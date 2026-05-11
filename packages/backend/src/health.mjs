import { randomUUID } from 'node:crypto';
import { getAssistantSystemPrompt } from './ai/prompt-registry.mjs';

const COLLECTIONS = {
  'weight-logs': 'weightLogs',
  'sleep-logs': 'sleepLogs',
  'meal-logs': 'mealLogs',
  'workout-plans': 'workoutPlans',
  'workout-logs': 'workoutLogs',
  'mood-logs': 'moodLogs',
};

export function createDefaultHealthData() {
  return {
    profile: { heightCm: null, birthYear: null, gender: '', activityLevel: 'moderate', waterGoalMl: 2000, calorieGoal: null },
    weightLogs: [],
    sleepLogs: [],
    mealLogs: [],
    workoutPlans: [],
    workoutLogs: [],
    moodLogs: [],
    waterLogs: [],
  };
}

export function ensureHealthData(userData) {
  if (!userData.health) userData.health = createDefaultHealthData();
  for (const [key, value] of Object.entries(createDefaultHealthData())) {
    if (userData.health[key] === undefined) userData.health[key] = value;
  }
  return userData.health;
}

export function calculateBmi({ weightKg, heightCm }) {
  const weight = Number(weightKg);
  const height = Number(heightCm) / 100;
  if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(height) || height <= 0) {
    return null;
  }
  const value = Math.round((weight / (height * height)) * 100) / 100;
  return { value, category: classifyBmi(value) };
}

export function classifyBmi(value) {
  if (value < 18.5) return 'gầy';
  if (value <= 24.9) return 'bình thường';
  if (value <= 29.9) return 'thừa cân';
  return 'béo phì';
}

export function upsertHealthProfile(health, body) {
  health.profile = {
    ...health.profile,
    heightCm: toOptionalNumber(body.heightCm, health.profile.heightCm),
    birthYear: toOptionalInteger(body.birthYear, health.profile.birthYear),
    gender: body.gender ?? health.profile.gender ?? '',
    activityLevel: body.activityLevel ?? health.profile.activityLevel ?? 'moderate',
    waterGoalMl: toOptionalInteger(body.waterGoalMl, health.profile.waterGoalMl || 2000),
    calorieGoal: toOptionalInteger(body.calorieGoal, health.profile.calorieGoal),
    updatedAt: nowIso(),
  };
  return health.profile;
}

export function createHealthLog(health, collectionName, body) {
  const key = COLLECTIONS[collectionName];
  if (!key) return null;
  const log = normalizeLog(collectionName, body, health.profile);
  health[key].unshift(log);
  return log;
}

export function listHealthLogs(health, collectionName) {
  const key = COLLECTIONS[collectionName];
  return key ? health[key] : null;
}

export function updateHealthLog(health, collectionName, id, body) {
  const key = COLLECTIONS[collectionName];
  if (!key) return null;
  const index = health[key].findIndex((item) => item.id === id);
  if (index < 0) return null;
  health[key][index] = { ...health[key][index], ...normalizeLog(collectionName, body, health.profile, false), id, updatedAt: nowIso() };
  return health[key][index];
}

export function deleteHealthLog(health, collectionName, id) {
  const key = COLLECTIONS[collectionName];
  if (!key) return false;
  const before = health[key].length;
  health[key] = health[key].filter((item) => item.id !== id);
  return health[key].length !== before;
}

export function buildHealthStatistics(health) {
  const latestWeight = sortByDate(health.weightLogs, 'loggedAt')[0];
  const recentSleep = health.sleepLogs.slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const latestMealDate = sortByDate(health.mealLogs, 'mealDate')[0]?.mealDate;
  const latestWorkoutDate = sortByDate(health.workoutLogs, 'workoutDate')[0]?.workoutDate;
  const todayMeals = health.mealLogs.filter((item) => item.mealDate === today || (!health.mealLogs.some((meal) => meal.mealDate === today) && item.mealDate === latestMealDate));
  const todayWorkouts = health.workoutLogs.filter((item) => item.workoutDate === today || (!health.workoutLogs.some((workout) => workout.workoutDate === today) && item.workoutDate === latestWorkoutDate));
  const latestMood = sortByDate(health.moodLogs, 'moodDate')[0];
  const averageSleepHours = recentSleep.length
    ? round(recentSleep.reduce((sum, item) => sum + Number(item.durationHours || 0), 0) / recentSleep.length)
    : 0;
  const warnings = buildWarnings({ latestWeight, averageSleepHours, latestMood, profile: health.profile });

  return {
    profile: health.profile,
    latestWeightKg: latestWeight?.weightKg || null,
    bmi: latestWeight?.bmi || null,
    averageSleepHours,
    todayCalories: todayMeals.reduce((sum, item) => sum + Number(item.calories || 0), 0),
    todayWorkoutMinutes: todayWorkouts.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0),
    latestMoodScore: latestMood?.moodScore || null,
    warnings,
    series: {
      weight: sortByDate(health.weightLogs, 'loggedAt').slice(0, 14).reverse(),
      sleep: sortByDate(health.sleepLogs, 'sleepDate').slice(0, 14).reverse(),
      mood: sortByDate(health.moodLogs, 'moodDate').slice(0, 14).reverse(),
    },
  };
}

