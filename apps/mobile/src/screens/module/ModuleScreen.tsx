import { useRoute, type RouteProp } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyView } from '../../components/ui/EmptyView';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import type { RootStackParamList } from '../../navigation/types';

type ModuleRoute = RouteProp<RootStackParamList, keyof RootStackParamList>;

const routeTitles: Partial<Record<keyof RootStackParamList, string>> = {
  Subjects: 'Môn học',
  SubjectDetail: 'Chi tiết môn học',
  Assignments: 'Bài tập',
  AssignmentDetail: 'Chi tiết bài tập',
  StudyPlan: 'Kế hoạch học tập',
  Documents: 'Tài liệu',
  Flashcards: 'Flashcards',
  Tasks: 'Công việc',
  TaskDetail: 'Chi tiết công việc',
  CV: 'CV',
  CareerPath: 'Lộ trình nghề nghiệp',
  InterviewPractice: 'Luyện phỏng vấn',
  FinanceDashboard: 'Tài chính',
  Income: 'Thu nhập',
  Expense: 'Chi tiêu',
  Budget: 'Ngân sách',
  FinanceStatistics: 'Thống kê tài chính',
  ReminderList: 'Nhắc nhở',
  AddReminder: 'Thêm nhắc nhở',
  ReminderDetail: 'Chi tiết nhắc nhở',
  EditProfile: 'Chỉnh sửa hồ sơ',
  Settings: 'Cài đặt',
  ChangePassword: 'Đổi mật khẩu',
  NotificationSettings: 'Cài đặt thông báo',
  PrivacySettings: 'Quyền riêng tư',
};

export function ModuleScreen() {
  const route = useRoute<ModuleRoute>();
  const title = routeTitles[route.name] || route.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <EmptyView
        title="Tính năng đang được chuẩn bị"
        text="Màn hình này đã có điểm đến trong điều hướng và sẽ được hoàn thiện ở các bước tiếp theo."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginBottom: Spacing.xl,
  },
});
