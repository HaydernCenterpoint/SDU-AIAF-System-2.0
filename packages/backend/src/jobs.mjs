import { randomUUID } from 'node:crypto';

const allowedCrawlerSourceTypes = new Set(['public', 'official', 'community']);
const blockedCrawlerSourceTypes = new Set(['private', 'protected', 'login', 'password', 'closed']);

export function createDefaultJobs() {
  const now = new Date();
  return [
    {
      id: 'job-student-1',
      title: 'Gia sư Tin học cơ bản cho học sinh THCS',
      employer: 'Sinh viên CNTT K15',
      description: 'Cần tìm gia sư dạy Tin học cơ bản (Word, Excel, PowerPoint) cho 2 học sinh lớp 8 tại nhà. Yêu cầu kiên nhẫn, có phương pháp sư phạm tốt. Ưu tiên sinh viên ngành CNTT hoặc Sư phạm.',
      pay: '80.000đ/giờ',
      region: 'Chí Linh, Hải Dương',
      schedule: 'Tối T3, T5 (19:00 - 21:00)',
      sourceType: 'student',
      sourceLabel: 'Sinh viên đăng',
      sourceUrl: 'community://saodo/jobs/job-student-1',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['part-time', 'gia sư', 'gần trường'],
      postedAt: new Date(now - 2 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      contact: {
        name: 'Trần Minh Đức',
        phone: '0387.654.321',
        zalo: '0387654321',
        email: 'duc.tran.k15@saodo.edu.vn',
        address: 'Số 45, Tổ 3, Phường Sao Đỏ, TP Chí Linh, Hải Dương',
        method: 'Nhắn tin Zalo hoặc gọi điện trước 21h',
        note: 'Gặp trực tiếp tại quán cà phê đối diện cổng trường Sao Đỏ để trao đổi chi tiết.',
      },
    },
    {
      id: 'job-employer-1',
      title: 'Nhân viên phục vụ ca tối',
      employer: 'Quán cà phê Sao Đỏ',
      description: 'Tuyển 2 nhân viên phục vụ bàn ca tối. Công việc: pha chế cơ bản, phục vụ đồ uống, dọn dẹp. Được đào tạo từ đầu, không cần kinh nghiệm. Có phụ cấp ăn tối + thưởng cuối tháng.',
      pay: '22.000đ/giờ + phụ cấp',
      region: 'Phường Sao Đỏ, Chí Linh',
      schedule: '18:00 - 22:00 hàng ngày',
      sourceType: 'employer',
      sourceLabel: 'Nhà tuyển dụng',
      sourceUrl: 'official://employer/coffee-saodo',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['ca tối', 'dịch vụ', 'không đặt cọc'],
      postedAt: new Date(now - 1 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 14 * 86400000).toISOString(),
      contact: {
        name: 'Chị Hương (Quản lý)',
        phone: '0912.345.678',
        zalo: '0912345678',
        email: null,
        address: '128 Đường Hoàng Quốc Việt, Phường Sao Đỏ, TP Chí Linh',
        method: 'Đến trực tiếp quán hoặc gọi Zalo từ 9h-17h',
        note: 'Mang theo CMND/CCCD bản gốc khi phỏng vấn. Phỏng vấn nhanh 15 phút, có kết quả ngay.',
      },
    },
    {
      id: 'job-admin-1',
      title: 'CTV hỗ trợ ngày hội tuyển sinh',
      employer: 'Trường Đại học Sao Đỏ',
      description: 'Cần 20 CTV hỗ trợ tổ chức ngày hội tuyển sinh 2026. Nhiệm vụ: hướng dẫn phụ huynh, phát tài liệu, hỗ trợ đăng ký online. Được cấp áo đồng phục, ăn trưa và chứng nhận tham gia hoạt động.',
      pay: 'Theo ca hỗ trợ (150.000đ/ca)',
      region: 'Cơ sở Sao Đỏ',
      schedule: 'Cuối tuần (T7-CN, 7:30 - 17:00)',
      sourceType: 'admin',
      sourceLabel: 'Nhà trường xác nhận',
      sourceUrl: 'official://saodo/career-day',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['sự kiện', 'kỹ năng mềm', 'ưu tiên sinh viên'],
      postedAt: new Date(now - 3 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
      contact: {
        name: 'Phòng Công tác Sinh viên',
        phone: '0220.3886.000 (máy lẻ 105)',
        zalo: '0965.123.456',
        email: 'ctsv@saodo.edu.vn',
        address: 'Phòng 108, Nhà A1, Trường ĐH Sao Đỏ, Chí Linh, Hải Dương',
        method: 'Đăng ký trực tiếp tại phòng CTSV hoặc gửi email kèm họ tên + MSSV',
        note: 'Ưu tiên sinh viên năm 1-2. Hạn đăng ký: trước thứ 5 hàng tuần.',
      },
    },
    {
      id: 'job-crawler-1',
      title: 'CTV bán hàng online khu vực Hải Dương',
      employer: 'Nguồn công khai Chí Linh Jobs',
      description: 'Tuyển CTV bán hàng online (mỹ phẩm, đồ gia dụng). Làm việc tại nhà, chỉ cần smartphone. Thu nhập theo hoa hồng đơn hàng. Được đào tạo marketing online miễn phí.',
      pay: '3 - 5 triệu/tháng',
      region: 'Chí Linh, Hải Dương',
      schedule: 'Linh hoạt',
      sourceType: 'crawler',
      sourceLabel: 'Crawler nguồn công khai',
      sourceUrl: 'https://chilinhjobs.vn/ctv-ban-hang-online',
      riskLevel: 'medium',
      moderationStatus: 'visible_immediately',
      tags: ['cần xác minh', 'online', 'nguồn crawl'],
      postedAt: new Date(now - 5 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 20 * 86400000).toISOString(),
      contact: {
        name: 'Anh Tuấn (Team Leader)',
        phone: '0976.xxx.xxx (ẩn - nguồn crawl)',
        zalo: null,
        email: null,
        address: null,
        method: 'Liên hệ qua link gốc bài đăng',
        note: '⚠️ Nguồn crawl tự động - Vui lòng xác minh trước khi liên hệ. Không chuyển khoản đặt cọc.',
      },
    },
    {
      id: 'job-crawler-2',
      title: 'Nhân viên kho bãi KCN Phả Lại',
      employer: 'Công ty TNHH Logistics Hải Dương',
      description: 'Tuyển nhân viên kho: kiểm đếm hàng, sắp xếp kệ, xuất nhập hàng. Làm ca sáng hoặc ca chiều. Có xe đưa đón từ Chí Linh. BHXH đầy đủ sau thử việc.',
      pay: '5.5 - 7 triệu/tháng',
      region: 'KCN Phả Lại, Chí Linh',
      schedule: 'Ca sáng 6:00-14:00 hoặc Ca chiều 14:00-22:00',
      sourceType: 'crawler',
      sourceLabel: 'Crawler nguồn công khai',
      sourceUrl: 'https://vieclam.haiduong.gov.vn/kho-bai-pha-lai',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['toàn thời gian', 'có xe đưa đón', 'BHXH'],
      postedAt: new Date(now - 1 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 25 * 86400000).toISOString(),
      contact: {
        name: 'Phòng Nhân sự - Logistics HD',
        phone: '0220.3888.999',
        zalo: '0901.234.567',
        email: 'tuyendung@logisticshd.vn',
        address: 'Lô C5-C6, KCN Phả Lại, TP Chí Linh, Hải Dương',
        method: 'Gửi CV qua email hoặc đến trực tiếp phỏng vấn T2-T6 (8:00-16:00)',
        note: 'Mang CCCD + Sơ yếu lý lịch + Ảnh 3x4. Có xe đưa đón miễn phí.',
      },
    },
    {
      id: 'job-crawler-3',
      title: 'Nhân viên bán hàng tại siêu thị Winmart Chí Linh',
      employer: 'Winmart Chí Linh',
      description: 'Tuyển nhân viên bán hàng, thu ngân, trưng bày sản phẩm. Yêu cầu: tốt nghiệp THPT trở lên, ngoại hình ưa nhìn, giao tiếp tốt. Làm theo ca, có thưởng doanh số.',
      pay: '4.5 - 6 triệu/tháng + thưởng',
      region: 'Phường Sao Đỏ, Chí Linh',
      schedule: 'Ca xoay: 7:00-15:00 / 15:00-22:00',
      sourceType: 'crawler',
      sourceLabel: 'Crawler nguồn công khai',
      sourceUrl: 'https://tuyendung.winmart.vn/chi-linh',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['bán lẻ', 'ca xoay', 'thưởng doanh số'],
      postedAt: new Date(now - 4 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 86400000).toISOString(),
      contact: {
        name: 'Bộ phận Tuyển dụng Winmart',
        phone: '1900.6600',
        zalo: null,
        email: 'hr.chilinh@winmart.vn',
        address: 'Tầng 1, TTTM Chí Linh, Đường Hoàng Quốc Việt, P. Sao Đỏ',
        method: 'Nộp hồ sơ trực tiếp tại quầy lễ tân siêu thị hoặc gửi email',
        note: 'Phỏng vấn hàng tuần vào thứ 4 và thứ 6, 9:00-11:00.',
      },
    },
    {
      id: 'job-student-2',
      title: 'Dạy kèm Tiếng Anh giao tiếp 1-1',
      employer: 'Nguyễn Thị Lan - SV Sư phạm K16',
      description: 'Nhận dạy kèm Tiếng Anh giao tiếp cơ bản cho người đi làm hoặc sinh viên muốn luyện speaking. Có chứng chỉ IELTS 6.5, kinh nghiệm 1 năm dạy kèm.',
      pay: '100.000đ/giờ',
      region: 'Phường Sao Đỏ hoặc Online',
      schedule: 'Linh hoạt theo lịch học viên',
      sourceType: 'student',
      sourceLabel: 'Sinh viên đăng',
      sourceUrl: 'community://saodo/jobs/job-student-2',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['gia sư', 'tiếng Anh', 'online'],
      postedAt: new Date(now - 6 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      contact: {
        name: 'Nguyễn Thị Lan',
        phone: '0356.789.012',
        zalo: '0356789012',
        email: 'lan.nguyen.k16@saodo.edu.vn',
        address: 'KTX Sao Đỏ hoặc dạy online qua Google Meet',
        method: 'Nhắn Zalo để đặt lịch học thử miễn phí 1 buổi',
        note: 'Có thể học thử 1 buổi miễn phí. Thanh toán theo tuần hoặc tháng.',
      },
    },
    {
      id: 'job-employer-2',
      title: 'Phụ bếp nhà hàng Hương Việt',
      employer: 'Nhà hàng Hương Việt - Chí Linh',
      description: 'Tuyển phụ bếp: sơ chế nguyên liệu, rửa dụng cụ, hỗ trợ bếp chính. Bao ăn ca, thưởng lễ tết. Phù hợp sinh viên muốn làm thêm buổi trưa/tối.',
      pay: '25.000đ/giờ + ăn ca',
      region: 'Phường Chí Minh, Chí Linh',
      schedule: '10:00 - 14:00 hoặc 17:00 - 21:00',
      sourceType: 'employer',
      sourceLabel: 'Nhà tuyển dụng',
      sourceUrl: 'official://employer/huong-viet',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['bao ăn', 'gần trường', 'linh hoạt ca'],
      postedAt: new Date(now - 2 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 10 * 86400000).toISOString(),
      contact: {
        name: 'Anh Cường (Bếp trưởng)',
        phone: '0978.111.222',
        zalo: '0978111222',
        email: null,
        address: '56 Đường Trần Phú, Phường Chí Minh, TP Chí Linh, Hải Dương',
        method: 'Gọi điện hoặc đến nhà hàng trước 16h để phỏng vấn',
        note: 'Thử việc 3 ngày có trả lương. Bao ăn 2 bữa/ca.',
      },
    },
    {
      id: 'job-crawler-4',
      title: 'Thực tập sinh IT tại công ty phần mềm Hải Dương',
      employer: 'HD Software JSC',
      description: 'Tuyển thực tập sinh lập trình web (React/Node.js hoặc PHP/Laravel). Được mentor hướng dẫn 1-1, có lương thực tập. Cơ hội trở thành nhân viên chính thức sau thực tập.',
      pay: '3 - 4 triệu/tháng (thực tập)',
      region: 'TP Hải Dương',
      schedule: 'T2-T6, 8:00 - 17:00 (linh hoạt cho SV)',
      sourceType: 'crawler',
      sourceLabel: 'Crawler nguồn công khai',
      sourceUrl: 'https://vieclam.haiduong.gov.vn/thuc-tap-it',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['thực tập', 'IT', 'có mentor'],
      postedAt: new Date(now - 3 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      contact: {
        name: 'Phòng HR - HD Software',
        phone: '0220.3555.888',
        zalo: '0909.876.543',
        email: 'hr@hdsoftware.vn',
        address: 'Tầng 5, Tòa nhà Sunrise, 23 Nguyễn Lương Bằng, TP Hải Dương',
        method: 'Gửi CV + portfolio (nếu có) qua email. Subject: [INTERN-2026] Họ tên',
        note: 'Phỏng vấn online qua Google Meet. Kết quả trả trong 3 ngày làm việc.',
      },
    },
    {
      id: 'job-crawler-5',
      title: 'Shipper giao hàng khu vực Chí Linh',
      employer: 'GrabExpress / Giao Hàng Nhanh',
      description: 'Tuyển đối tác giao hàng khu vực Chí Linh - Hải Dương. Yêu cầu: có xe máy, smartphone, CCCD. Thu nhập theo đơn hàng, thưởng chuyên cần hàng tuần.',
      pay: '200k - 500k/ngày (theo đơn)',
      region: 'Chí Linh, Hải Dương',
      schedule: 'Tự chọn ca, tối thiểu 4h/ngày',
      sourceType: 'crawler',
      sourceLabel: 'Crawler nguồn công khai',
      sourceUrl: 'https://tuyendung.ghn.vn/chi-linh',
      riskLevel: 'low',
      moderationStatus: 'visible_immediately',
      tags: ['tự do', 'có xe máy', 'thu nhập theo đơn'],
      postedAt: new Date(now - 7 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 86400000).toISOString(),
      contact: {
        name: 'Trung tâm tuyển dụng GHN Hải Dương',
        phone: '1900.636.688',
        zalo: '0888.456.789',
        email: 'doitac.haiduong@ghn.vn',
        address: '12 Đường Bến Tắm, Phường Bến Tắm, TP Chí Linh',
        method: 'Đăng ký online tại app GHN hoặc đến trực tiếp bưu cục',
        note: 'Cần mang CCCD gốc + Giấy phép lái xe A1/A2 + ĐKTX xe máy. Kích hoạt tài khoản trong 24h.',
      },
    },
  ];
}

export function createDefaultJobSources() {
  return [
    {
      id: 'source-public-local',
      name: 'Nhóm việc làm công khai Chí Linh',
      sourceType: 'public',
      endpoint: 'crawl/public-sources',
      region: 'Chí Linh, Hải Dương',
      policy: 'Chỉ nhận nguồn public, official, community; không vượt đăng nhập hoặc nhóm riêng tư.',
      status: 'active',
      count: 18,
      lastCrawled: new Date().toISOString(),
    },
    {
      id: 'source-official-school',
      name: 'Nguồn chính thức doanh nghiệp Hải Dương',
      sourceType: 'official',
      endpoint: 'crawl/public-sources',
      region: 'Hải Dương',
      policy: 'Ưu tiên API/RSS/website công khai có quyền truy cập hợp pháp.',
      status: 'active',
      count: 7,
      lastCrawled: new Date().toISOString(),
    },
    {
      id: 'source-community-app',
      name: 'Bài đăng cộng đồng trong app',
      sourceType: 'community',
      endpoint: 'jobs',
      region: 'Sao Đỏ',
      policy: 'Hiển thị ngay với nhãn nguồn, mức rủi ro và nút báo cáo.',
      status: 'active',
      count: 12,
      lastCrawled: new Date().toISOString(),
    },
  ];
}

export function ensureJobsData(userData) {
  if (!Array.isArray(userData.jobs)) userData.jobs = createDefaultJobs();
  if (!Array.isArray(userData.jobSources)) userData.jobSources = createDefaultJobSources();
  return { jobs: userData.jobs, sources: userData.jobSources };
}

export function createJobPost(user, body = {}) {
  const title = String(body.title || '').trim();
  if (!title) return null;

  const sourceType = ['student', 'employer', 'admin'].includes(body.sourceType) ? body.sourceType : 'student';
  return {
    id: randomUUID(),
    title,
    employer: String(body.employer || user.fullName || 'Cộng đồng Sao Đỏ').trim(),
    description: String(body.description || '').trim() || null,
    pay: String(body.pay || 'Trao đổi khi liên hệ').trim(),
    region: String(body.region || 'Chí Linh, Hải Dương').trim(),
    schedule: String(body.schedule || 'Linh hoạt').trim(),
    sourceType,
    sourceLabel: sourceType === 'student' ? 'Sinh viên đăng' : sourceType === 'admin' ? 'Admin đăng' : 'Nhà tuyển dụng',
    sourceUrl: `community://saodo/jobs/${randomUUID()}`,
    riskLevel: inferRiskLevel(body),
    moderationStatus: 'visible_immediately',
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 5).map(String) : ['mới đăng'],
    postedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    contact: {
      name: String(body.contactName || user.fullName || 'Người đăng').trim(),
      phone: String(body.contactPhone || '').trim() || null,
      zalo: String(body.contactZalo || '').trim() || null,
      email: String(body.contactEmail || user.email || '').trim() || null,
      address: String(body.contactAddress || '').trim() || null,
      method: String(body.contactMethod || 'Liên hệ qua số điện thoại hoặc Zalo').trim(),
      note: String(body.contactNote || '').trim() || null,
    },
  };
}

export function ingestPublicJobSource(body = {}) {
  const sourceType = String(body.sourceType || '').toLowerCase();
  if (blockedCrawlerSourceTypes.has(sourceType) || !allowedCrawlerSourceTypes.has(sourceType)) {
    return {
      status: 400,
      payload: {
        accepted: false,
        error: 'Nguồn crawler phải là public, official hoặc community và không yêu cầu đăng nhập riêng tư.',
      },
    };
  }

  const region = String(body.region || 'Chí Linh, Hải Dương').trim();
  const sourceUrl = String(body.sourceUrl || 'https://example.edu/jobs').trim();
  const ingestedJobs = [
    {
      id: randomUUID(),
      title: 'Tin tuyển dụng mới từ nguồn công khai',
      employer: 'Nguồn crawler địa phương',
      description: null,
      pay: 'Cần xác minh',
      region,
      schedule: 'Theo bài đăng gốc',
      sourceType: 'crawler',
      sourceLabel: `${sourceType} source`,
      sourceUrl,
      riskLevel: 'medium',
      moderationStatus: 'visible_immediately',
      tags: ['crawler', 'cần xác minh nguồn'],
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      contact: {
        name: 'Nguồn crawl tự động',
        phone: null,
        zalo: null,
        email: null,
        address: null,
        method: 'Liên hệ qua link gốc bài đăng',
        note: '⚠️ Nguồn crawl - Xác minh trước khi liên hệ.',
      },
    },
  ];

  return {
    status: 202,
    payload: {
      accepted: true,
      policy: 'Only public, official, or community sources are accepted; protected login/private sources are rejected.',
      ingestedJobs,
    },
  };
}

function inferRiskLevel(body) {
  const text = `${body.title || ''} ${body.pay || ''} ${body.description || ''}`.toLowerCase();
  if (/đặt cọc|phí hồ sơ|chuyển khoản trước|thu phí/.test(text)) return 'high';
  if (/lương cao|không cần kinh nghiệm|online/.test(text)) return 'medium';
  return 'low';
}
