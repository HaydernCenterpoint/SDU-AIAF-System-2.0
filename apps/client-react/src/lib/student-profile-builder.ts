import type { AuthUser } from '@/types';
import type {
  LearningMetrics,
  LearningPattern,
  LearningGoals,
  RecentPerformanceSnapshot,
  StudentLearningProfile,
  SubjectGrade,
  StudentProfileBuildInput,
} from './student-profile-types';

function buildMetrics(grades: SubjectGrade[], user: AuthUser): LearningMetrics {
  if (!grades || grades.length === 0) {
    return {
      overallGPA: 0,
      semesterGPAs: {},
      subjectPerformance: {},
      strongestSubjects: [],
      weakestSubjects: [],
      improvementTrend: 'stable',
      attendanceRate: 0,
    };
  }

  const subjectMap: Record<string, SubjectGrade[]> = {};
  for (const g of grades) {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
    subjectMap[g.subject].push(g);
  }

  const subjectAverages: Array<{ subject: string; avg: number; credits: number }> = [];
  for (const [subject, grades_of_subject] of Object.entries(subjectMap)) {
    const totalScore = grades_of_subject.reduce((sum, g) => sum + g.score, 0);
    const totalCredits = grades_of_subject.reduce((sum, g) => sum + g.credits, 0);
    subjectAverages.push({
      subject,
      avg: totalScore / grades_of_subject.length,
      credits: totalCredits,
    });
  }

  subjectAverages.sort((a, b) => b.avg - a.avg);
  const strongest = subjectAverages.filter((s) => s.avg >= 8.0).map((s) => s.subject);
  const weakest = subjectAverages.filter((s) => s.avg < 6.5).map((s) => s.subject);

  const semesters = [...new Set(grades.map((g) => g.semester))].sort();
  const semesterGPAs: Record<string, number> = {};
  for (const sem of semesters) {
    const semGrades = grades.filter((g) => g.semester === sem);
    if (semGrades.length > 0) {
      const total = semGrades.reduce((sum, g) => sum + g.score * g.credits, 0);
      const credits = semGrades.reduce((sum, g) => sum + g.credits, 0);
      semesterGPAs[sem] = credits > 0 ? Math.round((total / credits) * 100) / 100 : 0;
    }
  }

  const semesterValues = Object.values(semesterGPAs);
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (semesterValues.length >= 2) {
    const first = semesterValues[0];
    const last = semesterValues[semesterValues.length - 1];
    if (last - first > 0.3) trend = 'improving';
    else if (first - last > 0.3) trend = 'declining';
  }

  const overallGPA = semesterValues.length > 0
    ? Math.round((semesterValues.reduce((a, b) => a + b, 0) / semesterValues.length) * 100) / 100
    : 0;

  const subjectPerformance: Record<string, SubjectGrade> = {};
  for (const s of subjectAverages) {
    subjectPerformance[s.subject] = {
      subject: s.subject,
      score: Math.round(s.avg * 100) / 100,
      credits: s.credits,
      semester: semesters[semesters.length - 1] || '',
    };
  }

  return {
    overallGPA,
    semesterGPAs,
    subjectPerformance,
    strongestSubjects: strongest.length > 0 ? strongest : subjectAverages.slice(0, 2).map((s) => s.subject),
    weakestSubjects: weakest.length > 0 ? weakest : [],
    improvementTrend: trend,
    attendanceRate: 0,
  };
}

function buildPatterns(user: AuthUser): LearningPattern {
  const isNtd = user.schoolId === 'nguyen-thi-due' || user.schoolId === 'ntd';
  return {
    mostProductiveHours: ['19:00', '20:00', '21:00'],
    preferredStudyDuration: 45,
    studyFrequency: 'weekly',
    learningStyle: 'mixed',
    breaksBetweenSessions: 10,
  };
}

