import { create } from 'zustand';
import { buildDocumentQuery } from '@/lib/document-filters.mjs';
import { getCurrentSchoolSlug, readSchoolToken } from '@/lib/school-session';
import type { AppTab, StudentProfile, DashboardStats, ScheduleItem, DocumentItem, DocumentFilters, ConversationSummary, ConversationDetail, ChatMessage } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

function normalizeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    sources: Array.isArray(message.sources) ? message.sources : [],
  };
}

interface AppState {
  currentTab: AppTab;
  user: StudentProfile;
  stats: DashboardStats;
  schedule: ScheduleItem[];
  documents: DocumentItem[];
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  conversationDetails: Record<string, ConversationDetail>;
  suggestions: string[];
  isLoading: boolean;
  setCurrentTab: (tab: AppTab) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  bootstrap: (token: string) => Promise<void>;
  fetchDocuments: (token: string, filters?: DocumentFilters) => Promise<void>;
  uploadDocument: (token: string, formData: FormData) => Promise<{ success: boolean; error?: string }>;
  updateDocument: (token: string, id: string, data: { title: string; description?: string; tags?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteDocument: (token: string, id: string) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (token: string, conversationId: string, message: string, attachments?: Array<{ type: string; dataUrl?: string; name: string; mimeType: string }>) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentTab: 'dashboard',
  user: { id: '', name: '', school: '', major: '' },
  stats: { classesToday: 0, reminders: 0, documents: 0 },
  schedule: [],
  documents: [],
  conversations: [],
  activeConversationId: null,
  conversationDetails: {},
  suggestions: [],
  isLoading: false,

  setCurrentTab: (tab) => set({ currentTab: tab }),

  setActiveConversation: async (id) => {
    set({ activeConversationId: id });
    if (id) {
      const token = readSchoolToken(getCurrentSchoolSlug());
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
                messages: (data.messages || []).map(normalizeMessage),
              },
            },
          }));
        }
      } catch {
        // ignore
      }
    }
  },

  addMessage: (conversationId, message) =>
    set((state) => {
      const details = { ...state.conversationDetails };
      if (details[conversationId]) {
        details[conversationId] = {
          ...details[conversationId],
          messages: [...details[conversationId].messages, normalizeMessage(message)],
        };
      } else {
        details[conversationId] = {
          id: conversationId,
          title: message.content.slice(0, 30),
          updatedAt: message.createdAt,
          messages: [normalizeMessage(message)],
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
        documents: normalizeDocuments(data.documents || []),
        conversations: data.conversations,
        conversationDetails,
        suggestions: data.suggestions,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchDocuments: async (token, filters = {}) => {
    set({ isLoading: true });
    try {
      const query = buildDocumentQuery(filters as Record<string, string | undefined>);
      const res = await fetch(`${API_BASE}/documents${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (res.ok) {
        set({ documents: normalizeDocuments(payload.data || []), isLoading: false });
        return;
      }
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (token, formData) => {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) return { success: false, error: payload.message || payload.error || 'Không thể đăng tài liệu' };
      const uploadedDocument = normalizeDocuments([payload.data])[0];
      set((state) => ({ documents: [uploadedDocument, ...state.documents.filter((document) => document.id !== uploadedDocument.id)] }));
      return { success: true };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ' };
    }
  },

  updateDocument: async (token, id, data) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) return { success: false, error: payload.message || 'Không thể cập nhật tài liệu' };
      set((state) => ({
        documents: state.documents.map((document) => (document.id === id ? payload.data : document)),
      }));
      return { success: true };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ' };
    }
  },

  deleteDocument: async (token, id) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) return { success: false, error: payload.message || 'Không thể xóa tài liệu' };
      set((state) => ({ documents: state.documents.filter((document) => document.id !== id) }));
      return { success: true };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ' };
    }
  },

  sendMessage: async (token, conversationId, content, attachments = []) => {
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
        body: JSON.stringify({ conversationId, message: content, attachments }),
      });
      if (res.ok) {
        const data = await res.json();
        get().addMessage(conversationId, data.message);
        set((state) => {
          const returnedId = data.conversation.id;
          const exists = state.conversations.some((c) => c.id === returnedId);
          const updatedEntry = {
            id: returnedId,
            title: data.conversation.title || 'Hỏi đáp mới',
            updatedAt: data.conversation.updatedAt,
            preview: data.message.content.slice(0, 80),
          };
          const convs = exists
            ? state.conversations.map((c) => (c.id === returnedId ? { ...c, ...updatedEntry } : c))
            : [updatedEntry, ...state.conversations];
          return { conversations: convs };
        });
      }
    } catch {
      // ignore
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

function normalizeDocuments(documents: DocumentItem[]): DocumentItem[] {
  return documents.map((document) => {
    if (document.file) return document;
    const [type = 'FILE', size = ''] = (document.meta || '').split('-').map((part) => part.trim());
    return {
      ...document,
      description: document.note || '',
      tags: document.note ? [document.note] : [],
      owner: { id: '', email: 'system@portal.local' },
      file: { originalName: document.title, mimeType: type, size: Number.parseFloat(size) || 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canManage: false,
    };
  });
}
