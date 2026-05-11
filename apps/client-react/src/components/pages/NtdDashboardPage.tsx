'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { AIRecommendationsWidget } from '@/components/AIRecommendationsWidget';

export function NtdDashboardPage() {
  const { stats, schedule, documents } = useAppStore();
  const { user } = useAuthStore();

  const upcomingSchedule = schedule.slice(0, 4);
  const featuredDocuments = documents.slice(0, 3);
  const displayName = user?.fullName || 'Học sinh';

  return (
    <section className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0F3460_0%,#4D97FF_55%,#0F3460_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,52,96,0.24)]">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-12 left-8 h-36 w-36 rounded-full bg-[#FCDC62]/20 blur-sm" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FCDC62]">Portal THPT Nguyễn Thị Duệ</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              Chào {displayName},<br />
              <span className="text-[#FCDC62]">hôm nay cần giữ nhịp học tập.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/82">
              Xem nhanh lịch học, tài liệu, thông báo và các nhắc nhở nội bộ trong một khung điều phối riêng cho THPT.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/14 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FCDC62]">Tổng quan</p>
            <div className="mt-4 grid gap-3">
              <StatCard label="Tiết học hôm nay" value={stats.classesToday} />
              <StatCard label="Nhắc nhở đang mở" value={stats.reminders} />
              <StatCard label="Tài liệu mới" value={stats.documents} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-[26px] border border-[#dbeafe] bg-white p-5 shadow-[0_16px_48px_rgba(77,151,255,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4D97FF]">Lịch học</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#0F3460]">Tiết học sắp tới</h2>
            </div>
            <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#4D97FF]">{upcomingSchedule.length} mục</span>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingSchedule.map((item) => (
              <article key={item.id} className="rounded-[20px] border border-[#dbeafe] bg-[#f8faff] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#0F3460]">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold text-[#64748B]">{item.type} · {item.day}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#4D97FF] shadow-sm">{item.time}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#334155]">{item.room}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-[26px] border border-[#FCDC62]/40 bg-[#FFFBE5] p-5 shadow-[0_16px_48px_rgba(252,220,98,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#92400e]">Thông báo nội bộ</p>
            <div className="mt-4 space-y-3">
              {[
                'Cập nhật lịch trực tuần cho giáo viên chủ nhiệm.',
                'Học sinh truyền thông theo dõi mục cộng đồng để đăng bài sự kiện.',
                'Ban giám hiệu có thể xem toàn bộ thống kê tại khu quản trị.',
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-white/85 p-4 text-sm font-semibold leading-6 text-[#5B4300]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-[#dbeafe] bg-white p-5 shadow-[0_16px_48px_rgba(77,151,255,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4D97FF]">Tài liệu</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#0F3460]">Cần xem tiếp</h2>
              </div>
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#4D97FF]">{featuredDocuments.length} tệp</span>
            </div>

            <div className="mt-4 space-y-3">
              {featuredDocuments.map((document) => (
                <article key={document.id} className="rounded-[18px] border border-[#dbeafe] bg-[#f8faff] p-4">
                  <p className="text-sm font-black text-[#0F3460]">{document.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#64748B]">{document.meta}</p>
                  {document.note && <p className="mt-2 text-sm font-semibold text-[#334155]">{document.note}</p>}
                </article>
              ))}
            </div>
          </section>

          {/* AI Personalized Recommendations */}
          <AIRecommendationsWidget school="ntd" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/68">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value.toLocaleString('vi-VN')}</p>
    </div>
  );
}
