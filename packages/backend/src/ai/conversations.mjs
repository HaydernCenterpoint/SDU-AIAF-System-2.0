import { randomUUID } from 'node:crypto';

export function getOrCreateAiConversation({ userData, assistantType, conversationId }) {
  if (!Array.isArray(userData.aiConversations)) userData.aiConversations = [];
  let conversation = conversationId
    ? userData.aiConversations.find((item) => item.id === conversationId && item.assistantType === assistantType)
    : null;

  if (!conversation) {
    conversation = {
      id: randomUUID(),
      assistantType,
      title: buildDefaultTitle(assistantType),
      summary: '',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    userData.aiConversations.unshift(conversation);
  }

  return conversation;
}

export function appendAiMessage(conversation, message) {
  conversation.messages.push({ id: randomUUID(), createdAt: new Date().toISOString(), ...message });
  conversation.updatedAt = conversation.messages.at(-1).createdAt;
  conversation.title = buildConversationTitle(conversation);
}

function buildDefaultTitle(assistantType) {
  const labels = {
    study: 'Trợ lý học tập',
    document: 'Trợ lý tài liệu',
    report: 'Trợ lý viết báo cáo',
    coding: 'Trợ lý lập trình',
    career: 'Trợ lý nghề nghiệp',
    interview: 'Trợ lý luyện phỏng vấn',
    health: 'Trợ lý sức khỏe',
    finance: 'Trợ lý tài chính',
    productivity: 'Trợ lý quản lý thời gian',
  };
  return labels[assistantType] || 'Trợ lý AI';
}

function buildConversationTitle(conversation) {
  const firstUserMessage = conversation.messages.find((item) => item.role === 'user');
  if (!firstUserMessage) return conversation.title;
  return firstUserMessage.content.slice(0, 48);
}
