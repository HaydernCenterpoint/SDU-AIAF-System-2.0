'use client';

import { useState, useRef, useEffect } from 'react';

const NTD_PRIMARY = '#4D97FF';
const NTD_DARK = '#0F3460';
const SDU_PRIMARY = '#E31D1C';
const SDU_DARK = '#B71918';

type Message = {
  id: string;
  authorId: string;
  author: string;
  school: 'ntd' | 'sdu';
  role: string;
  avatar: string;
  content: string;
  time: string;
  reactions?: Record<string, number>;
  myReaction?: string;
};

type Channel = {
  id: string;
  name: string;
  icon: string;
  unread: number;
  description: string;
};

const DEMO_MESSAGES: Record<string, Message[]> = {
  'ch-general': [
    { id: 'm1', authorId: 'u1', author: 'Nguyễn Thị Hương', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Chào mọi người! Mình là học sinh lớp 12A1 trường Nguyễn Thị Duệ. Có ai đang ôn thi đại học không ạ?', time: '10:30', reactions: { '👍': 3 }, myReaction: undefined },
    { id: 'm2', authorId: 'u2', author: 'Trần Minh Đức', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Chào em! Anh là sinh viên năm 3 ngành CNTT trường Sao Đỏ. Anh nhớ hồi lớp 12 cũng lo lắng lắm 😅 Có gì cần hỏi cứ hỏi nhé!', time: '10:32', reactions: { '👍': 5, '❤️': 2 }, myReaction: '👍' },
    { id: 'm3', authorId: 'u3', author: 'Lê Thu Hà', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Ad ơi cho em hỏi về phần tích phân trong Toán 12. Em cứ bị nhầm khi dùng công thức từng phần 😢', time: '10:35', reactions: { '🤔': 2 }, myReaction: undefined },
    { id: 'm4', authorId: 'u2', author: 'Trần Minh Đức', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Để anh giải thích nhé! Tích phân từng phần theo công thức: ∫u·dv = u·v - ∫v·du. Mẹo là chọn u theo thứ tự: Logarith (L), Polynomial (Đa thức), Exponential (Mũ), Trigonometric (Lượng giác). Áp dụng quy tắc LIATE để chọn u phù hợp nhé!', time: '10:38', reactions: { '👍': 8, '❤️': 3, '🎯': 1 }, myReaction: '👍' },
    { id: 'm5', authorId: 'u4', author: 'Phạm Quang Huy', school: 'sdu', role: 'sinhvien', avatar: '🧑‍💻', content: 'Tham gia nè! Mình cũng muốn góp sức hỗ trợ các em lớp 12. Mình học ngành AI, có gì về Python, Machine Learning cứ hỏi!', time: '10:40', reactions: { '👍': 4 }, myReaction: undefined },
    { id: 'm6', authorId: 'u3', author: 'Lê Thu Hà', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Cảm ơn anh Đức nhiều ạ! Em sẽ thử áp dụng quy tắc LIATE. Nhưng mà em vẫn hay quên công thức lắm 😅 Có cách nào nhớ lâu hơn không ạ?', time: '10:45', reactions: {}, myReaction: undefined },
    { id: 'm7', authorId: 'u2', author: 'Trần Minh Đức', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Dùng spaced repetition nhé em! Ôn lại sau 1 ngày → 3 ngày → 7 ngày → 14 ngày. Não sẽ tự chuyển vào trí nhớ dài hạn. App như Anki rất hữu ích!', time: '10:48', reactions: { '👍': 6, '🎯': 4 }, myReaction: '👍' },
    { id: 'm8', authorId: 'u5', author: 'Ngô Thị Mai Anh', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Mình xin gia nhập nhóm! Mình cần hỗ trợ về môn Tiếng Anh, đặc biệt là phần viết luận. Có anh chị nào giỏi Tiếng Anh không ạ?', time: '10:52', reactions: { '👏': 2 }, myReaction: undefined },
    { id: 'm9', authorId: 'u6', author: 'Đặng Văn Nam', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Chào em! Chị khóa trên mình giỏi Tiếng Anh lắm. Mình share mẹo: đọc báo Tiếng Anh mỗi ngày 15 phút, chọn bài vừa sức, highlight từ mới, viết lại câu. Sau 2 tuần em sẽ thấy khác biệt!', time: '10:55', reactions: { '👍': 5, '🔥': 3 }, myReaction: '👍' },
  ],
  'ch-onthi': [
    { id: 'om1', authorId: 'u1', author: 'Nguyễn Thị Hương', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Mình đang ôn thi khối A00. Có tài liệu nào ôn Toán Lý Hóa hay không ạ? Mình thấy lượng kiến thức nhiều quá 😰', time: '09:00', reactions: { '📚': 3 }, myReaction: undefined },
    { id: 'om2', authorId: 'u4', author: 'Phạm Quang Huy', school: 'sdu', role: 'sinhvien', avatar: '🧑‍💻', content: 'Mình gợi ý: 1) Tổng hợp công thức theo từng chương, 2) Làm đề thi thử hàng tuần, 3) Ôn lại lỗi sai sau mỗi đề. Mình có thư mục tài liệu, để mình chia sẻ sau nhé!', time: '09:05', reactions: { '👍': 7, '📋': 4 }, myReaction: '👍' },
    { id: 'om3', authorId: 'u3', author: 'Lê Thu Hà', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Cảm ơn anh Huy! Em thường làm đề xong không biết phân tích lỗi sai. Có phương pháp nào hiệu quả không ạ?', time: '09:10', reactions: {}, myReaction: undefined },
    { id: 'om4', authorId: 'u4', author: 'Phạm Quang Huy', school: 'sdu', role: 'sinhvien', avatar: '🧑‍💻', content: 'Sau khi làm đề xong, mỗi câu sai em nên ghi lại: (1) Lý do sai? (2) Kiến thức còn thiếu? (3) Mẹo/quy tắc để nhớ? (4) Câu tương tự nào em đã làm đúng? Cuốn sổ lỗi sai này sẽ rất giá trị trước kỳ thi!', time: '09:15', reactions: { '👍': 10, '🎯': 8, '📓': 5 }, myReaction: '👍' },
  ],
  'ch-tailieu': [
    { id: 'tm1', authorId: 'u2', author: 'Trần Minh Đức', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Mình đã upload bộ đề thi thử Toán 2026 (30 đề) vào thư viện tài liệu rồi nhé! Link: [Bộ đề thi thử Toán 2026]', time: '14:00', reactions: { '👍': 15, '🎉': 8 }, myReaction: '👍' },
    { id: 'tm2', authorId: 'u5', author: 'Ngô Thị Mai Anh', school: 'ntd', role: 'hocsinh12', avatar: '👩‍🎓', content: 'Cảm ơn anh Đức! Đề có đáp án chi tiết không ạ? Và có phân tích theo mức độ khó không?', time: '14:05', reactions: {}, myReaction: undefined },
    { id: 'tm3', authorId: 'u2', author: 'Trần Minh Đức', school: 'sdu', role: 'sinhvien', avatar: '👨‍🎓', content: 'Có đầy đủ lời giải chi tiết từng câu và phân tích theo 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao. Em nên tập trung vào phần Vận dụng trước khi làm Vận dụng cao nhé!', time: '14:10', reactions: { '👍': 12, '🎯': 6 }, myReaction: '👍' },
  ],
};

const CHANNELS: Channel[] = [
  { id: 'ch-general', name: 'general', icon: '💬', unread: 0, description: 'Trò chuyện chung - Học sinh & Sinh viên' },
  { id: 'ch-onthi', name: 'ôn thi đh', icon: '📚', unread: 4, description: 'Trao đổi phương pháp & tài liệu ôn thi' },
  { id: 'ch-tailieu', name: 'tài liệu', icon: '📁', unread: 0, description: 'Chia sẻ tài liệu học tập' },
  { id: 'ch-toan', name: 'toán', icon: '📐', unread: 0, description: 'Hỏi đáp về Toán học' },
  { id: 'ch-ly', name: 'vật lý', icon: '⚡', unread: 0, description: 'Hỏi đáp về Vật lý' },
  { id: 'ch-hoa', name: 'hóa học', icon: '🧪', unread: 0, description: 'Hỏi đáp về Hóa học' },
  { id: 'ch-anh', name: 'tiếng anh', icon: '🌍', unread: 2, description: 'Trao đổi Tiếng Anh & ôn thi' },
  { id: 'ch-sk', name: 'sức khỏe', icon: '🏃', unread: 0, description: 'Sức khỏe & tinh thần mùa thi' },
];

const REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎯', '🔥', '👏'];

const SCHOOL_CONFIG = {
  ntd: {
    name: 'NTD',
    fullName: 'THPT Nguyễn Thị Duệ',
    color: NTD_PRIMARY,
    darkColor: NTD_DARK,
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-700',
    userType: 'Học sinh',
  },
  sdu: {
    name: 'SDU',
    fullName: 'Sao Đỏ University',
    color: SDU_PRIMARY,
    darkColor: SDU_DARK,
    bg: '#fff1f1',
    border: '#fecaca',
    text: '#991b1b',
    badge: 'bg-red-100',
    badgeText: 'text-red-700',
    userType: 'Sinh viên',
  },
};

const currentUser = {
  id: 'u7',
  name: 'Học sinh Demo',
  school: 'ntd' as 'ntd' | 'sdu',
  role: 'hocsinh12',
  avatar: '👩‍🎓',
};

export function UnifiedCommunityPage() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES['ch-general'] || []);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(DEMO_MESSAGES[activeChannel] || []);
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser.name,
      school: currentUser.school,
      role: currentUser.role,
      avatar: currentUser.avatar,
      content: input,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const current = m.reactions?.[emoji] || 0;
      const isRemoving = m.myReaction === emoji;
      return {
        ...m,
        reactions: { ...(m.reactions || {}), [emoji]: Math.max(0, current + (isRemoving ? -1 : 1)) },
        myReaction: isRemoving ? undefined : emoji,
      };
    }));
  };

  const activeChannelData = CHANNELS.find(c => c.id === activeChannel)!;

  const groupedByDate = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const key = 'Hôm nay';
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return (
    <section className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Channel Sidebar */}
      <aside className={`flex flex-col border-r border-slate-100 transition-all ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black" style={{ background: 'linear-gradient(135deg, #4D97FF, #0F3460)', color: 'white' }}>AI</div>
            <div>
              <h2 className="text-sm font-black text-slate-800">SĐU Community</h2>
              <p className="text-[10px] text-slate-400">NTD + SDU · Học tập</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-bold text-slate-500">243 người online</span>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Kênh</p>
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className="group mx-2 mb-0.5 flex w-[calc(100%-1rem)] items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all"
              style={activeChannel === ch.id ? { background: `${NTD_PRIMARY}15`, color: NTD_PRIMARY } : { color: '#64748b' }}
            >
              <span className="text-base">{ch.icon}</span>
              <span className="flex-1 truncate">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black text-white" style={{ background: NTD_PRIMARY }}>
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Current user */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-black text-slate-800">{currentUser.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black" style={{ color: SCHOOL_CONFIG[currentUser.school].color }}>
                  {SCHOOL_CONFIG[currentUser.school].name}
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] text-slate-400">{SCHOOL_CONFIG[currentUser.school].userType}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Channel Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <span className="text-xl">{activeChannelData.icon}</span>
            <div>
              <h2 className="font-black text-slate-800">{activeChannelData.name}</h2>
              <p className="text-xs text-slate-400">{activeChannelData.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:flex">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              243 online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-bold text-slate-400">Hôm nay</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="space-y-4">
            {messages.map(msg => {
              const school = SCHOOL_CONFIG[msg.school];
              const isMe = msg.authorId === currentUser.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: `${school.color}15` }}>
                    {msg.avatar}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={`mb-1 flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-black text-slate-800">{msg.author}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: school.bg, color: school.text }}>
                        {school.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{school.userType} · {msg.time}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        isMe
                          ? 'rounded-br-md'
                          : 'rounded-bl-md'
                      }`}
                      style={{
                        background: isMe ? `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_DARK})` : '#f8fafc',
                        color: isMe ? 'white' : '#1e293b',
                        border: isMe ? 'none' : '1px solid #e2e8f0',
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {Object.keys(msg.reactions || {}).length > 0 && (
                      <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {Object.entries(msg.reactions!).filter(([, c]) => c > 0).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold transition-all hover:scale-105 ${
                              msg.myReaction === emoji
                                ? 'border-blue-400 bg-blue-50 text-blue-600'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={`mt-1 flex gap-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {REACTION_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="rounded px-1 py-0.5 text-sm opacity-0 transition-all hover:bg-slate-100 hover:opacity-100 group-hover:opacity-100"
                          style={{ opacity: undefined }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Nhắn tin trong #${activeChannelData.name}...`}
                rows={1}
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm transition-all disabled:opacity-40"
              style={{ background: input.trim() ? `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_DARK})` : '#94a3b8' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Nhấn Enter để gửi · Shift+Enter để xuống dòng</span>
          </div>
        </div>
      </div>

      {/* Right: Members Panel */}
      <aside className="hidden w-56 shrink-0 overflow-y-auto border-l border-slate-100 p-4 xl:block">
        <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Đang hoạt động</h3>
        {[
          { name: 'Trần Minh Đức', school: 'sdu', avatar: '👨‍🎓', status: '🟢', role: 'SV K15 CNTT' },
          { name: 'Nguyễn Thị Hương', school: 'ntd', avatar: '👩‍🎓', status: '🟢', role: 'HS Lớp 12A1' },
          { name: 'Phạm Quang Huy', school: 'sdu', avatar: '🧑‍💻', status: '🟢', role: 'SV K16 AI' },
          { name: 'Lê Thu Hà', school: 'ntd', avatar: '👩‍🎓', status: '🟡', role: 'HS Lớp 12A2' },
          { name: 'Ngô Thị Mai Anh', school: 'ntd', avatar: '👩‍🎓', status: '🟢', role: 'HS Lớp 12A3' },
          { name: 'Đặng Văn Nam', school: 'sdu', avatar: '👨‍🎓', status: '🟡', role: 'SV K15 NN' },
          { name: 'Bùi Thị Lan', school: 'ntd', avatar: '👩‍🎓', status: '⚪', role: 'HS Lớp 12B1' },
          { name: 'Hoàng Minh Tuấn', school: 'sdu', avatar: '🧑‍💻', status: '🟢', role: 'SV K17 Cybersecurity' },
        ].map((member, i) => {
          const sc = SCHOOL_CONFIG[member.school as 'ntd' | 'sdu'];
          return (
            <div key={i} className="mb-2 flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50">
              <div className="relative">
                <span className="text-lg">{member.avatar}</span>
                <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">{member.status}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-bold text-slate-700">{member.name}</p>
                  <span className="shrink-0 rounded px-1 py-0.5 text-[8px] font-black" style={{ background: sc.bg, color: sc.text }}>{sc.name}</span>
                </div>
                <p className="truncate text-[10px] text-slate-400">{member.role}</p>
              </div>
            </div>
          );
        })}

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <h4 className="text-xs font-black text-slate-600">🏫 Trường tham gia</h4>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: NTD_PRIMARY }} />
                <span className="text-xs font-semibold text-slate-600">NTD</span>
              </div>
              <span className="text-xs font-bold text-slate-400">142</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: SDU_PRIMARY }} />
                <span className="text-xs font-semibold text-slate-600">SDU</span>
              </div>
              <span className="text-xs font-bold text-slate-400">101</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full" style={{ width: '58.4%', background: `linear-gradient(90deg, ${NTD_PRIMARY}, ${SDU_PRIMARY})` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">58.4% NTD · 41.6% SDU</p>
        </div>
      </aside>
    </section>
  );
}
