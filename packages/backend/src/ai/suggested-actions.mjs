const ACTIONS = {
  study: ['Tạo kế hoạch ôn tập', 'Tạo câu hỏi tự kiểm tra', 'Giải thích bằng ví dụ dễ hiểu'],
  document: ['Tóm tắt ý chính', 'Tạo thẻ ghi nhớ', 'Tạo câu hỏi ôn tập'],
  report: ['Lập dàn ý báo cáo', 'Kiểm tra logic bài viết', 'Gợi ý nguồn cần bổ sung'],
  coding: ['Giải thích lỗi', 'Gợi ý test case', 'Tối ưu code'],
  career: ['Cải thiện CV', 'Lập lộ trình kỹ năng', 'Gợi ý dự án portfolio'],
  interview: ['Bắt đầu phỏng vấn thử', 'Chấm câu trả lời STAR', 'Gợi ý câu trả lời tốt hơn'],
  health: ['Gợi ý lịch ngủ', 'Tạo kế hoạch vận động nhẹ', 'Nhắc nghỉ giải lao'],
  finance: ['Tạo ngân sách tuần', 'Phân loại chi tiêu', 'Gợi ý cách tiết kiệm'],
  productivity: ['Tạo kế hoạch hôm nay', 'Chia nhỏ deadline', 'Sắp xếp việc ưu tiên'],
};

export function getSuggestedActions(assistantType) {
  return ACTIONS[assistantType] || [];
}
