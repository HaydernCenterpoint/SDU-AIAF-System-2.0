import { apiClient } from './api-client';

export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year';

export const statisticsApi = {
  getDashboard: (period: StatisticsPeriod = 'month') => apiClient.get(`statistics/dashboard?period=${period}`),
  getStudy: (period: StatisticsPeriod = 'month') => apiClient.get(`statistics/study?period=${period}`),
  getTasks: (period: StatisticsPeriod = 'month') => apiClient.get(`statistics/tasks?period=${period}`),
  getHealth: (period: StatisticsPeriod = 'month') => apiClient.get(`statistics/health?period=${period}`),
  getFinance: (period: StatisticsPeriod = 'month') => apiClient.get(`statistics/finance?period=${period}`),
};
