import { apiGet } from '@/lib/api-client';

export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year';

export const statisticsApi = {
  getDashboard: (period: StatisticsPeriod = 'month') => apiGet(`statistics/dashboard?period=${period}`),
  getStudy: (period: StatisticsPeriod = 'month') => apiGet(`statistics/study?period=${period}`),
  getTasks: (period: StatisticsPeriod = 'month') => apiGet(`statistics/tasks?period=${period}`),
  getHealth: (period: StatisticsPeriod = 'month') => apiGet(`statistics/health?period=${period}`),
  getFinance: (period: StatisticsPeriod = 'month') => apiGet(`statistics/finance?period=${period}`),
};
