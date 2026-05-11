const MAX_MESSAGES_BEFORE_SUMMARY = 20;
const MAX_CHARS_BEFORE_SUMMARY = 12000;

export function summarizeLongConversation(conversation) {
  const totalChars = conversation.messages.reduce((sum, message) => sum + String(message.content || '').length, 0);
  if (conversation.messages.length <= MAX_MESSAGES_BEFORE_SUMMARY && totalChars <= MAX_CHARS_BEFORE_SUMMARY) {
    return conversation.summary || '';
  }

  const olderMessages = conversation.messages.slice(0, -10);
  const facts = olderMessages
    .slice(-8)
    .map((message) => {
      const label = message.role === 'assistant' ? 'Trợ lý đã trả lời' : 'Sinh viên đã hỏi';
      return `- ${label}: ${String(message.content).slice(0, 180)}`;
    })
    .join('\n');

  conversation.summary = [conversation.summary, facts].filter(Boolean).join('\n').slice(-3000);
  conversation.messages = conversation.messages.slice(-10);
  return conversation.summary;
}
