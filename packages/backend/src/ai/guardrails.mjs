const SECRET_PATTERNS = [
  /\bsk-[a-zA-Z0-9_-]{8,}\b/,
  /\b(api[_-]?key|token|password|mật khẩu|mat khau|otp)\b\s*[:=]\s*\S+/i,
  /\bBearer\s+[a-zA-Z0-9._-]{12,}\b/i,
];

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?84|0)(?:\d[\s.-]?){9,10}\b/,
  /\b\d{12}\b/,
  /\b(?:CCCD|CMND|căn cước|can cuoc|số tài khoản|so tai khoan|stk)\b[^\n]{0,40}\d{6,}/i,
  /\b(?:mã sinh viên|ma sinh vien|student id|studentId)\b[^\n]{0,30}[a-zA-Z0-9_-]{4,}/i,
];

const MEDICAL_EMERGENCY = /(tự tử|tu tu|tự hại|tu hai|khó thở|kho tho|đau ngực|dau nguc|ngất|ngat|co giật|co giat)/i;

export function validateUserMessage(message) {
  if (!message || !message.trim()) {
    return { ok: false, status: 400, error: 'Message is required' };
  }
  if (message.length > 8000) {
    return { ok: false, status: 400, error: 'Tin nhắn quá dài. Vui lòng rút gọn nội dung.' };
  }
  if (SECRET_PATTERNS.some((pattern) => pattern.test(message))) {
    return {
      ok: false,
      status: 400,
      error: 'Tin nhắn có vẻ chứa thông tin nhạy cảm như API key, token hoặc mật khẩu. Vui lòng xóa thông tin đó trước khi gửi.',
    };
  }
  if (PII_PATTERNS.some((pattern) => pattern.test(message))) {
    return {
      ok: false,
      status: 400,
      error: 'Tin nhắn có vẻ chứa dữ liệu cá nhân hoặc thông tin nhạy cảm. Vui lòng ẩn email, số điện thoại, CCCD, mã sinh viên hoặc số tài khoản trước khi gửi.',
    };
  }
  return { ok: true };
}

export function buildSafetyPrefix({ assistantType, message }) {
  if (assistantType === 'health') {
    const emergency = MEDICAL_EMERGENCY.test(message);
    return emergency
      ? 'Lưu ý an toàn: Nếu bạn đang gặp tình huống khẩn cấp hoặc có nguy cơ tự hại, hãy liên hệ ngay người thân, nhà trường, cơ sở y tế hoặc dịch vụ khẩn cấp tại địa phương. AI không thay thế bác sĩ hoặc chuyên gia tâm lý.\n\n'
      : 'Lưu ý: Mình có thể gợi ý thói quen sức khỏe chung, nhưng AI không thay thế bác sĩ hoặc chuyên gia tâm lý.\n\n';
  }
  return '';
}

export function redactSensitiveText(value = '') {
  return SECRET_PATTERNS.reduce((text, pattern) => text.replace(pattern, '[REDACTED]'), String(value));
}
