'use client';

import { useMemo, useState } from 'react';

// ── NTD color palette ─────────────────────── */
const NTD_PRIMARY = '#4D97FF';
const NTD_PRIMARY_DARK = '#0F3460';
const NTD_ACCENT = '#FCDC62';

type SchoolSlug = 'ntd' | 'sdu';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type ScheduleKind = 'theory' | 'practice' | 'online' | 'exam' | 'paused';

type ScheduleItem = {
  id: string;
  title: string;
  code: string;
  lecturer: string;
  room: string;
  building: string;
  dayKey: DayKey;
  start: string;
  end: string;
  period: string;
  kind: ScheduleKind;
  note?: string;
  credits: number;
  students: number;
};

const DAYS: Record<DayKey, { short: string; full: string }> = {
  mon: { short: 'T2', full: 'Thứ Hai' },
  tue: { short: 'T3', full: 'Thứ Ba' },
  wed: { short: 'T4', full: 'Thứ Tư' },
  thu: { short: 'T5', full: 'Thứ Năm' },
  fri: { short: 'T6', full: 'Thứ Sáu' },
  sat: { short: 'T7', full: 'Thứ Bảy' },
  sun: { short: 'CN', full: 'Chủ Nhật' },
};

const demoSchedule: ScheduleItem[] = [
  { id: '1', title: 'Toán', code: 'TOAN 101', lecturer: 'ThS. Nguyễn Văn A', room: '301', building: 'Tòa A', dayKey: 'mon', start: '07:00', end: '08:30', period: 'Tiết 1-2', kind: 'theory', credits: 4, students: 45, note: 'Mang theo sách giáo khoa' },
  { id: '2', title: 'Ngữ văn', code: 'NVAN 101', lecturer: 'ThS. Trần Thị B', room: '205', building: 'Tòa A', dayKey: 'mon', start: '08:45', end: '10:15', period: 'Tiết 3-4', kind: 'theory', credits: 3, students: 40 },
  { id: '3', title: 'Tiếng Anh', code: 'TANH 101', lecturer: 'Cô Lê Thị C', room: '102', building: 'Tòa B', dayKey: 'mon', start: '10:30', end: '12:00', period: 'Tiết 5-6', kind: 'practice', credits: 3, students: 35 },
  { id: '4', title: 'Vật lý', code: 'VLY 101', lecturer: 'ThS. Hoàng Văn D', room: '401', building: 'Tòa C', dayKey: 'tue', start: '07:00', end: '08:30', period: 'Tiết 1-2', kind: 'theory', credits: 4, students: 42 },
  { id: '5', title: 'Hóa học', code: 'HOA 101', lecturer: 'TS. Phạm Thị E', room: '303', building: 'Tòa C', dayKey: 'tue', start: '08:45', end: '10:15', period: 'Tiết 3-4', kind: 'practice', credits: 3, students: 38 },
  { id: '6', title: 'Sinh học', code: 'SINH 101', lecturer: 'ThS. Lê Văn F', room: '205', building: 'Tòa A', dayKey: 'wed', start: '13:30', end: '15:00', period: 'Tiết 7-8', kind: 'theory', credits: 3, students: 44 },
  { id: '7', title: 'Lịch sử', code: 'LSU 101', lecturer: 'ThS. Ngô Thị G', room: '108', building: 'Tòa A', dayKey: 'thu', start: '07:00', end: '08:30', period: 'Tiết 1-2', kind: 'theory', credits: 2, students: 50 },
  { id: '8', title: 'Địa lý', code: 'DIA 101', lecturer: 'ThS. Vũ Văn H', room: '210', building: 'Tòa B', dayKey: 'thu', start: '13:30', end: '15:00', period: 'Tiết 7-8', kind: 'practice', credits: 2, students: 48 },
  { id: '9', title: 'GDCD', code: 'GDCD 101', lecturer: 'Cô Đặng Thị I', room: '305', building: 'Tòa A', dayKey: 'fri', start: '10:30', end: '12:00', period: 'Tiết 5-6', kind: 'theory', credits: 2, students: 52 },
  { id: '10', title: 'Công nghệ', code: 'CNGH 101', lecturer: 'ThS. Bùi Văn J', room: 'B102', building: 'Lab B', dayKey: 'fri', start: '13:30', end: '15:00', period: 'Tiết 7-8', kind: 'practice', credits: 2, students: 36 },
  { id: '11', title: 'Tin học', code: 'TINH 101', lecturer: 'ThS. Đỗ Thị K', room: 'B201', building: 'Lab B', dayKey: 'sat', start: '08:00', end: '09:30', period: 'Buổi sáng', kind: 'practice', credits: 2, students: 30 },
  { id: '12', title: 'Thi Toán', code: 'TOAN-E', lecturer: 'Ban coi thi', room: 'A101', building: 'Tòa A', dayKey: 'fri', start: '08:00', end: '10:00', period: 'Ca thi sáng', kind: 'exam', credits: 0, students: 45, note: 'Mang theo bút chì và máy tính' },
];

