'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { GroupChatInterface } from './GroupChatInterface';
import { apiFetch } from '@/lib/api-client';
import { getCurrentSchoolSlug } from '@/lib/school-session';

type Post = { 
  id: string; 
  author: string; 
  role: string; 
  avatar: string; 
  content: string; 
  image?: string; 
  likes: number; 
  dislikes: number; 
  comments: Comment[]; 
  createdAt: Date; 
  myVote?: 'like' | 'dislike' | null;
  pinned?: boolean;
};
type Comment = { id: string; author: string; content: string; createdAt: Date };
type ChatGroup = { id: string; name: string; members: number; lastMsg: string; creator: string; online?: number };

const ROLES_CAN_POST = ['giảng viên', 'sinh viên', 'clb smc', 'admin'];
const AVATARS = ['🧑‍🏫', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍🏫'];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

const demoPosts: Post[] = [
  { 
    id: '1', 
    author: 'ThS. Nguyễn Văn Hùng', 
    role: 'giảng viên', 
    avatar: '🧑‍🏫', 
    content: 'Thông báo: Lịch thi cuối kỳ môn Cơ sở dữ liệu đã được cập nhật trên hệ thống. Các em kiểm tra lại lịch thi và phòng thi nhé!\n\n📅 Ngày thi: 15/05/2026\n🕐 Ca thi: 7h30 - 9h30\n📍 Phòng: H3-201', 
    likes: 24, 
    dislikes: 0, 
    comments: [
      { id: 'c1', author: 'Trần Minh Đức', content: 'Dạ em cảm ơn thầy ạ!', createdAt: new Date('2026-05-02T10:30:00') }, 
      { id: 'c2', author: 'Lê Thu Hà', content: 'Thầy ơi có cho mang tài liệu không ạ?', createdAt: new Date('2026-05-02T11:00:00') }
    ], 
    createdAt: new Date('2026-05-02T08:00:00'),
    pinned: true,
  },
  { 
    id: '2', 
    author: 'CLB SMC - Sao Đỏ', 
    role: 'clb smc', 
    avatar: '🧑‍💻', 
    content: '🔥 Workshop "Lập trình AI với Python" - Miễn phí cho sinh viên Sao Đỏ!\n\nĐăng ký ngay tại link trong bình luận. Số lượng có hạn, chỉ 50 suất!\n\n⏰ Thời gian: 18h00 - 21h00, Thứ 7 ngày 10/05\n📍 Phòng máy Lab H2-305', 
    likes: 45, 
    dislikes: 2, 
    comments: [{ id: 'c3', author: 'Phạm Quang Huy', content: 'Đăng ký rồi, hype quá!', createdAt: new Date('2026-05-01T15:00:00') }], 
    createdAt: new Date('2026-05-01T14:00:00'),
  },
  { 
    id: '3', 
    author: 'Nguyễn Thị Mai', 
    role: 'sinh viên', 
    avatar: '👩‍🎓', 
    content: 'Có bạn nào có slide bài giảng Flutter tuần trước không? Mình nghỉ ốm nên bị miss mất 😢 Cảm ơn mọi người!', 
    likes: 8, 
    dislikes: 0, 
    comments: [{ id: 'c4', author: 'Đặng Văn Nam', content: 'Mình gửi qua Zalo nhé bạn!', createdAt: new Date('2026-05-03T09:00:00') }], 
    createdAt: new Date('2026-05-03T07:30:00'),
  },
  { 
    id: '4', 
    author: 'PGS.TS Trần Quốc Bảo', 
    role: 'giảng viên', 
    avatar: '🧑‍🏫', 
    content: '📢 Nhắc nhở: Deadline nộp báo cáo đồ án môn Mạng máy tính là 23h59 ngày 08/05/2026. Các nhóm chưa nộp vui lòng hoàn thành sớm.\n\nYêu cầu:\n✅ File PDF + source code\n✅ Demo video 3-5 phút\n✅ Nộp qua hệ thống LMS', 
    likes: 15, 
    dislikes: 1, 
    comments: [], 
    createdAt: new Date('2026-05-03T06:00:00'),
  },
];

const demoGroups: ChatGroup[] = [
  { id: 'g1', name: 'CNTT K15 - Trao đổi', members: 156, lastMsg: 'Ai có đề cương ôn tập CSDL không?', creator: 'Nguyễn Văn An', online: 23 },
  { id: 'g2', name: 'CLB Lập trình SMC', members: 89, lastMsg: 'Workshop tuần sau ai đi không?', creator: 'CLB SMC', online: 12 },
  { id: 'g3', name: 'Ôn thi cuối kỳ HK2', members: 234, lastMsg: 'Share tài liệu ôn thi nhé!', creator: 'Trần Minh Đức', online: 45 },
  { id: 'g4', name: 'Tìm việc part-time', members: 67, lastMsg: 'Quán mới tuyển nhân viên kìa', creator: 'Lê Thu Hà', online: 8 },
];

function timeAgo(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  if (m < 1440) return `${Math.floor(m / 60)} giờ trước`;
  return `${Math.floor(m / 1440)} ngày trước`;
}

const roleConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'giảng viên': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Giảng viên' },
  'sinh viên': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Sinh viên' },
  'clb smc': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'CLB SMC' },
  'admin': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', label: 'Admin' },
};

