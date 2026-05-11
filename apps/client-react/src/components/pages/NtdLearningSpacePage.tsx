'use client';

import { useState } from 'react';

const NTD_PRIMARY = '#4D97FF';
const NTD_PRIMARY_DARK = '#0F3460';
const NTD_ACCENT = '#FCDC62';

const SUBJECTS = [
  { id: 'toan', name: 'Toán', emoji: '📐', color: '#4D97FF', chapters: 8, progress: 65 },
  { id: 'van', name: 'Ngữ văn', emoji: '📖', color: '#10B981', chapters: 6, progress: 40 },
  { id: 'anh', name: 'Tiếng Anh', emoji: '🌍', color: '#F59E0B', chapters: 7, progress: 55 },
  { id: 'ly', name: 'Vật lý', emoji: '⚡', color: '#8B5CF6', chapters: 6, progress: 30 },
  { id: 'hoa', name: 'Hóa học', emoji: '🧪', color: '#EF4444', chapters: 7, progress: 20 },
  { id: 'sinh', name: 'Sinh học', emoji: '🧬', color: '#06B6D4', chapters: 6, progress: 15 },
];

const TOPIC_PROGRESS = [
  { subject: 'Toán', topic: 'Hàm số và đồ thị', done: 24, total: 30, color: '#4D97FF' },
  { subject: 'Toán', topic: 'Tích phân & vi phân', done: 8, total: 25, color: '#4D97FF' },
  { subject: 'Toán', topic: 'Hình học không gian', done: 18, total: 22, color: '#4D97FF' },
  { subject: 'Tiếng Anh', topic: 'Ngữ pháp nâng cao', done: 12, total: 20, color: '#F59E0B' },
  { subject: 'Tiếng Anh', topic: 'Từ vựng IELTS 7.0+', done: 200, total: 500, color: '#F59E0B' },
  { subject: 'Vật lý', topic: 'Dao động cơ học', done: 15, total: 28, color: '#8B5CF6' },
  { subject: 'Hóa học', topic: 'Hóa hữu cơ', done: 10, total: 35, color: '#EF4444' },
  { subject: 'Sinh học', topic: 'Di truyền học', done: 5, total: 30, color: '#06B6D4' },
];

const ROADMAP_ITEMS = [
  { phase: 'Giai đoạn 1', title: 'Nền tảng', date: '01/09 - 15/11', desc: 'Ôn tập toàn bộ kiến thức lớp 10-11, tập trung các chủ đề trọng tâm.', done: true, color: '#10B981' },
  { phase: 'Giai đoạn 2', title: 'Luyện đề', date: '16/11 - 28/02', desc: 'Giải ít nhất 30 đề thi thử, phân tích lỗi sai và bổ sung kiến thức.', done: false, color: '#F59E0B' },
  { phase: 'Giai đoạn 3', title: 'Ôn luyện chuyên sâu', date: '01/03 - 30/04', desc: 'Tập trung vào các phần yếu, luyện đề chuyên biệt theo từng môn.', done: false, color: '#4D97FF' },
  { phase: 'Giai đoạn 4', title: 'Thi thử & chốt điểm', date: '01/05 - 20/06', desc: 'Thi thử mỗi tuần, phân tích chi tiết kết quả, tối ưu chiến lược làm bài.', done: false, color: '#EF4444' },
];

const TIPS = [
  { icon: '🎯', title: 'Phương pháp Pomodoro', desc: 'Học 25 phút, nghỉ 5 phút. Tối ưu sự tập trung và tránh kiệt sức.' },
  { icon: '📝', title: 'Ghi chép thông minh', desc: 'Dùng sơ đồ tư duy thay vì ghi chép thuần túy. Dễ nhớ hơn 80%.' },
  { icon: '🧠', title: 'Spaced repetition', desc: 'Ôn lại kiến thức sau 1 ngày, 3 ngày, 7 ngày, 21 ngày để ghi nhớ lâu dài.' },
  { icon: '🏃', title: 'Cân bằng sức khỏe', desc: 'Ngủ đủ 7-8h, uống đủ nước, vận động nhẹ mỗi ngày. Não bộ hoạt động tốt hơn khi cơ thể khỏe mạnh.' },
];

