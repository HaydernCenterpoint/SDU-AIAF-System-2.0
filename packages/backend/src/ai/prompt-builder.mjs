import { getAssistantSystemPrompt } from './prompt-registry.mjs';

export function buildStudentContext({ user, userData, extraContext = {}, schoolKnowledge = null }) {
  return {
    user: {
      id: user.id,
      name: user.fullName || 'Sinh viên',
      school: user.schoolName || 'Đại học Sao Đỏ',
      major: user.faculty || 'Chưa cập nhật',
    },
    schedule: userData.schedule || [],
    documents: userData.documents || [],
    reminders: userData.reminders || [],
    courses: userData.courses || [],
    grades: userData.grades || [],
    cvProfile: normalizeCvProfile(extraContext.cvProfile),
    healthProfile: normalizeHealthProfile(extraContext.healthProfile),
    schoolKnowledge: normalizeSchoolKnowledge(schoolKnowledge),
  };
}

export function buildAiPrompt({ assistantType, message, studentContext, conversation, webContextBlock = '' }) {
  const recentMessages = (conversation.messages || [])
    .slice(-10)
    .map((item) => `${item.role === 'assistant' ? 'Trợ lý' : 'Sinh viên'}: ${item.content}`)
    .join('\n');

  const cvSection = studentContext.cvProfile
    ? `
CV hiện tại của sinh viên:
${formatCvProfile(studentContext.cvProfile)}
`
    : '';

  const healthSection = studentContext.healthProfile
    ? `
Dữ liệu sức khỏe hiện tại của sinh viên:
${formatHealthProfile(studentContext.healthProfile)}
`
    : '';

  const schoolKnowledgeSection = studentContext.schoolKnowledge
    ? `
ThÃ´ng tin tuyá»ƒn sinh cá»‘ Ä‘á»‹nh cá»§a trÆ°á»ng:
${formatSchoolKnowledge(studentContext.schoolKnowledge)}
`
    : '';

  // Web context is injected just before the student's question so the AI can
  // cite and reason over the freshly-scraped content.
  const webSection = webContextBlock
    ? `\nThông tin bổ sung tìm kiếm từ internet (hãy sử dụng để trả lời chính xác hơn):\n${webContextBlock}\n`
    : '';

  return `${getAssistantSystemPrompt(assistantType)}

Ngữ cảnh sinh viên:
- Tên: ${studentContext.user.name}
- Trường: ${studentContext.user.school}
- Khoa/ngành: ${studentContext.user.major}
${schoolKnowledgeSection}

Môn học hiện có:
${formatCourses(studentContext.courses)}

Lịch học:
${formatSchedule(studentContext.schedule)}

Tài liệu:
${formatDocuments(studentContext.documents)}

Nhắc nhở:
${formatReminders(studentContext.reminders)}
${cvSection}
${healthSection}
Tóm tắt hội thoại trước đó:
${conversation.summary || 'Chưa có tóm tắt.'}

Tin nhắn gần đây:
${recentMessages || 'Chưa có tin nhắn gần đây.'}
${webSection}
Câu hỏi mới của sinh viên:
${message}

Yêu cầu định dạng:
- Trả lời trực tiếp bằng tiếng Việt.
- Dùng bullet hoặc các bước khi phù hợp.
- Có ví dụ minh họa nếu giúp sinh viên hiểu nhanh hơn.
- Nếu đang góp ý CV, bám sát đúng dữ liệu CV đã cho thay vì trả lời chung chung.
- Nếu đang góp ý sức khỏe, bám sát đúng dữ liệu ngủ, nước, vận động, stress đã cho thay vì trả lời chung chung.
- Nếu có thông tin tìm kiếm từ web, hãy tóm tắt và trích dẫn nguồn cụ thể.
- Nếu thiếu dữ liệu, nói rõ và gợi ý bước tiếp theo.`;
}

