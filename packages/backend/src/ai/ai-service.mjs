// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { performance } from 'node:perf_hooks';
import { appendAiMessage, getOrCreateAiConversation } from './conversations.mjs';
import { buildSafetyPrefix, validateUserMessage } from './guardrails.mjs';
import { logAiQuery } from './logs.mjs';
import { buildAiPrompt, buildStudentContext } from './prompt-builder.mjs';
import { isAssistantType } from './prompt-registry.mjs';
import { checkAiRateLimit } from './rate-limit.mjs';
import { loadSchoolAdmissionsKnowledge } from '../school-knowledge.mjs';
import { getSuggestedActions } from './suggested-actions.mjs';
import { summarizeLongConversation } from './summarizer.mjs';
import { detectSearchIntent, buildWebContext } from './web-search.mjs';

// Web search is opt-in via env — set WEB_SEARCH_ENABLED=true to activate
const WEB_SEARCH_ENABLED = process.env.WEB_SEARCH_ENABLED === 'true' || process.env.WEB_SEARCH_ENABLED === '1';

export async function sendAiMessage({ body, user, userData, assistantReply, saveUserData }) {
  const startedAt = performance.now();
  const assistantType = String(body?.assistant_type || body?.assistantType || 'study').trim();
  const message = String(body?.message || '').trim();
  const conversationId = body?.conversation_id || body?.conversationId || null;
  const extraContext = body?.context && typeof body.context === 'object' ? body.context : {};

  if (!isAssistantType(assistantType)) {
    return { status: 400, payload: { error: 'Loại trợ lý AI không hợp lệ.' } };
  }

  const messageValidation = validateUserMessage(message);
  if (!messageValidation.ok) {
    return { status: messageValidation.status, payload: { error: messageValidation.error } };
  }

  const rateLimit = checkAiRateLimit({ userId: user.id, assistantType });
  if (!rateLimit.allowed) {
    logAiQuery({ userId: user.id, assistantType, status: 'rate_limited' });
    return {
      status: 429,
      payload: { error: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.', retry_after_seconds: rateLimit.retryAfterSeconds },
    };
  }

  const conversation = getOrCreateAiConversation({ userData, assistantType, conversationId });
  appendAiMessage(conversation, { role: 'user', content: message });
  summarizeLongConversation(conversation);

  const schoolKnowledge = loadSchoolAdmissionsKnowledge(user.schoolId);
  const studentContext = buildStudentContext({ user, userData, extraContext, schoolKnowledge });

  // ── Web search enrichment ──────────────────────────────────────────────────
  let webContextBlock = '';
  let webSources = [];

  if (WEB_SEARCH_ENABLED) {
    try {
      const intent = detectSearchIntent(message);
      if (intent.shouldSearch) {
        const { contextBlock, sources } = await buildWebContext({
          query: intent.query,
          urls: intent.urls,
        });
        webContextBlock = contextBlock;
        webSources = sources;
      }
    } catch (err) {
      // Non-fatal: log and continue without web context
      console.warn('[ai-service] Web search enrichment failed:', err?.message);
    }
  }

  const prompt = buildAiPrompt({ assistantType, message, studentContext, conversation, webContextBlock });
  const catalog = {
    user: studentContext.user,
    schedule: studentContext.schedule,
    documents: studentContext.documents,
    courses: studentContext.courses,
    schoolKnowledge: studentContext.schoolKnowledge,
  };

  try {
    const aiResponse = await assistantReply({ message, prompt, conversation, catalog, assistantType });
    const reply = `${buildSafetyPrefix({ assistantType, message })}${aiResponse?.content || 'Xin lỗi, mình chưa thể trả lời câu hỏi này.'}`;

    // Merge web sources with AI-inferred sources
    const allSources = [...(aiResponse?.sources || []), ...webSources];
    appendAiMessage(conversation, { role: 'assistant', content: reply, assistantType, sources: allSources });
    saveUserData(user.id, userData);
    logAiQuery({
      userId: user.id,
      assistantType,
      conversationId: conversation.id,
      latencyMs: Math.round(performance.now() - startedAt),
      status: 'success',
    });

    return {
      status: 200,
      payload: {
        reply,
        assistant_type: assistantType,
        conversation_id: conversation.id,
        suggested_actions: getSuggestedActions(assistantType),
        // Expose sources so the frontend can show "Nguồn từ web" links
        sources: allSources,
        web_searched: webSources.length > 0,
      },
    };
  } catch {
    logAiQuery({
      userId: user.id,
      assistantType,
      conversationId: conversation.id,
      latencyMs: Math.round(performance.now() - startedAt),
      status: 'error',
    });
    return {
      status: 502,
      payload: { error: 'AI hiện chưa phản hồi được. Vui lòng thử lại sau.' },
    };
  }
}
