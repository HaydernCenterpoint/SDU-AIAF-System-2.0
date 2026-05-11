// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getSchoolCvPath, resolveSchoolSlugFromBackendId } from '@/lib/school-site';
import { AIRecommendationsWidget } from '@/components/AIRecommendationsWidget';
import type { ScheduleItem } from '@/types';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/* ── NTD color palette ─────────────────────── */
const NTD_PRIMARY = '#4D97FF';
const NTD_PRIMARY_DARK = '#0F3460';
const NTD_ACCENT = '#FCDC62';

type SchoolSlug = 'ntd' | 'sdu';

/* ── Custom SVG Icons (Lucide-style, stroke-based) ─────────────── */
type IconProps = { size?: number; color?: string; strokeWidth?: number; className?: string };
const ic = (d: string) => ({ size = 20, color = 'currentColor', strokeWidth = 1.8, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d={d} />
  </svg>
);
const icMulti = (paths: string[]) => ({ size = 20, color = 'currentColor', strokeWidth = 1.8, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

// Section labels
const BookIcon    = ic('M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z');
const BriefcaseIcon = icMulti(['M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z', 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2']);
const HeartIcon   = ic('M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z');

// Card headers
const CalendarIcon = icMulti(['M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z']);
const ChecklistIcon = icMulti(['M9 11l3 3 8-8', 'M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9']);
const FileIcon    = icMulti(['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M16 13H8M16 17H8M10 9H8']);
const RocketIcon  = icMulti(['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z','M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z','M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5']);
const MoonIcon    = ic('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
const DropIcon    = ic('M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z');
const BotIcon     = icMulti(['M12 8V4H8','M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z','M9 13h.01M15 13h.01','M10 16s.8 1 2 1 2-1 2-1']);
const StarIcon    = ic('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
const TrophyIcon  = icMulti(['M6 9H4a2 2 0 0 0-2 2v1a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6v-1a2 2 0 0 0-2-2h-2','M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5','M12 17v4','M8 21h8']);

/* ── Fallback data ───────────────────────────────────────────── */
const fallbackSchedule: ScheduleItem[] = [
  { id: 's1', title: 'Toán',             time: '07:00–08:30', room: '301', type: 'Thứ Hai' },
  { id: 's2', title: 'Ngữ văn',         time: '08:45–10:15', room: '205', type: 'Thứ Hai' },
  { id: 's3', title: 'Tiếng Anh',        time: '10:30–12:00', room: '102', type: 'Thứ Hai' },
];

const assignments = [
  { id: 'a1', label: 'Toán – Bài tập chương 3',    done: true  },
  { id: 'a2', label: 'Ngữ văn – Bài 2.1',           done: false },
  { id: 'a3', label: 'Tiếng Anh – Bài tập Unit 4',  done: false },
];

const projects = [
  { id: 'p1', label: 'Dự án nhóm học tập',          status: 'Đang làm', pct: 65 },
  { id: 'p2', label: 'CLB Sáng tạo THPT',            status: 'Hoàn thành', pct: 100 },
];

const todayPriorities = [
  'Xem tiết học tiếp theo và phòng học.',
  'Mở tài liệu liên quan đến môn đang học.',
  'Hỏi trợ lý để chuẩn bị bài trước giờ lên lớp.',
];

/* ── Main page ───────────────────────────────────────────────── */
export function DashboardPage({ school: schoolSlug }: { school?: SchoolSlug }) {
  const { schedule, setCurrentTab } = useAppStore();
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const resolvedSchool = schoolSlug || resolveSchoolSlugFromBackendId(authUser?.schoolId);
  const isNtd = resolvedSchool === 'ntd';
  const displayName = authUser?.fullName || 'Học sinh';
  const todaySchedule = schedule.length > 0 ? schedule.slice(0, 3) : fallbackSchedule;

  const primary = isNtd ? NTD_PRIMARY : '#3BAEE8';
  const primaryDark = isNtd ? NTD_PRIMARY_DARK : '#2592D8';
  const accent = isNtd ? NTD_ACCENT : '#FFE94D';
  const accentText = isNtd ? '#7B5E00' : '#7B5E00';
  const accentBg = isNtd ? '#fffbeb' : '#FFFCD0';

  return (
    <section className="student-os-fade-up space-y-5">
      {/* ── Hero ────────────────────────────────────────────── */}
      <HeroSection
        displayName={displayName}
        onAskAI={() => setCurrentTab('chat')}
        isNtd={isNtd}
        primary={primary}
        primaryDark={primaryDark}
        accent={accent}
        accentText={accentText}
        accentBg={accentBg}
      />

      {/* ── Content grid ────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <LearningColumn
          schedule={todaySchedule}
          onOpenSchedule={() => setCurrentTab('schedule')}
          onOpenReminders={() => setCurrentTab('reminders')}
          isNtd={isNtd}
          primary={primary}
        />
        <WorkColumn
          onOpenChat={() => setCurrentTab('chat')}
          onOpenReminders={() => setCurrentTab('reminders')}
          onOpenCv={() => router.push(getSchoolCvPath(resolvedSchool))}
          isNtd={isNtd}
          primary={primary}
        />
        <HealthColumn isNtd={isNtd} primary={primary} primaryDark={primaryDark} />
      </div>
    </section>
  );
}

/* ── Hero section ─────────────────────────────────────────────── */
function HeroSection({
  displayName, onAskAI, isNtd, primary, primaryDark, accent, accentText, accentBg,
}: {
  displayName: string;
  onAskAI: () => void;
  isNtd: boolean;
  primary: string;
  primaryDark: string;
  accent: string;
  accentText: string;
  accentBg: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px]"
      style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)` }}
    >
      {/* Wave blob decorations */}
      <svg className="pointer-events-none absolute -left-16 -top-20 h-80 w-80 opacity-20" viewBox="0 0 200 200" aria-hidden>
        <path d="M44.7,-68.4C56.7,-60,63.2,-44.4,69.3,-28.5C75.4,-12.6,81.1,3.6,77.8,18.1C74.5,32.6,62.1,45.4,48.5,55.6C34.9,65.8,20,73.4,3.2,76.2C-13.6,79,-28.2,77,-41.5,70.1C-54.8,63.2,-66.8,51.4,-73.7,37C-80.6,22.6,-82.5,5.6,-78.4,-9.1C-74.3,-23.8,-64.3,-36.2,-51.7,-44.7C-39.1,-53.2,-24,-57.8,-7.4,-62.2C9.2,-66.6,32.7,-76.8,44.7,-68.4Z" fill="white" transform="translate(100 100)" />
      </svg>
      <svg className="pointer-events-none absolute -bottom-12 -right-8 h-64 w-64 opacity-15" viewBox="0 0 200 200" aria-hidden>
        <path d="M39.5,-65.3C50.5,-57.6,58.5,-45.2,64.6,-31.5C70.7,-17.8,74.9,-2.8,72.3,11.4C69.8,25.6,60.4,38.9,48.9,49.4C37.4,59.9,23.8,67.5,7.9,72.7C-8,77.9,-26.2,80.7,-41.5,74.9C-56.8,69.1,-69.2,54.7,-75.9,38.3C-82.6,21.9,-83.6,3.5,-79,-12.9C-74.4,-29.3,-64.3,-43.6,-51.2,-51.7C-38.1,-59.8,-22,-61.7,-6.8,-68.6C8.4,-75.5,28.5,-73,39.5,-65.3Z" fill="white" transform="translate(100 100)" />
      </svg>

      {/* Leaf SVG decorations */}
      <svg className="pointer-events-none absolute right-52 top-2 h-20 w-20 opacity-25" viewBox="0 0 80 80" fill="none" aria-hidden>
        <path d="M40 10 C55 10 70 25 70 45 C70 60 55 70 40 70 C30 70 20 65 15 55 C25 55 35 50 40 40 C45 30 42 20 40 10Z" fill="white" />
        <line x1="40" y1="10" x2="40" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </svg>
      <svg className="pointer-events-none absolute bottom-6 right-44 h-12 w-12 opacity-20 rotate-12" viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 6 C32 6 42 16 42 28 C42 38 33 44 24 44 C18 44 12 40 9 33 C15 33 21 30 24 24 C27 18 25 12 24 6Z" fill="white" />
      </svg>

      <div className="relative grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-8">
        {/* Left: greeting + CTA */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: isNtd ? '#FFD700' : 'rgba(255,255,255,0.85)' }}>
            {isNtd ? 'Trợ lý học tập THPT Nguyễn Thị Duệ' : 'Trợ lý học tập Sao Đỏ'}
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
            Ngày học rõ ràng hơn,<br />
            <span style={{ color: accent }}>{displayName}.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-white/85">
            Theo dõi lịch học, việc cần làm. Mỗi điều diễn ra trong một không gian gọn gàng.
          </p>

          {/* AI suggestion CTA */}
          <button
            onClick={onAskAI}
            className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-[0_12px_34px_rgba(0,0,0,0.15)] transition hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: primary }}>
              <BotIcon size={18} color="white" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-[#112641]">Dự ý cho bạn hôm nay</span>
              <span className="block truncate text-xs font-semibold text-[#64748B]">Ôn tập bài học để nắm chắc kiến thức nhé!</span>
            </span>
            <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ background: primary }}>Xem →</span>
          </button>
        </div>

        {/* Right: priority panel (yellow) */}
        <aside
          className="flex flex-col gap-3 rounded-[20px] p-5"
          style={{ background: `linear-gradient(145deg, ${accent} 0%, ${isNtd ? '#f5c842' : '#FFCD29'} 100%)` }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/50">
              <StarIcon size={14} color={accentText} strokeWidth={2} />
            </span>
            <p className="text-sm font-black" style={{ color: accentText }}>Gợi ý hôm nay</p>
          </div>
          <ul className="space-y-2">
            {todayPriorities.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-semibold" style={{ color: isNtd ? '#5B4300' : '#5B4300' }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/60 text-[11px] font-black" style={{ color: accentText }}>{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
          <button className="mt-auto rounded-xl bg-white/70 px-3 py-2 text-xs font-black transition hover:bg-white/90" style={{ color: accentText }}>
            Xem tất cả gợi ý →
          </button>
        </aside>
      </div>

      {/* Bottom wave divider */}
      <svg className="block w-full" viewBox="0 0 1440 32" preserveAspectRatio="none" style={{ height: 28 }} aria-hidden>
        <path d="M0,20 C240,36 480,0 720,16 C960,32 1200,4 1440,20 L1440,32 L0,32 Z" fill="white" />
      </svg>
    </div>
  );
}

/* ── Learning column ──────────────────────────────────────────── */
function LearningColumn({
  schedule, onOpenSchedule, onOpenReminders, isNtd, primary,
}: {
  schedule: ScheduleItem[];
  onOpenSchedule: () => void;
  onOpenReminders: () => void;
  isNtd: boolean;
  primary: string;
}) {
  const soft = isNtd ? '#e8f4ff' : '#D9F5FF';
  const borderColor = isNtd ? '#93c5fd' : '#A8DCFF';
  const labelColor = primary;

  return (
    <div className="space-y-4">
      <SectionLabel color={labelColor} icon={<BookIcon size={15} color={labelColor} strokeWidth={2} />}>Học tập</SectionLabel>

      {/* Schedule card */}
      <OrgCard accent={soft} borderColor={borderColor}>
        <CardHeader icon={<CalendarIcon size={15} color={primary} strokeWidth={2} />} iconBg={soft} title="Lịch học hôm nay" onMore={onOpenSchedule} />
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wide text-[#64748B]">
              <th className="py-1.5 text-left">Môn học</th>
              <th className="py-1.5 text-center">Tiết</th>
              <th className="py-1.5 text-right">Hôm nay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF5FF]">
            {schedule.map((item) => (
              <tr key={item.id} className="font-semibold text-[#334155]">
                <td className="truncate py-2 pr-2 text-xs">{item.title}</td>
                <td className="py-2 text-center text-[11px]" style={{ color: primary }}>{item.time}</td>
                <td className="py-2 text-right">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: soft, color: primary }}>{item.room}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </OrgCard>

      {/* Assignment card */}
      <OrgCard accent="#F0FFF4" borderColor="#BDEFCC">
        <CardHeader icon={<ChecklistIcon size={15} color="#34835A" strokeWidth={2} />} iconBg="#D1FAE5" title="Bài tập cần làm" onMore={onOpenReminders} />
        <ul className="space-y-1.5">
          {assignments.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold ${item.done ? 'bg-[#F0FFF4] text-[#34835A] line-through' : 'bg-[#FAFAFA] text-[#334155]'}`}
            >
              <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 ${item.done ? 'border-[#34C473] bg-[#34C473]' : 'border-[#CBD5E1]'}`}>
                {item.done && <span className="text-[9px] text-white">✓</span>}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#64748B]">2 việc còn lại</span>
          <span className="flex items-center gap-1 rounded-full bg-[#FFE8EA] px-2.5 py-1 text-[11px] font-black text-[#E31D1C]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#E31D1C" aria-hidden><path d="M12 2L2 20h20L12 2zm0 5v6m0 3v1" stroke="none"/><path d="M12 7v6M12 16v1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            3
          </span>
        </div>
      </OrgCard>
    </div>
  );
}

/* ── Work column ──────────────────────────────────────────────── */
function WorkColumn({
  onOpenChat,
  onOpenReminders,
  onOpenCv,
  isNtd,
  primary,
}: {
  onOpenChat: () => void;
  onOpenReminders: () => void;
  onOpenCv: () => void;
  isNtd: boolean;
  primary: string;
}) {
  return (
    <div className="space-y-4">
      <SectionLabel color="#34C473" icon={<BriefcaseIcon size={15} color="#34C473" strokeWidth={2} />}>Công việc</SectionLabel>

      {/* CV card */}
      <OrgCard accent="#F9FFF5" borderColor="#BDEFCC">
        <CardHeader icon={<FileIcon size={15} color="#34835A" strokeWidth={2} />} iconBg="#D1FAE5" title="CV & Kỹ năng" onMore={onOpenCv} />
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[
              <BotIcon key="bot" size={14} color="white" strokeWidth={2} />,
              <svg key="chart" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="4" width="4" height="17"/></svg>,
              <svg key="pen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 19l7-7-3-3-7 7v3h3zM18 5l1 1-2 2-1-1 2-2z"/></svg>,
              <svg key="light" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>,
            ].map((icon, i) => (
              <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm" style={{ background: `linear-gradient(135deg, ${primary}, ${isNtd ? NTD_PRIMARY_DARK : '#1784DA'})` }}>
                {icon}
              </span>
            ))}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-[#64748B]">Hồ sơ nghề nghiệp</p>
            <p className="text-lg font-black text-[#34835A]">65%</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2F5EA]">
          <div className="h-full rounded-full transition-all" style={{ width: '65%', background: `linear-gradient(to right, #34C473, ${primary})` }} />
        </div>
        <button onClick={onOpenCv} className="mt-2 text-xs font-black text-[#34835A]">Mở CV của bạn →</button>
      </OrgCard>

      {/* Projects card */}
      <OrgCard accent="#FFFBF0" borderColor="#FFE4A0">
        <CardHeader icon={<RocketIcon size={15} color="#B45309" strokeWidth={2} />} iconBg="#FFF3CD" title="Dự án & Hoạt động" onMore={onOpenReminders} />
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id}>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#334155]">
                <span className="truncate">{p.label}</span>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${p.pct === 100 ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FFF3CD] text-[#B45309]'}`}>
                  {p.status}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#FFF0C4]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${p.pct}%`, background: p.pct === 100 ? '#34C473' : `linear-gradient(to right, ${isNtd ? NTD_PRIMARY : '#F59E0B'}, ${isNtd ? NTD_PRIMARY_DARK : '#F97316'})` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-[#E9F9FF] px-2.5 py-1 text-[11px] font-black text-[#1784DA]">2 dự án</span>
          <span className="rounded-full bg-[#FFF3CD] px-2.5 py-1 text-[11px] font-black text-[#B45309]">1 hoạt động</span>
        </div>
      </OrgCard>

      {/* AI Recommendations */}
      <AIRecommendationsWidget school={isNtd ? 'ntd' : 'sdu'} />
    </div>
  );
}

/* ── Health column ────────────────────────────────────────────── */
function HealthColumn({ isNtd, primary, primaryDark }: { isNtd: boolean; primary: string; primaryDark: string }) {
  const sleepBars = [22, 34, 26, 38, 31, 25, 35];
  const waterFilled = 3;
  const waterTotal = 8;

  return (
    <div className="space-y-4">
      <SectionLabel color="#7C3AED" icon={<HeartIcon size={15} color="#7C3AED" strokeWidth={2} />}>Sức khỏe</SectionLabel>

      {/* Sleep card – dark teal */}
      <div
        className="relative overflow-hidden rounded-[22px] p-5"
        style={{ background: `linear-gradient(145deg, ${primaryDark} 0%, ${isNtd ? '#071f3d' : '#0F2540'} 100%)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#7DD3FA]">Giấc ngủ</p>
            <p className="mt-1 text-3xl font-black text-white">7h 15m</p>
            <span className="mt-1 inline-block rounded-full bg-[#22D3EE]/20 px-2.5 py-0.5 text-[11px] font-black text-[#22D3EE]">Ngủ ngon ✓</span>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <MoonIcon size={32} color="#7DD3FA" strokeWidth={1.5} />
          </span>
        </div>

        {/* Bar chart */}
        <div className="mt-4 flex items-end gap-1.5" aria-label="Biểu đồ giấc ngủ 7 ngày">
          {sleepBars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${h}px`,
                  background: i === 6
                    ? `linear-gradient(to top, ${primary}, #7DD3FA)`
                    : 'rgba(255,255,255,0.2)',
                }}
              />
              <span className="text-[9px] text-white/40">{['T2','T3','T4','T5','T6','T7','CN'][i]}</span>
            </div>
          ))}
        </div>

        {/* Decorative circle */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full" style={{ background: `${primary}10` }} />
      </div>

      {/* Water card */}
      <OrgCard accent="#E0F7FF" borderColor="#7DD3FA">
        <CardHeader icon={<DropIcon size={15} color="#0EA5E9" strokeWidth={2} />} iconBg="#BAE6FD" title="Uống nước" />
        <div className="flex items-center justify-between">
          <p className="text-2xl font-black text-[#0EA5E9]">
            {waterFilled}
            <span className="text-sm font-semibold text-[#64748B]">/{waterTotal} ly</span>
          </p>
          <button className="rounded-full bg-[#0EA5E9] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[#0284C7]">
            Uống ngay +
          </button>
        </div>
        {/* Water drops (SVG) */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: waterTotal }, (_, i) => (
            <DropIcon key={i} size={18}
              color={i < waterFilled ? '#0EA5E9' : '#CBD5E1'}
              strokeWidth={i < waterFilled ? 2 : 1.5}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold text-[#64748B]">Mục tiêu: {waterTotal * 250}ml / ngày</p>
      </OrgCard>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────────────── */
function SectionLabel({ color, icon, children }: { color: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-xl shadow-sm"
        style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
      >
        {icon}
      </span>
      <h2 className="text-base font-black tracking-tight" style={{ color }}>
        {children}
      </h2>
    </div>
  );
}

function OrgCard({ accent, borderColor, children }: { accent: string; borderColor: string; children: ReactNode }) {
  return (
    <article
      className="rounded-[22px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
      style={{ background: accent, border: `1.5px solid ${borderColor}` }}
    >
      {children}
    </article>
  );
}

function CardHeader({ icon, iconBg = '#EFF6FF', title, onMore }: { icon: ReactNode; iconBg?: string; title: string; onMore?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
        <h3 className="text-sm font-black text-[#112641]">{title}</h3>
      </div>
      {onMore && (
        <button onClick={onMore} className="text-[11px] font-black text-[#1784DA] hover:underline">
          Xem thêm →
        </button>
      )}
    </div>
  );
}
