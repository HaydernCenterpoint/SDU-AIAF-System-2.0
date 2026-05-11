import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-health-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');

test('Prisma schema defines normalized health module tables', () => {
  const schema = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

  for (const model of ['HealthProfile', 'WeightLog', 'SleepLog', 'MealLog', 'NutritionItem', 'WorkoutPlan', 'WorkoutLog', 'MoodLog']) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  for (const table of ['health_profiles', 'weight_logs', 'sleep_logs', 'meal_logs', 'nutrition_items', 'workout_plans', 'workout_logs', 'mood_logs']) {
    assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
  }
});

test('health APIs create logs, calculate BMI, summarize statistics, and return safe AI suggestions', async () => {
  await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'HL001');
      const auth = { Authorization: `Bearer ${token}` };

      const profile = await jsonFetch(baseUrl, '/api/health/profile', {
        method: 'PUT',
        headers: auth,
        body: { heightCm: 170, birthYear: 2004, activityLevel: 'moderate' },
      });
      assert.equal(profile.status, 200);
      assert.equal(profile.body.profile.heightCm, 170);

      const weight = await jsonFetch(baseUrl, '/api/health/weight-logs', {
        method: 'POST',
        headers: auth,
        body: { weightKg: 72, loggedAt: '2026-04-28T07:00:00.000Z', note: 'Buổi sáng' },
      });
      assert.equal(weight.status, 201);
      assert.equal(weight.body.log.bmi.value, 24.91);
      assert.equal(weight.body.log.bmi.category, 'thừa cân');

      await jsonFetch(baseUrl, '/api/health/sleep-logs', {
        method: 'POST',
        headers: auth,
        body: { sleepDate: '2026-04-27', durationHours: 5.5, quality: 2 },
      });
      await jsonFetch(baseUrl, '/api/health/meal-logs', {
        method: 'POST',
        headers: auth,
        body: {
          mealDate: '2026-04-28',
          mealType: 'lunch',
          calories: 650,
          items: [{ name: 'Cơm gà', calories: 520, proteinGrams: 28 }],
        },
      });
      await jsonFetch(baseUrl, '/api/health/workout-logs', {
        method: 'POST',
        headers: auth,
        body: { workoutDate: '2026-04-28', workoutType: 'walk', durationMinutes: 30, caloriesBurned: 120 },
      });
      await jsonFetch(baseUrl, '/api/health/mood-logs', {
        method: 'POST',
        headers: auth,
        body: { moodDate: '2026-04-28', moodScore: 2, stressLevel: 4, note: 'Áp lực bài tập' },
      });

      const bmi = await jsonFetch(baseUrl, '/api/health/bmi', {
        method: 'POST',
        headers: auth,
        body: { weightKg: 72, heightCm: 170 },
      });
      assert.equal(bmi.status, 200);
      assert.deepEqual(bmi.body.bmi, { value: 24.91, category: 'thừa cân' });

      const stats = await jsonFetch(baseUrl, '/api/health/statistics', { headers: auth });
      assert.equal(stats.status, 200);
      assert.equal(stats.body.statistics.latestWeightKg, 72);
      assert.equal(stats.body.statistics.todayCalories, 650);
      assert.equal(stats.body.statistics.averageSleepHours, 5.5);
      assert.ok(stats.body.statistics.warnings.some((warning) => /ngủ|tâm trạng/i.test(warning.message)));

      const ai = await jsonFetch(baseUrl, '/api/health/ai-suggestions', { method: 'POST', headers: auth, body: {} });
      assert.equal(ai.status, 200);
      assert.match(ai.body.reply, /không thay thế bác sĩ/i);
      assert.ok(ai.body.suggestions.length >= 3);
    },
    {
      assistantReply: async ({ assistantType, prompt }) => ({
        content: `Gợi ý an toàn cho ${assistantType}: ${prompt.includes('Health Assistant') ? 'đúng ngữ cảnh' : 'thiếu ngữ cảnh'}.`,
        sources: [],
      }),
    },
  );
});

async function createUserAndToken(baseUrl, studentId) {
  const email = `${studentId.toLowerCase()}@saodo.edu.vn`;
  const password = 'secret123';
  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password, email }),
  });
  assert.equal(register.status, 200);

  const complete = await fetch(`${baseUrl}/api/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      fullName: `Sinh viên ${studentId}`,
      dateOfBirth: '2004-01-01',
      faculty: 'Công nghệ thông tin',
      phone: '0912345678',
    }),
  });
  assert.equal(complete.status, 200);
  const payload = await complete.json();
  return payload.token;
}

async function jsonFetch(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

async function withServer(run, options = {}) {
  const server = createAppServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}
