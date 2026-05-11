'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { fetchAIRecommendations } from '@/lib/ai-reasoning-client';
import type { AIRecommendation } from '@/lib/student-profile-types';

const typeLabels: Record<string, string> = {
  study_plan: 'Kế hoạch học tập',
  resource: 'Tài nguyên',
  improvement: 'Cải thiện',
  motivation: 'Động lực',
  schedule: 'Lịch học',
};

const typeColors: Record<string, string> = {
  study_plan: 'from-blue-500 to-blue-600',
  resource: 'from-emerald-500 to-emerald-600',
  improvement: 'from-orange-500 to-orange-600',
  motivation: 'from-purple-500 to-purple-600',
  schedule: 'from-teal-500 to-teal-600',
};

const priorityBadge: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const typeIcons: Record<string, string> = {
  study_plan: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83',
  resource: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  improvement: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  motivation: 'M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  schedule: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
};

export function AIRecommendationsWidget({ school = 'sdu' }: { school?: 'ntd' | 'sdu' }) {
  const { token, user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNtd = school === 'ntd';
  const primaryColor = isNtd ? '#4D97FF' : '#E31D1C';
  const primaryDark = isNtd ? '#0F3460' : '#B71918';

  useEffect(() => {
    if (!token || !user) return;
    loadRecommendations();
  }, [token, user]);

  async function loadRecommendations() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAIRecommendations(token!, user!);
      if (result.success) {
        setRecommendations(result.recommendations);
      }
    } catch {
      setError('Không thể tải khuyến nghị');
    } finally {
      setIsLoading(false);
    }
  }

  const highPriority = recommendations.filter((r) => r.priority === 'high');

  if (!token || !user) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-text">AI Học Tập Cá Nhân</h3>
            <p className="text-xs font-semibold text-text-muted">
              {isLoading
                ? 'Đang phân tích...'
                : recommendations.length > 0
                  ? `${recommendations.length} khuyến nghị · ${highPriority.length} ưu tiên cao`
                  : 'AI phân tích hồ sơ học tập của em'}
            </p>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-2">
          {error && (
            <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
              <button onClick={loadRecommendations} className="ml-2 underline">Thử lại</button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-100 p-3">
                  <div className="mb-1 h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-2 w-full rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl border border-border bg-gray-soft p-3 transition hover:border-primary/30"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-lg bg-gradient-to-br p-1.5 text-white shadow-sm ${typeColors[rec.type] || 'from-gray-400 to-gray-500'}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={typeIcons[rec.type] || typeIcons.study_plan} />
                        </svg>
                      </div>
                      <span className="text-xs font-black text-text">{rec.title}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityBadge[rec.priority] || priorityBadge.low}`}>
                      {rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'TB' : 'Thấp'}
                    </span>
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-text-muted">{rec.description}</p>
                  {rec.actionableSteps.length > 0 && (
                    <ul className="space-y-1">
                      {rec.actionableSteps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5 text-xs text-text-sub">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                  {rec.expectedImpact && (
                    <p className="mt-2 border-t border-border/50 pt-1.5 text-[11px] font-semibold text-emerald-600">
                      Kỳ vọng: {rec.expectedImpact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-gray-soft p-4 text-center">
              <p className="text-xs font-semibold text-text-muted">
                Đăng nhập và cập nhật điểm số để nhận khuyến nghị cá nhân hóa từ AI.
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
            <p className="text-[10px] font-semibold text-text-muted">
              Dựa trên: {user.fullName || 'hồ sơ cá nhân'}
            </p>
            <button
              onClick={loadRecommendations}
              className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-bold text-text-sub transition hover:border-primary hover:text-primary"
            >
              Cập nhật
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
