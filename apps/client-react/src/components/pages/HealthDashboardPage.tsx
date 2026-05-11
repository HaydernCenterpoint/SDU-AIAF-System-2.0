// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { schoolConfigs } from '@/lib/school-config';
import { resolveSchoolSlugFromBackendId } from '@/lib/school-site';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

type HealthDay = {
  day: string;
  short: string;
  date: string;
  sleep: number;
  water: number;
  active: number;
  stress: number;
  mood: string;
  meals: string;
  focusHours: string;
  weight: number;
  note: string;
};

type HealthRecommendation = {
  title: string;
  detail: string;
  tone: string;
};

const healthWeek: HealthDay[] = [
  { day: 'Thứ 2', short: 'T2', date: '29/04', sleep: 6.4, water: 5, active: 24, stress: 71, mood: 'Hơi căng', meals: '3 bữa', focusHours: '2h45', weight: 72.6, note: 'Ngủ muộn do hoàn thiện slide nhóm.' },
  { day: 'Thứ 3', short: 'T3', date: '30/04', sleep: 7.1, water: 6, active: 36, stress: 58, mood: 'Ổn định', meals: '3 bữa', focusHours: '3h10', weight: 72.4, note: 'Nhịp học đều, có đi bộ sau giờ chiều.' },
  { day: 'Thứ 4', short: 'T4', date: '01/05', sleep: 7.5, water: 7, active: 41, stress: 43, mood: 'Tốt', meals: '3 bữa', focusHours: '3h30', weight: 72.3, note: 'Ngày cân bằng nhất, ngủ đủ và ít ngồi liên tục.' },
  { day: 'Thứ 5', short: 'T5', date: '02/05', sleep: 6.9, water: 6, active: 33, stress: 54, mood: 'Khá tốt', meals: '2 bữa + 1 snack', focusHours: '3h05', weight: 72.2, note: 'Thiếu bữa tối đúng giờ nhưng vẫn giữ vận động.' },
  { day: 'Thứ 6', short: 'T6', date: '03/05', sleep: 7.8, water: 7, active: 52, stress: 38, mood: 'Rất tốt', meals: '3 bữa', focusHours: '2h35', weight: 72.1, note: 'Ngủ sớm, có buổi tập nhẹ 45 phút.' },
  { day: 'Thứ 7', short: 'T7', date: '04/05', sleep: 7.3, water: 6, active: 47, stress: 40, mood: 'Thoải mái', meals: '3 bữa', focusHours: '2h20', weight: 72.0, note: 'Giữ lịch sinh hoạt ổn định dù là cuối tuần.' },
  { day: 'Chủ nhật', short: 'CN', date: '05/05', sleep: 7.4, water: 8, active: 44, stress: 35, mood: 'Hồi phục tốt', meals: '3 bữa', focusHours: '1h40', weight: 72.0, note: 'Ngày hồi phục, dành thời gian đi bộ và chuẩn bị tuần mới.' },
];

const todayTimeline = [
  { time: '06:20', label: 'Thức dậy', detail: 'Ngủ 7h24, thức dậy đúng báo thức', tone: 'bg-[#EAF6FF] text-[#1784DA]' },
  { time: '07:05', label: 'Bữa sáng', detail: 'Bánh mì trứng + sữa, đủ năng lượng cho buổi sáng', tone: 'bg-[#FFF8DD] text-[#9A6700]' },
  { time: '10:10', label: 'Nhắc uống nước', detail: 'Đã uống 3/8 ly trước giờ trưa', tone: 'bg-[#E8FBF2] text-[#18875F]' },
  { time: '17:30', label: 'Vận động nhẹ', detail: 'Đi bộ nhanh 25 phút sau giờ học', tone: 'bg-[#EEF2FF] text-[#4155C6]' },
  { time: '22:45', label: 'Giảm ánh sáng màn hình', detail: 'Ưu tiên ngủ trước 23:15 để giữ nhịp cho ngày mai', tone: 'bg-[#FFF1F2] text-[#E31D1C]' },
];

const healthStarterQuestions = [
  'Tuần này em nên ưu tiên cải thiện điều gì trước để đỡ mệt khi học?',
  'Nếu mục tiêu là ngủ tốt hơn, em nên đổi thói quen nào đầu tiên?',
  'Dữ liệu hiện tại cho thấy em đang thiếu nước hay thiếu vận động nhiều hơn?',
];

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function chartPoint(index: number, value: number, maxValue: number, width: number, height: number) {
  const gap = width / (healthWeek.length - 1);
  const x = index * gap;
  const y = height - (value / maxValue) * height;
  return `${x},${y}`;
}

