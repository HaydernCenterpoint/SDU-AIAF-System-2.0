import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, getApiErrorMessage } from '../services/api-client';

export type BootstrapStatistic = {
  label: string;
  value: number;
};

export type BootstrapReminder = {
  id: string;
  title: string;
  dueText: string;
  done?: boolean;
};

export type BootstrapAssignment = {
  id: string;
  title: string;
  subject: string;
  dueText: string;
  status?: string;
};

export type BootstrapHealthAlert = {
  id: string;
  title: string;
  value: string;
  helper: string;
};

export type BootstrapData = {
  statistics: BootstrapStatistic[];
  reminders: BootstrapReminder[];
  assignments: BootstrapAssignment[];
  healthAlerts: BootstrapHealthAlert[];
  suggestions: string[];
};

export type BootstrapState = {
  data: BootstrapData;
  loading: boolean;
  error: string | null;
  empty: boolean;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
};

type BootstrapResponse = Partial<BootstrapData> & {
  stats?: {
    classesToday?: number;
    reminders?: number;
    documents?: number;
  };
  schedule?: {
    id: string;
    title: string;
    time: string;
    room: string;
    type: string;
  }[];
};

const fallbackData: BootstrapData = {
  statistics: [
    { label: 'Deadline', value: 2 },
    { label: 'Task', value: 4 },
    { label: 'Lịch học', value: 3 },
  ],
  reminders: [
    { id: 'tuition', title: 'Nộp học phí kỳ này', dueText: 'Hạn hôm nay' },
    { id: 'library', title: 'Trả sách thư viện', dueText: 'Ngày mai' },
  ],
  assignments: [
    { id: 'mobile-ui', title: 'Hoàn thiện bài tập thiết kế giao diện', subject: 'Công nghệ phần mềm', dueText: '23:00 hôm nay' },
    { id: 'english', title: 'Ôn từ vựng Unit 5', subject: 'Tiếng Anh', dueText: 'Sáng mai', status: 'Cần ôn' },
  ],
  healthAlerts: [
    { id: 'weight', title: 'Cân nặng', value: 'Ổn định', helper: 'Duy trì vận động nhẹ trong tuần.' },
    { id: 'sleep', title: 'Giấc ngủ', value: '7 giờ', helper: 'Cố gắng ngủ trước 23:00 để học tập hiệu quả.' },
    { id: 'meal', title: 'Bữa ăn', value: 'Đủ bữa', helper: 'Nhớ uống nước giữa các tiết học.' },
    { id: 'mood', title: 'Tâm trạng', value: 'Tích cực', helper: 'Nếu căng thẳng, hãy nghỉ 5 phút hoặc nhắn cố vấn.' },
  ],
  suggestions: ['Hỏi lịch học hôm nay', 'Tạo nhắc nhở ôn thi', 'Tìm tài liệu môn đang học'],
};

function mergeBootstrapData(payload?: BootstrapResponse): BootstrapData {
  return {
    statistics: payload?.statistics ?? [
      { label: 'Lịch học', value: payload?.stats?.classesToday ?? fallbackData.statistics[2].value },
      { label: 'Deadline', value: payload?.stats?.reminders ?? fallbackData.statistics[0].value },
      { label: 'Tài liệu', value: payload?.stats?.documents ?? 8 },
    ],
    reminders: payload?.reminders ?? fallbackData.reminders,
    assignments: payload?.assignments ?? fallbackData.assignments,
    healthAlerts: payload?.healthAlerts ?? fallbackData.healthAlerts,
    suggestions: payload?.suggestions ?? fallbackData.suggestions,
  };
}

function isBootstrapEmpty(data: BootstrapData) {
  return data.reminders.length === 0 && data.assignments.length === 0 && data.healthAlerts.length === 0 && data.statistics.length === 0;
}

export function useBootstrapData(): BootstrapState {
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [data, setData] = useState<BootstrapData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await apiClient.get<BootstrapResponse>('/app/bootstrap');
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setData(mergeBootstrapData(response.data));
      setError(null);
    } catch (caught) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setData(fallbackData);
      setError(getApiErrorMessage(caught, 'Không thể tải dữ liệu dashboard'));
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();

    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const empty = useMemo(() => isBootstrapEmpty(data), [data]);

  return { data, loading, error, empty, refresh, refetch: refresh };
}
