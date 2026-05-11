// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('frontend foundation exposes API client, auth context, protected route, and dashboard route', () => {
  const expectedFiles = [
    'src/lib/api-client.ts',
    'src/contexts/AuthContext.tsx',
    'src/components/guards/ProtectedRoute.tsx',
    'src/components/feedback/ToastProvider.tsx',
    'src/app/dashboard/page.tsx',
  ];

  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const apiClient = read('src/lib/api-client.ts');
  assert.match(apiClient, /axios\.create/);
  assert.match(apiClient, /Authorization/);

  const authContext = read('src/contexts/AuthContext.tsx');
  assert.match(authContext, /createContext/);
  assert.match(authContext, /useAuth/);

  const dashboardRoute = read('src/app/dashboard/page.tsx');
  assert.match(dashboardRoute, /ProtectedRoute/);
  assert.match(dashboardRoute, /AppShell/);
});

test('root page opens the school selection login instead of marketing landing copy', () => {
  const home = read('src/app/page.tsx');
  const gatewayPage = read('src/sites/gateway/SchoolGatewayPage.tsx');
  const sharedLoginPage = read('src/components/SchoolPortalLoginPage.tsx');
  const portal = read('src/components/SchoolPortalLogin.tsx');
  const threeDivider = read('src/lib/schoolPortalThreeDivider.ts');
  const portalCss = read('src/components/SchoolPortalLogin.module.css');
  assert.match(home, /SchoolGatewayPage/);
  assert.match(gatewayPage, /SchoolPortalLoginPage/);
  assert.match(gatewayPage, /mode="gateway"/);
  assert.match(sharedLoginPage, /SchoolPortalLogin/);
  assert.match(portal, /buildThreeDividerClipPath/);
  assert.match(portal, /getThreeDividerTargetWidths/);
  assert.match(portal, /fallbackDisplayName: 'Học sinh 2025324AK02'/);
  assert.match(portal, /fallbackDisplayName: 'Sinh viên 2200286'/);
  assert.match(portal, /readSchoolDisplayName/);
  assert.match(portal, /getDisplayName/);
  assert.match(portal, /resolveSchoolSlugFromBackendId/);
  assert.match(portal, /preloadImage/);
  assert.doesNotMatch(portal, /Promise\.reject/);
  assert.doesNotMatch(portal, /runSchoolPortalThreeTransition/);
  assert.match(threeDivider, /from 'three'/);
  assert.match(portalCss, /schoolPanelEnter/);
  assert.match(portalCss, /panelContentEnter/);
  assert.match(portalCss, /selectedPanelDarken/);
  assert.match(portalCss, /selectedSlideLeft/);
  assert.match(portalCss, /selectedSlideRight/);
  assert.doesNotMatch(portalCss, /transitionFxLayer/);
  assert.match(portalCss, /logoOrbitSpin/);
  assert.match(portalCss, /prefers-reduced-motion/);
  assert.doesNotMatch(home, /href="\/dashboard"/);
  assert.doesNotMatch(home, /Trợ lý AI toàn diện cho sinh viên/);
});

test('school login brand panel omits the redundant school intro block beside the form', () => {
  const portal = read('src/components/SchoolPortalLogin.tsx');
  const portalCss = read('src/components/SchoolPortalLogin.module.css');

  assert.doesNotMatch(portal, /className={styles\.brandKicker}/);
  assert.doesNotMatch(portal, /className={styles\.brandTitle}/);
  assert.doesNotMatch(portal, /className={styles\.brandDesc}/);
  assert.doesNotMatch(portal, /className={styles\.brandMeta}/);
  assert.doesNotMatch(portalCss, /\.brandMeta\b/);
});