function buildHealthRecommendations(week: HealthDay[]): HealthRecommendation[] {
  const lowestWaterDay = week.reduce((lowest, item) => (item.water < lowest.water ? item : lowest), week[0]);
  const highestStressDay = week.reduce((highest, item) => (item.stress > highest.stress ? item : highest), week[0]);
  const sleepAverage = average(week.map((item) => item.sleep));

  return [
    {
      title: 'Ưu tiên bù nước sớm hơn',
      detail: `${lowestWaterDay.day} chỉ đạt ${lowestWaterDay.water} ly. Dời ly nước thứ 5 lên trước 15:30 để buổi tối không bị hụt.`,
      tone: 'bg-[#EAF6FF] text-[#195B92]',
    },
    {
      title: 'Cắt căng thẳng đầu tuần',
      detail: `${highestStressDay.day} chạm ${highestStressDay.stress}/100. Nên chặn 20 phút nghỉ sau khối học dài hoặc deadline nhóm.`,
      tone: 'bg-[#FFF2F2] text-[#C53A2D]',
    },
    {
      title: 'Giữ khung ngủ ổn định',
      detail: `Trung bình tuần là ${sleepAverage.toFixed(1)}h. Nếu giữ mốc lên giường trước 23:15 trong 3 ngày tới, đường ngủ sẽ đẹp hơn rõ rệt.`,
      tone: 'bg-[#EEF2FF] text-[#4155C6]',
    },
  ];
}

function buildHealthAiContext(week: HealthDay[], recommendations: HealthRecommendation[]) {
  return {
    summary: 'Tuần này có dao động về giấc ngủ đầu tuần, nước uống chưa thật đều và mức căng thẳng tăng rõ ở các ngày có deadline.',
    sleepAverage: `${average(week.map((item) => item.sleep)).toFixed(1)}h`,
    hydrationAverage: `${average(week.map((item) => item.water)).toFixed(1)} ly`,
    activityAverage: `${Math.round(average(week.map((item) => item.active)))} phút`,
    stressAverage: `${Math.round(average(week.map((item) => item.stress)))}/100`,
    recommendations: recommendations.map((item) => ({ title: item.title, detail: item.detail })),
    days: week.map((item) => ({
      day: item.day,
      date: item.date,
      sleep: `${item.sleep.toFixed(1)}h`,
      water: `${item.water} ly`,
      active: `${item.active} phút`,
      stress: `${item.stress}/100`,
      mood: item.mood,
      note: item.note,
    })),
  };
}

async function askHealthCoach({
  token,
  question,
  healthProfile,
  conversationId,
}: {
  token: string;
  question: string;
  healthProfile: ReturnType<typeof buildHealthAiContext>;
  conversationId?: string | null;
}) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assistant_type: 'health',
      conversation_id: conversationId,
      message: question,
      context: {
        healthProfile,
      },
    }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'AI chưa phản hồi được cho bảng sức khỏe này');
  }

  return {
    reply: String(payload.reply || ''),
    conversationId: payload.conversation_id || null,
  };
}

