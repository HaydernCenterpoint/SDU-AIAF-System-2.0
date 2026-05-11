import React from 'react';
import { HealthLogScreen } from './HealthLogScreen';

export function AddMealLogScreen() {
  return <HealthLogScreen title="Thêm bữa ăn" subtitle="Theo dõi bữa ăn, năng lượng và ghi chú dinh dưỡng." primaryField="Bữa ăn" helper="Không dùng AI để thay thế tư vấn dinh dưỡng chuyên môn." />;
}