function getWeekDates(weekOffset: number = 0): Date[] {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString();
}

function kindColor(kind: ScheduleKind, primary: string, primaryDark: string) {
  if (kind === 'exam') return { bg: '#fef3c7', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700 border-amber-200', grad: 'from-amber-500 to-orange-500' };
  if (kind === 'paused') return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', badge: 'bg-slate-200 text-slate-600 border-slate-300', grad: 'from-slate-400 to-slate-500' };
  return { bg: `${primary}12`, border: `${primary}30`, text: primary, badge: `text-white border-0`, grad: `from-[${primary}] to-[${primaryDark}]` };
}

export function SchedulePage({ school: schoolSlug }: { school?: SchoolSlug }) {
  const isNtd = schoolSlug === 'ntd';
  const primary = isNtd ? NTD_PRIMARY : '#3BAEE8';
  const primaryDark = isNtd ? NTD_PRIMARY_DARK : '#2592D8';
  const accent = NTD_ACCENT;

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>('all');

  const weekDates = useMemo(() => getWeekDates(currentWeekOffset), [currentWeekOffset]);

  const filteredSchedule = useMemo(() => {
    if (selectedDay === 'all') return demoSchedule;
    return demoSchedule.filter(item => item.dayKey === selectedDay);
  }, [selectedDay]);

  const groupedByDay = useMemo(() => {
    const groups: Record<DayKey, ScheduleItem[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    demoSchedule.forEach(item => { groups[item.dayKey].push(item); });
    return groups;
  }, []);

  const stats = useMemo(() => ({
    total: demoSchedule.length,
    theory: demoSchedule.filter(s => s.kind === 'theory').length,
    practice: demoSchedule.filter(s => s.kind === 'practice').length,
    exam: demoSchedule.filter(s => s.kind === 'exam').length,
    online: demoSchedule.filter(s => s.kind === 'online').length,
    credits: demoSchedule.reduce((sum, s) => sum + s.credits, 0),
  }), []);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (currentWeekOffset === 0) return `Tuần này`;
    if (currentWeekOffset === 1) return `Tuần sau`;
    if (currentWeekOffset === -1) return `Tuần trước`;
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  }, [currentWeekOffset, weekDates]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 md:p-6">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-[0.05] blur-3xl" style={{ background: primary }} />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full opacity-[0.06] blur-3xl" style={{ background: accent }} />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full opacity-[0.04] blur-3xl" style={{ background: primary }} />
      </div>

      {/* Header */}
      <header className="mb-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl" style={{ boxShadow: `0 20px 60px ${primary}15` }}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, boxShadow: `0 8px 24px ${primary}40` }}>
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${primary}15`, color: primary }}>HỌC TẬP</span>
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${accent}30`, color: '#92400e' }}>HK2 2025-2026</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">Thời Khóa Biểu</h1>
                <p className="mt-1 text-sm text-slate-500">Học kỳ 2 năm học 2025-2026</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[
                { label: 'Tổng buổi', value: stats.total, icon: '📅' },
                { label: 'Lý thuyết', value: stats.theory, icon: '📚' },
                { label: 'Thực hành', value: stats.practice, icon: '💻' },
                { label: 'Thi', value: stats.exam, icon: '📝' },
                { label: 'Tín chỉ', value: stats.credits, icon: '🎓' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: stat.label === 'Thi' ? '#fef3c7' : `${primary}10` }}>
                  <span className="text-xl">{stat.icon}</span>
                  <p className="mt-1 text-xl font-black" style={{ color: stat.label === 'Thi' ? '#d97706' : primary }}>{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentWeekOffset(p => p - 1)} className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white text-sm font-bold shadow-sm transition-all active:scale-95" style={{ borderColor: `${primary}40`, color: primary }}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-white px-5 py-2 shadow-sm">
            <span className="text-sm font-bold text-slate-700">{weekLabel}</span>
            <span className="text-xs text-slate-400">{weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} - {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}</span>
          </div>
          <button onClick={() => setCurrentWeekOffset(p => p + 1)} className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white text-sm font-bold shadow-sm transition-all active:scale-95" style={{ borderColor: `${primary}40`, color: primary }}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          {currentWeekOffset !== 0 && (
            <button onClick={() => setCurrentWeekOffset(0)} className="rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, boxShadow: `0 4px 16px ${primary}40` }}>
              Quay về tuần này
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedDay('all')} className="rounded-2xl px-5 py-3 text-sm font-bold transition-all active:scale-95" style={selectedDay === 'all' ? { background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, color: 'white', boxShadow: `0 4px 16px ${primary}40` } : { border: `2px solid ${primary}40`, background: 'white', color: primary }}>
            📅 Tất cả
          </button>
          {(Object.keys(DAYS) as DayKey[]).slice(0, 5).map(key => (
            <button key={key} onClick={() => setSelectedDay(key)} className="rounded-2xl px-4 py-3 text-sm font-bold transition-all active:scale-95" style={selectedDay === key ? { background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, color: 'white', boxShadow: `0 4px 16px ${primary}40` } : { border: `2px solid ${primary}40`, background: 'white', color: primary }}>
              {DAYS[key].short}
            </button>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      <div className="mb-6 grid grid-cols-5 gap-3">
        {weekDates.slice(0, 5).map((date, i) => {
          const dayKey = (Object.keys(DAYS) as DayKey[])[i];
          const isSelected = selectedDay === dayKey;
          const isTodayDate = isToday(date);
          const hasSchedule = groupedByDay[dayKey].length > 0;
          return (
            <button key={dayKey} onClick={() => setSelectedDay(isSelected ? 'all' : dayKey)}
              className="group relative rounded-2xl border-2 p-4 transition-all duration-300 active:scale-95"
              style={isSelected ? { background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, borderColor: 'transparent', boxShadow: `0 8px 32px ${primary}40` } : isTodayDate ? { borderColor: `${accent}80`, background: 'white', boxShadow: `0 8px 24px ${accent}30` } : { borderColor: `${primary}20`, background: 'white' }}
            >
              <p className="text-xs font-bold" style={isSelected ? { color: 'rgba(255,255,255,0.8)' } : isTodayDate ? { color: '#d97706' } : { color: '#64748b' }}>{DAYS[dayKey].full}</p>
              <p className="mt-1 text-3xl font-black" style={isSelected ? { color: 'white' } : isTodayDate ? { color: '#d97706' } : { color: '#1e293b' }}>{date.getDate()}</p>
              <p className="mt-1 text-xs font-medium" style={isSelected ? { color: 'rgba(255,255,255,0.6)' } : { color: '#94a3b8' }}>{hasSchedule ? `${groupedByDay[dayKey].length} buổi` : 'Nghỉ'}</p>
              {isTodayDate && !isSelected && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black text-white shadow" style={{ background: accent, color: '#7B5E00', boxShadow: `0 2px 8px ${accent}60` }}>HÔM NAY</span>
              )}
              {hasSchedule && !isSelected && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg" style={{ background: primary }}>{groupedByDay[dayKey].length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Content */}
      <div className="space-y-6">
        {filteredSchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/80 py-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100"><svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
            <p className="mt-6 text-xl font-bold text-slate-700">Không có lịch học</p>
            <p className="mt-2 text-sm text-slate-500">Chọn ngày khác hoặc xem tất cả các buổi học</p>
          </div>
        ) : selectedDay === 'all' ? (
          (['mon', 'tue', 'wed', 'thu', 'fri'] as DayKey[]).map(dayKey => {
            const dayItems = groupedByDay[dayKey];
            if (dayItems.length === 0) return null;
            const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(dayKey);
            const date = weekDates[dayIndex];
            const isTodayDate = isToday(date);
            return (
              <div key={dayKey} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 rounded-2xl px-5 py-3 text-white shadow-lg" style={isTodayDate ? { background: `linear-gradient(145deg, ${accent}, ${isNtd ? '#f5c842' : '#f59e0b'})`, boxShadow: `0 8px 24px ${accent}50` } : { background: `linear-gradient(145deg, ${primaryDark}, ${isNtd ? '#071f3d' : '#0f2540'})`, boxShadow: `0 8px 24px ${primaryDark}30` }}>
                    <span className="text-2xl font-black">{DAYS[dayKey].short}</span>
                    <div className="h-8 w-px bg-white/30" />
                    <div className="text-left">
                      <p className="text-lg font-black">{date.getDate()}</p>
                      <p className="text-xs opacity-80">Tháng {date.getMonth() + 1}</p>
                    </div>
                  </div>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${primary}20, transparent)` }} />
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: `${primary}10` }}>
                    <span className="text-sm font-bold" style={{ color: primary }}>{dayItems.length} buổi học</span>
                    <span style={{ color: `${primary}40` }}>•</span>
                    <span className="text-sm font-bold" style={{ color: primary }}>{dayItems.reduce((sum, i) => sum + i.credits, 0)} tín chỉ</span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dayItems.sort((a, b) => a.start.localeCompare(b.start)).map(item => (
                    <ScheduleCard key={item.id} item={item} primary={primary} primaryDark={primaryDark} accent={accent} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl px-5 py-3 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, boxShadow: `0 8px 24px ${primary}40` }}>
                <span className="text-2xl font-black">{DAYS[selectedDay].short}</span>
                <div className="h-8 w-px bg-white/30" />
                <div className="text-left">
                  <p className="text-lg font-black">{weekDates[['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(selectedDay)].getDate()}</p>
                  <p className="text-xs opacity-80">Tháng {weekDates[['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(selectedDay)].getMonth() + 1}</p>
                </div>
              </div>
              <div className="h-px flex-1" style={{ background: `${primary}20` }} />
              <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: `${primary}10` }}>
                <span className="text-sm font-bold" style={{ color: primary }}>{filteredSchedule.length} buổi học</span>
                <span style={{ color: `${primary}40` }}>•</span>
                <span className="text-sm font-bold" style={{ color: primary }}>{filteredSchedule.reduce((sum, i) => sum + i.credits, 0)} tín chỉ</span>
              </div>
            </div>
            <div className="space-y-4">
              {filteredSchedule.sort((a, b) => a.start.localeCompare(b.start)).map(item => (
                <ScheduleCardDetailed key={item.id} item={item} primary={primary} primaryDark={primaryDark} accent={accent} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur">
        {[
          { label: 'Lý thuyết', grad: `from-[${primary}] to-[${primaryDark}]` },
          { label: 'Thực hành', grad: `from-[${primary}] to-[${primaryDark}]` },
          { label: 'Thi', grad: 'from-amber-500 to-orange-500' },
          { label: 'Tạm ngưng', grad: 'from-slate-400 to-slate-500' },
        ].map(k => (
          <div key={k.label} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-lg bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${k.grad.split(' from-[')[0] || primary}, ${k.grad.includes('[${primaryDark}]') ? primaryDark : k.grad.includes('orange') ? '#f97316' : '#64748b'})` }}>
              <div className="h-4 w-4 rounded-lg bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${k.grad.replace(`from-[${primary}]`, primary).replace(`to-[${primaryDark}]`, primaryDark).replace('from-amber-500', '#f59e0b').replace('to-orange-500', '#f97316').replace('from-slate-400', '#94a3b8').replace('to-slate-500', '#64748b')}` }} />
            </div>
            <span className="text-sm font-medium text-slate-600">{k.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScheduleCard({ item, primary, primaryDark, accent }: { item: ScheduleItem; primary: string; primaryDark: string; accent: string }) {
  const k = kindColor(item.kind, primary, primaryDark);

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: `${primary}25` }}>
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r" style={{ background: k.grad.replace(`from-[${primary}]`, primary).replace(`to-[${primaryDark}]`, primaryDark) }} />
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold" style={{ background: item.kind === 'theory' || item.kind === 'practice' || item.kind === 'online' ? `linear-gradient(135deg, ${primary}, ${primaryDark})` : '#fef3c7', color: item.kind === 'theory' || item.kind === 'practice' || item.kind === 'online' ? 'white' : '#92400e' }}>
            {item.kind === 'theory' ? '📖' : item.kind === 'practice' ? '💻' : item.kind === 'exam' ? '📝' : item.kind === 'paused' ? '⏸' : '🌐'} {item.kind === 'theory' ? 'Lý thuyết' : item.kind === 'practice' ? 'Thực hành' : item.kind === 'exam' ? 'Thi' : item.kind === 'paused' ? 'Tạm ngưng' : 'Trực tuyến'}
          </span>
          <span className="text-xs font-medium text-slate-400">{item.code}</span>
        </div>
        <div className="rounded-xl px-3 py-2 text-center" style={{ background: `${primary}12` }}>
          <p className="text-lg font-black" style={{ color: primary }}>{item.start}</p>
          <p className="text-xs font-semibold" style={{ color: `${primary}70` }}>{item.end}</p>
        </div>
      </div>
      <h3 className="mb-3 text-lg font-bold leading-tight text-slate-800 transition-colors group-hover:text-blue-600">{item.title}</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">🎓 {item.credits > 0 ? `${item.credits} tín chỉ` : 'Không tín chỉ'}</span>
        {item.students > 0 && <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">👥 {item.students} HS</span>}
      </div>
      <div className="space-y-3 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${primary}18` }}>
            <svg className="h-5 w-5" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: `${primary}70` }}>Phòng học</p>
            <p className="font-bold text-slate-800">{item.room}</p>
            <p className="text-xs text-slate-500">{item.building}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Giáo viên</p>
            <p className="font-bold text-slate-800">{item.lecturer}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${primary}18` }}>
            <svg className="h-5 w-5" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tiết/Buổi</p>
            <p className="font-bold text-slate-800">{item.period}</p>
          </div>
        </div>
      </div>
      {item.note && (
        <div className="mt-4 flex items-start gap-2 rounded-xl p-3" style={{ background: `${accent}30` }}>
          <span className="text-lg">📌</span>
          <p className="text-sm font-medium" style={{ color: '#92400e' }}>{item.note}</p>
        </div>
      )}
    </div>
  );
}

function ScheduleCardDetailed({ item, primary, primaryDark, accent }: { item: ScheduleItem; primary: string; primaryDark: string; accent: string }) {
  const k = kindColor(item.kind, primary, primaryDark);
  const grad = k.grad.replace(`from-[${primary}]`, primary).replace(`to-[${primaryDark}]`, primaryDark);

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl" style={{ borderColor: `${primary}25` }}>
      <div className="absolute inset-y-0 left-0 w-2 rounded-l-2xl bg-gradient-to-b" style={{ background: grad }} />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="shrink-0">
          <div className="inline-flex flex-col items-center rounded-2xl p-4" style={{ background: `${primary}12` }}>
            <p className="text-3xl font-black" style={{ color: primary }}>{item.start}</p>
            <div className="my-1 h-px w-12" style={{ background: `${primary}30` }} />
            <p className="text-lg font-bold" style={{ color: primary }}>{item.end}</p>
          </div>
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-bold" style={{ background: item.kind === 'theory' || item.kind === 'practice' || item.kind === 'online' ? `linear-gradient(135deg, ${primary}, ${primaryDark})` : '#fef3c7', color: item.kind === 'theory' || item.kind === 'practice' || item.kind === 'online' ? 'white' : '#92400e' }}>
              {item.kind === 'theory' ? '📖' : item.kind === 'practice' ? '💻' : item.kind === 'exam' ? '📝' : item.kind === 'paused' ? '⏸' : '🌐'} {item.kind === 'theory' ? 'Lý thuyết' : item.kind === 'practice' ? 'Thực hành' : item.kind === 'exam' ? 'Thi' : item.kind === 'paused' ? 'Tạm ngưng' : 'Trực tuyến'}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{item.code}</span>
            <span className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: `${primary}15`, color: primary }}>🎓 {item.credits > 0 ? `${item.credits} tín chỉ` : 'Không tín chỉ'}</span>
            {item.students > 0 && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">👥 {item.students} HS</span>}
          </div>
          <h3 className="text-2xl font-black text-slate-800 transition-colors group-hover:text-blue-600">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.period}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: `${primary}10` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${primary}20` }}>
                <svg className="h-6 w-6" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: `${primary}70` }}>Phòng học</p>
                <p className="text-lg font-black" style={{ color: primaryDark }}>{item.room}</p>
                <p className="text-xs" style={{ color: `${primary}60` }}>{item.building}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-500">Giáo viên</p>
                <p className="text-lg font-black text-emerald-700">{item.lecturer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: `${primary}10` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${primary}20` }}>
                <svg className="h-6 w-6" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: `${primary}70` }}>Thời gian</p>
                <p className="text-lg font-black" style={{ color: primaryDark }}>{item.start} - {item.end}</p>
                <p className="text-xs" style={{ color: `${primary}60` }}>{item.period}</p>
              </div>
            </div>
          </div>
          {item.note && (
            <div className="mt-4 flex items-start gap-3 rounded-xl p-4" style={{ background: `${accent}30` }}>
              <span className="text-2xl">📌</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#92400e' }}>Ghi chú quan trọng</p>
                <p className="text-sm" style={{ color: '#a16207' }}>{item.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
