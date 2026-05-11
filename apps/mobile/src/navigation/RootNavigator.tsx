import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tokenStorage } from '../services/token-storage';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { AddMealLogScreen } from '../screens/health/AddMealLogScreen';
import { AddMoodLogScreen } from '../screens/health/AddMoodLogScreen';
import { AddSleepLogScreen } from '../screens/health/AddSleepLogScreen';
import { AddWeightLogScreen } from '../screens/health/AddWeightLogScreen';
import { AddWorkoutLogScreen } from '../screens/health/AddWorkoutLogScreen';
import { HealthStatisticsScreen } from '../screens/health/HealthStatisticsScreen';
import { ModuleScreen } from '../screens/module/ModuleScreen';
import { AddReminderScreen } from '../screens/notifications/AddReminderScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { StatisticsScreen } from '../screens/statistics/StatisticsScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const moduleRoutes: (keyof Pick<
  RootStackParamList,
  | 'Subjects'
  | 'SubjectDetail'
  | 'Assignments'
  | 'AssignmentDetail'
  | 'StudyPlan'
  | 'Documents'
  | 'Flashcards'
  | 'Tasks'
  | 'TaskDetail'
  | 'CV'
  | 'CareerPath'
  | 'InterviewPractice'
  | 'FinanceDashboard'
  | 'Income'
  | 'Expense'
  | 'Budget'
  | 'FinanceStatistics'
  | 'ReminderList'
  | 'ReminderDetail'
  | 'EditProfile'
  | 'Settings'
  | 'ChangePassword'
  | 'NotificationSettings'
  | 'PrivacySettings'
>)[] = [
  'Subjects',
  'SubjectDetail',
  'Assignments',
  'AssignmentDetail',
  'StudyPlan',
  'Documents',
  'Flashcards',
  'Tasks',
  'TaskDetail',
  'CV',
  'CareerPath',
  'InterviewPractice',
  'FinanceDashboard',
  'Income',
  'Expense',
  'Budget',
  'FinanceStatistics',
  'ReminderList',
  'ReminderDetail',
  'EditProfile',
  'Settings',
  'ChangePassword',
  'NotificationSettings',
  'PrivacySettings',
];

export function RootNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    tokenStorage.hasCompletedOnboarding().then((completed) => {
      if (active) setHasCompletedOnboarding(completed);
    });

    return () => {
      active = false;
    };
  }, []);

  if (isInitializing || hasCompletedOnboarding === null) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName={hasCompletedOnboarding ? 'Login' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen
              onNavigateRegister={() => navigation.navigate('Register')}
              onNavigateForgot={() => navigation.navigate('ForgotPassword')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {({ navigation }) => (
            <RegisterScreen
              onNavigateLogin={() => navigation.navigate('Login')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddWeightLog" component={AddWeightLogScreen} />
      <Stack.Screen name="AddSleepLog" component={AddSleepLogScreen} />
      <Stack.Screen name="AddMealLog" component={AddMealLogScreen} />
      <Stack.Screen name="AddWorkoutLog" component={AddWorkoutLogScreen} />
      <Stack.Screen name="AddMoodLog" component={AddMoodLogScreen} />
      <Stack.Screen name="HealthStatistics" component={HealthStatisticsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="AddReminder" component={AddReminderScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      {moduleRoutes.map((routeName) => (
        <Stack.Screen key={routeName} name={routeName} component={ModuleScreen} />
      ))}
    </Stack.Navigator>
  );
}