export function CommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>(demoPosts);
  const [groups, setGroups] = useState<ChatGroup[]>(demoGroups);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const userRole = (user?.role || 'sinh viên').toLowerCase();
  const canPost = ROLES_CAN_POST.includes(userRole);
  const userName = user?.fullName || 'Nguyễn Văn An';
  const schoolName = getCurrentSchoolSlug() === 'ntd' ? 'Nguyễn Thị Duệ' : 'Sao Đỏ';

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (filter !== 'all') {
      result = result.filter(p => p.role === filter);
    }
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [posts, filter]);

  const stats = useMemo(() => ({
    postsToday: posts.filter(p => p.createdAt.toDateString() === new Date().toDateString()).length,
    totalPosts: posts.length,
    groups: groups.length,
    activeMembers: 312,
    onlineNow: groups.reduce((sum, g) => sum + (g.online || 0), 0),
  }), [posts, groups]);

  const handlePost = () => {
    if (!newPost.trim() || !canPost) return;
    const post: Post = {
      id: `p${Date.now()}`, 
      author: userName, 
      role: userRole,
      avatar: pick(AVATARS), 
      content: newPost.trim(),
      likes: 0, 
      dislikes: 0, 
      comments: [], 
      createdAt: new Date(), 
      myVote: null,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const handleVote = (postId: string, type: 'like' | 'dislike') => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      if (p.myVote === type) {
        return { ...p, [type === 'like' ? 'likes' : 'dislikes']: p[type === 'like' ? 'likes' : 'dislikes'] - 1, myVote: null };
      }
      const undo = p.myVote ? { [p.myVote === 'like' ? 'likes' : 'dislikes']: p[p.myVote === 'like' ? 'likes' : 'dislikes'] - 1 } : {};
      return { ...p, ...undo, [type === 'like' ? 'likes' : 'dislikes']: p[type === 'like' ? 'likes' : 'dislikes'] + 1, myVote: type };
    }));
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p, comments: [...p.comments, { id: `c${Date.now()}`, author: userName, content: commentText.trim(), createdAt: new Date() }],
    }));
    setCommentText('');
  };

  const handleNewGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await apiFetch('/api/groups', {
        method: 'POST',
        headers: { 'X-School-ID': getCurrentSchoolSlug() },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (res.group) {
        setGroups(prev => [res.group, ...prev]);
        setNewGroupName('');
        setShowNewGroup(false);
      }
    } catch(e) { console.error(e); }
  };

  const FILTERS = [
    { key: 'all', label: 'Tất cả', icon: '📋', count: posts.length },
    { key: 'giảng viên', label: 'Giảng viên', icon: '🧑‍🏫', count: posts.filter(p => p.role === 'giảng viên').length },
    { key: 'sinh viên', label: 'Sinh viên', icon: '👨‍🎓', count: posts.filter(p => p.role === 'sinh viên').length },
    { key: 'clb smc', label: 'CLB SMC', icon: '💻', count: posts.filter(p => p.role === 'clb smc').length },
  ];

  if (activeGroupId) {
    return <GroupChatInterface schoolId={getCurrentSchoolSlug()} activeGroupId={activeGroupId} onBack={() => setActiveGroupId(null)} onGroupSelect={setActiveGroupId} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-600 shadow-lg shadow-red-200/50">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">CỘNG ĐỒNG</span>
                </div>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800">
                  Cộng đồng {schoolName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">Nơi chia sẻ, trao đổi thông tin học tập</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-blue-600">{stats.onlineNow}</p>
                <p className="text-xs font-medium text-blue-500">Online</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-emerald-600">{stats.totalPosts}</p>
                <p className="text-xs font-medium text-emerald-500">Bài đăng</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-amber-600">{stats.groups}</p>
                <p className="text-xs font-medium text-amber-500">Nhóm chat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Feed */}
        <main className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {FILTERS.map(f => (
              <button 
                key={f.key} 
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  filter === f.key ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Post Composer */}
          {canPost ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-black text-white shadow-lg shadow-blue-200">
                  {userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={newPost} 
                    onChange={e => setNewPost(e.target.value)} 
                    placeholder="Chia sẻ thông tin, thông báo, hỏi đáp..." 
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                        📷 Ảnh
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                        📎 File
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                        📊 Khảo sát
                      </button>
                    </div>
                    <button 
                      onClick={handlePost} 
                      disabled={!newPost.trim()}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Đăng bài
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
              Chỉ giảng viên, sinh viên và CLB SMC mới có quyền đăng bài.
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map(post => {
              const badge = roleConfig[post.role] || roleConfig['sinh viên'];
              const isOpen = showComments === post.id;
              
              return (
                <article 
                  key={post.id} 
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg ${
                    post.pinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  {post.pinned && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-2 border-b border-amber-100">
                      <span className="text-lg">📌</span>
                      <span className="text-xs font-bold text-amber-700">Bài được ghim</span>
                    </div>
                  )}
                  
                  {/* Post Header */}
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-2xl">
                      {post.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800">{post.author}</span>
                        <span className={`rounded-full border ${badge.bg} ${badge.text} px-2.5 py-0.5 text-xs font-bold`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
                    </div>
                    <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                      </svg>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-5 pb-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{post.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleVote(post.id, 'like')} 
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                          post.myVote === 'like' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <svg className="h-4 w-4" fill={post.myVote === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        {post.likes}
                      </button>
                      <button 
                        onClick={() => handleVote(post.id, 'dislike')} 
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                          post.myVote === 'dislike' 
                            ? 'bg-rose-100 text-rose-600' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <svg className="h-4 w-4 rotate-180" fill={post.myVote === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        {post.dislikes}
                      </button>
                    </div>
                    <button 
                      onClick={() => { setShowComments(isOpen ? null : post.id); setCommentText(''); }}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                        isOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {post.comments.length} bình luận
                    </button>
                  </div>

                  {/* Comments */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                      {post.comments.map(c => (
                        <div key={c.id} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {c.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{c.author}</span>
                              <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                            </div>
                            <p className="mt-0.5 text-sm text-slate-600">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 flex gap-2">
                        <input 
                          value={commentText} 
                          onChange={e => setCommentText(e.target.value)} 
                          placeholder="Viết bình luận..."
                          onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        <button 
                          onClick={() => handleComment(post.id)}
                          className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Chat Groups */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <h3 className="font-bold text-slate-800">NHÓM CHAT</h3>
                </div>
                <button 
                  onClick={() => setShowNewGroup(!showNewGroup)}
                  className="rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-600"
                >
                  + Tạo nhóm
                </button>
              </div>
            </div>

            {showNewGroup && (
              <div className="border-b border-slate-100 bg-blue-50/50 p-4">
                <input 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  placeholder="Tên nhóm chat..."
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={handleNewGroup}
                    className="flex-1 rounded-xl bg-blue-500 py-2 text-sm font-bold text-white transition hover:bg-blue-600"
                  >
                    Tạo
                  </button>
                  <button 
                    onClick={() => setShowNewGroup(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto">
              {groups.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => setActiveGroupId(g.id)}
                  className="group cursor-pointer border-b border-slate-50 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 truncate">{g.name}</p>
                        {g.online && g.online > 10 && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-600">
                            {g.online} online
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{g.members} thành viên</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-600">
                      Mở
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <span>💬</span>
                    <span className="truncate">{g.lastMsg}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
            <div className="border-b border-amber-100 p-4">
              <h3 className="flex items-center gap-2 font-bold text-amber-800">
                <span>📊</span> THỐNG KÊ
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {[
                { label: 'Bài hôm nay', value: stats.postsToday, icon: '📝', color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Tổng bài', value: stats.totalPosts, icon: '📋', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: 'Nhóm chat', value: stats.groups, icon: '💬', color: 'text-violet-600', bg: 'bg-violet-100' },
                { label: 'Thành viên', value: stats.activeMembers, icon: '👥', color: 'text-rose-600', bg: 'bg-rose-100' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-xl ${stat.bg} p-3 text-center`}>
                  <span className="text-xl">{stat.icon}</span>
                  <p className={`mt-1 text-xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
            <div className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-red-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-rose-700">
                <span>📋</span> NỘI QUY
              </h3>
            </div>
            <ul className="space-y-2.5 p-4 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-red-500">●</span>
                <span>Không spam, quảng cáo bên ngoài</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-red-500">●</span>
                <span>Tôn trọng giảng viên và bạn bè</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-red-500">●</span>
                <span>Không chia sẻ đáp án thi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-red-500">●</span>
                <span>Báo cáo nội dung vi phạm</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
