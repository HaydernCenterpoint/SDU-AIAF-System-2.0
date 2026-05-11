import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('mobile foundation has service, context, navigation, theme, and UI layers', () => {
  const expectedFiles = [
    'src/services/api-client.ts',
    'src/services/token-storage.ts',
    'src/services/notifications.ts',
    'src/contexts/AuthContext.tsx',
    'src/contexts/ThemeContext.tsx',
    'src/navigation/RootNavigator.tsx',
    'src/navigation/types.ts',
    'src/hooks/useBootstrapData.ts',
    'src/components/ui/AppButton.tsx',
    'src/components/ui/AppInput.tsx',
    'src/components/ui/AppCard.tsx',
    'src/components/ui/LoadingView.tsx',
    'src/components/ui/EmptyView.tsx',
    'src/components/ui/ErrorView.tsx',
    'src/components/ui/Header.tsx',
    'src/components/ui/StatisticCard.tsx',
    'src/components/ui/ReminderCard.tsx',
    'src/components/ui/AssignmentCard.tsx',
    'src/components/ui/HealthCard.tsx',
    'src/screens/auth/SplashScreen.tsx',
    'src/screens/auth/OnboardingScreen.tsx',
    'src/screens/auth/ForgotPasswordScreen.tsx',
    'src/screens/main/HomeScreen.tsx',
    'src/screens/main/HealthScreen.tsx',
  ];

  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const apiClient = read('src/services/api-client.ts');
  assert.match(apiClient, /axios\.create/);
  assert.match(apiClient, /Authorization/);
  assert.match(apiClient, /onUnauthorized/);

  const authContext = read('src/contexts/AuthContext.tsx');
  assert.match(authContext, /createContext/);
  assert.match(authContext, /useAuth/);
  assert.match(authContext, /AsyncStorage|tokenStorage/);

  const themeContext = read('src/contexts/ThemeContext.tsx');
  assert.match(themeContext, /dark/);
  assert.match(themeContext, /light/);
  assert.match(themeContext, /useAppTheme/);

  const tabs = read('src/navigation/MainTabs.tsx');
  for (const tab of ['Home', 'AIChat', 'Calendar', 'Health', 'Profile']) {
    assert.match(tabs, new RegExp(tab));
  }

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  for (const screen of ['Splash', 'Onboarding', 'Login', 'Register', 'ForgotPassword', 'Main']) {
    assert.match(rootNavigator, new RegExp(screen));
  }
});

test('auth and home screens use the shared foundation', () => {
  const login = read('src/screens/auth/LoginScreen.tsx');
  assert.match(login, /useAuth/);
  assert.match(login, /AppInput/);
  assert.match(login, /AppButton/);

  const register = read('src/screens/auth/RegisterScreen.tsx');
  assert.match(register, /useAuth/);
  assert.match(register, /fullName/);
  assert.match(register, /AppInput/);
  assert.match(register, /AppButton/);

  const home = read('src/screens/main/HomeScreen.tsx');
  for (const text of ['Deadline', 'Task', 'Lịch học', 'Sức khỏe', 'Gợi ý từ AI']) {
    assert.match(home, new RegExp(text));
  }
});

