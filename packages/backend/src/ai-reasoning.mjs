// AI Reasoning Routes - Student Learning Profile & Personalized AI
import { getAssistantRuntimeStatus } from './nemoclaw-client.mjs';

const KROUTER_API_KEY = process.env.KROUTER_API_KEY;
const KROUTER_API_URL_RAW = process.env.KROUTER_API_URL || 'https://api.krouter.net/v1';
const KROUTER_API_URL = KROUTER_API_URL_RAW.endsWith('/chat/completions')
  ? KROUTER_API_URL_RAW
  : `${KROUTER_API_URL_RAW.replace(/\/+$/, '')}/chat/completions`;
const KROUTER_MODEL = process.env.KROUTER_MODEL || 'cx/gpt-5.4';
const NEMOCLAW_TIMEOUT_MS = Number(process.env.NEMOCLAW_TIMEOUT_MS || 30000);

export function createAiReasoningRoutes() {
  return {
    'POST /api/ai-reasoning/chat': handleChat,
    'POST /api/ai-reasoning/personalized': handlePersonalized,
    'POST /api/ai-reasoning/recommendations': handleRecommendations,
    'POST /api/ai-reasoning/nemoclaw': handleNemoClaw,
    'GET /api/ai-reasoning/status': handleStatus,
  };
}

