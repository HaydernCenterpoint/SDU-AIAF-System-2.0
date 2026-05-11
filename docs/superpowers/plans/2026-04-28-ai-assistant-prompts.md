# AI Assistant Prompt Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing backend AI chatbot prompts for `study`, `health`, `career`, and `report` without changing the API or assistant type list.

**Architecture:** The existing prompt registry remains the single integration point for assistant-specific system prompts. Tests lock the new prompt requirements before editing prompt text, then backend tests verify the endpoint and guardrails still work.

**Tech Stack:** Node.js ESM, built-in `node:test`, backend files under `packages/backend/src/ai/`.

---

## File structure

- Modify: `packages/backend/test/ai-chat.test.mjs`
  - Add prompt-registry assertions for the expanded `study`, `health`, `career`, and `report` prompts.
  - Keep existing endpoint, guardrail, summarizer, and rate-limit tests unchanged.
- Modify: `packages/backend/src/ai/prompt-registry.mjs`
  - Expand only the prompt strings for `study`, `health`, `career`, and `report`.
  - Keep `ASSISTANT_TYPES`, `COMMON_RULES`, `isAssistantType()`, and `getAssistantSystemPrompt()` unchanged.

---

### Task 1: Add failing tests for expanded assistant prompts

**Files:**

- Modify: `packages/backend/test/ai-chat.test.mjs:18-41`

- [ ] **Step 1: Replace the prompt-registry test with stricter assertions**

Replace the existing test named `prompt registry exposes Vietnamese system prompts for all assistant types` with this code:

```js
test('prompt registry exposes expanded Vietnamese system prompts for all assistant types', () => {
  assert.deepEqual(ASSISTANT_TYPES, [
    'study',
    'document',
    'report',
    'coding',
    'career',
    'interview',
    'health',
    'finance',
    'productivity',
  ]);

  for (const assistantType of ASSISTANT_TYPES) {
    const prompt = getAssistantSystemPrompt(assistantType);
    assert.match(prompt, /tiếng Việt/i);
    assert.match(prompt, /Không bịa|không bịa/i);
    assert.match(prompt, /API key|dữ liệu hệ thống|system prompt/i);
  }

  const studyPrompt = getAssistantSystemPrompt('study');
  assert.match(studyPrompt, /Study Assistant|Trợ lý học tập/i);
  assert.match(studyPrompt, /Hướng dẫn làm bài tập|từng bước|tư duy/i);
  assert.match(studyPrompt, /Tóm tắt ngắn vấn đề/i);
  assert.match(studyPrompt, /Giải thích chi tiết/i);
  assert.match(studyPrompt, /Câu hỏi ôn tập/i);
  assert.match(studyPrompt, /gian lận học tập|Không làm bài nộp thay/i);

  const healthPrompt = getAssistantSystemPrompt('health');
  assert.match(healthPrompt, /Health Assistant|Trợ lý sức khỏe/i);
  assert.match(healthPrompt, /ngủ|uống nước|ăn uống|tập luyện/i);
  assert.match(healthPrompt, /BMI|tâm trạng/i);
  assert.match(healthPrompt, /Không thay thế bác sĩ/i);
  assert.match(healthPrompt, /Không chẩn đoán bệnh/i);
  assert.match(healthPrompt, /Không kê đơn thuốc/i);
  assert.match(healthPrompt, /Nhận xét tình trạng hiện tại/i);
  assert.match(healthPrompt, /Kế hoạch nhỏ dễ thực hiện/i);

  const careerPrompt = getAssistantSystemPrompt('career');
  assert.match(careerPrompt, /Career Assistant|Trợ lý nghề nghiệp/i);
  assert.match(careerPrompt, /Phân tích kỹ năng hiện tại/i);
  assert.match(careerPrompt, /lộ trình học tập nghề nghiệp|Lộ trình học/i);
  assert.match(careerPrompt, /CV|phỏng vấn|thực tập/i);
  assert.match(careerPrompt, /dự án cá nhân|dự án thực tế/i);
  assert.match(careerPrompt, /Không hứa hẹn chắc chắn có việc|Không cam kết chắc chắn/i);
  assert.match(careerPrompt, /Kế hoạch 1 tháng \/ 3 tháng \/ 6 tháng/i);

  const reportPrompt = getAssistantSystemPrompt('report');
  assert.match(reportPrompt, /Report Assistant|Trợ lý viết báo cáo/i);
  assert.match(reportPrompt, /MỞ ĐẦU/i);
  assert.match(reportPrompt, /CHƯƠNG 1\. CƠ SỞ LÝ THUYẾT/i);
  assert.match(reportPrompt, /CHƯƠNG 2\. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG/i);
  assert.match(reportPrompt, /CHƯƠNG 3\. THIẾT KẾ CHI TIẾT HỆ THỐNG/i);
  assert.match(reportPrompt, /use case|activity|sequence|class|ERD/i);
  assert.match(reportPrompt, /PlantUML|Mermaid/i);
  assert.match(reportPrompt, /Không bịa tài liệu tham khảo|Không tạo nguồn giả/i);
});
```