export async function buildAiHealthSuggestion({ health, assistantReply }) {
  const statistics = buildHealthStatistics(health);
  const prompt = `${getAssistantSystemPrompt('health')}\n\nDữ liệu sức khỏe hiện tại:\n${JSON.stringify(statistics, null, 2)}`;
  const response = await assistantReply({ message: 'Gợi ý cải thiện sức khỏe cá nhân', prompt, assistantType: 'health', catalog: { health: statistics } });
  const suggestions = buildRuleBasedSuggestions(statistics);
  return {
    reply: `Lưu ý: Gợi ý này không thay thế bác sĩ, không phải chẩn đoán và không kê đơn thuốc. ${response?.content || suggestions.join(' ')}`,
    suggestions,
    warnings: statistics.warnings,
  };
}

function normalizeLog(collectionName, body, profile, withId = true) {
  const base = withId ? { id: `${collectionName}-${randomUUID()}`, createdAt: nowIso() } : {};
  const updatedAt = nowIso();
  if (collectionName === 'weight-logs') {
    const weightKg = Number(body.weightKg);
    const bmi = calculateBmi({ weightKg, heightCm: body.heightCm || profile.heightCm });
    return { ...base, weightKg, note: body.note || '', loggedAt: body.loggedAt || nowIso(), bmi, updatedAt };
  }
  if (collectionName === 'sleep-logs') {
    return { ...base, sleepDate: body.sleepDate || todayIso(), durationHours: Number(body.durationHours || 0), quality: toOptionalInteger(body.quality, null), note: body.note || '', updatedAt };
  }
  if (collectionName === 'meal-logs') {
    const items = Array.isArray(body.items) ? body.items.map(normalizeNutritionItem) : [];
    const calories = Number(body.calories ?? items.reduce((sum, item) => sum + item.calories, 0));
    return { ...base, mealDate: body.mealDate || todayIso(), mealType: body.mealType || 'meal', calories, items, note: body.note || '', updatedAt };
  }
  if (collectionName === 'workout-plans') {
    return { ...base, title: body.title || 'Kế hoạch tập luyện', description: body.description || '', frequency: body.frequency || '', active: body.active !== false, updatedAt };
  }
  if (collectionName === 'workout-logs') {
    return { ...base, workoutDate: body.workoutDate || todayIso(), workoutType: body.workoutType || 'general', durationMinutes: Number(body.durationMinutes || 0), caloriesBurned: toOptionalInteger(body.caloriesBurned, null), note: body.note || '', updatedAt };
  }
  return { ...base, moodDate: body.moodDate || todayIso(), moodScore: Number(body.moodScore || 3), stressLevel: toOptionalInteger(body.stressLevel, null), note: body.note || '', updatedAt };
}

function normalizeNutritionItem(item) {
  return {
    id: `nutrition-${randomUUID()}`,
    name: item.name || 'Món ăn',
    calories: Number(item.calories || 0),
    proteinGrams: toOptionalNumber(item.proteinGrams, null),
    carbsGrams: toOptionalNumber(item.carbsGrams, null),
    fatGrams: toOptionalNumber(item.fatGrams, null),
  };
}

function buildWarnings({ latestWeight, averageSleepHours, latestMood }) {
  const warnings = [];
  if (latestWeight?.bmi?.category === 'gầy' || latestWeight?.bmi?.category === 'béo phì') {
    warnings.push({ level: 'medical', message: 'BMI đang ở vùng cần chú ý. Hãy liên hệ chuyên gia y tế nếu thay đổi cân nặng kéo dài hoặc có triệu chứng bất thường.' });
  }
  if (averageSleepHours > 0 && averageSleepHours < 6) {
    warnings.push({ level: 'habit', message: 'Giấc ngủ trung bình đang thấp. Hãy ưu tiên nghỉ ngơi và giảm học quá khuya.' });
  }
  if (latestMood && (latestMood.moodScore <= 2 || latestMood.stressLevel >= 4)) {
    warnings.push({ level: 'support', message: 'Tâm trạng hoặc căng thẳng đang đáng chú ý. Hãy chia sẻ với gia đình, nhà trường hoặc chuyên gia tâm lý nếu tình trạng kéo dài.' });
  }
  return warnings;
}

function buildRuleBasedSuggestions(statistics) {
  const suggestions = ['Uống nước đều trong ngày và đặt chai nước gần bàn học.'];
  if (statistics.averageSleepHours && statistics.averageSleepHours < 7) suggestions.push('Thử ngủ sớm hơn 20 phút trong 3 ngày tới.');
  if (!statistics.todayWorkoutMinutes) suggestions.push('Đi bộ 15–20 phút sau giờ học để giảm căng thẳng.');
  if (statistics.latestMoodScore && statistics.latestMoodScore <= 2) suggestions.push('Ghi lại cảm xúc và nói chuyện với người tin cậy nếu tâm trạng xấu kéo dài.');
  return suggestions;
}

function sortByDate(items, key) {
  return [...items].sort((a, b) => String(b[key] || '').localeCompare(String(a[key] || '')));
}

function toOptionalNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return nowIso().slice(0, 10);
}
