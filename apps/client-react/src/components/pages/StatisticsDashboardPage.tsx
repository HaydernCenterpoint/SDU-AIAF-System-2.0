'use client';

import { useEffect, useState } from 'react';
import { statisticsApi, type StatisticsPeriod } from '@/lib/statistics-api';

const periods: StatisticsPeriod[] = ['day', 'week', 'month', 'year'];
const fallback = {
  study: { totalCourses: 3, totalAssignments: 6, completedAssignments: 4, overdueAssignments: 1, upcomingDeadlines: 2, studyHours: 12, studyPlanProgress: 68 },
  tasks: { totalTasks: 8, completedTasks: 5, overdueTasks: 1, workEfficiency: 72 },
  health: { currentBmi: { value: 24.9 }, averageSleepHours: 7, averageCalories: 650, workoutSessions: 3, averageMood: 4 },
  finance: { totalIncome: 2500000, totalExpense: 1150000, balance: 1350000, budgetUsedPercent: 58, budgetAlerts: [] },
  calendarHeatmap: Array.from({ length: 14 }, (_, index) => ({ date: `${index + 1}`, value: index % 5 })),
  charts: { line: [], bar: [], pie: [] },
};

export function StatisticsDashboardPage() {
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const [data, setData] = useState(fallback);

  useEffect(() => {
    statisticsApi.getDashboard(period)
      .then((result) => setData(result.data as typeof fallback))
      .catch(() => undefined);
  }, [period]);

  const cards = [
    { group: 'Học tập', label: 'Tổng số môn học', value: data.study.totalCourses },
    { group: 'Học tập', label: 'Deadline sắp tới', value: data.study.upcomingDeadlines },
    { group: 'Công việc', label: 'Tổng task', value: data.tasks.totalTasks },
    { group: 'Công việc', label: 'Task quá hạn', value: data.tasks.overdueTasks },
    { group: 'Sức khỏe', label: 'BMI hiện tại', value: data.health.currentBmi?.value || '-' },
    { group: 'Tài chính', label: 'Số dư', value: data.finance.balance.toLocaleString('vi-VN') },
  ];

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-blue-border bg-white p-6 shadow-card">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Dashboard card · Bộ lọc thời gian</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-text">Dashboard thống kê sinh viên</h1>
            <p className="mt-2 text-sm font-semibold text-text-muted">Học tập, Công việc, Sức khỏe và Tài chính trong một bảng điều khiển.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((item) => (
              <button key={item} onClick={() => setPeriod(item)} className={`pressable rounded-2xl px-4 py-2 text-sm font-black ${period === item ? 'brand-gradient-blue text-white' : 'bg-blue-soft text-blue-dark'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={`${card.group}-${card.label}`} className="interactive-card rounded-3xl border border-border bg-white p-5 shadow-card">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-dark">{card.group}</p>
            <h2 className="mt-2 text-sm font-bold text-text-muted">{card.label}</h2>
            <p className="mt-3 text-3xl font-black text-text">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel title="Line chart" values={[12, 18, 14, 22, 26, 31]} />
        <ChartPanel title="Bar chart" values={[data.study.totalAssignments, data.tasks.totalTasks, data.health.workoutSessions, Math.round(data.finance.budgetUsedPercent / 10)]} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-text">Pie chart</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black text-text-sub">
            {['Học tập', 'Công việc', 'Tài chính'].map((label, index) => <div key={label} className="rounded-full bg-blue-soft px-3 py-6">{label}<br />{[40, 35, 25][index]}%</div>)}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-text">Progress bar</h2>
          <Progress label="Tiến độ kế hoạch học tập" value={data.study.studyPlanProgress} />
          <Progress label="Hiệu suất công việc" value={data.tasks.workEfficiency} />
          <Progress label="Ngân sách đã sử dụng" value={data.finance.budgetUsedPercent} />
        </section>
      </div>

      <section className="rounded-3xl border border-border bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-text">Calendar heatmap</h2>
        <div className="mt-4 grid grid-cols-14 gap-1">
          {data.calendarHeatmap.map((day) => <span key={day.date} className="aspect-square rounded-lg bg-blue" style={{ opacity: 0.18 + day.value * 0.14 }} />)}
        </div>
      </section>
    </section>
  );
}

function ChartPanel({ title, values }: { title: string; values: number[] }) {
  const max = Math.max(...values, 1);
  return <section className="rounded-3xl border border-border bg-white p-5 shadow-card"><h2 className="text-lg font-black text-text">{title}</h2><div className="mt-5 flex h-44 items-end gap-3">{values.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-2xl bg-blue" style={{ height: `${(value / max) * 100}%` }} /><span className="text-xs font-black text-text-muted">{index + 1}</span></div>)}</div></section>;
}

function Progress({ label, value }: { label: string; value: number }) {
  return <div className="mt-4"><div className="mb-2 flex justify-between text-sm font-black text-text"><span>{label}</span><span>{value}%</span></div><div className="h-3 rounded-full bg-blue-soft"><div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(100, value)}%` }} /></div></div>;
}