test('auth pages use shared AuthContext with schema-backed form validation', () => {
  const login = read('src/components/SchoolPortalLoginPage.tsx');
  const schoolPortal = read('src/components/SchoolPortalLogin.tsx');
  const authContext = read('src/contexts/AuthContext.tsx');
  const register = read('src/app/register/page.tsx');
  const profileSetup = read('src/app/profile-setup/page.tsx');
  assert.match(login, /useAuth/);
  assert.match(login, /useForm/);
  assert.match(login, /zodResolver/);
  assert.match(login, /z\.object/);
  assert.doesNotMatch(login, /useAuthStore/);
  assert.match(login, /router\.push\('\/dashboard'\)/);
  assert.match(login, /schoolId/);
  assert.match(login, /onSchoolSelected/);
  assert.match(schoolPortal, /backendSchoolIds/);
  assert.match(schoolPortal, /nguyen-thi-due/);
  assert.match(schoolPortal, /sao-do/);
  assert.match(authContext, /schoolId/);

  assert.match(register, /useAuth/);
  assert.match(register, /useForm/);
  assert.match(register, /zodResolver/);
  assert.match(register, /z\.object/);
  assert.match(register, /fullName/);
  assert.match(register, /schoolId/);
  assert.match(profileSetup, /schoolId/);
  assert.doesNotMatch(register, /useAuthStore/);
});

test('web health module exposes dashboard, charts, logs, mood tracker, and AI panel', () => {
  assert.equal(existsSync(join(root, 'src/components/pages/HealthDashboardPage.tsx')), true);
  assert.equal(existsSync(join(root, 'src/lib/health-api.ts')), true);

  const shell = read('src/components/AppShell.tsx');
  assert.match(shell, /HealthDashboardPage/);
  assert.match(shell, /Sức khỏe/);

  const healthApi = read('src/lib/health-api.ts');
  for (const endpoint of ['health/profile', 'health/weight-logs', 'health/sleep-logs', 'health/meal-logs', 'health/workout-logs', 'health/mood-logs', 'health/statistics', 'health/bmi', 'health/ai-suggestions']) {
    assert.match(healthApi, new RegExp(endpoint));
  }

  const page = read('src/components/pages/HealthDashboardPage.tsx');
  for (const text of ['Sức khỏe học đường', 'BMI', 'Weight chart', 'Sleep chart', 'Meal log', 'Workout log', 'Mood tracker', 'AI health suggestion']) {
    assert.match(page, new RegExp(text, 'i'));
  }
  assert.match(page, /không thay thế bác sĩ/i);
});

test('web reminder notification module exposes dropdown, unread badge, notification list, and typed reminder form', () => {
  assert.equal(existsSync(join(root, 'src/lib/notification-api.ts')), true);
  assert.equal(existsSync(join(root, 'src/components/NotificationDropdown.tsx')), true);
  assert.equal(existsSync(join(root, 'src/components/pages/NotificationsPage.tsx')), true);

  const api = read('src/lib/notification-api.ts');
  for (const endpoint of ['reminders', 'notifications', 'notifications/push-token']) {
    assert.match(api, new RegExp(endpoint));
  }
  assert.match(api, /markNotificationRead/);

  const shell = read('src/components/AppShell.tsx');
  assert.match(shell, /NotificationDropdown/);
  assert.match(shell, /NotificationsPage/);
  assert.match(shell, /notifications/);

  const dropdown = read('src/components/NotificationDropdown.tsx');
  assert.match(dropdown, /unreadCount/);
  assert.match(dropdown, /badge/i);
  assert.match(dropdown, /markNotificationRead/);

  const reminders = read('src/components/pages/RemindersPage.tsx');
  for (const text of ['Quản lý reminder', 'assignment_deadline', 'study_time', 'exam', 'task', 'sleep', 'water', 'workout', 'meal', 'custom', 'repeat_type']) {
    assert.match(reminders, new RegExp(text));
  }

  const notifications = read('src/components/pages/NotificationsPage.tsx');
  assert.match(notifications, /Danh sách thông báo/);
  assert.match(notifications, /Đánh dấu đã đọc/);
});

