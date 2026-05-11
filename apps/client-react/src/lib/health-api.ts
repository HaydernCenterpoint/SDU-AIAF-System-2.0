import { apiGet, apiPost, apiPut } from '@/lib/api-client';

export type HealthProfilePayload = {
  heightCm?: number;
  weightKg?: number;
  goal?: string;
};

export type WeightLogPayload = { weightKg: number; logDate?: string; note?: string };
export type SleepLogPayload = { hours: number; sleepDate?: string; quality?: string; note?: string };
export type MealLogPayload = { mealType: string; calories?: number; mealDate?: string; note?: string };
export type WorkoutLogPayload = { workoutType: string; durationMinutes: number; caloriesBurned?: number; workoutDate?: string; note?: string };
export type MoodLogPayload = { mood: string; energyLevel?: number; stressLevel?: number; logDate?: string; note?: string };

export const healthApi = {
  getProfile: () => apiGet('health/profile'),
  updateProfile: (payload: HealthProfilePayload) => apiPut('health/profile', payload),
  addWeightLog: (payload: WeightLogPayload) => apiPost('health/weight-logs', payload),
  addSleepLog: (payload: SleepLogPayload) => apiPost('health/sleep-logs', payload),
  addMealLog: (payload: MealLogPayload) => apiPost('health/meal-logs', payload),
  addWorkoutLog: (payload: WorkoutLogPayload) => apiPost('health/workout-logs', payload),
  addMoodLog: (payload: MoodLogPayload) => apiPost('health/mood-logs', payload),
  getStatistics: () => apiGet('health/statistics'),
  calculateBmi: (payload: { weightKg: number; heightCm: number }) => apiPost('health/bmi', payload),
  getAiSuggestion: (payload: { question?: string }) => apiPost('health/ai-suggestions', payload),
};
