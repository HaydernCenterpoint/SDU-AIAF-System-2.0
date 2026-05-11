import { apiClient } from './api-client';

export type WeightLogPayload = { weightKg: number; logDate?: string; note?: string };
export type SleepLogPayload = { hours: number; sleepDate?: string; quality?: string; note?: string };
export type MealLogPayload = { mealType: string; calories?: number; mealDate?: string; note?: string };
export type WorkoutLogPayload = { workoutType: string; durationMinutes: number; caloriesBurned?: number; workoutDate?: string; note?: string };
export type MoodLogPayload = { mood: string; energyLevel?: number; stressLevel?: number; logDate?: string; note?: string };

export const healthApi = {
  getProfile: () => apiClient.get('health/profile'),
  updateProfile: (payload: { heightCm?: number; weightKg?: number; goal?: string }) => apiClient.put('health/profile', payload),
  addWeightLog: (payload: WeightLogPayload) => apiClient.post('health/weight-logs', payload),
  addSleepLog: (payload: SleepLogPayload) => apiClient.post('health/sleep-logs', payload),
  addMealLog: (payload: MealLogPayload) => apiClient.post('health/meal-logs', payload),
  addWorkoutLog: (payload: WorkoutLogPayload) => apiClient.post('health/workout-logs', payload),
  addMoodLog: (payload: MoodLogPayload) => apiClient.post('health/mood-logs', payload),
  getStatistics: () => apiClient.get('health/statistics'),
};
