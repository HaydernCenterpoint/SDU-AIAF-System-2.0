import React from 'react';
import { HealthLogScreen } from './HealthLogScreen';

export function AddWeightLogScreen() {
  return <HealthLogScreen title="Thêm cân nặng" subtitle="Ghi lại cân nặng để theo dõi xu hướng BMI." primaryField="Cân nặng (kg)" helper="Sao Đỏ chỉ hỗ trợ theo dõi thói quen, không chẩn đoán y tế." />;
}