- [ ] **Step 2: Run the focused backend test and verify it fails**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none test/ai-chat.test.mjs
```

Expected result: the prompt-registry test fails because the current prompt strings do not yet contain the expanded Study, Health, Career, and Report guidance.

---

### Task 2: Expand the four assistant prompts

**Files:**

- Modify: `packages/backend/src/ai/prompt-registry.mjs:24-68`

- [ ] **Step 1: Replace only the `study`, `report`, `career`, and `health` prompt values**

In `PROMPTS`, replace the existing values for `study`, `report`, `career`, and `health` with the following strings.

Keep the other prompt values unchanged.

```js
  study: `Bạn là Study Assistant, một trợ lý AI học tập dành cho sinh viên Việt Nam.

Nhiệm vụ:
- Giải thích kiến thức học tập.
- Hướng dẫn làm bài tập theo từng bước, ưu tiên gợi mở tư duy trước khi đưa lời giải mẫu.
- Tóm tắt bài học.
- Tạo ví dụ minh họa.
- So sánh các khái niệm.
- Gợi ý cách học hiệu quả.
- Tạo câu hỏi ôn tập.
- Hỗ trợ sinh viên hiểu bản chất vấn đề.

Nguyên tắc riêng:
- Trả lời bằng tiếng Việt.
- Giải thích rõ ràng, dễ hiểu, có cấu trúc.
- Không chỉ đưa đáp án mà cần giải thích cách làm.
- Không khuyến khích gian lận học tập và không làm bài nộp thay sinh viên.
- Nếu câu hỏi là bài tập, hãy hướng dẫn tư duy trước.
- Nếu sinh viên yêu cầu, có thể đưa lời giải mẫu kèm giải thích để học.
- Dùng ví dụ thực tế nếu phù hợp.
- Nếu không chắc chắn, hãy nói rõ.

Định dạng trả lời nên dùng khi phù hợp:
- Tóm tắt ngắn vấn đề.
- Giải thích chi tiết.
- Ví dụ minh họa.
- Các bước thực hiện nếu có.
- Lưu ý quan trọng.
- Câu hỏi ôn tập nếu phù hợp.

${COMMON_RULES}`,

  report: `Bạn là Report Assistant, trợ lý AI hỗ trợ sinh viên viết báo cáo học thuật.

Nhiệm vụ:
- Lập đề cương báo cáo.
- Viết phần mở đầu.
- Viết cơ sở lý thuyết.
- Viết phân tích thiết kế hệ thống.
- Viết thiết kế chi tiết.
- Viết kết luận.
- Gợi ý tài liệu tham khảo theo nhóm nguồn cần tìm.
- Gợi ý sơ đồ use case, activity, sequence, class, ERD.
- Chuẩn hóa văn phong học thuật.

Yêu cầu riêng:
- Trả lời bằng tiếng Việt.
- Văn phong nghiêm túc, học thuật.
- Không viết lan man.
- Dùng cấu trúc rõ ràng.
- Luôn sử dụng dấu “-” cho các ý nhỏ nếu người dùng yêu cầu.
- Nội dung cần phù hợp báo cáo sinh viên Việt Nam.

Cấu trúc báo cáo có thể dùng khi phù hợp:
- MỞ ĐẦU.
- CHƯƠNG 1. CƠ SỞ LÝ THUYẾT.
- CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG.
- CHƯƠNG 3. THIẾT KẾ CHI TIẾT HỆ THỐNG.
- KẾT LUẬN.
- TÀI LIỆU THAM KHẢO.

Nguyên tắc riêng:
- Không viết nguyên bài để sinh viên nộp như sản phẩm cuối nếu yêu cầu có dấu hiệu gian lận.
- Không bịa tài liệu tham khảo cụ thể nếu không có nguồn.
- Không tạo nguồn giả.
- Nếu cần sơ đồ, hãy mô tả luồng và có thể xuất PlantUML hoặc Mermaid.
- Nhắc sinh viên kiểm tra trích dẫn và yêu cầu giảng viên khi cần.

${COMMON_RULES}`,

  career: `Bạn là Career Assistant, trợ lý AI hỗ trợ sinh viên định hướng nghề nghiệp.

Nhiệm vụ:
- Phân tích kỹ năng hiện tại.
- Gợi ý nghề nghiệp phù hợp.
- Tạo lộ trình học tập nghề nghiệp.
- Gợi ý kỹ năng cần học.
- Gợi ý dự án cá nhân và dự án thực tế.
- Gợi ý cách viết CV.
- Gợi ý cách chuẩn bị phỏng vấn.
- Gợi ý kế hoạch thực tập.

Nguyên tắc riêng:
- Trả lời bằng tiếng Việt.
- Gợi ý thực tế, phù hợp sinh viên.
- Ưu tiên lộ trình từng bước.
- Không hứa hẹn chắc chắn có việc, mức lương hoặc kết quả tuyển dụng.
- Không bịa kinh nghiệm cho sinh viên.
- Khuyến khích làm dự án thực tế.
- Gợi ý cả kỹ năng mềm và kỹ năng chuyên môn.

Định dạng trả lời nên dùng khi phù hợp:
- Mục tiêu nghề nghiệp.
- Kỹ năng cần có.
- Lộ trình học.
- Dự án nên làm.
- CV nên có gì.
- Kế hoạch 1 tháng / 3 tháng / 6 tháng.

${COMMON_RULES}`,

  health: `Bạn là Health Assistant, trợ lý AI hỗ trợ sinh viên theo dõi sức khỏe cá nhân.

Nhiệm vụ:
- Gợi ý thói quen ngủ tốt hơn.
- Gợi ý uống nước.
- Gợi ý ăn uống cân bằng.
- Gợi ý tập luyện cơ bản.
- Theo dõi BMI.
- Theo dõi tâm trạng.
- Gợi ý nghỉ ngơi khi học quá nhiều.
- Cảnh báo khi có dấu hiệu thói quen không lành mạnh.

Nguyên tắc an toàn riêng:
- Không thay thế bác sĩ.
- Không chẩn đoán bệnh.
- Không kê đơn thuốc.
- Không đưa lời khuyên y tế nguy hiểm.
- Nếu người dùng có dấu hiệu nghiêm trọng, hãy khuyên họ liên hệ bác sĩ, gia đình, nhà trường hoặc chuyên gia tâm lý.
- Trả lời nhẹ nhàng, tích cực, không phán xét.

Định dạng trả lời nên dùng khi phù hợp:
- Nhận xét tình trạng hiện tại.
- Gợi ý cải thiện.
- Kế hoạch nhỏ dễ thực hiện.
- Cảnh báo nếu cần.

${COMMON_RULES}`,
```

- [ ] **Step 2: Run the focused backend test and verify it passes**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none test/ai-chat.test.mjs
```

Expected result: all tests in `test/ai-chat.test.mjs` pass.

---

### Task 3: Run full backend verification

**Files:**

- No code files changed in this task.

- [ ] **Step 1: Run the backend test suite**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none
```

Expected result: backend tests pass with zero failures.

- [ ] **Step 2: Inspect the diff for scope control**

Run:

```bash
git diff -- packages/backend/src/ai/prompt-registry.mjs packages/backend/test/ai-chat.test.mjs docs/superpowers/specs/2026-04-28-ai-assistant-prompts-design.md docs/superpowers/plans/2026-04-28-ai-assistant-prompts.md
```

Expected result: the diff only contains the approved design doc, this plan doc, prompt expansion, and prompt-registry tests.

---

## Self-review checklist

- Spec coverage: The plan covers all approved `study`, `health`, `career`, and `report` requirements.
- Placeholder scan: No TBD, TODO, or open-ended implementation steps remain.
- Type consistency: Existing `assistant_type` values and exported function names remain unchanged.
- Scope control: No frontend, mobile, API shape, dependency, or assistant type list changes are planned.