function normalizeCvProfile(cvProfile) {
  if (!cvProfile || typeof cvProfile !== 'object') return null;

  return {
    desiredRole: normalizeString(cvProfile.desiredRole),
    summary: normalizeString(cvProfile.summary),
    strengths: normalizeStringList(cvProfile.strengths, 8),
    focusAreas: normalizeStringList(cvProfile.focusAreas, 8),
    skills: normalizeStringList(cvProfile.skills, 20),
    projects: normalizeProjects(cvProfile.projects),
    activities: normalizeActivities(cvProfile.activities),
    achievements: normalizeAchievements(cvProfile.achievements),
  };
}

function normalizeHealthProfile(healthProfile) {
  if (!healthProfile || typeof healthProfile !== 'object') return null;

  return {
    summary: normalizeString(healthProfile.summary),
    sleepAverage: normalizeString(healthProfile.sleepAverage),
    hydrationAverage: normalizeString(healthProfile.hydrationAverage),
    activityAverage: normalizeString(healthProfile.activityAverage),
    stressAverage: normalizeString(healthProfile.stressAverage),
    recommendations: normalizeLabeledDetails(healthProfile.recommendations),
    days: normalizeHealthDays(healthProfile.days),
  };
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return [];
  return projects
    .slice(0, 8)
    .map((project) => {
      if (!project || typeof project !== 'object') return null;
      return {
        name: normalizeString(project.name),
        role: normalizeString(project.role),
        impact: normalizeString(project.impact),
        stack: normalizeStringList(project.stack, 10),
      };
    })
    .filter(Boolean)
    .filter((project) => project.name || project.role || project.impact || project.stack.length);
}

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return activities
    .slice(0, 8)
    .map((activity) => {
      if (!activity || typeof activity !== 'object') return null;
      return {
        title: normalizeString(activity.title),
        organization: normalizeString(activity.organization),
        highlights: normalizeStringList(activity.highlights, 6),
      };
    })
    .filter(Boolean)
    .filter((activity) => activity.title || activity.organization || activity.highlights.length);
}

function normalizeAchievements(achievements) {
  if (!Array.isArray(achievements)) return [];
  return achievements
    .slice(0, 8)
    .map((achievement) => {
      if (!achievement || typeof achievement !== 'object') return null;
      return {
        label: normalizeString(achievement.label),
        detail: normalizeString(achievement.detail),
      };
    })
    .filter(Boolean)
    .filter((achievement) => achievement.label || achievement.detail);
}

function normalizeLabeledDetails(items) {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, 8)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      return {
        title: normalizeString(item.title || item.label),
        detail: normalizeString(item.detail),
      };
    })
    .filter(Boolean)
    .filter((item) => item.title || item.detail);
}

function normalizeHealthDays(days) {
  if (!Array.isArray(days)) return [];
  return days
    .slice(0, 8)
    .map((day) => {
      if (!day || typeof day !== 'object') return null;
      return {
        day: normalizeString(day.day),
        date: normalizeString(day.date),
        sleep: normalizeString(day.sleep),
        water: normalizeString(day.water),
        active: normalizeString(day.active),
        stress: normalizeString(day.stress),
        mood: normalizeString(day.mood),
        note: normalizeString(day.note),
      };
    })
    .filter(Boolean)
    .filter((day) => day.day || day.date || day.note);
}

function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 500);
}

