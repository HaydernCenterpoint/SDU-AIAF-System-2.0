import { NextRequest, NextResponse } from 'next/server';
import { generateSystemPrompt } from '@/lib/student-profile-builder';
import type { StudentLearningProfile } from '@/lib/student-profile-types';

const KROUTER_BASE_URL = process.env.KROUTER_API_URL || 'https://sv1.krouter.net/v1';
const KROUTER_API_KEY = process.env.KROUTER_API_KEY || '';
const DEFAULT_MODEL = 'cx/gpt-5.4';

function getKRouterConfig() {
  const baseUrl = process.env.KROUTER_API_URL || KROUTER_BASE_URL;
  const apiKey = KROUTER_API_KEY;
  return { baseUrl, apiKey };
}

async function callKRouter(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const { baseUrl, apiKey } = getKRouterConfig();

  if (!apiKey) {
    throw new Error('KRouter API key not configured');
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`KRouter API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function buildConversationMessages(
  studentProfile: StudentLearningProfile,
  question: string,
  history: Array<{ role: string; content: string }> = [],
): Array<{ role: string; content: string }> {
  const systemPrompt = generateSystemPrompt(studentProfile);
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of history.slice(-10)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: question });
  return messages;
}

function extractSources(question: string, answer: string): string[] {
  const sources: string[] = [];
  const lowerQ = question.toLowerCase();
  const lowerA = answer.toLowerCase();

  if (lowerQ.includes('lịch') || lowerQ.includes('thời khóa') || lowerA.includes('thời khóa biểu')) {
    sources.push('Thời khóa biểu');
  }
  if (lowerQ.includes('tài liệu') || lowerQ.includes('document') || lowerA.includes('tài liệu')) {
    sources.push('Tài liệu học tập');
  }
  if (lowerQ.includes('điểm') || lowerQ.includes('grade') || lowerA.includes('điểm số')) {
    sources.push('Kết quả học tập');
  }
  if (lowerQ.includes('lịch thi') || lowerQ.includes('exam') || lowerA.includes('lịch thi')) {
    sources.push('Lịch thi');
  }
  if (lowerA.includes('bài giảng') || lowerA.includes('slide')) {
    sources.push('Bài giảng');
  }

  return sources;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfile, question, conversationHistory } = body as {
      studentProfile: StudentLearningProfile;
      question: string;
      conversationHistory?: Array<{ role: string; content: string }>;
    };

    if (!studentProfile || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentProfile, question' },
        { status: 400 },
      );
    }

    const messages = buildConversationMessages(studentProfile, question, conversationHistory);

    let content = '';
    let provider = 'krouter';
    let model = DEFAULT_MODEL;

    try {
      content = await callKRouter(messages, model);
    } catch (apiError) {
      console.error('[AI Reasoning] KRouter call failed:', apiError);

      try {
        provider = 'nemoclaw';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api'}/chat/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: 'ai-reasoning',
            message: `[PERSONALIZED CONTEXT]\n${generateSystemPrompt(studentProfile)}\n\n[QUESTION]\n${question}`,
            attachments: [],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          content = data.message?.content || '';
        } else {
          content = 'Xin lỗi, hiện tại AI đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé.';
        }
      } catch {
        content = 'Xin lỗi, hiện tại mình chưa kết nối được AI. Bạn thử lại sau ít phút nhé.';
      }
    }

    const sources = extractSources(question, content);

    return NextResponse.json({
      success: true,
      content,
      sources,
      model,
      provider,
    });
  } catch (error) {
    console.error('[AI Reasoning] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
