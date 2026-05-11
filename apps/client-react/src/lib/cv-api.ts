import type { AuthUser, StudentProfileDetails } from '@/types';
import type { CvProfile } from '@/lib/cv-demo';
import { buildCvAiContext } from '@/lib/cv-demo';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

export async function fetchStudentProfile(token: string): Promise<{ user: AuthUser; profile: StudentProfileDetails }> {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'Không thể tải hồ sơ người dùng');
  }

  return payload;
}

export async function askCvCoach({
  token,
  question,
  cvProfile,
  conversationId,
}: {
  token: string;
  question: string;
  cvProfile: CvProfile;
  conversationId?: string | null;
}): Promise<{ reply: string; conversationId: string | null }> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assistant_type: 'career',
      conversation_id: conversationId,
      message: question,
      context: {
        cvProfile: buildCvAiContext(cvProfile),
      },
    }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'AI chưa phản hồi được cho CV này');
  }

  return {
    reply: String(payload.reply || ''),
    conversationId: payload.conversation_id || null,
  };
}
