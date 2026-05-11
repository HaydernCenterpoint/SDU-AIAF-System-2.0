import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type {
  ChatMessage,
  ConversationDetail,
  ConversationSummary,
  DashboardStats,
  DocumentItem,
  ScheduleItem,
  StudentProfile,
} from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

interface AppState {
  user: StudentProfile;
  stats: DashboardStats;
  schedule: ScheduleItem[];
  documents: DocumentItem[];
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  conversationDetails: Record<string, ConversationDetail>;
  suggestions: string[];
  isLoading: boolean;

  setActiveConversation: (id: string | null) => Promise<void>;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  bootstrap: (token: string) => Promise<void>;
  sendMessage: (token: string, conversationId: string, message: string) => Promise<void>;
  newConversation: (token: string) => Promise<string | null>;
  reset: () => void;
}

const defaultUser: StudentProfile = { id: '', name: '', school: 'Đại học Sao Đỏ', major: '' };
const defaultStats: DashboardStats = { classesToday: 0, reminders: 0, documents: 0 };

export const useAppStore = create<AppState>((set, get) => ({
  user: defaultUser,
  stats: defaultStats,
  schedule: [],
  documents: [],
  conversations: [],
  activeConversationId: null,
  conversationDetails: {},
  suggestions: [],
  isLoading: false,

  setActiveConversation: async (id) => {
    set({ activeConversationId: id });
    if (!id) return;
    const token = await AsyncStorage.getItem('saodo_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          conversationDetails: {
            ...state.conversationDetails,
            [id]: {
              id: data.conversation.id,
              title: data.conversation.title,
              updatedAt: data.conversation.updatedAt,
              messages: data.messages,
            },
          },
        }));
      }
    } catch {
      // ignore
    }
  },

  addMessage: (conversationId, message) =>
    set((state) => {
      const details = { ...state.conversationDetails };
      if (details[conversationId]) {
        details[conversationId] = {
          ...details[conversationId],
          messages: [...details[conversationId].messages, message],
        };
      } else {
        details[conversationId] = {
          id: conversationId,
          title: message.content.slice(0, 30),
          updatedAt: message.createdAt,
          messages: [message],
        };
      }
      return { conversationDetails: details };
    }),

  bootstrap: async (token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/app/bootstrap`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        set({ isLoading: false });
        return;
      }
      const data = await res.json();
      const conversationDetails: Record<string, ConversationDetail> = {};
      for (const conv of data.conversations || []) {
        conversationDetails[conv.id] = {
          id: conv.id,
          title: conv.title,
          updatedAt: conv.updatedAt,
          messages: [],
        };
      }
      set({
        user: data.user,
        stats: data.stats,
        schedule: data.schedule,
        documents: data.documents,
        conversations: data.conversations,
        conversationDetails,
        suggestions: data.suggestions,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (token, conversationId, content) => {
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { id: `m_${Date.now()}`, role: 'user', content, createdAt: now, sources: [] };
    get().addMessage(conversationId, userMsg);
    try {
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, message: content }),
      });
      if (res.ok) {
        const data = await res.json();
        get().addMessage(conversationId, data.message);
        set((state) => {
          const convs = state.conversations.map((c) =>
            c.id === data.conversation.id
              ? {
                  ...c,
                  title: data.conversation.title,
                  updatedAt: data.conversation.updatedAt,
                  preview: data.message.content,
                }
              : c
          );
          return { conversations: convs };
        });
      }
    } catch {
      // ignore
    }
  },

  newConversation: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Cuộc trò chuyện mới' }),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          conversations: [data.conversation, ...state.conversations],
          activeConversationId: data.conversation.id,
        }));
        return data.conversation.id;
      }
    } catch {
      // ignore
    }
    return null;
  },

  reset: () =>
    set({
      user: defaultUser,
      stats: defaultStats,
      schedule: [],
      documents: [],
      conversations: [],
      activeConversationId: null,
      conversationDetails: {},
      suggestions: [],
    }),
}));