function normalizeStringList(values, limit) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeSchoolKnowledge(schoolKnowledge) {
  if (!schoolKnowledge || typeof schoolKnowledge !== 'object') return null;

  const subjectCombinationDefinitions =
    schoolKnowledge.subjectCombinationDefinitions && typeof schoolKnowledge.subjectCombinationDefinitions === 'object'
      ? Object.fromEntries(
          Object.entries(schoolKnowledge.subjectCombinationDefinitions)
            .map(([code, label]) => [normalizeString(code).toUpperCase(), normalizeString(label)])
            .filter(([code, label]) => code && label),
        )
      : {};

  const majors = Array.isArray(schoolKnowledge.majors)
    ? schoolKnowledge.majors
        .slice(0, 30)
        .map((major) => {
          if (!major || typeof major !== 'object') return null;
          return {
            applicationCode: normalizeString(major.applicationCode).toUpperCase(),
            name: normalizeString(major.name),
            majorCode: normalizeString(major.majorCode),
            combinationCodes: normalizeStringList(major.combinationCodes, 20).map((code) => code.toUpperCase()),
          };
        })
        .filter(Boolean)
        .filter((major) => major.applicationCode || major.name || major.majorCode || major.combinationCodes.length)
    : [];

  const admissionMethods = normalizeStringList(schoolKnowledge.admissionMethods, 10);
  const faculties = normalizeStringList(schoolKnowledge.faculties, 20);
  const notes = normalizeStringList(schoolKnowledge.notes, 10);

  if (!faculties.length && !admissionMethods.length && !Object.keys(subjectCombinationDefinitions).length && !majors.length) {
    return null;
  }

  return {
    schoolName: normalizeString(schoolKnowledge.schoolName),
    academicYear: normalizeString(schoolKnowledge.academicYear),
    faculties,
    admissionMethods,
    subjectCombinationDefinitions,
    majors,
    notes,
  };
}

function formatCvProfile(cvProfile) {
  const sections = [];

  if (cvProfile.desiredRole) sections.push(`- Mục tiêu ứng tuyển: ${cvProfile.desiredRole}`);
  if (cvProfile.summary) sections.push(`- Tóm tắt CV: ${cvProfile.summary}`);
  if (cvProfile.strengths.length) sections.push(`- Điểm mạnh nổi bật: ${cvProfile.strengths.join(', ')}`);
  if (cvProfile.focusAreas.length) sections.push(`- Trọng tâm cần cải thiện: ${cvProfile.focusAreas.join(', ')}`);
  if (cvProfile.skills.length) sections.push(`- Kỹ năng hiện có: ${cvProfile.skills.join(', ')}`);

  if (cvProfile.projects.length) {
    sections.push('- Dự án:');
    for (const project of cvProfile.projects) {
      const parts = [project.name, project.role && `vai trò ${project.role}`, project.impact && `tác động ${project.impact}`].filter(Boolean);
      const stack = project.stack.length ? ` | stack: ${project.stack.join(', ')}` : '';
      sections.push(`  - ${parts.join(' | ')}${stack}`);
    }
  }

  if (cvProfile.activities.length) {
    sections.push('- Hoạt động:');
    for (const activity of cvProfile.activities) {
      const header = [activity.title, activity.organization && `tại ${activity.organization}`].filter(Boolean).join(' ');
      const highlights = activity.highlights.length ? ` | điểm nhấn: ${activity.highlights.join(', ')}` : '';
      sections.push(`  - ${header}${highlights}`);
    }
  }

  if (cvProfile.achievements.length) {
    sections.push('- Điểm nhấn CV:');
    for (const achievement of cvProfile.achievements) {
      sections.push(`  - ${achievement.label}: ${achievement.detail}`);
    }
  }

  return sections.length ? sections.join('\n') : '- Chưa có dữ liệu CV chi tiết.';
}