export function HealthDashboardPage() {
  const { user, token } = useAuthStore();
  const school = resolveSchoolSlugFromBackendId(user?.schoolId);
  const schoolConfig = schoolConfigs[school];
  const audience = school === 'ntd' ? 'học sinh THPT' : 'sinh viên';
  const [question, setQuestion] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [assistantError, setAssistantError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const metrics = useMemo(() => {
    const sleepAvg = average(healthWeek.map((item) => item.sleep));
    const waterAvg = average(healthWeek.map((item) => item.water));
    const activeAvg = average(healthWeek.map((item) => item.active));
    const stressAvg = average(healthWeek.map((item) => item.stress));
    const lastWeight = healthWeek[healthWeek.length - 1]?.weight ?? 72;
    const firstWeight = healthWeek[0]?.weight ?? lastWeight;

    return [
      { label: 'BMI', value: '24.9', note: 'Theo dõi xu hướng, không dùng để tự chẩn đoán', accent: 'text-[#112641]' },
      { label: 'Ngủ trung bình', value: `${sleepAvg.toFixed(1)}h`, note: '4/7 ngày ngủ trước 23:15', accent: 'text-[#1784DA]' },
      { label: 'Nước uống', value: `${waterAvg.toFixed(1)} ly`, note: 'Tăng 0.8 ly so với đầu tuần', accent: 'text-[#1F9D7A]' },
      { label: 'Vận động', value: `${Math.round(activeAvg)} phút`, note: `Căng thẳng trung bình ${Math.round(stressAvg)} / 100`, accent: 'text-[#E31D1C]' },
      { label: 'Cân nặng', value: `${lastWeight.toFixed(1)} kg`, note: `${(lastWeight - firstWeight).toFixed(1)} kg so với đầu tuần`, accent: 'text-[#4155C6]' },
    ];
  }, []);

  const sleepPoints = useMemo(
    () => healthWeek.map((item, index) => chartPoint(index, item.sleep, 8.5, 640, 180)).join(' '),
    [],
  );

  const sleepAreaPoints = useMemo(
    () => `0,180 ${sleepPoints} 640,180`,
    [sleepPoints],
  );

  const maxActive = Math.max(...healthWeek.map((item) => item.active));
  const bestDay = healthWeek.reduce((best, item) => {
    const score = item.sleep * 8 + item.water * 4 + item.active - item.stress * 0.5;
    const bestScore = best.sleep * 8 + best.water * 4 + best.active - best.stress * 0.5;
    return score > bestScore ? item : best;
  }, healthWeek[0]);

  const aiRecommendations = useMemo(() => buildHealthRecommendations(healthWeek), []);
  const healthProfile = useMemo(() => buildHealthAiContext(healthWeek, aiRecommendations), [aiRecommendations]);

  async function handleAskAi() {
    if (!token) {
      setAssistantError('Phiên đăng nhập không còn hợp lệ. Vui lòng tải lại trang.');
      return;
    }

    const trimmed = question.trim();
    if (!trimmed) {
      setAssistantError('Nhập câu hỏi cụ thể để AI góp ý dựa trên dữ liệu sức khỏe hiện tại.');
      return;
    }

    setAssistantError('');
    setIsAsking(true);

    try {
      const result = await askHealthCoach({
        token,
        question: trimmed,
        healthProfile,
        conversationId,
      });
      setAssistantReply(result.reply);
      setConversationId(result.conversationId);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'AI chưa phản hồi được cho bảng sức khỏe này');
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-[#CFE8FF] bg-[linear-gradient(135deg,#F7FCFF_0%,#E8F7FF_48%,#FFF8D9_100%)] p-6 shadow-[0_18px_44px_rgba(23,132,218,0.08)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E31D1C]">Sức khỏe học đường</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#112641] sm:text-5xl">Bảng điều phối sức khỏe học tập</h1>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[#50647B] sm:text-base">
              Theo dõi giấc ngủ, nước uống, vận động, nhịp học và tâm trạng trong cùng một màn hình để {audience} {schoolConfig.shortName} nhìn thấy thói quen thật của mình theo từng ngày.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1784DA]">7 ngày gần nhất</span>
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F9D7A]">Có lịch sử từng ngày</span>
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#E31D1C]">Khuyến nghị cá nhân hóa</span>
            </div>
          </div>

          <aside className="rounded-[28px] bg-white/85 p-5 shadow-[0_14px_34px_rgba(17,38,65,0.08)] backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Tổng quan tuần này</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] bg-[#F7FBFF] p-4">
                <p className="text-sm font-black text-[#112641]">Ngày nổi bật</p>
                <p className="mt-2 text-lg font-black text-[#1784DA]">{bestDay.day}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#5D728A]">{bestDay.note}</p>
              </div>
              <div className="rounded-[22px] bg-[#FFF7E5] p-4">
                <p className="text-sm font-black text-[#9A6700]">Nhịp cần giữ</p>
                <p className="mt-2 text-lg font-black text-[#112641]">Ngủ trước 23:15 trong 3 ngày tới</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#7A6640]">Giữ ổn định giờ ngủ sẽ giúp đường ngủ và mức căng thẳng tuần sau đẹp hơn rõ rệt.</p>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-[28px] border border-[#D9E9FF] bg-white p-5 shadow-[0_14px_34px_rgba(17,38,65,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7B8DA2]">{metric.label}</p>
            <p className={`mt-3 text-3xl font-black ${metric.accent}`}>{metric.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5E738B]">{metric.note}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Biểu đồ tổng hợp</p>
              <h2 className="mt-2 text-2xl font-black text-[#112641]">Bản đồ sức khỏe 7 ngày</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5D728A]">
                Đường màu xanh là giấc ngủ, cột đỏ cam là phút vận động mỗi ngày để nhìn rõ những hôm học nặng nhưng không kịp hồi phục.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em]">
              <span className="rounded-full bg-[#EAF6FF] px-3 py-2 text-[#1784DA]">Giấc ngủ</span>
              <span className="rounded-full bg-[#FFF1EC] px-3 py-2 text-[#E7602A]">Vận động</span>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E4EEF9] bg-[linear-gradient(180deg,#FBFEFF_0%,#F5FAFF_100%)] p-4">
            <svg viewBox="0 0 640 260" className="w-full" aria-label="Biểu đồ giấc ngủ và vận động 7 ngày">
              <defs>
                <linearGradient id="sleepArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1784DA" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#1784DA" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="barFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FF8A4C" />
                  <stop offset="100%" stopColor="#E31D1C" />
                </linearGradient>
              </defs>

              {Array.from({ length: 5 }, (_, index) => {
                const y = 30 + index * 38;
                return <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#E4EEF9" strokeDasharray="4 8" />;
              })}

              {healthWeek.map((item, index) => {
                const x = index * (640 / (healthWeek.length - 1));
                const barHeight = (item.active / maxActive) * 110;
                return (
                  <g key={item.day}>
                    <rect x={x - 16} y={200 - barHeight} width="32" height={barHeight} rx="12" fill="url(#barFill)" opacity="0.92" />
                    <text x={x} y="235" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="800">{item.short}</text>
                  </g>
                );
              })}

              <polygon points={sleepAreaPoints} fill="url(#sleepArea)" />
              <polyline points={sleepPoints} fill="none" stroke="#1784DA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

              {healthWeek.map((item, index) => {
                const [cx, cy] = chartPoint(index, item.sleep, 8.5, 640, 180).split(',').map(Number);
                return (
                  <g key={`${item.day}-point`}>
                    <circle cx={cx} cy={cy} r="8" fill="white" stroke="#1784DA" strokeWidth="3" />
                    <text x={cx} y={cy - 14} textAnchor="middle" fill="#112641" fontSize="11" fontWeight="900">{item.sleep.toFixed(1)}h</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <InsightCard title="Đêm ngủ tốt nhất" value="Thứ 6 · 7.8h" note="Ngủ sớm và có vận động nhẹ giúp chất lượng ngủ lên rõ." tone="text-[#1784DA]" />
            <InsightCard title="Ngày thiếu nước nhất" value="Thứ 2 · 5 ly" note="Đây cũng là ngày căng nhất vì deadline và ngồi lâu." tone="text-[#E31D1C]" />
            <InsightCard title="Ngày vận động tốt nhất" value="Thứ 6 · 52 phút" note="Khi hoạt động tốt, stress tuần đó giảm rõ rệt." tone="text-[#1F9D7A]" />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Trong ngày</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Nhịp học hôm nay</h2>
            <div className="mt-5 space-y-4">
              {todayTimeline.map((item) => (
                <div key={`${item.time}-${item.label}`} className="flex gap-3">
                  <div className="flex w-16 shrink-0 flex-col items-center">
                    <div className="rounded-full bg-[#112641] px-2.5 py-1 text-xs font-black text-white">{item.time}</div>
                    <div className="mt-2 h-full w-px bg-[#D7E8FA]" />
                  </div>
                  <div className={`flex-1 rounded-[24px] px-4 py-3 ${item.tone}`}>
                    <p className="text-sm font-black">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 opacity-90">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#D8E9FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FCFF_100%)] p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31D1C]">AI Coach sức khỏe</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Hỏi AI về sức khỏe tuần này</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#5E738B]">
              AI sẽ đọc đúng dữ liệu giấc ngủ, nước uống, vận động và căng thẳng đang hiển thị để đưa khuyên và recommend thay vì trả lời chung chung.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {healthStarterQuestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setQuestion(item)}
                  className="rounded-full border border-[#D7EBFF] bg-white px-3 py-2 text-left text-xs font-black text-[#1784DA] transition hover:border-[#1784DA] hover:bg-[#F2FAFF]"
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-sm font-black text-[#112641]">
              Câu hỏi của bạn
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                placeholder="Ví dụ: Mức stress đầu tuần của em đến từ thiếu ngủ hay thiếu vận động nhiều hơn?"
                className="mt-2 w-full rounded-[22px] border border-[#D8E9FF] bg-white px-4 py-3 text-sm font-semibold text-[#112641] outline-none transition placeholder:text-[#8AA0B8] focus:border-[#1784DA] focus:ring-4 focus:ring-[#BFE8FF]"
              />
            </label>

            {assistantError ? (
              <div className="mt-3 rounded-[20px] border border-[#FFD5D5] bg-[#FFF5F5] px-4 py-3 text-sm font-bold text-[#C53030]">
                {assistantError}
              </div>
            ) : null}

            <button
              onClick={handleAskAi}
              disabled={isAsking}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#E31D1C_0%,#F97316_100%)] px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(227,29,28,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAsking ? 'AI đang phân tích sức khỏe...' : 'Hỏi AI về sức khỏe tuần này'}
            </button>

            <div className="mt-4 rounded-[24px] border border-[#DCEBFF] bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Phản hồi AI</p>
              <div className="mt-3 min-h-[120px] whitespace-pre-wrap text-sm font-semibold leading-6 text-[#40566F]">
                {assistantReply || 'AI chưa phản hồi. Chọn câu hỏi mẫu hoặc nhập câu hỏi riêng để nhận góp ý có bám dữ liệu sức khỏe tuần này.'}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Chi tiết tuần</p>
              <h2 className="mt-2 text-2xl font-black text-[#112641]">Lịch sử từng ngày</h2>
            </div>
            <p className="text-sm font-semibold leading-6 text-[#5E738B]">Mỗi ô tóm tắt đủ giấc ngủ, nước uống, vận động, nhịp học và trạng thái tinh thần của từng ngày.</p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {healthWeek.map((item) => (
              <article key={item.day} className="rounded-[28px] border border-[#E4EEF9] bg-[linear-gradient(135deg,#FFFFFF_0%,#F9FCFF_100%)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#112641] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">{item.day}</span>
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#7B8DA2]">{item.date}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#5E738B]">{item.note}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#F6FAFF] px-3 py-2 text-right">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7B8DA2]">Tâm trạng</p>
                    <p className="mt-1 text-base font-black text-[#112641]">{item.mood}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  <HistoryStat label="Ngủ" value={`${item.sleep.toFixed(1)}h`} />
                  <HistoryStat label="Nước" value={`${item.water} ly`} />
                  <HistoryStat label="Vận động" value={`${item.active} phút`} />
                  <HistoryStat label="Bữa ăn" value={item.meals} />
                  <HistoryStat label="Học sâu" value={item.focusHours} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">So sánh nhanh</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Giấc ngủ 7 ngày</h2>
            <div className="mt-5 flex items-end gap-2">
              {healthWeek.map((item) => (
                <div key={`${item.day}-sleep`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end rounded-[18px] bg-[#F2F8FF] px-1.5 pb-1.5">
                    <div
                      className="w-full rounded-[14px] bg-[linear-gradient(180deg,#5CC8F7_0%,#1784DA_100%)]"
                      style={{ height: `${(item.sleep / 8.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#64748B]">{item.short}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1F9D7A]">Nhịp nền</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Nước uống & vận động</h2>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Nước uống', value: 80, note: 'Trung bình 6.4 / 8 ly' },
                { label: 'Vận động', value: 72, note: 'Trung bình 39 / 54 phút mục tiêu' },
                { label: 'Đứng dậy giữa giờ', value: 68, note: 'Cần đều hơn vào các buổi học dài' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm font-black text-[#112641]">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E8F5EE]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#21B36C_0%,#1784DA_100%)]" style={{ width: `${item.value}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#60748B]">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31D1C]">Cảm xúc</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Tâm trạng & áp lực</h2>
            <div className="mt-4 space-y-3">
              {healthWeek.map((item) => (
                <div key={`${item.day}-stress`} className="rounded-[24px] bg-[#FBFCFF] px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-black text-[#112641]">
                    <span>{item.day}</span>
                    <span>{item.stress}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#FFE4E8]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#F97316_0%,#E31D1C_100%)]" style={{ width: `${item.stress}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#617489]">{item.mood}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-5 shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31D1C]">Khuyến nghị AI</p>
            <h2 className="mt-2 text-2xl font-black text-[#112641]">Khuyến nghị cho hôm nay</h2>
            <div className="mt-4 space-y-3">
              {aiRecommendations.map((item) => (
                <article key={item.title} className={`rounded-[24px] px-4 py-3 ${item.tone}`}>
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 opacity-90">{item.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 rounded-[24px] bg-[#EAF6FF] px-4 py-3 text-sm font-bold leading-6 text-[#1C5C91]">
              Đây là bảng theo dõi sức khỏe học đường, không thay thế tư vấn y tế. Nếu có dấu hiệu kéo dài về mất ngủ, căng thẳng hoặc đau mỏi, cần liên hệ bộ phận y tế hoặc người phụ trách của trường.
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function InsightCard({ title, value, note, tone }: { title: string; value: string; note: string; tone: string }) {
  return (
    <article className="rounded-[24px] border border-[#E4EEF9] bg-white px-4 py-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7B8DA2]">{title}</p>
      <p className={`mt-2 text-lg font-black ${tone}`}>{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5F748B]">{note}</p>
    </article>
  );
}

function HistoryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-[#F7FBFF] px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7B8DA2]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#112641]">{value}</p>
    </div>
  );
}
