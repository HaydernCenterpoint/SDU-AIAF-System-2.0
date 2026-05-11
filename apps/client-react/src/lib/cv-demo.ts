import type { AuthUser, StudentProfileDetails } from '@/types';
import type { SchoolSlug } from '@/lib/school-site';

export type CvProject = {
  name: string;
  role: string;
  period: string;
  summary: string;
  impact: string;
  stack: string[];
};

export type CvSkillGroup = {
  title: string;
  items: string[];
};

export type CvActivity = {
  title: string;
  organization: string;
  period: string;
  highlights: string[];
};

export type CvAchievement = {
  label: string;
  detail: string;
};

export type CvEducation = {
  schoolName: string;
  program: string;
  period: string;
  status: string;
  highlights: string[];
};

export type CvProfile = {
  fullName: string;
  headline: string;
  desiredRole: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  education: CvEducation;
  skillGroups: CvSkillGroup[];
  projects: CvProject[];
  activities: CvActivity[];
  achievements: CvAchievement[];
  focusAreas: string[];
  strengths: string[];
  aiStarterQuestions: string[];
  readinessScore: number;
};

type BuildCvProfileInput = {
  school: SchoolSlug;
  user?: AuthUser | null;
  profile?: StudentProfileDetails | null;
};

export function buildDemoCvProfile({ school, user, profile }: BuildCvProfileInput): CvProfile {
  const fullName = user?.fullName || (school === 'ntd' ? 'Nguyễn Minh Châu' : 'Nguyễn Văn An');
  const major = user?.faculty || profile?.academicInfo?.major || (school === 'ntd' ? 'Khối 12' : 'Công nghệ thông tin');
  const schoolName = profile?.academicInfo?.schoolName || user?.schoolName || (school === 'ntd' ? 'THPT Nguyễn Thị Duệ' : 'Đại học Sao Đỏ');
  const program = school === 'ntd'
    ? `${major} | Định hướng Công nghệ thông tin`
    : `${major} | Định hướng Frontend / Product Builder`;
  const period = profile?.academicInfo?.courseRange || (school === 'ntd' ? '2023 - 2026' : '2022 - 2026');
  const email = user?.email || (school === 'ntd' ? 'minhchau@ntd.edu.vn' : 'an.nguyen@saodo.edu.vn');
  const phone = user?.phone || '0912 345 678';
  const location = profile?.personalInfo?.contactAddress || (school === 'ntd' ? 'Chí Linh, Hải Dương' : 'Sao Đỏ, Hải Dương');

  if (school === 'ntd') {
    return {
      fullName,
      headline: 'Học sinh THPT tích cực, có định hướng truyền thông số và công nghệ',
      desiredRole: 'Ứng viên học bổng / CLB / ngành Công nghệ thông tin',
      summary: `${fullName} là học sinh ${major.toLowerCase()} đang xây hồ sơ cá nhân theo hướng hiện đại, rõ thành tích học tập và nổi bật ở tinh thần chủ động tham gia hoạt động trường lớp.`,
      location,
      email,
      phone,
      education: {
        schoolName,
        program,
        period,
        status: profile?.academicInfo?.status || 'Đang học',
        highlights: [
          'Điểm trung bình ổn định ở nhóm môn Toán, Tin, Tiếng Anh.',
          'Tham gia đội truyền thông học sinh và hỗ trợ các sự kiện trường.',
          'Có mục tiêu ứng tuyển ngành CNTT và môi trường học tập định hướng dự án.',
        ],
      },
      skillGroups: [
        { title: 'Kỹ năng học tập', items: ['Thuyết trình', 'Tự học theo kế hoạch', 'Ghi chú hệ thống', 'Làm việc nhóm'] },
        { title: 'Công cụ', items: ['Canva', 'Google Slides', 'Word', 'Excel', 'CapCut'] },
        { title: 'Nền tảng số', items: ['Tin học văn phòng', 'Tìm kiếm tài liệu', 'Quản lý deadline', 'Trình bày hồ sơ'] },
      ],
      projects: [
        {
          name: 'Portfolio hoạt động học sinh',
          role: 'Người tổng hợp nội dung',
          period: '2025 - nay',
          summary: 'Dựng bộ hồ sơ cá nhân để tổng hợp thành tích học tập, hoạt động ngoại khóa và định hướng nghề nghiệp.',
          impact: 'Giúp hồ sơ rõ ràng hơn khi ứng tuyển học bổng, CLB và các chương trình trải nghiệm.',
          stack: ['Canva', 'Google Docs', 'Slides'],
        },
        {
          name: 'Bản tin lớp 12A1',
          role: 'Phụ trách nội dung',
          period: 'Học kỳ II',
          summary: 'Phối hợp lên ý tưởng, viết nội dung và thiết kế bản tin lớp theo chủ đề thi cử và hoạt động trường.',
          impact: 'Tăng tương tác của học sinh trong lớp và giúp ban cán sự truyền đạt thông báo nhanh hơn.',
          stack: ['Canva', 'Google Drive', 'Messenger'],
        },
      ],
      activities: [
        {
          title: 'Đội truyền thông học sinh',
          organization: schoolName,
          period: '2025 - nay',
          highlights: ['Hỗ trợ chụp ảnh sự kiện trường', 'Viết caption cho fanpage lớp', 'Phối hợp thiết kế poster truyền thông'],
        },
        {
          title: 'Nhóm học tập Toán - Tin',
          organization: 'Lớp 12A1',
          period: '2024 - nay',
          highlights: ['Tổng hợp tài liệu ôn tập', 'Chia sẻ đề cương và nhắc deadline', 'Hỗ trợ bạn cùng lớp chuẩn bị bài'],
        },
      ],
      achievements: [
        { label: 'Điểm mạnh nổi bật', detail: 'Chủ động, giao tiếp tốt, biết trình bày hồ sơ rõ ràng.' },
        { label: 'Mục tiêu 6 tháng', detail: 'Hoàn thiện portfolio cá nhân và thêm 1 dự án học tập có sản phẩm số.' },
        { label: 'Điểm cần tăng', detail: 'Bổ sung minh chứng định lượng và sản phẩm cá nhân cụ thể hơn.' },
      ],
      focusAreas: ['Tăng độ rõ của mục tiêu', 'Bổ sung sản phẩm cá nhân', 'Thêm số liệu cho hoạt động'],
      strengths: ['Hình ảnh hồ sơ sạch', 'Có định hướng rõ', 'Thể hiện tinh thần chủ động'],
      aiStarterQuestions: [
        'CV này đã đủ thuyết phục để ứng tuyển học bổng chưa?',
        'Em nên thêm hoạt động nào để hồ sơ nổi bật hơn?',
        'Phần mục tiêu nghề nghiệp của em nên viết lại thế nào?',
      ],
      readinessScore: 74,
    };
  }

  return {
    fullName,
    headline: 'Sinh viên định hướng Frontend, thích xây sản phẩm học tập rõ ràng và hữu ích',
    desiredRole: 'Thực tập sinh Frontend / Product Intern',
    summary: `${fullName} là sinh viên ${major.toLowerCase()} đang xây hồ sơ theo hướng thực chiến: biết biến nhu cầu của sinh viên thành giao diện dễ dùng, có tư duy hệ thống và ưu tiên sản phẩm có thể demo rõ ràng.`,
    location,
    email,
    phone,
    education: {
      schoolName,
      program,
      period,
      status: profile?.academicInfo?.status || 'Đang học',
      highlights: [
        'Tập trung vào hướng giao diện, hệ thống học tập và công cụ hỗ trợ sinh viên.',
        'Có lợi thế khi kết hợp kỹ năng trình bày, tư duy sản phẩm và khả năng tự triển khai demo.',
        'Đang tích lũy kinh nghiệm qua dự án nhóm và hoạt động cộng đồng trong trường.',
      ],
    },
    skillGroups: [
      { title: 'Kỹ năng cốt lõi', items: ['React', 'TypeScript', 'HTML/CSS', 'Figma', 'REST API'] },
      { title: 'Kỹ năng làm việc', items: ['Phân tích yêu cầu', 'Thiết kế giao diện', 'Trình bày demo', 'Làm việc nhóm'] },
      { title: 'Học tập & vận hành', items: ['Viết tài liệu', 'Tự học nhanh', 'Quản lý tiến độ', 'Đọc feedback'] },
    ],
    projects: [
      {
        name: 'Student Assistant Dashboard',
        role: 'Frontend implementer',
        period: '2026',
        summary: 'Thiết kế và hiện thực dashboard hỗ trợ lịch học, tài liệu, nhắc nhở và chat AI cho sinh viên.',
        impact: 'Biến nhiều tác vụ học tập rời rạc thành một trải nghiệm tập trung, dễ dùng trên web.',
        stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      },
      {
        name: 'CV Visual Builder Demo',
        role: 'Product + UI builder',
        period: '2026',
        summary: 'Dựng giao diện CV trực quan từ hồ sơ người học để giúp sinh viên nhìn thấy chất lượng CV của mình ngay trong portal.',
        impact: 'Giảm rào cản bắt đầu viết CV và tạo nền cho AI góp ý có ngữ cảnh.',
        stack: ['React', 'Design system', 'Career AI flow'],
      },
    ],
    activities: [
      {
        title: 'Câu lạc bộ công nghệ',
        organization: schoolName,
        period: '2025 - nay',
        highlights: ['Chia sẻ tài liệu tự học', 'Hỗ trợ demo sản phẩm nhóm', 'Tham gia review giao diện cho bạn cùng lớp'],
      },
      {
        title: 'Nhóm dự án môn học',
        organization: 'Khoa / lớp chuyên ngành',
        period: '2024 - nay',
        highlights: ['Phụ trách UI cho bài tập lớn', 'Viết mô tả chức năng và luồng người dùng', 'Tổng hợp feedback để chỉnh bản demo'],
      },
    ],
    achievements: [
      { label: 'Điểm mạnh nổi bật', detail: 'Biết biến yêu cầu mơ hồ thành bản demo trực quan và dễ trình bày.' },
      { label: 'Mục tiêu 3 tháng', detail: 'Bổ sung 1 case study hoàn chỉnh với số liệu người dùng hoặc kết quả trước/sau.' },
      { label: 'Điểm cần tăng', detail: 'Cần thêm số liệu định lượng và minh chứng rõ hơn cho từng dự án.' },
    ],
    focusAreas: ['Đo lường tác động dự án', 'Viết bullet theo kết quả', 'Bổ sung portfolio / link demo'],
    strengths: ['Hướng sản phẩm rõ', 'Giao diện trình bày tốt', 'Có chất liệu dự án phù hợp thực tập'],
    aiStarterQuestions: [
      'CV này còn thiếu gì để ứng tuyển thực tập Frontend?',
      'Phần dự án của em nên viết lại ngắn gọn nhưng mạnh hơn thế nào?',
      'Em nên ưu tiên học gì trong 3 tháng tới để CV tốt lên rõ nhất?',
    ],
    readinessScore: 81,
  };
}

export function buildCvAiContext(cvProfile: CvProfile) {
  return {
    desiredRole: cvProfile.desiredRole,
    summary: cvProfile.summary,
    strengths: cvProfile.strengths,
    focusAreas: cvProfile.focusAreas,
    skills: cvProfile.skillGroups.flatMap((group) => group.items).slice(0, 16),
    projects: cvProfile.projects.map((project) => ({
      name: project.name,
      role: project.role,
      impact: project.impact,
      stack: project.stack,
    })),
    activities: cvProfile.activities.map((activity) => ({
      title: activity.title,
      organization: activity.organization,
      highlights: activity.highlights,
    })),
    achievements: cvProfile.achievements,
  };
}
