import { buildHealthStatistics, ensureHealthData } from './health.mjs';
import { ensureNotificationData } from './reminders.mjs';

const VALID_PERIODS = new Set(['day', 'week', 'month', 'year']);

export function buildStatistics(userData, period = 'month') {
  const normalizedPeriod = VALID_PERIODS.has(period) ? period : 'month';
  ensureNotificationData(userData);
  const healthStats = buildHealthStatistics(ensureHealthData(userData));
  const study = buildStudyStatistics(userData, normalizedPeriod);
  const tasks = buildTaskStatistics(userData, normalizedPeriod);
  const health = buildHealthDashboardStatistics(healthStats, userData.health, normalizedPeriod);
  const finance = buildFinanceStatistics(userData, normalizedPeriod);
  const calendarHeatmap = buildCalendarHeatmap({ study, tasks, health });

  return {
    period: normalizedPeriod,
    study,
    tasks,
    health,
    finance,
    calendarHeatmap,
    charts: mergeCharts([study, tasks, health, finance]),
  };
}

export function buildStatisticsSection(userData, section, period = 'month') {
  const dashboard = buildStatistics(userData, period);
  return { period: dashboard.period, ...dashboard[section], charts: dashboard[section].charts };
}

function buildStudyStatistics(userData, period) {
  const courses = userData.courses || [];
  const reminders = userData.reminders || [];
  const assignments = reminders.filter((item) => item.type === 'assignment_deadline' || /bài tập|deadline|nộp/i.test(item.title || ''));
  const now = Date.now();
  const completedAssignments = assignments.filter((item) => item.done || item.status === 'completed').length;
  const overdueAssignments = assignments.filter((item) => !item.done && new Date(item.remind_at || item.dueDate || 0).getTime() < now).length;
  const upcomingDeadlines = assignments.filter((item) => !item.done && new Date(item.remind_at || item.dueDate || 0).getTime() >= now).length;
  const studyHours = Math.max(0, (userData.schedule || []).length * 1.5 + reminders.filter((item) => item.type === 'study_time').length);
  const totalAssignments = assignments.length;
  const studyPlanProgress = totalAssignments ? Math.round((completedAssignments / totalAssignments) * 100) : 65;

  return {
    totalCourses: courses.length,
    totalAssignments,
    completedAssignments,
    overdueAssignments,
    upcomingDeadlines,
    studyHours,
    studyPlanProgress,
    charts: {
      line: buildSeries('Giờ học', period, studyHours),
      bar: [
        { label: 'Hoàn thành', value: completedAssignments },
        { label: 'Quá hạn', value: overdueAssignments },
        { label: 'Sắp tới', value: upcomingDeadlines },
      ],
      pie: courses.map((course) => ({ label: course.title, value: 1 })),
    },
  };
}

function buildTaskStatistics(userData, period) {
  const reminders = userData.reminders || [];
  const tasks = reminders.filter((item) => item.type === 'task' || item.type === 'custom');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((item) => item.done || item.status === 'completed').length;
  const overdueTasks = tasks.filter((item) => !item.done && new Date(item.remind_at || item.dueDate || 0).getTime() < Date.now()).length;
  const byPriority = { high: overdueTasks, medium: Math.max(0, totalTasks - completedTasks - overdueTasks), low: completedTasks };
  const workEfficiency = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 72;

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    byPriority,
    workEfficiency,
    charts: {
      line: buildSeries('Hiệu suất', period, workEfficiency),
      bar: Object.entries(byPriority).map(([label, value]) => ({ label, value })),
      pie: [
        { label: 'Hoàn thành', value: completedTasks },
        { label: 'Quá hạn', value: overdueTasks },
        { label: 'Còn lại', value: Math.max(0, totalTasks - completedTasks - overdueTasks) },
      ],
    },
  };
}

function buildHealthDashboardStatistics(healthStats, health, period) {
  const mealLogs = health.mealLogs || [];
  const workoutLogs = health.workoutLogs || [];
  const moodLogs = health.moodLogs || [];
  const averageCalories = mealLogs.length ? round(mealLogs.reduce((sum, item) => sum + Number(item.calories || 0), 0) / mealLogs.length) : 0;
  const averageMood = moodLogs.length ? round(moodLogs.reduce((sum, item) => sum + Number(item.moodScore || 0), 0) / moodLogs.length) : 0;

  return {
    currentBmi: healthStats.bmi || { value: null, category: 'chưa có dữ liệu' },
    weightTrend: healthStats.series.weight,
    averageSleepHours: healthStats.averageSleepHours,
    averageCalories,
    workoutSessions: workoutLogs.length,
    averageMood,
    charts: {
      line: healthStats.series.weight.map((item) => ({ label: String(item.loggedAt || '').slice(5, 10), value: Number(item.weightKg || 0) })),
      bar: buildSeries('Giấc ngủ', period, healthStats.averageSleepHours),
      pie: [
        { label: 'Ngủ', value: healthStats.averageSleepHours },
        { label: 'Tập', value: workoutLogs.length },
        { label: 'Tâm trạng', value: averageMood },
      ],
    },
  };
}

function buildFinanceStatistics(userData, period) {
  const finance = userData.finance || {};
  const income = finance.income || [{ amount: 2500000, category: 'Gia đình' }];
  const expenses = finance.expenses || [{ amount: 850000, category: 'Ăn uống' }, { amount: 300000, category: 'Học tập' }];
  const budget = finance.budget || 2000000;
  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenseByCategory = groupAmounts(expenses);
  const budgetUsedPercent = budget ? Math.round((totalExpense / budget) * 100) : 0;
  const budgetAlerts = budgetUsedPercent > 100 ? ['Chi tiêu đã vượt ngân sách.'] : budgetUsedPercent >= 80 ? ['Chi tiêu đã vượt 80% ngân sách.'] : [];

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expenseByCategory,
    budgetUsedPercent,
    budgetAlerts,
    charts: {
      line: buildSeries('Số dư', period, totalIncome - totalExpense),
      bar: Object.entries(expenseByCategory).map(([label, value]) => ({ label, value })),
      pie: Object.entries(expenseByCategory).map(([label, value]) => ({ label, value })),
    },
  };
}

function buildSeries(label, period, value) {
  const points = period === 'year' ? 12 : period === 'month' ? 6 : period === 'week' ? 7 : 4;
  return Array.from({ length: points }, (_, index) => ({ label: `${label} ${index + 1}`, value: round(Number(value || 0) * (0.7 + (index + 1) / (points * 2))) }));
}

function mergeCharts(sections) {
  return {
    line: sections.flatMap((section) => section.charts.line).slice(0, 24),
    bar: sections.flatMap((section) => section.charts.bar).slice(0, 24),
    pie: sections.flatMap((section) => section.charts.pie).filter((item) => Number(item.value) > 0).slice(0, 12),
  };
}

function buildCalendarHeatmap({ study, tasks, health }) {
  return Array.from({ length: 14 }, (_, index) => ({
    date: new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(0, 10),
    value: Math.min(5, Math.round((study.studyHours + tasks.totalTasks + health.workoutSessions + index) % 6)),
  }));
}

function groupAmounts(items) {
  return items.reduce((acc, item) => {
    const category = item.category || 'Khác';
    acc[category] = (acc[category] || 0) + Number(item.amount || 0);
    return acc;
  }, {});
}

function round(value) {
  return Math.round(value * 100) / 100;
}
