import React from 'react';
import { HealthLogScreen } from './HealthLogScreen';

export function AddSleepLogScreen() {
  return <HealthLogScreen title="Thêm giấc ngủ" subtitle="Ghi số giờ ngủ và chất lượng nghỉ ngơi." primaryField="Số giờ ngủ" helper="Ưu tiên lịch ngủ đều để học tập bền bỉ hơn." />;
}
