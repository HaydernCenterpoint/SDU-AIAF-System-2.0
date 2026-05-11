import { useRef, useCallback, useState } from 'react';
import { createReasoningEngine, type AIReasoningEngine, type ReasoningResult } from '@/lib/ai-reasoning-engine';
import type { AuthUser } from '@/types';
import type { AIRecommendation } from '@/lib/student-profile-types';

export type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type UseReasoningOptions = {
  user: AuthUser;
  grades?: Array<{
    subject: string;
    score: number;
    credits: number;
    semester: string;
  }>;
  schedule?: Array<{ title: string; time: string; room: string }>;
};

export function useAIRecommendations(options: UseReasoningOptions) {
  const { user, grades, schedule } = options;
  const engineRef = useRef<AIReasoningEngine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = createReasoningEngine(user, grades);
    }
    return engineRef.current;
  }, [user, grades]);

  const generateRecommendations = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const engine = ensureEngine();
      const result = await engine.generateRecommendations();
      setRecommendations(result.recommendations);
    } catch {
      setError('Không thể tạo khuyến nghị. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  }, [ensureEngine]);

  const refreshWithNewData = useCallback(
    (newGrades?: typeof grades) => {
      engineRef.current = createReasoningEngine(user, newGrades ?? grades);
    },
    [user, grades],
  );

  return {
    recommendations,
    isGenerating,
    error,
    generateRecommendations,
    refreshWithNewData,
    getSystemPrompt: () => ensureEngine().getSystemPrompt(),
  };
}

export function useStudentReasoning(options: UseReasoningOptions) {
  const { user, grades, schedule } = options;
  const engineRef = useRef<AIReasoningEngine | null>(null);
  const historyRef = useRef<ConversationEntry[]>([]);
  const [isReasoning, setIsReasoning] = useState(false);
  const [lastResult, setLastResult] = useState<ReasoningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = createReasoningEngine(user, grades);
    }
    return engineRef.current;
  }, [user, grades, schedule]);

  const ask = useCallback(
    async (question: string): Promise<ReasoningResult> => {
      setIsReasoning(true);
      setError(null);
      try {
        const engine = ensureEngine();
        const history = historyRef.current.map((e) => ({ role: e.role, content: e.content }));
        const result = await engine.reason(question, history);

        historyRef.current.push(
          { role: 'user', content: question, timestamp: new Date().toISOString() },
          { role: 'assistant', content: result.answer, timestamp: new Date().toISOString() },
        );

        if (historyRef.current.length > 20) {
          historyRef.current = historyRef.current.slice(-20);
        }

        setLastResult(result);
        return result;
      } catch {
        const errMsg = 'Xin lỗi, mình chưa kết nối được AI. Bạn thử lại nhé.';
        setError(errMsg);
        setLastResult({ answer: errMsg });
        return { answer: errMsg };
      } finally {
        setIsReasoning(false);
      }
    },
    [ensureEngine],
  );

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    engineRef.current = null;
    setLastResult(null);
  }, []);

  const updateGrades = useCallback(
    (newGrades: typeof grades) => {
      engineRef.current = createReasoningEngine(user, newGrades);
      historyRef.current = [];
    },
    [user, schedule],
  );

  const getHistory = useCallback(() => historyRef.current, []);

  return {
    ask,
    isReasoning,
    lastResult,
    error,
    clearHistory,
    updateGrades,
    getHistory,
    systemPrompt: ensureEngine().getSystemPrompt(),
  };
}
