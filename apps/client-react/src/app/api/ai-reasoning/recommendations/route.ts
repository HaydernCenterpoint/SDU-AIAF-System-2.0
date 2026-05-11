import { NextRequest, NextResponse } from 'next/server';
import type { StudentLearningProfile, AIRecommendation } from '@/lib/student-profile-types';

function generateRecommendations(profile: StudentLearningProfile): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  const { metrics, goals } = profile;

  if (metrics.weakestSubjects.length > 0) {
    recs.push({
      type: 'improvement',
      priority: 'high',
      title: 'Cải thiện môn học yếu',
      description: `Cần tập trung vào: ${metrics.weakestSubjects.join(', ')}. Đây là những môn ảnh hưởng trực tiếp đến GPA.`,
      subject: metrics.weakestSubjects[0],
      actionableSteps: [
        'Xem lại bài giảng từ đầu kỳ, tìm ra lỗ hổng kiến thức',
        'Tìm tài liệu bổ sung hoặc nhờ giáo viên hỗ trợ',
        'Luyện tập bài tập từ dễ đến khó',
        'Đặt lịch ôn tập cố định cho mỗi môn',
      ],
      expectedImpact: `Nâng GPA thêm ${metrics.overallGPA > 0 ? '0.2-0.5 điểm' : 'đáng kể'}`,
    });
  }

  recs.push({
    type: 'study_plan',
    priority: 'high',
    title: 'Lập kế hoạch học tập cá nhân',
    description: `Khung giờ hiệu quả nhất: ${profile.patterns.mostProductiveHours.join(', ')}. Học theo block ${profile.patterns.preferredStudyDuration} phút, nghỉ ${profile.patterns.breaksBetweenSessions} phút.`,
    actionableSteps: [
      'Xác định thời điểm học hiệu quả nhất trong ngày',
      'Phân bổ thời gian: ưu tiên môn khó khi tỉnh táo',
      'Học nhóm 1-2 lần/tuần để trao đổi',
      'Duy trì đều đặn, không học cửa quyết',
    ],
    expectedImpact: 'Tăng 20-30% hiệu quả ghi nhớ và tập trung',
  });

  if (metrics.overallGPA > 0) {
    const gap = goals.targetGPA - metrics.overallGPA;
    if (gap > 0) {
      recs.push({
        type: 'motivation',
        priority: 'medium',
        title: `Hướng tới GPA ${goals.targetGPA}/10`,
        description: `Khoảng cách hiện tại: ${gap.toFixed(1)} điểm. Cần cải thiện đều ở các môn.`,
        actionableSteps: [
          'Nộp đầy đủ bài tập, điểm danh đầy đủ',
          'Thi giữa kỳ và cuối kỳ cố gắng đạt cao hơn bình thường',
          'Chủ động hỏi giáo viên khi chưa hiểu bài',
          'Tránh các lỗi mất điểm không đáng có',
        ],
        expectedImpact: `Đạt mục tiêu GPA ${goals.targetGPA}/10 cuối học kỳ`,
      });
    }
  }

  recs.push({
    type: 'resource',
    priority: 'medium',
    title: 'Tận dụng tài nguyên học tập',
    description: 'Kho tài liệu và AI Companion luôn sẵn sàng hỗ trợ em 24/7.',
    actionableSteps: [
      'Truy cập mục Tài liệu để tìm bài giảng, đề cương',
      'Sử dụng AI Companion để giải đáp thắc mắc',
      'Tham gia cộng đồng học tập',
    ],
    expectedImpact: 'Hỗ trợ tốt hơn trong quá trình học',
  });

  return recs;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfile } = body as { studentProfile: StudentLearningProfile };

    if (!studentProfile) {
      return NextResponse.json({ success: false, error: 'Missing studentProfile' }, { status: 400 });
    }

    const recommendations = generateRecommendations(studentProfile);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('[Recommendations] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