test('web statistics dashboard exposes charts, cards, progress, heatmap, and time filters', () => {
  assert.equal(existsSync(join(root, 'src/lib/statistics-api.ts')), true);
  assert.equal(existsSync(join(root, 'src/components/pages/StatisticsDashboardPage.tsx')), true);

  const api = read('src/lib/statistics-api.ts');
  for (const endpoint of ['statistics/dashboard', 'statistics/study', 'statistics/tasks', 'statistics/health', 'statistics/finance']) {
    assert.match(api, new RegExp(endpoint));
  }

  const shell = read('src/components/AppShell.tsx');
  assert.match(shell, /StatisticsDashboardPage/);
  assert.doesNotMatch(shell, /label: 'Thống kê'/, 'statistics page may remain implemented but should not be shown in student navigation');

  const page = read('src/components/pages/StatisticsDashboardPage.tsx');
  for (const text of ['Dashboard card', 'Line chart', 'Bar chart', 'Pie chart', 'Progress bar', 'Calendar heatmap', 'Bộ lọc thời gian', 'Học tập', 'Công việc', 'Sức khỏe', 'Tài chính']) {
    assert.match(page, new RegExp(text, 'i'));
  }
});

test('admin web module exposes protected admin layout, dashboard, users, templates, and logs', () => {
  const expectedFiles = [
    'src/lib/admin-api.ts',
    'src/components/admin/AdminLayout.tsx',
    'src/components/admin/AdminDashboard.tsx',
    'src/app/admin/login/page.tsx',
    'src/app/admin/dashboard/page.tsx',
  ];
  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const api = read('src/lib/admin-api.ts');
  for (const endpoint of ['admin/users', 'admin/statistics', 'admin/ai-logs', 'admin/logs', 'admin/catalog']) {
    assert.match(api, new RegExp(endpoint));
  }
  assert.match(api, /toggleUserStatus/);

  const layout = read('src/components/admin/AdminLayout.tsx');
  for (const text of ['Admin sidebar', 'Dashboard tổng quan', 'Quản lý người dùng', 'Thông báo hệ thống', 'Mẫu CV', 'Mẫu báo cáo', 'Danh mục hệ thống', 'Log hoạt động']) {
    assert.match(layout, new RegExp(text));
  }

  const dashboard = read('src/components/admin/AdminDashboard.tsx');
  for (const text of ['Dashboard card', 'Table danh sách user', 'Search/filter user', 'Modal xem chi tiết user', 'Chart thống kê', 'Log table', 'Khóa', 'Mở khóa', 'Lịch sử truy vấn AI']) {
    assert.match(dashboard, new RegExp(text));
  }
  assert.match(dashboard, /role\s*!==\s*['"]admin['"]/);
});

test('student web dashboard exposes Student OS AI Companion layout without sales copy', () => {
  const expectedComponents = [
    'Sidebar',
    'Topbar',
    'StudentMenu',
    'HeroStudent',
    'SuggestionCard',
    'SectionPanel',
    'ScheduleCard',
    'TaskCard',
    'ProgressCard',
    'DocumentAICard',
    'CareerCard',
    'JobCard',
    'WellnessCard',
    'WaterCard',
    'BreakReminderCard',
    'AICompanionWidget',
    'MotivationCard',
  ];

  const dashboard = read('src/components/pages/DashboardPage.tsx');
  const shell = read('src/components/AppShell.tsx');
  const widget = read('src/components/AICompanionWidget.tsx');
  const globals = read('src/app/globals.css');

  const studentUi = `${dashboard}\n${shell}\n${widget}`;

  for (const component of expectedComponents) {
    assert.match(studentUi, new RegExp(`function ${component}|const ${component}|<${component}`), `${component} should be present`);
  }

  for (const text of [
    'Trường Đại học Sao Đỏ',
    'AI Companion',
    'Ngày học rõ ràng hơn',
    'Theo dõi lịch học, việc cần làm, tài liệu và câu hỏi AI',
    'Học tập',
    'Công việc',
    'Sức khỏe',
    'Uống nước',
    'Nghỉ mắt',
    'Tài liệu AI',
    'CV',
    'Chat nhanh',
    'Mở Chat tổng',
    'aria-haspopup="menu"',
    'role="menu"',
  ]) {
    assert.match(studentUi, new RegExp(text), `${text} should appear in student dashboard UI`);
  }

  for (const forbidden of ['\\bPro\\b', 'Premium', 'Upgrade', 'Pricing', 'Nâng cấp']) {
    assert.doesNotMatch(studentUi, new RegExp(forbidden, 'i'), `${forbidden} should not appear in student UI`);
  }

  for (const token of ['#E31D1C', '#F7D428', '#1784DA', '#112641', 'student-os-fade-up', 'student-os-orb-pulse']) {
    assert.match(`${dashboard}\n${shell}\n${globals}`, new RegExp(token.replace('#', '#?'), 'i'), `${token} should support the Student OS visual system`);
  }
});

test('student dashboard mirrors the provided reference composition', () => {
  const dashboard = read('src/components/pages/DashboardPage.tsx');
  const shell = read('src/components/AppShell.tsx');
  const widget = read('src/components/AICompanionWidget.tsx');
  const globals = read('src/app/globals.css');
  const studentUi = `${dashboard}\n${shell}\n${widget}\n${globals}`;

  for (const marker of [
    'reference-student-photo',
    'reference-ai-robot',
    'reference-search-bar',
    'Trợ lí học tập Sao Đỏ',
    'Ưu tiên hôm nay',
    'Gợi ý cho bạn hôm nay',
    'Học tập thông minh, nắm vững kiến thức',
    'Phát triển kỹ năng, mở rộng cơ hội',
    'Cân bằng thân – tâm – trí',
    'Lịch học hôm nay',
    'Bài tập cần làm',
    'Tiến độ học tập',
    'CV & Kỹ năng',
    'Việc làm thêm',
    'Giấc ngủ',
    'Mức năng lượng',
    'Nhập câu hỏi nhanh',
    'Thành công là tổng của những nỗ lực nhỏ',
    'student-os-reference-grid',
  ]) {
    assert.match(studentUi, new RegExp(marker), `${marker} should match the reference dashboard composition`);
  }

  assert.doesNotMatch(shell, /ConversationSidebar/, 'Student OS dashboard must not render the legacy blue conversation sidebar');
  assert.doesNotMatch(dashboard, /AICompanionBar/, 'Dashboard should not render the old wide AI companion strip');
  assert.match(shell, /!\['profile', 'health'\]\.includes\(item\.id\)/, 'Sidebar should move Hồ sơ and Sức khỏe into the topbar student dropdown');
  assert.match(shell, /'dashboard', 'schedule', 'chat', 'documents', 'reminders'/, 'Mobile nav should keep Chat AI as a primary destination after moving personal items to the student menu');
});

test('student topbar keeps only notifications and account menu actions', () => {
  const shell = read('src/components/AppShell.tsx');
  const topbarStart = shell.indexOf('function Topbar');
  const menuStart = shell.indexOf('function StudentMenu');
  const topbar = shell.slice(topbarStart, menuStart);
  const menu = shell.slice(menuStart, shell.indexOf('function MobileNavigation'));

  assert.doesNotMatch(topbar, /📅/, 'topbar should remove the standalone calendar button');
  assert.doesNotMatch(topbar, /Hỏi AI/, 'topbar should remove the standalone Ask AI button');
  assert.match(menu, /Đăng xuất/, 'student menu should expose logout');
  assert.match(menu, /logout/, 'student menu should call the auth logout action');
  assert.match(menu, /router\.replace\(getSchoolGatewayPath\(\)\)/, 'logout should return the student to the school selection gateway');
});

test('manual logout preserves gateway redirect even while protected routes react to lost auth', () => {
  const shell = read('src/components/AppShell.tsx');
  const profile = read('src/app/profile/ProfilePageClient.tsx');
  const protectedRoute = read('src/components/guards/ProtectedRoute.tsx');
  const schoolSession = read('src/lib/school-session.ts');

  assert.match(shell, /logout\(school,\s*getSchoolGatewayPath\(\)\)/, 'student menu logout should mark a gateway redirect');
  assert.match(profile, /logout\(school,\s*getSchoolGatewayPath\(\)\)/, 'profile logout should mark a gateway redirect');
  assert.match(shell, /router\.replace\(getSchoolGatewayPath\(\)\)/, 'student menu logout should navigate to the school selection gateway');
  assert.match(profile, /router\.replace\(getSchoolGatewayPath\(\)\)/, 'profile logout should navigate to the school selection gateway');
  assert.match(schoolSession, /markPostLogoutRedirectPath/, 'manual logout should persist a one-shot redirect target');
  assert.match(schoolSession, /consumePostLogoutRedirectPath/, 'protected routes should be able to consume the one-shot redirect target');
  assert.match(protectedRoute, /consumePostLogoutRedirectPath/, 'protected routes should read the one-shot logout redirect');
  assert.match(protectedRoute, /postLogoutRedirectPath\s*\|\|\s*getSchoolLoginPath\(school\)/, 'protected routes should fall back to the school login when there is no manual logout redirect');
});

test('documents page exposes the community document library workflow', () => {
  const documentsPage = read('src/components/pages/DocumentsPage.tsx');

  for (const marker of [
    'Bộ lọc',
    'Đăng tài liệu mới',
    'Tìm theo tên, mô tả, mã môn hoặc tag',
    'Lọc theo tag',
    'Ngày tạo',
    'Ngày cập nhật',
    'Chọn một tài liệu để xem chi tiết.',
    'xl:grid-cols',
    'demoDocuments',
    'visibleDocuments',
    'Giáo trình Trí tuệ nhân tạo - Chương 1-4',
    'Slide Lập trình Flutter: State management',
    'Ngân hàng đề Cơ sở dữ liệu',
    'Bài tập lớn Phân tích thiết kế hệ thống',
    'Tài liệu demo chưa có file tải xuống.',
    'Chỉnh sửa',
    'Lưu chỉnh sửa',
    'Tải xuống',
  ]) {
    assert.match(documentsPage, new RegExp(marker), `${marker} should appear in the community documents workflow`);
  }

  assert.doesNotMatch(documentsPage, /Kho học liệu cộng đồng/, 'documents page should not render the old community-library hero');
  assert.doesNotMatch(documentsPage, /Kho học liệu của tôi/, 'documents page should not render the old personal-library header');
});

test('student sidebar removes the statistics navigation item', () => {
  const shell = read('src/components/AppShell.tsx');
  const navStart = shell.indexOf('const navItems');
  const navEnd = shell.indexOf('function Icon');
  const navItems = shell.slice(navStart, navEnd);

  assert.doesNotMatch(navItems, /id: 'statistics'/, 'statistics tab should not be present in student navigation');
  assert.doesNotMatch(navItems, /label: 'Thống kê'/, 'statistics label should not be shown in the sidebar');
});

test('protected dashboard route defers auth-dependent rendering until after mount', () => {
  const protectedRoute = read('src/components/guards/ProtectedRoute.tsx');

  assert.match(protectedRoute, /useState\(false\)/, 'ProtectedRoute should track client mount state');
  assert.match(protectedRoute, /setHasMounted\(true\)/, 'ProtectedRoute should only enable auth-dependent UI after mount');
  assert.match(protectedRoute, /if \(!hasMounted\) return null/, 'ProtectedRoute should render stable null markup for SSR and first client render');
});

test('student dashboard uses Sao Do University logo, name, and logo-inspired palette', () => {
  const logoPath = join(root, 'public', 'sao-do-university-logo.png');
  const shell = read('src/components/AppShell.tsx');
  const dashboard = read('src/components/pages/DashboardPage.tsx');
  const globals = read('src/app/globals.css');
  const studentUi = `${shell}\n${dashboard}\n${globals}`;

  assert.equal(existsSync(logoPath), true, 'optimized Sao Do logo asset should exist in public');
  assert.match(shell, /sao-do-university-logo\.png/, 'shell should render the provided Sao Do logo');
  assert.match(shell, /Trường Đại học Sao Đỏ/, 'sidebar brand name should be Trường Đại học Sao Đỏ');
  assert.doesNotMatch(shell, /STUDENT OS/, 'old Student OS brand name should be removed from the shell');

  for (const color of ['#E31D1C', '#F7D428', '#1784DA', '#112641']) {
    assert.match(studentUi, new RegExp(color.replace('#', '#?'), 'i'), `${color} should be part of the canonical academic palette`);
  }
});

test('student work tab exposes local jobs marketplace with crawler provenance and risk labels', () => {
  const courses = read('src/components/pages/CoursesPage.tsx');

  for (const marker of [
    'JobMarketplacePage',
    'localJobSources',
    'communityJobPosts',
    'crawlerJobFeeds',
    'riskBadges',
    'Việc làm quanh Chí Linh',
    'Đăng việc nhanh',
    'Nguồn đang quét',
    'Cảnh báo an toàn',
    'Báo cáo',
    'sourceType',
    'riskLevel',
  ]) {
    assert.match(courses, new RegExp(marker), `${marker} should support the student jobs marketplace`);
  }

  assert.doesNotMatch(courses, /Học kỳ này/, 'Công việc tab should no longer render the old course-semester page');
});

test('dashboard section boards use compact modern cards instead of bulky grid blocks', () => {
  const dashboard = read('src/components/pages/DashboardPage.tsx');

  for (const marker of ['compact-board-grid', 'CompactBoardCard', 'CompactBoardRow', 'BoardMetricPill']) {
    assert.match(dashboard, new RegExp(marker), `${marker} should be used for the compact board redesign`);
  }

  assert.doesNotMatch(dashboard, /min-h-\[178px\]/, 'old tall mini-card blocks should be removed');
  assert.doesNotMatch(dashboard, /md:grid-cols-2 xl:grid-cols-2/, 'section content should no longer be a bulky 2x2 card grid');
});

test('schedule page renders a dense weekly timetable with demo courses, filters, and week navigation', () => {
  const schedule = read('src/components/pages/SchedulePage.tsx');

  for (const marker of [
    'WeeklyScheduleGrid',
    'ScheduleDayColumn',
    'ScheduleMetric',
    'ScheduleBlockLayout',
    'SESSION_LAYOUTS',
    "detailLevel === 'compact'",
    "detailLevel === 'full'",
    'demoWeeks',
    'schedule-week-grid',
    'schedule-week-toolbar',
    'schedule-grid-session-label',
    'Lịch học, lịch thi theo tuần',
    'Ca học',
    'Sáng',
    'Chiều',
    'Tối',
    'Lịch học lý thuyết',
    'Lịch học thực hành',
    'Lịch học trực tuyến',
    'Lịch thi',
    'Lịch tạm ngưng',
    'Tin sinh học',
    'Thị giác máy tính',
    'Dữ liệu lớn – Big Data',
    'Trí tuệ nhân tạo',
    'Lập trình Flutter',
    'Hệ điều hành',
    'Hiện tại',
    'In lịch',
    'Trước',
    'Tiếp',
    'Workshop portfolio',
    'Thi cuối kỳ Hệ điều hành',
  ]) {
    assert.match(schedule, new RegExp(marker), `${marker} should be present in the weekly timetable workspace`);
  }

  const headerIndex = schedule.indexOf('Lịch tuần chi tiết');
  const weeklyGridIndex = schedule.indexOf('<WeeklyScheduleGrid');

  assert.ok(headerIndex > -1 && weeklyGridIndex > -1, 'schedule page should render a timetable header and the weekly grid');
  assert.ok(headerIndex < weeklyGridIndex, 'weekly grid should appear after the compact schedule header');
  assert.doesNotMatch(schedule, /function WeekStrip|<WeekStrip/, 'weekly overview strip should be removed');
  assert.doesNotMatch(schedule, /function TimelineSchedule|<TimelineSchedule/, 'today timeline should be removed');
  assert.doesNotMatch(schedule, /function ScheduleTimelineItem|<ScheduleTimelineItem/, 'timeline item component should be removed');
  assert.doesNotMatch(schedule, /Tuần học Sao Đỏ/, 'Sao Do weekly overview heading should be removed');
  assert.doesNotMatch(schedule, /Lịch học hôm nay/, 'today timeline eyebrow should be removed');
  assert.doesNotMatch(schedule, /Timeline theo buổi/, 'today timeline heading should be removed');
  assert.doesNotMatch(schedule, /ModernScheduleHero/, 'old large timetable hero should be removed');
  assert.doesNotMatch(schedule, /StudyFocusCard|Nhịp học/, 'old study rhythm block should be removed');
  assert.doesNotMatch(schedule, /grid gap-5 xl:grid-cols-\[0\.95fr_1\.05fr\]/, 'old two-panel schedule layout should be removed');
  assert.doesNotMatch(schedule, /NextClassHeroCard|PreparationCard/, 'old next-class and preparation cards should be removed in favor of the detailed timetable');
});

test('student UI uses lightweight Sao Do button motion instead of heavy per-button WebGL', () => {
  const globals = read('src/app/globals.css');
  const packageJson = read('package.json');
  const threeDivider = read('src/lib/schoolPortalThreeDivider.ts');

  for (const marker of ['sdu-button-motion', 'sdu-button-shimmer', 'sdu-button-ripple', 'sdu-button-press']) {
    assert.match(globals, new RegExp(marker), `${marker} should define the shared button animation system`);
  }

  assert.match(globals, /\.student-os-shell button/, 'student shell buttons should inherit the shared motion system');
  assert.match(packageJson, /"three"/, 'three.js is allowed only for the school selector seam animation');
  assert.match(threeDivider, /from 'three'/, 'three.js usage should stay scoped to the school selector divider');
  assert.doesNotMatch(globals, /from ['"]three['"]|WebGLRenderer|THREE\./, 'button animation CSS should not depend on three.js');
});

test('student profile page exposes a detailed Sao Do student dossier experience', () => {
  const profile = read('src/app/profile/page.tsx');

  for (const marker of [
    'HeroProfileCard',
    'BentoCard',
    'SemesterProgressCard',
    'StudentBentoProfileContent',
    'Hồ sơ sinh viên',
    'Thông tin học tập',
    'Quản lý thông tin cá nhân',
    'Mã định danh',
    'Lớp sinh hoạt',
    'Khóa học',
    'Cố vấn học tập',
    'Tiến độ học kỳ',
    'Điểm rèn luyện',
  ]) {
    assert.match(profile, new RegExp(marker), `${marker} should be present in the detailed profile UI`);
  }

  for (const color of ['#F8FCFF', '#1784DA', '#E31D1C', '#F7D428', '#112641']) {
    assert.match(profile, new RegExp(color.replace('#', '#?'), 'i'), `${color} should anchor the academic profile palette`);
  }
});

test('student profile page stays inside the Student OS shell navigation', () => {
  const profile = read('src/app/profile/page.tsx');

  assert.match(profile, /<ProtectedRoute>/, 'profile route should use the shared auth gate');
  assert.match(profile, /<AppShell[^>]*activeNavId=["']profile["']/, 'profile route should keep the existing app shell navigation active');
  assert.doesNotMatch(profile, /function StudentBentoSidebar|<StudentBentoSidebar/, 'profile should not render its own duplicate sidebar');
  assert.doesNotMatch(profile, /function StudentBentoTopbar|<StudentBentoTopbar/, 'profile should not render its own duplicate topbar');
  assert.doesNotMatch(profile, /Quay lại/, 'profile should not require a back button when opened from sidebar navigation');
});

test('student profile semester progress is calculated from first class day to final exam day', () => {
  const profile = read('src/app/profile/page.tsx');

  for (const marker of [
    'calculateSemesterProgress',
    'semesterStartDate',
    'lastExamDate',
    'daysRemaining',
    'Ngày đầu tiên đi học',
    'Ngày thi cuối cùng',
    'Còn',
  ]) {
    assert.match(profile, new RegExp(marker), `${marker} should support semester progress calculation`);
  }

  assert.match(profile, /Math\.min\(100,\s*Math\.max\(0/, 'semester progress should be clamped between 0 and 100');
  assert.match(profile, /style=\{\{ width: `\$\{semesterProgress\.percent\}%` \}\}/, 'progress bar width should use the calculated percentage');
  assert.doesNotMatch(profile, /semesterProgress:\s*'72%'/, 'semester progress should not be a hard-coded string');
});

test('student profile renders the Student Bento OS reference composition', () => {
  const profile = read('src/app/profile/page.tsx');

  for (const component of [
    'StudentBentoProfileContent',
    'HeroProfileCard',
    'SemesterProgressCard',
    'StudyInfoCard',
    'AccountStatusCard',
    'AICompanionMemoryCard',
    'QuickStatsCard',
    'ProgressRing',
    'MiniSparkline',
  ]) {
    assert.match(profile, new RegExp(`function ${component}|const ${component}|<${component}`), `${component} should compose the Student Bento OS profile`);
  }

  for (const text of [
    'Xin chào!',
    'Nhịp học kỳ hiện tại',
    'Thông tin học tập',
    'Quản lý thông tin cá nhân',
    'AI Companion ghi nhớ',
    'Thống kê nhanh',
    'Mục tiêu học tập',
    'Lịch ôn tập gợi ý',
    'Gợi ý ưu tiên',
    'Nội dung nên xem',
    'Điểm TB tích lũy',
  ]) {
    assert.match(profile, new RegExp(text), `${text} should match the requested bento profile copy`);
  }

  for (const color of ['#F8FCFF', '#1784DA', '#E31D1C', '#F7D428', '#112641', '#D8EAF5', '#57C785', '#EAF0FF', '#EEF7FF']) {
    assert.match(profile, new RegExp(color.replace('#', '#?'), 'i'), `${color} should support the academic bento palette`);
  }

  for (const forbidden of ['\\bPro\\b', 'Premium', 'Upgrade', 'Pricing', 'Nâng cấp']) {
    assert.doesNotMatch(profile, new RegExp(forbidden, 'i'), `${forbidden} should not appear in profile UI`);
  }
});

test('student profile hero surfaces concise personal student information', () => {
  const profile = read('src/app/profile/page.tsx');

  for (const marker of [
    'personalDetails',
    'Ngày sinh',
    'Email',
    'Số điện thoại',
    'Lớp: \\${academicInfo\\.className \\|\\| academicDefaults\\.className}',
    'Khóa: \\${academicInfo\\.courseRange \\|\\| academicDefaults\\.cohort}',
    'formattedBirthDate',
  ]) {
    assert.match(profile, new RegExp(marker), `${marker} should appear in the hero personal information area`);
  }
});

test('student profile places quick statistics before account status for overview scanning', () => {
  const profile = read('src/app/profile/page.tsx');
  const studyIndex = profile.indexOf('<StudyInfoCard');
  const statsIndex = profile.indexOf('<QuickStatsCard');
  const aiIndex = profile.indexOf('<AICompanionMemoryCard');
  const accountIndex = profile.indexOf('<AccountStatusCard');

  assert.ok(studyIndex > -1 && statsIndex > -1 && aiIndex > -1 && accountIndex > -1, 'profile cards should be rendered in the page grid');
  assert.ok(studyIndex < statsIndex, 'quick statistics should sit beside/after study info');
  assert.ok(statsIndex < aiIndex, 'quick statistics should appear before the lower AI companion row');
  assert.ok(aiIndex < accountIndex, 'account status should move below quick statistics');
});

test('app shell leaves profile child route when other nav items are selected', () => {
  const shell = read('src/components/AppShell.tsx');

  assert.match(shell, /if \(children\) \{\s*router\.push\('\/dashboard'\)/s, 'AppShell should navigate back to dashboard when a child route owns the content');
  assert.match(shell, /setCurrentTab\(id\);\s*if \(children\)/s, 'AppShell should preserve the selected destination tab before leaving the child route');
});