function buildGoals(user: AuthUser): LearningGoals {
  const isNtd = user.schoolId === 'nguyen-thi-due' || user.schoolId === 'ntd';
  if (isNtd) {
    return {
      shortTerm: ['Cải thiện điểm thi giữa kỳ', 'Hoàn thành bài tập đúng hạn'],
      longTerm: ['Đỗ đại học top đầu', 'Đạt học sinh giỏi cấp trường'],
      targetGPA: 9.0,
      targetRank: 'Top 10',
      scholarships: [],
    };
  }
  return {
    shortTerm: ['Nâng cao GPA học kỳ này', 'Hoàn thành đồ án cuối kỳ'],
    longTerm: ['Tốt nghiệp loại Giỏi', 'Xin được học bổng'],
    targetGPA: 3.5,
    targetRank: 'Top 20%',
    scholarships: [],
  };
}

function buildRecentPerformance(
  grades: SubjectGrade[],
  user: AuthUser,
): RecentPerformanceSnapshot {
  if (!grades || grades.length === 0) {
    return {
      lastUpdated: new Date().toISOString(),
      recentGrades: [],
      averageScore: 0,
      comparedToClass: 'Chưa có dữ liệu',
      strengthsThisSemester: [],
      areasToImprove: [],
    };
  }

  const sorted = [...grades].sort(
    (a, b) => new Date(b.semester).getTime() - new Date(a.semester).getTime(),
  );
  const recent = sorted.slice(0, 5);
  const averageScore =
    recent.length > 0
      ? Math.round((recent.reduce((s, g) => s + g.score, 0) / recent.length) * 10) / 10
      : 0;

  const strengths = recent
    .filter((g) => g.score >= 8.0)
    .map((g) => g.subject);
  const improvements = recent
    .filter((g) => g.score < 7.0)
    .map((g) => g.subject);

  let compared = 'Trung bình';
  if (averageScore >= 9.0) compared = 'Xuất sắc';
  else if (averageScore >= 8.0) compared = 'Giỏi';
  else if (averageScore >= 7.0) compared = 'Khá';
  else if (averageScore >= 6.0) compared = 'Trung bình khá';

  return {
    lastUpdated: new Date().toISOString(),
    recentGrades: recent,
    averageScore,
    comparedToClass: compared,
    strengthsThisSemester: [...new Set(strengths)],
    areasToImprove: [...new Set(improvements)],
  };
}

function buildContextSummary(profile: StudentLearningProfile): string {
  const { student, metrics, patterns, goals, recentPerformance } = profile;
  const isNtd = student.schoolId === 'nguyen-thi-due' || student.schoolId === 'ntd';
  const studentLabel = isNtd ? 'học sinh' : 'sinh viên';
  const schoolLabel = isNtd ? 'THPT Nguyễn Thị Duệ' : 'Trường Đại học Sao Đỏ';
  const classLabel = isNtd ? 'lớp' : 'ngành';

  const strong = metrics.strongestSubjects.slice(0, 3).join(', ') || 'chưa xác định';
  const weak = metrics.weakestSubjects.slice(0, 3).join(', ') || 'không có';

  const summary = [
    `${student.fullName} là ${studentLabel} ${classLabel} ${student.faculty || 'chưa cập nhật'} tại ${schoolLabel}.`,
    `Mã ${isNtd ? 'HS' : 'SV'}: ${student.studentId || 'chưa có'}.`,
    metrics.overallGPA > 0
      ? `Điểm trung bình tích lũy: ${metrics.overallGPA}/10. Xu hướng học tập: ${metrics.improvementTrend === 'improving' ? 'đang cải thiện' : metrics.improvementTrend === 'declining' ? 'có xu hướng giảm' : 'ổn định'}.`
      : 'Chưa có dữ liệu điểm số.',
    `Môn học thế mạnh: ${strong}.${weak !== 'không có' ? ` Cần cải thiện: ${weak}.` : ''}`,
    recentPerformance.averageScore > 0
      ? `Điểm trung bình gần đây: ${recentPerformance.averageScore}/10, xếp loại: ${recentPerformance.comparedToClass}.`
      : '',
    goals.shortTerm.length > 0
      ? `Mục tiêu ngắn hạn: ${goals.shortTerm.join('; ')}.`
      : '',
  ].filter(Boolean);

  return summary.join(' ');
}

