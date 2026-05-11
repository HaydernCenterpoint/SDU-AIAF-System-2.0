'use client';

import { useState } from 'react';

const NTD_PRIMARY = '#4D97FF';
const NTD_PRIMARY_DARK = '#0F3460';
const NTD_ACCENT = '#FCDC62';

const TYPE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  exam: { emoji: '📝', color: '#EF4444', label: 'Kiểm tra' },
  homework: { emoji: '📋', color: '#F59E0B', label: 'Bài tập' },
  study: { emoji: '📖', color: '#4D97FF', label: 'Tự học' },
  project: { emoji: '💻', color: '#8B5CF6', label: 'Dự án' },
  event: { emoji: '🎉', color: '#10B981', label: 'Sự kiện' },
  reminder: { emoji: '🔔', color: '#FCDC62', label: 'Nhắc nhở' },
};

const DEMO_REMINDERS = [
  { id: 'r1', title: 'Thi Toán giữa kỳ', type: 'exam', due: '2026-05-15', done: false, subject: 'Toán', priority: 3, note: 'Mang theo máy tính Casio' },
  { id: 'r2', title: 'Nộp bài tập Vật lý chương 4', type: 'homework', due: '2026-05-12', done: false, subject: 'Vật lý', priority: 2 },
  { id: 'r3', title: 'Ôn tập Ngữ văn - Nghị luận', type: 'study', due: '2026-05-14', done: false, subject: 'Ngữ văn', priority: 2 },
  { id: 'r4', title: 'Họp CLB Sáng tạo', type: 'event', due: '2026-05-13', done: true, subject: 'CLB', priority: 1 },
  { id: 'r5', title: 'Thi Tiếng Anh online', type: 'exam', due: '2026-05-18', done: false, subject: 'Tiếng Anh', priority: 3, note: 'Phòng máy 201' },
  { id: 'r6', title: 'Nộp đồ án nhóm Tin học', type: 'project', due: '2026-05-20', done: false, subject: 'Tin học', priority: 3 },
  { id: 'r7', title: 'Xem lại bài Hóa hữu cơ', type: 'study', due: '2026-05-16', done: false, subject: 'Hóa học', priority: 1 },
  { id: 'r8', title: 'Thi thử đại học lần 2', type: 'exam', due: '2026-05-22', done: false, subject: 'Tổng hợp', priority: 3, note: 'Toàn bộ khối A00' },
  { id: 'r9', title: 'Nhắc: Học 2 tiếng mỗi tối', type: 'reminder', due: '', done: false, subject: 'Tự học', priority: 1, recurring: true },
  { id: 'r10', title: 'Nộp bài tập Toán chương 5', type: 'homework', due: '2026-05-11', done: true, subject: 'Toán', priority: 2 },
];

const WEEKS = [
  { label: 'Tuần này', dates: ['11/5', '12/5', '13/5', '14/5', '15/5', '16/5', '17/5'] },
  { label: 'Tuần sau', dates: ['18/5', '19/5', '20/5', '21/5', '22/5', '23/5', '24/5'] },
];

