import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { apiFetch, getApiErrorMessage } from '@/lib/api-client';

type ChatGroup = {
  id: string;
  name: string;
  membersCount: number;
  lastMsg: string;
  creator: string;
};

type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  content: string;
  createdAt: string;
};

export function GroupChatInterface({
  schoolId,
  activeGroupId,
  onBack,
  onGroupSelect
}: {
  schoolId: string;
  activeGroupId: string | null;
  onBack: () => void;
  onGroupSelect: (id: string) => void;
}) {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
  }, [schoolId]);

  useEffect(() => {
    if (activeGroupId) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeGroupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroups = async () => {
    try {
      const res = await apiFetch('/api/groups', {
        headers: { 'X-School-ID': schoolId }
      });
      if (res.groups) {
        setGroups(res.groups);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách nhóm chat.'));
    }
  };

  const fetchMessages = async () => {
    if (!activeGroupId) return;
    try {
      const res = await apiFetch(`/api/groups/${activeGroupId}/messages`, {
        headers: { 'X-School-ID': schoolId }
      });
      if (res.messages) {
        setMessages(res.messages);
        setGroupInfo(res.group);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể tải tin nhắn của nhóm này.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeGroupId) return;
    const content = messageInput.trim();
    setMessageInput('');
    try {
      const res = await apiFetch(`/api/groups/${activeGroupId}/messages`, {
        method: 'POST',
        headers: { 'X-School-ID': schoolId },
        body: JSON.stringify({ content })
      });
      if (res.message) {
        setMessages(prev => [...prev, res.message]);
        setErrorMessage('');
      }
    } catch (error) {
      setMessageInput(content);
      setErrorMessage(getApiErrorMessage(error, 'Không thể gửi tin nhắn ngay bây giờ.'));
    }
  };

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    if (m < 1440) return `${Math.floor(m / 60)} giờ trước`;
    return `${Math.floor(m / 1440)} ngày trước`;
  };

  const formatTime = (d: string) => {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-[24px] border border-[#BFEFFF] bg-white shadow-[0_24px_70px_rgba(23,132,218,0.12)]">
      {errorMessage && (
        <div className="absolute left-1/2 top-4 z-20 flex w-[min(560px,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-sm font-bold text-[#B91C1C] shadow-[0_10px_28px_rgba(185,28,28,0.12)]">
          <span className="min-w-0 flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="shrink-0 rounded-full border border-[#FECACA] bg-white px-3 py-1 text-xs font-black text-[#B91C1C] transition hover:bg-[#FEE2E2]">
            Đóng
          </button>
        </div>
      )}
      {/* Sidebar: Channel List */}
      <div className="w-[280px] shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <button onClick={onBack} className="text-[#64748B] hover:text-[#1784DA] flex items-center gap-1 text-sm font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Trở lại
          </button>
          <span className="text-sm font-black text-[#112641]">Nhóm Chat</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-2 py-1 text-[11px] font-black uppercase text-[#94A3B8] tracking-wider mb-2">Tất cả nhóm</p>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => onGroupSelect(g.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${activeGroupId === g.id ? 'bg-[#E0F2FE] text-[#0369A1]' : 'hover:bg-[#F1F5F9] text-[#475569]'}`}
            >
              <span className="text-lg opacity-60">#</span>
              <span className="flex-1 min-w-0 truncate text-sm font-bold">{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeGroupId ? (
          <>
            {/* Chat Header */}
            <div className="h-14 shrink-0 border-b border-[#E2E8F0] px-6 flex items-center shadow-sm">
              <span className="text-xl text-[#94A3B8] mr-2">#</span>
              <h2 className="text-base font-black text-[#112641]">{groupInfo?.name || 'Đang tải...'}</h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-[#94A3B8] font-bold text-sm">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center text-3xl">💬</div>
                  <div>
                    <h3 className="text-lg font-black text-[#112641]">Chào mừng đến với #{groupInfo?.name}</h3>
                    <p className="text-sm font-medium text-[#64748B]">Đây là sự khởi đầu của kênh này. Hãy gửi lời chào nhé!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const showHeader = i === 0 || messages[i - 1].authorId !== msg.authorId || (new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 300000);
                  const isMe = msg.authorId === user?.id;

                  return (
                    <div key={msg.id} className={`flex gap-4 ${!showHeader ? 'mt-1' : ''}`}>
                      {showHeader ? (
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#1784DA] to-[#0EA5E9] flex items-center justify-center text-white font-black text-sm">
                          {msg.authorAvatar ? <img src={msg.authorAvatar} className="w-full h-full rounded-full object-cover" /> : msg.authorName.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 shrink-0 flex justify-center mt-0.5 opacity-0 hover:opacity-100">
                          <span className="text-[10px] text-[#94A3B8] font-medium">{formatTime(msg.createdAt)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className={`text-sm font-black ${isMe ? 'text-[#1784DA]' : 'text-[#112641]'}`}>{msg.authorName}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">{msg.authorRole}</span>
                            <span className="text-xs font-medium text-[#94A3B8]">{formatTime(msg.createdAt)}</span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-[#334155] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white">
              <div className="relative flex items-center rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#1784DA] focus-within:ring-4 focus-within:ring-[#1784DA]/10 transition-all">
                <button className="pl-4 pr-2 text-[#94A3B8] hover:text-[#1784DA] transition">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Gửi tin nhắn vào #${groupInfo?.name || 'kênh'}...`}
                  className="flex-1 py-4 px-2 bg-transparent outline-none text-sm font-semibold text-[#112641] placeholder:text-[#94A3B8]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="mr-2 ml-2 p-2 rounded-xl bg-[#1784DA] text-white disabled:opacity-40 disabled:bg-[#94A3B8] transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-[#F0F9FF] flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1784DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#112641]">Chưa chọn nhóm chat</h3>
              <p className="text-sm font-medium text-[#64748B] mt-2 max-w-sm">Chọn một nhóm chat ở danh sách bên trái để bắt đầu trao đổi với mọi người.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
