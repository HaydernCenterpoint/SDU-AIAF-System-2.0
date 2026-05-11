'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { GroupChatInterface } from './GroupChatInterface';
import { apiFetch } from '@/lib/api-client';

type PostRole = 'teacher' | 'student' | 'student_media' | 'admin';
type Post = {
  id: string;
  author: string;
  role: PostRole;
  content: string;
  createdAt: string;
  comments: number;
};

const initialPosts: Post[] = [
  {
    id: 'ntd-post-1',
    author: 'Cô Nguyễn Thu Hà',
    role: 'teacher',
    content: 'Thông báo tới khối 12: cập nhật lịch ôn tập môn Toán và danh sách phòng học cho buổi chiều mai.',
    createdAt: '08:15',
    comments: 5,
  },
  {
    id: 'ntd-post-2',
    author: 'Ban truyền thông học sinh',
    role: 'student_media',
    content: 'Đã mở khung bài viết sự kiện 26/3 trong mục cộng đồng. Các lớp gửi ảnh và caption trước 17:00 để duyệt.',
    createdAt: '09:40',
    comments: 3,
  },
  {
    id: 'ntd-post-3',
    author: 'Ban giám hiệu',
    role: 'admin',
    content: 'Hệ thống portal THPT đã tách riêng. Mỗi khối dùng đúng khu vực đăng nhập và thông báo theo trường.',
    createdAt: '10:05',
    comments: 2,
  },
];

const roleBadges: Record<PostRole, { label: string; className: string }> = {
  teacher: { label: 'Giáo viên THPT', className: 'bg-[#DBEAFE] text-[#1D4ED8]' },
  student: { label: 'Học sinh', className: 'bg-[#DCFCE7] text-[#166534]' },
  student_media: { label: 'Học sinh (Truyền thông)', className: 'bg-[#FEF3C7] text-[#92400E]' },
  admin: { label: 'Ban giám hiệu', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
};

const filterOptions: Array<{ id: 'all' | PostRole; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'teacher', label: 'Giáo viên' },
  { id: 'student_media', label: 'Truyền thông' },
  { id: 'admin', label: 'Ban giám hiệu' },
];

export function NtdCommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<'all' | PostRole>('all');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/groups', { headers: { 'X-School-ID': 'nguyen-thi-due' } })
      .then(res => { if (res.groups) setGroups(res.groups); })
      .catch(console.error);
  }, []);

  const currentRole = normalizeRole(user?.role, user?.accountType);
  const canPost = currentRole === 'teacher' || currentRole === 'student_media' || currentRole === 'admin';
  const canModerateChat = currentRole === 'student_media' || currentRole === 'admin';
  const authorName = user?.fullName || 'Tài khoản nội bộ';

  const visiblePosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((post) => post.role === filter);
  }, [filter, posts]);

  const handlePost = () => {
    if (!draft.trim() || !canPost) return;
    setPosts((current) => [
      {
        id: `ntd-post-${Date.now()}`,
        author: authorName,
        role: currentRole,
        content: draft.trim(),
        createdAt: 'Vừa xong',
        comments: 0,
      },
      ...current,
    ]);
    setDraft('');
  };

  if (activeGroupId) {
    return <GroupChatInterface schoolId="nguyen-thi-due" activeGroupId={activeGroupId} onBack={() => setActiveGroupId(null)} onGroupSelect={setActiveGroupId} />;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] border border-[#D7E7FF] bg-white p-6 shadow-[0_18px_54px_rgba(21,95,209,0.08)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#155FD1]">Cộng đồng THPT</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#112641]">Không gian nội bộ Nguyễn Thị Duệ</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#64748B]">
          Học sinh, giáo viên THPT, học sinh truyền thông và ban giám hiệu trao đổi tại đây. Quyền đăng bài và quản lý chat được mở theo vai trò.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                  filter === option.id
                    ? 'border-[#155FD1] bg-[#155FD1] text-white'
                    : 'border-[#D7E7FF] bg-white text-[#155FD1] hover:bg-[#EFF5FF]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {canPost ? (
            <section className="rounded-[24px] border border-[#D7E7FF] bg-white p-4 shadow-[0_12px_36px_rgba(21,95,209,0.06)]">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                placeholder="Đăng bài viết nội bộ, thông báo lớp hoặc nội dung truyền thông..."
                className="w-full resize-none rounded-[18px] border border-[#E5EEFB] bg-[#F8FBFF] px-4 py-3 text-sm font-semibold text-[#112641] outline-none transition focus:border-[#155FD1] focus:ring-4 focus:ring-[#155FD1]/10"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#64748B]">
                  {canModerateChat ? 'Vai trò này có quyền đăng bài và quản lý chat cộng đồng.' : 'Vai trò này có quyền đăng bài trong cộng đồng.'}
                </p>
                <button
                  onClick={handlePost}
                  disabled={!draft.trim()}
                  className="rounded-xl bg-[#155FD1] px-4 py-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] transition hover:brightness-110 disabled:opacity-40"
                >
                  Đăng bài
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-[24px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-sm font-semibold text-[#64748B]">
              Tài khoản này có thể xem nội dung cộng đồng. Quyền đăng bài được mở cho Giáo viên THPT, Học sinh (Truyền thông) và Ban giám hiệu.
            </section>
          )}

          <div className="space-y-4">
            {visiblePosts.map((post) => {
              const badge = roleBadges[post.role];
              return (
                <article key={post.id} className="rounded-[24px] border border-[#E5EEFB] bg-white p-5 shadow-[0_12px_36px_rgba(21,95,209,0.05)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-[#112641]">{post.author}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${badge.className}`}>{badge.label}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#64748B]">{post.createdAt}</p>
                    </div>
                    <span className="rounded-full bg-[#EFF5FF] px-3 py-1 text-[11px] font-black text-[#155FD1]">{post.comments} bình luận</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-6 text-[#334155]">{post.content}</p>
                </article>
              );
            })}
          </div>
        </main>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#F0E1C0] bg-[#FFF9EC] p-5 shadow-[0_12px_36px_rgba(215,186,122,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9A6700]">Chat cộng đồng</p>
            <div className="mt-4 space-y-3">
              {groups.map((group) => (
                <div key={group.id} onClick={() => setActiveGroupId(group.id)} className="rounded-[18px] bg-white/90 p-4 cursor-pointer hover:bg-white transition">
                  <p className="text-sm font-black text-[#5B4300]">{group.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#8A6A17]">
                    {canModerateChat ? 'Tài khoản hiện tại có thể mở, ghim và điều phối luồng chat.' : 'Đang theo dõi chat nội bộ theo quyền xem.'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#D7E7FF] bg-white p-5 shadow-[0_12px_36px_rgba(21,95,209,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#155FD1]">Quyền hiện tại</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-[#334155]">
              <li>Vai trò: {roleBadges[currentRole].label}</li>
              <li>Đăng bài: {canPost ? 'Có' : 'Không'}</li>
              <li>Quản lý chat: {canModerateChat ? 'Có' : 'Không'}</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}

function normalizeRole(role?: string, accountType?: string | null): PostRole {
  if (role === 'admin') return 'admin';
  if (role === 'teacher') return 'teacher';
  if (role === 'student_media' || accountType === 'highschool_media_student') return 'student_media';
  return 'student';
}
