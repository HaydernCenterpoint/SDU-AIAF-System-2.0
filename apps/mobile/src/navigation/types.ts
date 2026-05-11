export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AIChat: undefined;
  Calendar: undefined;
  Health: undefined;
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & {
  Main: undefined;
  Subjects: undefined;
  SubjectDetail: { id: string };
  Assignments: undefined;
  AssignmentDetail: { id: string };
  StudyPlan: undefined;
  Documents: undefined;
  Flashcards: undefined;
  Tasks: undefined;
  TaskDetail: { id: string };
  CV: undefined;
  CareerPath: undefined;
  InterviewPractice: undefined;
  FinanceDashboard: undefined;
  Income: undefined;
  Expense: undefined;
  Budget: undefined;
  FinanceStatistics: undefined;
  Statistics: undefined;
  ReminderList: undefined;
  AddReminder: undefined;
  ReminderDetail: { id: string };
  Notifications: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AddWeightLog: undefined;
  AddSleepLog: undefined;
  AddMealLog: undefined;
  AddWorkoutLog: undefined;
  AddMoodLog: undefined;
  HealthStatistics: undefined;
};
