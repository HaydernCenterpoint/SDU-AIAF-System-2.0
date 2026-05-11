import React from 'react';
import { HealthLogScreen } from './HealthLogScreen';

export function AddMoodLogScreen() {
  return <HealthLogScreen title="Thêm tâm trạng" subtitle="Ghi tâm trạng, năng lượng và mức căng thẳng." primaryField="Tâm trạng" helper="Nếu căng thẳng kéo dài, hãy tìm hỗ trợ từ người thân hoặc chuyên gia." />;
}
