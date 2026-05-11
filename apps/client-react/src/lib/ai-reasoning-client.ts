import type { AuthUser } from '@/types';
import type { SubjectGrade, AIRecommendation } from './student-profile-types';
import { buildStudentContext } from './ai-reasoning-engine';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

export type AIReasoningRequest = {
  user: AuthUser;
  question: string;
  grades?: SubjectGrade[];
  schedule?: Array<{ title: string; time: string; room: string }>;
  conversationHistory?: Array<{ role: string; content: string }>;
};

export type AIReasoningResponse = {
  success: boolean;
  content: string;
  sources: string[];
  model?: string;
  provider?: string;
};

export type AIRecommendationsResponse = {
  success: boolean;
  recommendations: AIRecommendation[];
};

export async function sendPersonalizedMessage(
  token: string,
  user: AuthUser,
  question: string,
  conversationId: string,
  grades?: SubjectGrade[],
  schedule?: Array<{ title: string; time: string; room: string }>,
  conversationHistory?: Array<{ role: string; content: string }>,
): Promise<AIReasoningResponse> {
  const studentProfile = buildStudentContext(user, grades, schedule);

  try {
    const res = await fetch(`${API_BASE}/ai-reasoning/personalized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId,
        question,
        studentProfile,
        conversationHistory: conversationHistory || [],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        content: data.content || data.message?.content || '',
        sources: data.sources || [],
        model: data.model,
        provider: data.provider,
      };
    }
  } catch {
    // fall through
  }

  return {
    success: false,
    content: 'Xin lỗi, hiện tại AI đang bận. Bạn thử lại nhé.',
    sources: [],
  };
}

export async function fetchAIRecommendations(
  token: string,
  user: AuthUser,
  grades?: SubjectGrade[],
): Promise<AIRecommendationsResponse> {
  const studentProfile = buildStudentContext(user, grades);

  try {
    const res = await fetch(`${API_BASE}/ai-reasoning/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ studentProfile }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        recommendations: data.recommendations || [],
      };
    }
  } catch {
    // fall through
  }

  return { success: false, recommendations: [] };
}
