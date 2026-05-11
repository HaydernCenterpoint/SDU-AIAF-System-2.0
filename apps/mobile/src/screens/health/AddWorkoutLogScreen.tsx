import React from 'react';
import { HealthLogScreen } from './HealthLogScreen';

export function AddWorkoutLogScreen() {
  return <HealthLogScreen title="Thêm tập luyện" subtitle="Ghi bài tập, thời lượng và cảm nhận sau vận động." primaryField="Bài tập" helper="Nếu có dấu hiệu bất thường nghiêm trọng, hãy liên hệ chuyên gia y tế." />;
}
