'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { resolveSchoolSlugFromBackendId } from '@/lib/school-site';
import { buildStudentContext } from '@/lib/ai-reasoning-engine';
import type { AssistantRuntimeStatus } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

type AttachedFile = {
  id: string;
  name: string;
  type: 'image' | 'document';
  dataUrl?: string;
  mimeType: string;
  size: number;
};

function SvgIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function ChatPage({ school }: { school?: 'ntd' | 'sdu' }) {
  const {
    activeConversationId,
    conversationDetails,
    conversations,
    sendMessage,
    suggestions,
    setActiveConversation,
  } = useAppStore();
  const { token, user } = useAuthStore();
  const currentSchool = school || resolveSchoolSlugFromBackendId(user?.schoolId);
  const isNtd = currentSchool === 'ntd';
  const primaryColor = isNtd ? '#4D97FF' : '#E31D1C';
  const primaryDark = isNtd ? '#0F3460' : '#B71918';
  const assistantName = isNtd ? 'Trợ lý AI Nguyễn Thị Duệ' : 'Trợ lý AI Sao Đỏ';
  const inputPlaceholder = isNtd ? 'Nhập câu hỏi cho trợ lý THPT...' : 'Nhập câu hỏi cho trợ lý Sao Đỏ...';

  const [input, setInput] = useState('');
  const [assistantStatus, setAssistantStatus] = useState<AssistantRuntimeStatus | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const detail = activeConversationId ? conversationDetails[activeConversationId] : null;
  const messages = detail?.messages ?? [];

  const connectionLabel = useMemo(() => {
    if (!assistantStatus) return 'Đang kết nối...';
    if (assistantStatus.krouter) return `KRouter · ${assistantStatus.model || 'cx/gpt-5.4'}`;
    if (assistantStatus.xai) return `xAI · ${assistantStatus.model || 'Grok'}`;
    if (assistantStatus.openrouter) return `OpenRouter · ${assistantStatus.model || 'AI'}`;
    if (assistantStatus.openai) return `OpenAI · ${assistantStatus.model || 'GPT'}`;
    if (assistantStatus.http) return 'NemoClaw agent';
    if (assistantStatus.openclawCli) return 'OpenClaw CLI';
    return 'Demo nội bộ';
  }, [assistantStatus]);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.assistant) setAssistantStatus(d.assistant); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, forceType?: 'image' | 'document') => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const isImage = forceType === 'image' || file.type.startsWith('image/');
      const id = `f_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachedFiles((prev) => [
            ...prev,
            { id, name: file.name, type: 'image', dataUrl: ev.target?.result as string, mimeType: file.type, size: file.size },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) => [
          ...prev,
          { id, name: file.name, type: 'document', mimeType: file.type, size: file.size },
        ]);
      }
    });
    e.target.value = '';
  };

  const removeFile = (id: string) => setAttachedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleNewConversation = () => {
    setActiveConversation(`c_${Date.now()}`);
    setIsMobileSidebarOpen(false);
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content && attachedFiles.length === 0) return;
    if (!token) return;

    const convId =
      activeConversationId && activeConversationId !== 'new'
        ? activeConversationId
        : `c_${Date.now()}`;

    const docContext = attachedFiles
      .filter((f) => f.type === 'document')
      .map((f) => `[Tài liệu đính kèm: ${f.name}]`)
      .join(' ');
    const fullMessage = [docContext, content].filter(Boolean).join('\n');

    const imageAttachments = attachedFiles
      .filter((f) => f.type === 'image' && f.dataUrl)
      .map((f) => ({ type: 'image', dataUrl: f.dataUrl!, name: f.name, mimeType: f.mimeType }));

    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (!activeConversationId || activeConversationId === 'new') {
      setActiveConversation(convId);
    }
    sendMessage(token, convId, fullMessage, imageAttachments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const defaultSuggestions = [
    'Hôm nay học môn gì?',
    'Tóm tắt bài giảng CSDL',
    'Tìm tài liệu Trí tuệ nhân tạo',
    'Lịch thi tuần này',
  ];

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <aside
        className={`hidden flex-col border-r border-border bg-[#F8FAFF] transition-all duration-300 lg:flex ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black text-white shadow-sm transition hover:brightness-110 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)` }}
          >
            <SvgIcon d="M12 5v14M5 12h14" size={15} />
            Cuộc hội thoại mới
          </button>
        </div>

        <div className="px-3 pb-1">
          <p className="px-1 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Lịch sử</p>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {conversations.length === 0 ? (
            <p className="py-8 text-center text-xs text-text-muted">Chưa có hội thoại nào</p>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-sub hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <p className={`truncate text-xs ${isActive ? 'font-black' : 'font-semibold'}`}>
                    {conv.title || 'Hỏi đáp mới'}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-text-muted">
                    {conv.preview || 'Bắt đầu cuộc trò chuyện'}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                assistantStatus?.configured ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-slate-300'
              }`}
            />
            <span className="truncate text-[11px] font-bold text-text-sub">{connectionLabel}</span>
          </div>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative z-10 flex w-72 flex-col border-r border-border bg-[#F8FAFF] shadow-2xl">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-black text-text">Lịch sử chat</p>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="rounded-xl p-1.5 hover:bg-white">
                <SvgIcon d="M18 6 6 18M6 6l12 12" size={16} />
              </button>
            </div>
            <div className="px-4 pb-3">
              <button
                onClick={handleNewConversation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-white"
              >
                <SvgIcon d="M12 5v14M5 12h14" size={14} />
                Cuộc hội thoại mới
              </button>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConversation(conv.id); setIsMobileSidebarOpen(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left ${
                    activeConversationId === conv.id ? 'bg-primary/10 font-black text-primary' : 'font-semibold text-text-sub hover:bg-white'
                  }`}
                >
                  <p className="truncate text-xs">{conv.title || 'Hỏi đáp mới'}</p>
                  <p className="mt-0.5 truncate text-[10px] text-text-muted">{conv.preview || ''}</p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="hidden h-8 w-8 items-center justify-center rounded-xl text-text-muted transition hover:bg-blue-soft hover:text-primary lg:flex"
              aria-label="Mở/đóng lịch sử hội thoại"
            >
              <SvgIcon d="M3 6h18M3 12h18M3 18h18" size={16} />
            </button>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition hover:bg-blue-soft lg:hidden"
              aria-label="Mở lịch sử hội thoại"
            >
              <SvgIcon d="M3 6h18M3 12h18M3 18h18" size={16} />
            </button>

            <div>
              <h1 className="line-clamp-1 text-sm font-black text-text">
                {detail?.title || assistantName}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    assistantStatus?.configured
                      ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]'
                      : 'bg-slate-300'
                  }`}
                />
                <span className="text-[10px] font-semibold text-text-muted">{connectionLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="hidden items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-black text-text-sub shadow-sm transition hover:border-primary hover:text-primary sm:flex"
            >
              <SvgIcon d="M12 5v14M5 12h14" size={13} />
              Mới
            </button>
            <div className="hidden sm:block">
              <BrandMark compact size="sm" school={currentSchool} />
            </div>
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#F8FBFF] to-white px-6 py-10 text-center">
            <BrandMark size="lg" showText={false} />
            <h2 className="mt-4 text-xl font-black text-text">Bạn cần hỗ trợ gì hôm nay?</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">
              Hỏi về lịch học, tài liệu, điểm số hoặc tải ảnh và tệp lên để phân tích.
            </p>
            <div className="mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {(suggestions.length > 0 ? suggestions : defaultSuggestions).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-left text-sm font-semibold text-text shadow-sm transition hover:border-primary hover:text-primary active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FBFF] px-4 py-5 lg:px-6">
            {messages.map((msg) => {
              const sources = Array.isArray(msg.sources) ? msg.sources : [];
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[82%] gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${
                        isUser ? 'bg-primary text-white' : 'bg-white p-1 ring-1 ring-border'
                      }`}
                    >
                      {isUser ? 'SV' : <img src="/logo.png" alt="AI" className="h-full w-full object-contain" />}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        isUser
                          ? 'bg-primary text-white'
                          : 'border border-border bg-white text-text'
                      }`}
                    >
                      <div className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap leading-relaxed" {...props} />,
                            a: ({node, ...props}) => <a className="font-semibold underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            ul: ({node, ...props}) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
                            ol: ({node, ...props}) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            h1: ({node, ...props}) => <h1 className="mb-2 mt-3 text-lg font-black" {...props} />,
                            h2: ({node, ...props}) => <h2 className="mb-2 mt-2 text-base font-bold" {...props} />,
                            h3: ({node, ...props}) => <h3 className="mb-1 mt-2 text-sm font-bold" {...props} />,
                            pre: ({node, className, ...props}) => (
                              <pre
                                className={['mb-2 mt-1 overflow-x-auto rounded-xl bg-black/8 p-3', className].filter(Boolean).join(' ')}
                                {...props}
                              />
                            ),
                            code: ({node, inline, className, ...props}: any) => (
                              <code
                                className={[
                                  inline
                                    ? 'rounded bg-black/10 px-1.5 py-0.5 font-mono text-[13px]'
                                    : 'whitespace-pre font-mono text-[13px]',
                                  className,
                                ].filter(Boolean).join(' ')}
                                {...props}
                              />
                            ),
                            blockquote: ({node, ...props}) => <blockquote className="my-2 border-l-4 border-primary/30 pl-3 italic" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {sources.length > 0 && (
                        <div className={`mt-2 border-t pt-2 ${isUser ? 'border-white/20' : 'border-border'}`}>
                          <div className="flex flex-wrap gap-1.5">
                            {sources.map((src, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary"
                              >
                                {src.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="shrink-0 border-t border-border bg-white px-3 py-3">
          {attachedFiles.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {attachedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-semibold text-primary"
                >
                  {f.type === 'image' ? (
                    <SvgIcon d="M3 3h18v18H3zM8.5 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12.5 6.5-5-5L5 21" size={12} />
                  ) : (
                    <SvgIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" size={12} />
                  )}
                  <span className="max-w-[100px] truncate">{f.name}</span>
                  <span className="text-text-muted">{formatFileSize(f.size)}</span>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="ml-0.5 rounded-full p-0.5 text-text-muted transition hover:bg-red-50 hover:text-red-500"
                    aria-label={`Xóa tệp ${f.name}`}
                  >
                    <SvgIcon d="M18 6 6 18M6 6l12 12" size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-border bg-[#F8FAFF] px-2 py-1.5">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-white hover:text-primary"
              title="Tải ảnh lên"
              aria-label="Tải ảnh lên"
            >
              <SvgIcon d="M3 3h18v18H3zM8.5 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12.5 6.5-5-5L5 21" size={17} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-white hover:text-primary"
              title="Tải tài liệu lên"
              aria-label="Tải tài liệu lên"
            >
              <SvgIcon d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" size={17} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.md"
              className="hidden"
              onChange={(e) => handleFileSelect(e)}
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={inputPlaceholder}
              aria-label="Nhập câu hỏi cho trợ lý"
              rows={1}
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 pl-1 pr-2 text-sm font-medium text-text outline-none placeholder:text-text-muted"
            />

            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || !token}
              aria-label="Gửi tin nhắn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              <SvgIcon d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" size={15} />
            </button>
          </div>

          <p className="mt-1.5 text-center text-[10px] text-text-muted">
            Hỗ trợ ảnh PNG/JPG/WebP và tài liệu PDF, Word, Excel, PowerPoint, CSV · Enter để gửi · Shift+Enter xuống dòng
          </p>
        </div>
      </div>
    </div>
  );
}