function formatHealthProfile(healthProfile) {
  const sections = [];

  if (healthProfile.summary) sections.push(`- Tóm tắt tuần: ${healthProfile.summary}`);
  if (healthProfile.sleepAverage) sections.push(`- Giấc ngủ trung bình: ${healthProfile.sleepAverage}`);
  if (healthProfile.hydrationAverage) sections.push(`- Nước uống trung bình: ${healthProfile.hydrationAverage}`);
  if (healthProfile.activityAverage) sections.push(`- Vận động trung bình: ${healthProfile.activityAverage}`);
  if (healthProfile.stressAverage) sections.push(`- Căng thẳng trung bình: ${healthProfile.stressAverage}`);

  if (healthProfile.recommendations.length) {
    sections.push('- Khuyến nghị AI hiện tại:');
    for (const item of healthProfile.recommendations) {
      sections.push(`  - ${item.title}: ${item.detail}`);
    }
  }

  if (healthProfile.days.length) {
    sections.push('- Lịch sử từng ngày:');
    for (const day of healthProfile.days) {
      const parts = [
        day.day,
        day.date && `(${day.date})`,
        day.sleep && `ngủ ${day.sleep}`,
        day.water && `nước ${day.water}`,
        day.active && `vận động ${day.active}`,
        day.stress && `stress ${day.stress}`,
        day.mood && `tâm trạng ${day.mood}`,
      ].filter(Boolean);
      const note = day.note ? ` | ghi chú: ${day.note}` : '';
      sections.push(`  - ${parts.join(' | ')}${note}`);
    }
  }

  return sections.length ? sections.join('\n') : '- Chưa có dữ liệu sức khỏe chi tiết.';
}

function formatSchoolKnowledge(schoolKnowledge) {
  const sections = [];
  const combinationLines = Object.entries(schoolKnowledge.subjectCombinationDefinitions || {});

  if (schoolKnowledge.schoolName || schoolKnowledge.academicYear) {
    const label = [schoolKnowledge.schoolName, schoolKnowledge.academicYear && `dữ liệu tuyển sinh ${schoolKnowledge.academicYear}`]
      .filter(Boolean)
      .join(' - ');
    if (label) sections.push(`- Phạm vi dữ liệu: ${label}`);
  }

  if (schoolKnowledge.faculties.length) {
    sections.push(`- Các khoa đào tạo: ${schoolKnowledge.faculties.join('; ')}`);
  }

  if (schoolKnowledge.admissionMethods.length) {
    sections.push('- Phương thức tuyển sinh:');
    for (const method of schoolKnowledge.admissionMethods) {
      sections.push(`  - ${method}`);
    }
  }

  if (combinationLines.length) {
    sections.push('- Mã tổ hợp môn:');
    for (const [code, label] of combinationLines) {
      sections.push(`  - ${code}: ${label}`);
    }
  }

  if (schoolKnowledge.majors.length) {
    sections.push('- Ngành tuyển sinh 2026:');
    for (const major of schoolKnowledge.majors) {
      const parts = [major.applicationCode, major.name, major.majorCode && `mã ngành ${major.majorCode}`].filter(Boolean);
      const combinations = major.combinationCodes.length ? ` | tổ hợp: ${major.combinationCodes.join(', ')}` : '';
      sections.push(`  - ${parts.join(' | ')}${combinations}`);
    }
  }

  if (schoolKnowledge.notes.length) {
    sections.push('- Ghi chú nguồn dữ liệu:');
    for (const note of schoolKnowledge.notes) {
      sections.push(`  - ${note}`);
    }
  }

  return sections.join('\n');
}

function formatCourses(courses = []) {
  if (!courses.length) return '- Chưa có thông tin môn học.';
  return courses.map((course) => `- ${course.code}: ${course.title} (${course.credits} tín chỉ)`).join('\n');
}

function formatSchedule(schedule = []) {
  if (!schedule.length) return '- Chưa có lịch học.';
  return schedule.slice(0, 8).map((item) => `- ${item.day || ''} ${item.time}: ${item.title} (${item.room})`).join('\n');
}

function formatDocuments(documents = []) {
  if (!documents.length) return '- Chưa có tài liệu.';
  return documents.slice(0, 8).map((doc) => `- ${doc.title} (${doc.meta || doc.note || 'tài liệu'})`).join('\n');
}

function formatReminders(reminders = []) {
  if (!reminders.length) return '- Chưa có nhắc nhở.';
  return reminders.slice(0, 8).map((reminder) => `- ${reminder.title} - hạn ${reminder.dueDate || 'chưa rõ'}`).join('\n');
}
