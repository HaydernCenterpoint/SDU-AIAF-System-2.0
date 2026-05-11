'use client';

import { useState } from 'react';
import { NtdSidebar } from './NtdSidebar';
import styles from './NtdDashboard.module.css';

interface NtdDashboardPageProps {
  embedded?: boolean;
}

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

const KIND_CONFIG: Record<ScheduleKind, {
  label: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  gradient: string;
}> = {
  theory: {
    label: 'Lý thuyết',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    gradient: 'from-[#4D97FF] to-[#0F3460]',
  },
  practice: {
    label: 'Thực hành',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    gradient: 'from-[#4D97FF] to-[#0F3460]',
  },
  online: {
    label: 'Trực tuyến',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    gradient: 'from-[#4D97FF] to-[#0F3460]',
  },
  exam: {
    label: 'Thi',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    gradient: 'from-amber-500 to-orange-500',
  },
  paused: {
    label: 'Tạm ngưng',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-600',
    badge: 'bg-slate-200 text-slate-600 border-slate-300',
    gradient: 'from-slate-400 to-slate-500',
  },
};

const demoSchedule: ScheduleItem[] = [
  { id: '1', title: 'Toán', code: 'TOAN 101', lecturer: 'ThS. Nguyễn Văn A', room: '301', building: 'Tòa A', dayKey: 'mon', start: '07:00', end: '08:30', period: 'Tiết 1-2', kind: 'theory', credits: 4, students: 45 },
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

export function NtdDashboardPage({ embedded = false }: NtdDashboardPageProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>('all');

  const content = (
    <NtdDashboardContent
      selectedDay={selectedDay}
      setSelectedDay={setSelectedDay}
      currentWeekOffset={currentWeekOffset}
      setCurrentWeekOffset={setCurrentWeekOffset}
    />
  );

  if (embedded) {
    return (
      <div className={`${styles.container} ${styles.embedded}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NtdSidebar activeItem="dashboard" />
      {content}
    </div>
  );
}

function NtdDashboardContent({
  selectedDay,
  setSelectedDay,
  currentWeekOffset,
  setCurrentWeekOffset,
}: {
  selectedDay: DayKey | 'all';
  setSelectedDay: (d: DayKey | 'all') => void;
  currentWeekOffset: number;
  setCurrentWeekOffset: (f: (prev: number) => number) => void;
}) {
  const weekDates = getWeekDates(currentWeekOffset);

  const groupedByDay: Record<DayKey, ScheduleItem[]> = {
    mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
  };
  demoSchedule.forEach(item => {
    groupedByDay[item.dayKey].push(item);
  });

  const stats = {
    total: demoSchedule.length,
    theory: demoSchedule.filter(s => s.kind === 'theory').length,
    practice: demoSchedule.filter(s => s.kind === 'practice').length,
    exam: demoSchedule.filter(s => s.kind === 'exam').length,
    credits: demoSchedule.reduce((sum, s) => sum + s.credits, 0),
  };

  const weekLabel = (() => {
    if (currentWeekOffset === 0) return `Tuần này`;
    if (currentWeekOffset === 1) return `Tuần sau`;
    if (currentWeekOffset === -1) return `Tuần trước`;
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  })();

  const today = new Date();

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.headerLabel}>Portal THPT Nguyễn Thị Duệ</p>
          <h1 className={styles.headerTitle}>Thời Khóa Biểu</h1>
          <p className={styles.headerSub}>
            {today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.notificationBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className={styles.badge}>3</span>
          </button>
        </div>
      </header>

      {/* Schedule Header */}
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleHeaderLeft}>
          <div className={styles.scheduleIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className={styles.scheduleTags}>
              <span className={styles.scheduleTagRed}>HỌC TẬP</span>
              <span className={styles.scheduleTagAmber}>HK2 2025-2026</span>
            </div>
            <h2 className={styles.scheduleTitle}>Thời Khóa Biểu</h2>
            <p className={styles.scheduleSubtitle}>Ngày đăng ký: 15/01/2026 - Học kỳ 2 năm học 2025-2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Tổng buổi', value: stats.total, emoji: '📅', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Lý thuyết', value: stats.theory, emoji: '📚', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Thực hành', value: stats.practice, emoji: '💻', color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Thi', value: stats.exam, emoji: '📝', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Tín chỉ', value: stats.credits, emoji: '🎓', color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${styles.statBox} ${stat.bg}`}>
              <span className={styles.statEmoji}>{stat.emoji}</span>
              <p className={`${styles.statValue} ${stat.color}`}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.weekNav}>
          <button
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className={styles.weekNavBtn}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={styles.weekLabel}>
            <span className={styles.weekLabelText}>{weekLabel}</span>
            <span className={styles.weekLabelDate}>
              {weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} - {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}
            </span>
          </div>

          <button
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className={styles.weekNavBtn}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {currentWeekOffset !== 0 && (
            <button
              onClick={() => setCurrentWeekOffset((_prev) => 0)}
              className={styles.weekBackBtn}
            >
              Quay về tuần này
            </button>
          )}
        </div>

        {/* Day Filter */}
        <div className={styles.dayFilters}>
          <button
            onClick={() => setSelectedDay('all')}
            className={`${styles.dayFilterBtn} ${selectedDay === 'all' ? styles.dayFilterActive : ''}`}
          >
            📅 Tất cả
          </button>
          {(['mon', 'tue', 'wed', 'thu', 'fri'] as DayKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`${styles.dayFilterBtn} ${selectedDay === key ? styles.dayFilterActive : ''}`}
            >
              {DAYS[key].short}
            </button>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      <div className={styles.dayTabs}>
        {weekDates.slice(0, 5).map((date, i) => {
          const dayKey = (['mon', 'tue', 'wed', 'thu', 'fri'] as DayKey[])[i];
          const isSelected = selectedDay === dayKey;
          const isTodayDate = isToday(date);
          const hasSchedule = groupedByDay[dayKey].length > 0;
          const dayConfig = groupedByDay[dayKey];

          return (
            <button
              key={dayKey}
              onClick={() => setSelectedDay(isSelected ? 'all' : dayKey)}
              className={`${styles.dayTab} ${isSelected ? styles.dayTabSelected : ''} ${isTodayDate && !isSelected ? styles.dayTabToday : ''}`}
            >
              <p className={`${styles.dayTabName} ${isSelected ? styles.dayTabNameSelected : ''} ${isTodayDate && !isSelected ? styles.dayTabNameToday : ''}`}>
                {DAYS[dayKey].full}
              </p>
              <p className={`${styles.dayTabDate} ${isSelected ? styles.dayTabDateSelected : ''} ${isTodayDate && !isSelected ? styles.dayTabDateToday : ''}`}>
                {date.getDate()}
              </p>
              <p className={`${styles.dayTabCount} ${isSelected ? styles.dayTabCountSelected : ''}`}>
                {hasSchedule ? `${dayConfig.length} buổi` : 'Nghỉ'}
              </p>

              {isTodayDate && !isSelected && (
                <span className={styles.todayBadge}>HÔM NAY</span>
              )}

              {hasSchedule && !isSelected && (
                <span className={styles.countBadge}>{dayConfig.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Content */}
      <div className={styles.scheduleContent}>
        {(['mon', 'tue', 'wed', 'thu', 'fri'] as DayKey[]).map(dayKey => {
          const dayItems = groupedByDay[dayKey];
          if (dayItems.length === 0) return null;
          if (selectedDay !== 'all' && selectedDay !== dayKey) return null;

          const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(dayKey);
          const date = weekDates[dayIndex];
          const isTodayDate = isToday(date);

          return (
            <div key={dayKey} className={styles.daySection}>
              {/* Day Header */}
              <div className={styles.daySectionHeader}>
                <div className={`${styles.dayHeaderBadge} ${isTodayDate ? styles.dayHeaderBadgeToday : ''}`}>
                  <span className={styles.dayHeaderShort}>{DAYS[dayKey].short}</span>
                  <div className={styles.dayHeaderDivider} />
                  <div className={styles.dayHeaderDate}>
                    <p className={styles.dayHeaderDayNum}>{date.getDate()}</p>
                    <p className={styles.dayHeaderMonth}>Tháng {date.getMonth() + 1}</p>
                  </div>
                </div>
                <div className={styles.dayHeaderLine} />
                <div className={styles.dayHeaderMeta}>
                  <span className={styles.dayHeaderMetaText}>{dayItems.length} buổi học</span>
                  <span className={styles.dayHeaderMetaDot}>•</span>
                  <span className={styles.dayHeaderMetaText}>{dayItems.reduce((sum, i) => sum + i.credits, 0)} tín chỉ</span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className={styles.cardsGrid}>
                {dayItems.sort((a, b) => a.start.localeCompare(b.start)).map(item => (
                  <div key={item.id} className={`${styles.card} ${KIND_CONFIG[item.kind].border}`}>
                    <div className={`${styles.cardTopBar} bg-gradient-to-r ${KIND_CONFIG[item.kind].gradient}`} />
                    <div className={styles.cardHeader}>
                      <div className={styles.cardBadgeWrap}>
                        <span className={`${styles.cardBadge} ${KIND_CONFIG[item.kind].badge}`}>
                          {KIND_CONFIG[item.kind].label}
                        </span>
                        <span className={styles.cardCode}>{item.code}</span>
                      </div>
                      <div className={`${styles.cardTime} ${KIND_CONFIG[item.kind].bg}`}>
                        <p className={`${styles.cardTimeStart} ${KIND_CONFIG[item.kind].text}`}>{item.start}</p>
                        <p className={`${styles.cardTimeEnd} ${KIND_CONFIG[item.kind].text}`}>{item.end}</p>
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <div className={styles.cardTags}>
                      <span className={styles.cardTag}>
                        🎓 {item.credits > 0 ? `${item.credits} tín chỉ` : 'Không tín chỉ'}
                      </span>
                      {item.students > 0 && (
                        <span className={styles.cardTag}>👥 {item.students} HS</span>
                      )}
                    </div>
                    <div className={styles.cardDetails}>
                      <div className={styles.cardDetailItem}>
                        <div className={styles.cardDetailIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={styles.cardDetailLabel}>Phòng học</p>
                          <p className={styles.cardDetailValue}>{item.room}</p>
                          <p className={styles.cardDetailSub}>{item.building}</p>
                        </div>
                      </div>
                      <div className={styles.cardDetailItem}>
                        <div className={`${styles.cardDetailIcon} ${styles.cardDetailIconGreen}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className={styles.cardDetailLabel}>Giáo viên</p>
                          <p className={styles.cardDetailValue}>{item.lecturer}</p>
                        </div>
                      </div>
                      <div className={styles.cardDetailItem}>
                        <div className={styles.cardDetailIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={styles.cardDetailLabel}>Tiết/Buổi</p>
                          <p className={styles.cardDetailValue}>{item.period}</p>
                        </div>
                      </div>
                    </div>
                    {item.note && (
                      <div className={styles.cardNote}>
                        <span>📌</span>
                        <p>{item.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(KIND_CONFIG).map(([key, config]) => (
          <div key={key} className={styles.legendItem}>
            <div className={`${styles.legendDot} bg-gradient-to-br ${config.gradient}`} />
            <span className={styles.legendText}>{config.label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
