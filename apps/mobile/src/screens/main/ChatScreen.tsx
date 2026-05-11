import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ChatMessage } from '../../types';

export function ChatScreen() {
  const { conversations, activeConversationId, conversationDetails, sendMessage, setActiveConversation, newConversation, suggestions } =
    useAppStore();
  const { token } = useAuthStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(!activeConversationId);
  const flatRef = useRef<FlatList>(null);

  const activeDetail = activeConversationId ? conversationDetails[activeConversationId] : null;
  const messages = activeDetail?.messages || [];

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token) return;
    let convId = activeConversationId;
    if (!convId) {
      convId = await newConversation(token);
      if (!convId) return;
    }
    setInput('');
    setSending(true);
    await sendMessage(token, convId, text);
    setSending(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const openConversation = async (id: string) => {
    await setActiveConversation(id);
    setShowList(false);
  };

  const startNew = async () => {
    if (!token) return;
    const id = await newConversation(token);
    if (id) setShowList(false);
  };

  if (showList) {
    return (
      <View style={styles.container}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.eyebrow}>Trợ lý AI</Text>
            <Text style={styles.listTitle}>Cuộc trò chuyện</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={startNew} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={Colors.surface} />
            <Text style={styles.newBtnText}>Mới</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image source={require('../../../assets/logo.png')} style={styles.emptyLogo} resizeMode="contain" />
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
              <Text style={styles.emptyText}>Bắt đầu hỏi trợ lý Sao Đỏ về lịch học, tài liệu hoặc bài tập.</Text>
              <TouchableOpacity style={styles.startBtn} onPress={startNew}>
                <Text style={styles.startBtnText}>Bắt đầu ngay</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convItem} onPress={() => openConversation(item.id)} activeOpacity={0.85}>
              <View style={styles.convIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.convPreview} numberOfLines={1}>{item.preview || 'Chưa có nội dung'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => setShowList(true)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại danh sách cuộc trò chuyện"
        >
          <Ionicons name="chevron-back" size={23} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.chatTitle} numberOfLines={1}>{activeDetail?.title || 'Trợ lý Sao Đỏ'}</Text>
        <TouchableOpacity
          onPress={startNew}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Tạo cuộc trò chuyện mới"
        >
          <Ionicons name="create-outline" size={21} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.chatEmpty}>
            <Image source={require('../../../assets/logo.png')} style={styles.chatEmptyLogo} resizeMode="contain" />
            <Text style={styles.chatEmptyTitle}>Bạn cần hỗ trợ gì?</Text>
            <Text style={styles.chatEmptyText}>Hỏi về lịch học, tài liệu, điểm số hoặc cách chuẩn bị cho buổi học tiếp theo.</Text>
            <View style={styles.quickPrompts}>
              {(suggestions.length > 0 ? suggestions.slice(0, 3) : ['Hôm nay tôi học gì?', 'Tài liệu cần đọc?', 'Nhắc tôi ôn tập']).map((prompt) => (
                <TouchableOpacity key={prompt} style={styles.quickPrompt} onPress={() => setInput(prompt)}>
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }: { item: ChatMessage }) => (
          <View style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}>
            {item.role === 'assistant' && (
              <View style={styles.botAvatar}>
                <Image source={require('../../../assets/logo.png')} style={styles.botLogo} resizeMode="contain" />
              </View>
            )}
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              {item.role === 'user' ? (
                <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                  {item.content}
                </Text>
              ) : (
                <Markdown
                  style={{
                    body: { fontSize: FontSize.md, lineHeight: 22, color: Colors.text },
                    paragraph: { marginTop: 0, marginBottom: 8 },
                    code_block: { backgroundColor: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
                    code_inline: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 4, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
                    strong: { fontWeight: 'bold' },
                    em: { fontStyle: 'italic' },
                    link: { color: Colors.primary, textDecorationLine: 'underline' },
                    heading1: { fontSize: FontSize.lg, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
                    heading2: { fontSize: FontSize.md, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
                    heading3: { fontSize: FontSize.sm, fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
                  }}
                >
                  {item.content}
                </Markdown>
              )}
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sources}>
                  {item.sources.map((source, index) => (
                    <Text key={`${source.title}-${index}`} style={styles.sourceTag}>{source.title}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      />

      {sending && (
        <View style={styles.typingIndicator}>
          <View style={styles.botAvatar}>
            <Image source={require('../../../assets/logo.png')} style={styles.botLogo} resizeMode="contain" />
          </View>
          <View style={styles.typingDots}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>Đang trả lời...</Text>
          </View>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập câu hỏi..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Gửi câu hỏi"
        >
          <Ionicons name="send" size={18} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eyebrow: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  listTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  newBtnText: { color: Colors.surface, fontSize: FontSize.sm, fontWeight: '900' },
  listContent: { padding: Spacing.lg, paddingBottom: 40 },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  convIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  convInfo: { flex: 1 },
  convTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  convPreview: { fontSize: FontSize.sm, color: Colors.textSub, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 76, paddingHorizontal: Spacing.xl },
  emptyLogo: { width: 82, height: 82, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.textSub, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  startBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  startBtnText: { color: Colors.surface, fontWeight: '900', fontSize: FontSize.md },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: { padding: Spacing.sm },
  chatTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  messagesContent: { padding: Spacing.lg, paddingBottom: 20 },
  chatEmpty: { alignItems: 'center', paddingVertical: 52, paddingHorizontal: Spacing.md },
  chatEmptyLogo: { width: 72, height: 72, marginBottom: Spacing.lg },
  chatEmptyTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  chatEmptyText: { fontSize: FontSize.md, color: Colors.textSub, textAlign: 'center', lineHeight: 22 },
  quickPrompts: { width: '100%', marginTop: Spacing.xl, gap: Spacing.sm },
  quickPrompt: { borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryBg, padding: Spacing.md },
  quickPromptText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    padding: 3,
  },
  botLogo: { width: '100%', height: '100%' },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: Spacing.md },
  bubbleUser: {
    backgroundColor: Colors.primary,
  },
  bubbleBot: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: { fontSize: FontSize.md, lineHeight: 22 },
  bubbleTextUser: { color: Colors.surface },
  bubbleTextBot: { color: Colors.text },
  sources: { marginTop: Spacing.sm, gap: 4 },
  sourceTag: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typingText: { fontSize: FontSize.sm, color: Colors.textSub, marginLeft: Spacing.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