async function handleChat(req, res) {
  try {
    const body = await readJson(req);
    const { messages, profile } = body;

    if (!messages || !Array.isArray(messages)) {
      return sendJson(res, 400, { error: 'messages is required and must be an array' });
    }

    // Build system prompt from student profile
    const systemPrompt = buildStudentSystemPrompt(profile);

    // Call KRouter API
    const response = await callKRouterChat({
      systemPrompt,
      messages,
      model: KROUTER_MODEL,
    });

    if (response.error) {
      return sendJson(res, 502, { error: response.error });
    }

    return sendJson(res, 200, {
      content: response.content,
      model: KROUTER_MODEL,
      usage: response.usage,
    });
  } catch (error) {
    console.error('[ai-reasoning] Chat error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

async function handlePersonalized(req, res) {
  try {
    const body = await readJson(req);
    const { conversationId, question, studentProfile, conversationHistory } = body;

    if (!question) {
      return sendJson(res, 400, { error: 'question is required' });
    }

    // Build system prompt from student profile
    const systemPrompt = buildStudentSystemPrompt(studentProfile);

    // Build conversation messages
    const messages = [];

    // Add conversation history (last 10 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      }
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question,
    });

    // Call KRouter API
    const response = await callKRouterChat({
      systemPrompt,
      messages,
      model: KROUTER_MODEL,
    });

    if (response.error) {
      return sendJson(res, 502, { error: response.error });
    }

    // Infer sources based on question content
    const sources = inferSources(question);

    return sendJson(res, 200, {
      content: response.content,
      sources,
      model: KROUTER_MODEL,
      provider: 'krouter',
      conversationId,
    });
  } catch (error) {
    console.error('[ai-reasoning] Personalized error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

async function handleRecommendations(req, res) {
  try {
    const body = await readJson(req);
    const profile = body.profile || body.studentProfile;

    if (!profile) {
      return sendJson(res, 400, { error: 'profile is required' });
    }

    const systemPrompt = buildRecommendationSystemPrompt(profile);
    const userMessage = {
      role: 'user',
      content: 'Hãy phân tích hồ sơ học tập trên và đưa ra các khuyến nghị cụ thể, khả thi.',
    };

    const response = await callKRouterChat({
      systemPrompt,
      messages: [userMessage],
      model: KROUTER_MODEL,
    });

    if (response.error) {
      // KRouter unavailable — return smart fallback recommendations
      console.warn('[ai-reasoning] KRouter unavailable, using fallback recommendations:', response.error);
      const fallback = buildFallbackRecommendations(profile);
      return sendJson(res, 200, fallback);
    }

    // Try to parse JSON recommendations from response
    let recommendations = [];
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch {
      // If JSON parsing fails, return raw content
    }

    return sendJson(res, 200, {
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter((r) => r.priority === 'high').length,
        generatedAt: new Date().toISOString(),
      },
      rawContent: response.content,
    });
  } catch (error) {
    console.error('[ai-reasoning] Recommendations error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

function buildFallbackRecommendations(profile) {
  const student = profile?.student || {};
  const metrics = profile?.metrics || {};
  const goals = profile?.goals || {};
  const recs = [];

  if (metrics.weakestSubjects?.length > 0) {
    recs.push({
      type: 'improvement',
      priority: 'high',
      title: `Cải thiện môn ${metrics.weakestSubjects[0]}`,
      description: `Em cần tập trung cải thiện các môn: ${metrics.weakestSubjects.join(', ')}. Đây là những môn ảnh hưởng nhiều đến GPA chung.`,
      subject: metrics.weakestSubjects[0],
      actionableSteps: [
        'Xem lại bài giảng và ghi chép của các môn yếu',
        'Tìm tài liệu bổ sung hoặc nhờ bạn giỏi hỗ trợ',
        'Luyện thêm bài tập từ cơ bản đến nâng cao',
      ],
      expectedImpact: 'Nâng điểm lên 1-2 bậc trong kỳ thi tới',
    });
  }

  recs.push({
    type: 'study_plan',
    priority: 'medium',
    title: 'Xây dựng thời gian biểu học tập',
    description: 'Lên kế hoạch học tập cụ thể theo tuần, ưu tiên các môn sắp thi và các môn cần cải thiện.',
    actionableSteps: [
      'Chia thời gian học thành các block 45 phút + 10 phút nghỉ',
      'Ưu tiên học môn khó khi tinh thần còn tỉnh táo',
      'Học nhóm 1-2 lần/tuần để trao đổi kiến thức',
    ],
    expectedImpact: 'Tăng 20-30% hiệu quả ghi nhớ',
  });

  if (goals.targetGPA > 0 && metrics.overallGPA > 0 && goals.targetGPA > metrics.overallGPA) {
    recs.push({
      type: 'motivation',
      priority: 'medium',
      title: `Hướng tới GPA ${goals.targetGPA}/10`,
      description: `Hiện tại em đang ở ${metrics.overallGPA}/10, cần cải thiện thêm ${(goals.targetGPA - metrics.overallGPA).toFixed(1)} điểm.`,
      actionableSteps: [
        'Tham gia đầy đủ các buổi học và nộp bài đúng hạn',
        'Chủ động hỏi giảng viên khi chưa hiểu bài',
        'Ôn tập đều đặn, không dồn bài trước thi',
      ],
      expectedImpact: `Đạt GPA mục tiêu ${goals.targetGPA}/10`,
    });
  }

  recs.push({
    type: 'resource',
    priority: 'low',
    title: 'Tận dụng tài nguyên học tập',
    description: 'Khám phá kho tài liệu và sử dụng AI Companion để hỗ trợ học tập hàng ngày.',
    actionableSteps: [
      'Truy cập mục Tài liệu để tìm bài giảng, đề cương',
      'Sử dụng AI Companion để giải đáp thắc mắc 24/7',
      'Đặt nhắc nhở deadline để không bỏ lỡ bài tập',
    ],
    expectedImpact: 'Mở rộng kiến thức, hỗ trợ tốt hơn trong học tập',
  });

  return {
    recommendations: recs,
    summary: {
      totalRecommendations: recs.length,
      highPriority: recs.filter((r) => r.priority === 'high').length,
      generatedAt: new Date().toISOString(),
    },
    fallback: true,
  };
}

async function handleNemoClaw(req, res) {
  try {
    const body = await readJson(req);
    const { conversation } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return sendJson(res, 400, { error: 'conversation is required and must be an array' });
    }

    // Call via NemoClaw sandbox if configured
    const runtimeStatus = getAssistantRuntimeStatus();

    if (!runtimeStatus.configured) {
      return sendJson(res, 503, {
        error: 'AI runtime not configured',
        message: 'Vui lòng cấu hình KRouter hoặc NemoClaw để sử dụng tính năng này.',
      });
    }

    // Build prompt from conversation
    const systemPrompt = conversation.find((m) => m.role === 'system')?.content || '';
    const userMessages = conversation.filter((m) => m.role !== 'system');

    const response = await callKRouterChat({
      systemPrompt,
      messages: userMessages,
      model: KROUTER_MODEL,
    });

    if (response.error) {
      return sendJson(res, 502, { error: response.error });
    }

    return sendJson(res, 200, {
      content: response.content,
      model: KROUTER_MODEL,
    });
  } catch (error) {
    console.error('[ai-reasoning] NemoClaw error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

function handleStatus(req, res) {
  const status = getAssistantRuntimeStatus();
  return sendJson(res, 200, {
    ...status,
    endpoints: {
      chat: '/api/ai-reasoning/chat',
      recommendations: '/api/ai-reasoning/recommendations',
      nemoclaw: '/api/ai-reasoning/nemoclaw',
    },
  });
}

async function callKRouterChat({ systemPrompt, messages, model }) {
  if (!KROUTER_API_KEY) {
    return { error: 'KRouter API key not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NEMOCLAW_TIMEOUT_MS);

  try {
    const response = await fetch(KROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { error: 'Request timeout' };
    }
    return { error: error.message || 'Unknown error' };
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildStudentSystemPrompt(profile) {
  if (!profile) {
    return 'Bạn là trợ lý học tập AI cho sinh viên Trường Đại học Sao Đỏ. Trả lời bằng tiếng Việt.';
  }

  const isHighSchool = profile.student?.schoolId === 'nguyen-thi-due';
  const studentLabel = isHighSchool ? 'học sinh' : 'sinh viên';
  const schoolName = isHighSchool ? 'THPT Nguyễn Thị Duệ' : 'Trường Đại học Sao Đỏ';

  const sections = [
    `Bạn là trợ lý học tập AI cá nhân cho ${studentLabel} ${schoolName}.`,
    '',
    '## Thông tin học sinh/sinh viên',
  ];

  // Student info
  if (profile.student) {
    const { student } = profile;
    sections.push(`- Họ tên: ${student.fullName || 'Chưa cập nhật'}`);
    sections.push(`- Mã SV/HS: ${student.studentId || 'Chưa có'}`);
    sections.push(`- Ngành/Lớp: ${student.faculty || 'Chưa cập nhật'}`);
    sections.push(`- Trường: ${schoolName}`);
  }

  // Learning metrics
  if (profile.metrics) {
    const { metrics } = profile;
    sections.push('');
    sections.push('## Chỉ số học tập');
    sections.push(`- GPA tích lũy: ${metrics.overallGPA > 0 ? metrics.overallGPA + '/10' : 'Chưa có dữ liệu'}`);
    sections.push(`- Xu hướng: ${
      metrics.improvementTrend === 'improving' ? 'Đang cải thiện' :
      metrics.improvementTrend === 'declining' ? 'Có xu hướng giảm' : 'Ổn định'
    }`);

    if (metrics.strongestSubjects?.length > 0) {
      sections.push(`- Môn thế mạnh: ${metrics.strongestSubjects.slice(0, 3).join(', ')}`);
    }
    if (metrics.weakestSubjects?.length > 0) {
      sections.push(`- Môn cần cải thiện: ${metrics.weakestSubjects.slice(0, 3).join(', ')}`);
    }
  }

  // Recent performance
  if (profile.recentPerformance) {
    const { recentPerformance } = profile;
    sections.push('');
    sections.push('## Hiệu suất gần đây');
    sections.push(`- Điểm TB gần đây: ${recentPerformance.averageScore > 0 ? recentPerformance.averageScore + '/10' : 'Chưa có'}`);
    sections.push(`- Xếp loại: ${recentPerformance.comparedToClass || 'Chưa xác định'}`);
  }

  // Goals
  if (profile.goals) {
    const { goals } = profile;
    sections.push('');
    sections.push('## Mục tiêu');
    sections.push(`- GPA mục tiêu: ${goals.targetGPA > 0 ? goals.targetGPA + '/10' : 'Chưa đặt'}`);
    sections.push(`- Mục tiêu xếp hạng: ${goals.targetRank || 'Chưa đặt'}`);
  }

  // Patterns
  if (profile.patterns) {
    const { patterns } = profile;
    sections.push('');
    sections.push('## Phong cách học tập');
    sections.push(`- Giờ hiệu quả: ${patterns.mostProductiveHours?.join(', ') || '19:00, 20:00'}`);
    sections.push(`- Thời lượng học: ${patterns.preferredStudyDuration || 45} phút`);
    sections.push(`- Phong cách: ${
      patterns.learningStyle === 'visual' ? 'Hình ảnh' :
      patterns.learningStyle === 'auditory' ? 'Âm thanh' :
      patterns.learningStyle === 'reading' ? 'Đọc hiểu' :
      patterns.learningStyle === 'kinesthetic' ? 'Thực hành' : 'Kết hợp'
    }`);
  }

  sections.push('');
  sections.push('## Hướng dẫn trả lời');
  sections.push('1. LUÔN tham khảo thông tin học tập ở trên khi trả lời.');
  sections.push('2. Khi đề xuất học tập, hãy cân nhắc điểm mạnh/yếu của từng môn.');
  sections.push('3. Nếu hỏi về môn học cụ thể, nêu rõ điểm số hiện tại và gợi ý cải thiện.');
  sections.push('4. Trả lời bằng tiếng Việt, thân thiện, phù hợp.');
  sections.push('5. KHÔNG được bịa đặt điểm số. Nếu không có dữ liệu, nói rõ "hiện tại hệ thống chưa có dữ liệu".');
  sections.push('6. Gọi người dùng bằng "em" hoặc tên riêng nếu có.');

  return sections.join('\n');
}

function buildRecommendationSystemPrompt(profile) {
  const systemPrompt = buildStudentSystemPrompt(profile);

  return `${systemPrompt}

## Nhiệm vụ: Tạo khuyến nghị học tập cá nhân hóa

Hãy phân tích toàn diện hồ sơ học tập trên và đưa ra các khuyến nghị cụ thể, khả thi cho từng học sinh/sinh viên.

Trả lời theo định dạng JSON:
{
  "recommendations": [
    {
      "type": "study_plan|resource|improvement|motivation|schedule",
      "priority": "high|medium|low",
      "title": "Tiêu đề ngắn gọn",
      "description": "Mô tả chi tiết",
      "subject": "Tên môn học (nếu có)",
      "actionableSteps": ["Bước 1", "Bước 2", "Bước 3"],
      "expectedImpact": "Tác động mong đợi"
    }
  ]
}

Quy tắc:
- Mỗi khuyến nghị phải có ít nhất 3 actionableSteps cụ thể
- Ưu tiên các môn yếu và mục tiêu của học sinh/sinh viên
- Đưa ra lộ trình thực tế, có thể hoàn thành trong 1-2 tuần
- Nếu không có điểm số, hãy đưa ra khuyến nghị chung phù hợp với mục tiêu của người dùng`;
}

// Helper functions
function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function inferSources(question) {
  const sources = [];
  const lowerQ = question.toLowerCase();

  if (lowerQ.includes('lịch') || lowerQ.includes('thời khóa') || lowerQ.includes('học')) {
    sources.push('Thời khóa biểu');
  }
  if (lowerQ.includes('tài liệu') || lowerQ.includes('document') || lowerQ.includes('slide')) {
    sources.push('Tài liệu học tập');
  }
  if (lowerQ.includes('điểm') || lowerQ.includes('grade') || lowerQ.includes('thi')) {
    sources.push('Kết quả học tập');
  }
  if (lowerQ.includes('lịch thi') || lowerQ.includes('exam')) {
    sources.push('Lịch thi');
  }
  if (lowerQ.includes('nhắc') || lowerQ.includes('reminder') || lowerQ.includes('deadline')) {
    sources.push('Nhắc nhở');
  }

  return sources;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