export function NtdRemindersPage() {
  const [reminders, setReminders] = useState(DEMO_REMINDERS);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('homework');
  const [newDue, setNewDue] = useState('');
  const [newSubject, setNewSubject] = useState('Toán');
  const [activeWeek, setActiveWeek] = useState(0);
  const [showDone, setShowDone] = useState(true);

  const toggle = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const add = () => {
    if (!newTitle.trim()) return;
    setReminders(prev => [{
      id: `r${Date.now()}`,
      title: newTitle,
      type: newType,
      due: newDue,
      done: false,
      subject: newSubject,
      priority: 2,
    }, ...prev]);
    setNewTitle('');
  };

  const pending = reminders.filter(r => !r.done);
  const done = reminders.filter(r => r.done);

  const formatDate = (d: string) => {
    if (!d) return 'Hằng ngày';
    const [y, m, day] = d.split('-');
    return `${day}/${m}`;
  };

  const daysRemaining = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return Math.max(0, diff);
  };

  const getDayOfWeek = (d: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(day));
    return ['CN','T2','T3','T4','T5','T6','T7'][date.getDay()];
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[24px] border border-[#dbeafe] bg-gradient-to-br from-white via-[#f0f7ff] to-[#eff6ff] p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${NTD_PRIMARY}20` }}>🔔</span>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: NTD_PRIMARY }}>Lịch & Nhắc nhở</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: NTD_PRIMARY_DARK }}>
          Lịch & Nhắc nhở
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {pending.length} việc đang chờ · {done.length} đã hoàn thành
        </p>

        {/* Add Reminder */}
        <div className="mt-5 flex flex-wrap gap-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Thêm nhắc nhở mới..."
            className="flex-1 min-w-[200px] rounded-xl border-2 border-[#dbeafe] bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4D97FF] focus:ring-4 focus:ring-[#4D97FF]/10"
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="rounded-xl border-2 border-[#dbeafe] bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#4D97FF]"
          >
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={newDue}
            onChange={e => setNewDue(e.target.value)}
            className="rounded-xl border-2 border-[#dbeafe] bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#4D97FF]"
          />
          <select
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            className="rounded-xl border-2 border-[#dbeafe] bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#4D97FF]"
          >
            {['Toán','Ngữ văn','Tiếng Anh','Vật lý','Hóa học','Sinh học','Lịch sử','Địa lý','GDCD','Tin học','CLB','Tổng hợp'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={add}
            className="rounded-xl px-6 py-3 text-sm font-black text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_PRIMARY_DARK})`, boxShadow: `0 4px 16px ${NTD_PRIMARY}40` }}
          >
            + Thêm
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Calendar + Pending */}
        <div className="space-y-6 lg:col-span-2">
          {/* Week Calendar */}
          <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Lịch tuần</h2>
            <div className="mb-4 flex gap-2">
              {WEEKS.map((w, i) => (
                <button key={i} onClick={() => setActiveWeek(i)}
                  className="rounded-xl px-4 py-2 text-sm font-bold transition-all"
                  style={activeWeek === i ? { background: `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_PRIMARY_DARK})`, color: 'white' } : { border: '1px solid #dbeafe', color: '#64748b', background: 'white' }}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {WEEKS[activeWeek].dates.map((d, i) => {
                const dayReminders = pending.filter(r => {
                  if (!r.due) return false;
                  const [y, m, day] = r.due.split('-');
                  return d === `${day}/${m}`;
                });
                const isToday = d === '15/5';
                return (
                  <div key={i}
                    className="flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all"
                    style={isToday ? { borderColor: NTD_ACCENT, background: `${NTD_ACCENT}15` } : { borderColor: '#dbeafe', background: 'white' }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: isToday ? '#92400e' : '#94a3b8' }}>{['T2','T3','T4','T5','T6','T7','CN'][i]}</span>
                    <span className="text-lg font-black" style={{ color: isToday ? '#92400e' : '#334155' }}>{d.split('/')[1]}</span>
                    {dayReminders.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayReminders.slice(0, 3).map(r => (
                          <div key={r.id} className="w-full truncate rounded px-1 py-0.5 text-[8px] font-bold text-white" style={{ background: TYPE_CONFIG[r.type]?.color || NTD_PRIMARY }}>
                            {r.title.substring(0, 12)}
                          </div>
                        ))}
                        {dayReminders.length > 3 && (
                          <span className="text-[8px] text-slate-400">+{dayReminders.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending List */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>
                Việc cần làm <span className="text-sm font-normal text-slate-400">({pending.length})</span>
              </h2>
              <button onClick={() => setShowDone(v => !v)} className="text-sm font-bold text-slate-400 hover:text-slate-600">
                {showDone ? 'Ẩn đã xong' : 'Hiện đã xong'}
              </button>
            </div>
            <div className="space-y-3">
              {[...pending, ...(showDone ? done : [])].map(r => {
                const config = TYPE_CONFIG[r.type] || TYPE_CONFIG.reminder;
                return (
                  <div key={r.id}
                    className="flex items-start gap-4 rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:shadow-md"
                    style={{ borderLeftWidth: 4, borderLeftColor: r.done ? '#10B981' : config.color, opacity: r.done ? 0.65 : 1 }}
                  >
                    <button onClick={() => toggle(r.id)}
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black transition-all active:scale-80"
                      style={{ borderColor: r.done ? '#10B981' : config.color, background: r.done ? '#10B981' : 'white', color: r.done ? 'white' : config.color }}
                    >
                      {r.done ? '✓' : ''}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.emoji}</span>
                        <h3 className="font-black text-slate-800" style={{ textDecoration: r.done ? 'line-through' : 'none' }}>{r.title}</h3>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${config.color}15`, color: config.color }}>{r.subject}</span>
                        {r.recurring && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">🔁</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-slate-400">
                        {r.due ? (
                          <>
                            <span>{getDayOfWeek(r.due)} {formatDate(r.due)}</span>
                            <span>·</span>
                            <span>Còn {daysRemaining(r.due)} ngày</span>
                          </>
                        ) : (
                          <span>{config.label} hằng ngày</span>
                        )}
                        {r.note && <span>· 📌 {r.note}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {[3, 2, 1].map(p => (
                        <div key={p} className="h-2 w-2 rounded-full" style={{ background: p <= r.priority ? config.color : '#e2e8f0', marginBottom: 2 }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Thống kê</h2>
            <div className="space-y-4">
              {Object.entries(TYPE_CONFIG).map(([k, v]) => {
                const count = reminders.filter(r => r.type === k && !r.done).length;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-xl">{v.emoji}</span>
                    <span className="flex-1 text-sm font-semibold text-slate-600">{v.label}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black" style={{ background: `${v.color}15`, color: v.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl border border-[#FCDC62]/40 bg-[#FFFBE5] p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-amber-800">📅 Sắp tới</h2>
            <div className="space-y-3">
              {pending.filter(r => r.due).sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()).slice(0, 5).map(r => {
                const config = TYPE_CONFIG[r.type] || TYPE_CONFIG.reminder;
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xl">{config.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(r.due)}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold" style={{ color: config.color }}>{config.label}</span>
                  </div>
                );
              })}
              {pending.filter(r => r.due).length === 0 && (
                <p className="text-sm text-slate-400">Không có nhắc nhở sắp tới.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
