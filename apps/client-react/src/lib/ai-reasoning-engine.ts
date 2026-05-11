import type { AuthUser } from '@/types';
import type {
  AIRecommendation,
  AIRecommendationSummary,
  StudentLearningProfile,
  SubjectGrade,
} from './student-profile-types';
import { buildStudentLearningProfile, generateSystemPrompt } from './student-profile-builder';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

export type ReasoningResult = {
  answer: string;
  sources?: string[];
  reasoning?: string;
};

export type RecommendationResult = {
  recommendations: AIRecommendation[];
  summary: AIRecommendationSummary;
};

function getModelConfig(): { provider: string; model: string; apiKey: string } {
  return {
    provider: 'krouter',
    model: 'cx/gpt-5.4',
    apiKey: '',
  };
}

async function callAI(messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> {
  const config = getModelConfig();

  try {
    const res = await fetch(`${API_BASE}/ai-reasoning/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Model-Provider': config.provider,
        'X-Model-Name': config.model,
      },
      body: JSON.stringify({
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        model: config.model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.content || data.message?.content || '';
    }
  } catch {
    // fall through to NemoClaw path
  }

  const openclawRes = await callViaNemoClaw(systemPrompt, messages);
  return openclawRes;
}

async function callViaNemoClaw(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  try {
    const conversation = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const res = await fetch(`${API_BASE}/ai-reasoning/nemoclaw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.content || '';
    }
  } catch {
    // final fallback
  }

  return 'Xin lỗi, hiện tại không thể kết nối đến AI. Vui lòng thử lại sau.';
}

export class AIReasoningEngine {
  private profile: StudentLearningProfile;

  constructor(profile: StudentLearningProfile) {
    this.profile = profile;
  }

  updateProfile(profile: StudentLearningProfile) {
    this.profile = profile;
  }

  getSystemPrompt(): string {
    return generateSystemPrompt(this.profile);
  }

  async reason(question: string, history: Array<{ role: string; content: string }> = []): Promise<ReasoningResult> {
    const systemPrompt = this.getSystemPrompt();

    const messages: Array<{ role: string; content: string }> = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: question },
    ];

    const answer = await callAI(messages, systemPrompt);

    return {
      answer,
      sources: this.extractSources(question, answer),
    };
  }

  async generateRecommendations(): Promise<RecommendationResult> {
    const systemPrompt = `${this.getSystemPrompt()}

Hãy phân tích toàn diện hồ sơ học tập trên và đưa ra các khuyến nghị cụ thể, khả thi.

Trả lời theo định dạng JSON:
{
  "recommendations": [
    {
      "type": "study_plan|resource|improvement|motivation|schedule",
      "priority": "high|medium|low",
      "title": "Tiêu đề ngắn gọn",
      "description": "Mô tả chi tiết",
      "subject": "Tên môn học (nếu có)",
      "actionableSteps": ["Bước 1", "Bước 2"],
      "expectedImpact": "Tác động mong đợi"
    }
  ]
}`;

    try {
      const res = await fetch(`${API_BASE}/ai-reasoning/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: this.profile }),
      });

      if (res.ok) {
        const data = await res.json();
        return this.parseRecommendations(data);
      }
    } catch {
      // fall through
    }

    return this.generateFallbackRecommendations();
  }

  private extractSources(question: string, answer: string): string[] {
    const sources: string[] = [];
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('lịch') || lowerQ.includes('thời khóa')) sources.push('Thời khóa biểu');
    if (lowerQ.includes('tài liệu') || lowerQ.includes('document')) sources.push('Tài liệu học tập');
    if (lowerQ.includes('điểm') || lowerQ.includes('grade')) sources.push('Kết quả học tập');
    if (lowerQ.includes('lịch thi') || lowerQ.includes('exam')) sources.push('Lịch thi');

    return sources;
  }

  private parseRecommendations(data: { recommendations?: AIRecommendation[] }): RecommendationResult {
    const recs = data.recommendations || [];
    const byType: Record<string, number> = {};
    let highCount = 0;

    for (const r of recs) {
      byType[r.type] = (byType[r.type] || 0) + 1;
      if (r.priority === 'high') highCount++;
    }

    return {
      recommendations: recs,
      summary: {
        totalRecommendations: recs.length,
        highPriority: highCount,
        byType,
        topRecommendation: recs.find((r) => r.priority === 'high') || recs[0],
      },
    };
  }

  private generateFallbackRecommendations(): RecommendationResult {
    const { metrics, goals } = this.profile;
    const recs: AIRecommendation[] = [];

    if (metrics.weakestSubjects.length > 0) {
      recs.push({
        type: 'improvement',
        priority: 'high',
        title: 'Cải thiện điểm yếu',
        description: `Em cần tập trung cải thiện các môn: ${metrics.weakestSubjects.join(', ')}. Đây là những môn ảnh hưởng nhiều đến GPA chung.`,
        subject: metrics.weakestSubjects[0],
        actionableSteps: [
          'Xem lại bài giảng và ghi chép của các môn yếu',
          'Tìm tài liệu bổ sung hoặc nhờ giáo viên/học sinh giỏi hỗ trợ',
          'Luyện tập thêm bài tập từ cơ bản đến nâng cao',
          'Đặt lịch ôn tập cụ thể cho từng môn',
        ],
        expectedImpact: `Nâng GPA lên ${(metrics.overallGPA + 0.2).toFixed(1)}/10 trong 1 học kỳ`,
      });
    }

    recs.push({
      type: 'study_plan',
      priority: 'medium',
      title: 'Xây dựng kế hoạch học tập',
      description: `Dựa trên phong cách học tập của em, hãy học vào khung giờ ${this.profile.patterns.mostProductiveHours.join(', ')} để đạt hiệu quả cao nhất.`,
      actionableSteps: [
        'Chia thời gian học thành các block 45 phút với 10 phút nghỉ',
        'Ưu tiên học môn khó khi tinh thần còn tỉnh táo',
        'Học nhóm 1-2 lần/tuần để trao đổi kiến thức',
      ],
      expectedImpact: 'Tăng 20-30% hiệu quả ghi nhớ',
    });

    if (goals.targetGPA > metrics.overallGPA && metrics.overallGPA > 0) {
      const diff = goals.targetGPA - metrics.overallGPA;
      recs.push({
        type: 'motivation',
        priority: 'medium',
        title: 'Hướng tới mục tiêu GPA',
        description: `Mục tiêu của em là ${goals.targetGPA}/10, hiện tại em đang ở ${metrics.overallGPA}/10. Cần cải thiện thêm ${diff.toFixed(1)} điểm.`,
        actionableSteps: [
          `Tập trung vào các môn có điểm dưới ${(goals.targetGPA - 1).toFixed(0)}`,
          'Tham gia đầy đủ các buổi học và nộp bài đúng hạn',
          'Chủ động hỏi giáo viên khi chưa hiểu bài',
        ],
        expectedImpact: `Đạt GPA mục tiêu ${goals.targetGPA}/10`,
      });
    }

    recs.push({
      type: 'resource',
      priority: 'medium',
      title: 'Tận dụng tài nguyên học tập',
      description: 'Khám phá kho tài liệu và bài giảng trên hệ thống để bổ sung kiến thức.',
      actionableSteps: [
        'Truy cập mục Tài liệu để tìm bài giảng, đề cương',
        'Tham gia cộng đồng học tập để trao đổi',
        'Sử dụng AI Companion để giải đáp thắc mắc 24/7',
      ],
      expectedImpact: 'Mở rộng kiến thức, hỗ trợ tốt hơn trong học tập',
    });

    return {
      recommendations: recs,
      summary: {
        totalRecommendations: recs.length,
        highPriority: recs.filter((r) => r.priority === 'high').length,
        byType: recs.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {} as Record<string, number>),
        topRecommendation: recs.find((r) => r.priority === 'high') || recs[0],
      },
    };
  }
}

export function createReasoningEngine(user: AuthUser, grades?: SubjectGrade[]): AIReasoningEngine {
  const profile = buildStudentLearningProfile({ user, grades });
  return new AIReasoningEngine(profile);
}

export function buildStudentContext(
  user: AuthUser,
  grades?: SubjectGrade[],
  schedule?: Array<{ title: string; time: string; room: string }>,
): StudentLearningProfile {
  return buildStudentLearningProfile({ user, grades, schedule });
}