export function NtdLearningSpacePage() {
  const [activeSubject, setActiveSubject] = useState('toan');
  const [tipIndex, setTipIndex] = useState(0);

  const subject = SUBJECTS.find(s => s.id === activeSubject) || SUBJECTS[0];
  const progress = TOPIC_PROGRESS.filter(t => t.subject === subject.name);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[24px] border border-[#dbeafe] bg-gradient-to-br from-white via-[#f0f7ff] to-[#eff6ff] p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${NTD_PRIMARY}20` }}>🎓</span>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: NTD_PRIMARY }}>Không gian học tập</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: NTD_PRIMARY_DARK }}>
          Hành trình chinh phục đại học
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Lớp 12 · Hệ thống ôn thi tốt nghiệp & đại học 2026
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tiến độ chung</span>
            <span className="text-xs font-black" style={{ color: NTD_PRIMARY }}>58%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all" style={{ width: '58%', background: `linear-gradient(90deg, ${NTD_PRIMARY}, ${NTD_ACCENT})` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Subject Cards */}
          <div>
            <h2 className="mb-3 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Môn học</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSubject(s.id)}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all active:scale-95"
                  style={{
                    borderColor: activeSubject === s.id ? s.color : `${s.color}30`,
                    background: activeSubject === s.id ? `${s.color}12` : 'white',
                    boxShadow: activeSubject === s.id ? `0 4px 16px ${s.color}30` : 'none',
                  }}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: activeSubject === s.id ? s.color : '#64748b' }}>{s.name}</span>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.color }} />
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: `${s.color}90` }}>{s.progress}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <h2 className="mb-3 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Lộ trình ôn thi</h2>
            <div className="relative space-y-4">
              <div className="absolute left-5 top-0 h-full w-0.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${NTD_PRIMARY}, ${NTD_ACCENT}, #94a3b8)` }} />
              {ROADMAP_ITEMS.map((item, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-0">
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 bg-white shadow-sm"
                    style={{ borderColor: item.color }}
                  >
                    {item.done ? (
                      <span className="text-sm font-black" style={{ color: item.color }}>✓</span>
                    ) : (
                      <span className="text-xs font-bold" style={{ color: item.color }}>{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: `${item.color}18`, color: item.color }}>{item.phase}</span>
                      {item.done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-600">Hoàn thành</span>}
                    </div>
                    <h3 className="font-black text-slate-800">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{item.date}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Topic Progress */}
          <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">{subject.emoji}</span>
              <h3 className="font-black" style={{ color: subject.color }}>{subject.name} — Tiến độ chủ đề</h3>
            </div>
            <div className="space-y-4">
              {progress.length > 0 ? progress.map((t, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{t.topic}</span>
                    <span className="text-xs font-bold" style={{ color: t.color }}>{Math.round((t.done / t.total) * 100)}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(t.done / t.total) * 100}%`, background: t.color }} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{t.done}/{t.total} bài đã làm</p>
                </div>
              )) : (
                <p className="text-sm text-slate-400">Chưa có dữ liệu tiến độ.</p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-[#FCDC62]/40 bg-[#FFFBE5] p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-amber-800">Mẹo học tập</h3>
              <button
                onClick={() => setTipIndex(i => (i + 1) % TIPS.length)}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200"
              >
                ← →
              </button>
            </div>
            {(() => {
              const tip = TIPS[tipIndex];
              return (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-4xl">{tip.icon}</span>
                  <h4 className="font-black text-amber-900">{tip.title}</h4>
                  <p className="text-sm text-amber-700">{tip.desc}</p>
                </div>
              );
            })()}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              className="w-full rounded-2xl p-4 text-left font-black text-white transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_PRIMARY_DARK})`, boxShadow: `0 4px 16px ${NTD_PRIMARY}40` }}
            >
              📋 Làm bài thi thử hôm nay
            </button>
            <button
              className="w-full rounded-2xl border-2 p-4 text-left font-black transition-all active:scale-[0.98]"
              style={{ borderColor: `${NTD_PRIMARY}40`, color: NTD_PRIMARY, background: `${NTD_PRIMARY}10` }}
            >
              📊 Xem báo cáo chi tiết
            </button>
            <button
              className="w-full rounded-2xl border-2 p-4 text-left font-black transition-all active:scale-[0.98]"
              style={{ borderColor: `${NTD_ACCENT}60`, color: '#92400e', background: `${NTD_ACCENT}20` }}
            >
              🎯 Đặt mục tiêu tuần này
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