export function buildStudentLearningProfile(input: StudentProfileBuildInput): StudentLearningProfile {
  const metrics = buildMetrics(input.grades || [], input.user);
  const patterns = buildPatterns(input.user);
  const goals = buildGoals(input.user);
  const recentPerformance = buildRecentPerformance(input.grades || [], input.user);

  const profile: StudentLearningProfile = {
    student: input.user,
    metrics,
    patterns,
    goals,
    recentPerformance,
    contextSummary: '',
  };

  profile.contextSummary = buildContextSummary(profile);
  return profile;
}

export function generateSystemPrompt(profile: StudentLearningProfile): string {
  return `Bạn là trợ lý học tập AI cá nhân cho sinh viên/người học.

## Thông tin học sinh/sinh viên
${profile.contextSummary}

## Chỉ số học tập chi tiết
- GPA tích lũy: ${profile.metrics.overallGPA > 0 ? profile.metrics.overallGPA + '/10' : 'Chưa có dữ liệu'}
- Xu hướng: ${profile.metrics.improvementTrend === 'improving' ? 'Đang cải thiện' : profile.metrics.improvementTrend === 'declining' ? 'Có xu hướng giảm' : 'Ổn định'}
- Điểm trung bình gần đây: ${profile.recentPerformance.averageScore > 0 ? profile.recentPerformance.averageScore + '/10' : 'Chưa có'}
- Xếp loại so với lớp: ${profile.recentPerformance.comparedToClass}

## Môn học & Điểm số
${profile.metrics?.subjectPerformance && Object.keys(profile.metrics.subjectPerformance).length > 0
    ? Object.entries(profile.metrics.subjectPerformance)
        .map(([subj, data]) => `  - ${subj}: ${data?.score ?? 0}/10 (${data?.credits ?? 0} tín chỉ)`)
        .join('\n')
    : '  Chưa có dữ liệu điểm số chi tiết.'}

## Mục tiêu cá nhân
Mục tiêu GPA: ${profile.goals?.targetGPA > 0 ? profile.goals.targetGPA + '/10' : 'chưa đặt'}
Mục tiêu xếp hạng: ${profile.goals?.targetRank || 'chưa đặt'}

## Phong cách học tập
- Thời gian học hiệu quả nhất: ${profile.patterns?.mostProductiveHours?.join(', ') || '19:00, 20:00'}
- Thời lượng học ưa thích: ${profile.patterns?.preferredStudyDuration || 45} phút
- Phong cách: ${profile.patterns.learningStyle === 'visual' ? 'Hình ảnh' : profile.patterns.learningStyle === 'auditory' ? 'Âm thanh' : profile.patterns.learningStyle === 'reading' ? 'Đọc hiểu' : profile.patterns.learningStyle === 'kinesthetic' ? 'Thực hành' : 'Kết hợp'}

## Hướng dẫn trả lời
1. LUÔN tham khảo thông tin học tập ở trên khi trả lời.
2. Khi đề xuất học tập, hãy cân nhắc điểm mạnh/yếu của từng môn.
3. Nếu hỏi về môn học cụ thể, nêu rõ điểm số hiện tại và gợi ý cải thiện.
4. Khi gợi ý lịch học, ưu tiên khung giờ hiệu quả nhất của em.
5. Trả lời bằng tiếng Việt, thân thiện, phù hợp với học sinh THPT hoặc sinh viên ĐH.
6. Nếu câu hỏi không liên quan đến học tập, vẫn trả lời bình thường nhưng nhắc nhở khéo léo về việc em có thể hỏi về học tập.
7. KHÔNG được bịa đặt điểm số. Nếu không có dữ liệu, nói rõ "hiện tại hệ thống chưa có dữ liệu điểm số của em".

## Giọng điệu
Thân thiện như một người bạn đồng hành, gọi em bằng "em" hoặc dùng tên riêng nếu có.`;
}