test('auth foundation keeps errors visible and validates confirmation fields', () => {
  const splash = read('src/screens/auth/SplashScreen.tsx');
  assert.match(splash, /<LoadingView\s+text=/);
  assert.doesNotMatch(splash, /<LoadingView\s+message=/);

  const authContext = read('src/contexts/AuthContext.tsx');
  assert.match(authContext, /const clearError = useCallback\(\(\) => \{\s*setError\(null\);\s*\}, \[\]\);/s);
  assert.doesNotMatch(authContext, /clearError\(\)\s*\{/);

  const register = read('src/screens/auth/RegisterScreen.tsx');
  assert.match(register, /fullName\.trim\(\)[\s\S]*studentId\.trim\(\)[\s\S]*email\.trim\(\)[\s\S]*password[\s\S]*confirmPassword[\s\S]*!passwordsMismatch/);
});

test('bootstrap dashboard avoids stale async writes and exposes accessible quick actions', () => {
  const hook = read('src/hooks/useBootstrapData.ts');
  assert.match(hook, /useRef/);
  assert.match(hook, /mountedRef/);
  assert.match(hook, /requestIdRef/);
  assert.match(hook, /requestId\s*!==\s*requestIdRef\.current/);

  const home = read('src/screens/main/HomeScreen.tsx');
  assert.match(home, /accessibilityRole="button"/);
  assert.match(home, /accessibilityLabel=\{action\.label\}/);
});

test('auth flow avoids public 401 logout races and register navigation conflicts', () => {
  const apiClient = read('src/services/api-client.ts');
  assert.match(apiClient, /hasAuthorizationHeader/);
  assert.match(apiClient, /status === 401 && hasAuthorizationHeader/);

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  assert.doesNotMatch(rootNavigator, /onRegistered=\{\(\) => navigation\.navigate\('Login'\)\}/);

  const register = read('src/screens/auth/RegisterScreen.tsx');
  assert.doesNotMatch(register, /onRegistered/);

  const onboarding = read('src/screens/auth/OnboardingScreen.tsx');
  assert.match(onboarding, /mountedRef/);
  assert.match(onboarding, /try\s*\{[\s\S]*setOnboardingComplete/);
  assert.match(onboarding, /finally\s*\{[\s\S]*setIsSaving\(false\)/);
});

test('mobile health module exposes log entry screens and health API calls', () => {
  const expectedFiles = [
    'src/services/health-api.ts',
    'src/screens/health/AddWeightLogScreen.tsx',
    'src/screens/health/AddSleepLogScreen.tsx',
    'src/screens/health/AddMealLogScreen.tsx',
    'src/screens/health/AddWorkoutLogScreen.tsx',
    'src/screens/health/AddMoodLogScreen.tsx',
    'src/screens/health/HealthStatisticsScreen.tsx',
  ];

  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const healthApi = read('src/services/health-api.ts');
  for (const endpoint of ['health/profile', 'health/weight-logs', 'health/sleep-logs', 'health/meal-logs', 'health/workout-logs', 'health/mood-logs', 'health/statistics']) {
    assert.match(healthApi, new RegExp(endpoint));
  }

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  for (const screen of ['AddWeightLog', 'AddSleepLog', 'AddMealLog', 'AddWorkoutLog', 'AddMoodLog', 'HealthStatistics']) {
    assert.match(rootNavigator, new RegExp(screen));
  }

  const health = read('src/screens/main/HealthScreen.tsx');
  for (const text of ['Thêm cân nặng', 'Thêm giấc ngủ', 'Thêm bữa ăn', 'Thêm tập luyện', 'Thêm tâm trạng', 'Gợi ý từ AI']) {
    assert.match(health, new RegExp(text));
  }
});

test('mobile notification module exposes push registration, notification screen, and add reminder screen', () => {
  const expectedFiles = [
    'src/services/notification-api.ts',
    'src/screens/notifications/NotificationScreen.tsx',
    'src/screens/notifications/AddReminderScreen.tsx',
  ];

  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const api = read('src/services/notification-api.ts');
  assert.match(api, /expo-notifications/);
  for (const endpoint of ['reminders', 'notifications', 'notifications/push-token']) {
    assert.match(api, new RegExp(endpoint));
  }

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  for (const screen of ['Notifications', 'AddReminder']) {
    assert.match(rootNavigator, new RegExp(screen));
  }

  const addReminder = read('src/screens/notifications/AddReminderScreen.tsx');
  for (const text of ['assignment_deadline', 'study_time', 'exam', 'task', 'sleep', 'water', 'workout', 'meal', 'custom', 'repeat_type']) {
    assert.match(addReminder, new RegExp(text));
  }

  const notificationScreen = read('src/screens/notifications/NotificationScreen.tsx');
  assert.match(notificationScreen, /Đánh dấu đã đọc/);
  assert.match(notificationScreen, /Local notification/);
});

test('mobile statistics module exposes API service and weekly monthly summary charts', () => {
  assert.equal(existsSync(join(root, 'src/services/statistics-api.ts')), true);
  assert.equal(existsSync(join(root, 'src/screens/statistics/StatisticsScreen.tsx')), true);

  const api = read('src/services/statistics-api.ts');
  for (const endpoint of ['statistics/dashboard', 'statistics/study', 'statistics/tasks', 'statistics/health', 'statistics/finance']) {
    assert.match(api, new RegExp(endpoint));
  }

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  assert.match(rootNavigator, /Statistics/);

  const screen = read('src/screens/statistics/StatisticsScreen.tsx');
  for (const text of ['Statistic cards', 'Chart đơn giản', 'Summary theo tuần', 'Summary theo tháng', 'Học tập', 'Công việc', 'Sức khỏe', 'Tài chính']) {
    assert.match(screen, new RegExp(text));
  }
});
