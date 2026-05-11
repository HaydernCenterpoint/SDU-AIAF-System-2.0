'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { askCvCoach, fetchStudentProfile } from '@/lib/cv-api';
import { buildDemoCvProfile, type CvProfile } from '@/lib/cv-demo';
import type { StudentProfileDetails } from '@/types';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import type { SchoolSlug } from '@/lib/school-site';
import styles from './RealCvPage.module.css';

type CvChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <polyline points="6,9 6,2 18,2 18,9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  );
}

export function RealCvPage({ school = 'sdu' }: { school?: SchoolSlug }) {
  const { token, isAuthenticated, syncSessionFromStorage } = useAuthStore();
  const { bootstrap } = useAppStore();

  useEffect(() => {
    syncSessionFromStorage(school);
  }, [school, syncSessionFromStorage]);

  useEffect(() => {
    if (isAuthenticated && token) bootstrap(token);
  }, [isAuthenticated, token, bootstrap]);

  return (
    <ProtectedRoute school={school}>
      <AppShell school={school} activeNavId="profile">
        <RealCvContent school={school} />
      </AppShell>
    </ProtectedRoute>
  );
}

function RealCvContent({ school }: { school: SchoolSlug }) {
  const { user, token } = useAuthStore();
  const [profileDetails, setProfileDetails] = useState<StudentProfileDetails | null>(null);
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<CvChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const chatThreadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadProfile(activeToken: string) {
      try {
        const payload = await fetchStudentProfile(activeToken);
        if (cancelled) return;
        useAuthStore.setState({ user: payload.user });
        setProfileDetails(payload.profile);
      } catch {
        // fallback to demo data
      }
    }

    loadProfile(token);
    return () => {
      cancelled = true;
    };
  }, [token]);

  const cvProfile = useMemo(
    () => buildDemoCvProfile({ school, user, profile: profileDetails }),
    [school, user, profileDetails],
  );

  useEffect(() => {
    const node = chatThreadRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  async function submitCvQuestion(rawQuestion: string) {
    if (!token) {
      setAssistantError('Phiên đăng nhập không còn hợp lệ. Vui lòng tải lại trang.');
      return;
    }

    const trimmed = rawQuestion.trim();
    if (!trimmed) {
      setAssistantError('Nhập câu hỏi cụ thể để AI góp ý cho CV này.');
      return;
    }

    setChatMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: trimmed },
    ]);
    setQuestion('');
    setAssistantError('');
    setIsAsking(true);

    try {
      const result = await askCvCoach({
        token,
        question: trimmed,
        cvProfile,
        conversationId,
      });
      setChatMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: result.reply },
      ]);
      setConversationId(result.conversationId);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'AI chưa phản hồi được');
    } finally {
      setIsAsking(false);
    }
  }

  function handleAskAi() {
    void submitCvQuestion(question);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    handleAskAi();
  }

  const readinessColor = cvProfile.readinessScore >= 80 ? '#22C55E' : cvProfile.readinessScore >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <section className={styles.page}>
      {/* Header Banner */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logoBadge}>
              <SparkIcon />
            </div>
            <div>
              <p className={styles.headerLabel}>HỒ SƠ ỨNG VIÊN</p>
              <h1 className={styles.headerTitle}>CV Chuyên nghiệp</h1>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} title="Tải PDF">
              <DownloadIcon />
              <span>Tải PDF</span>
            </button>
            <button className={styles.actionBtn} title="In CV">
              <PrintIcon />
              <span>In CV</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Main CV Content */}
        <div className={styles.cvContainer}>
          <div className={styles.cvPaper} id="cv-print-area">
            {/* Left Column - Sidebar */}
            <aside className={styles.sidebar}>
              {/* Avatar */}
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {cvProfile.fullName.split(' ').map(n => n[0]).slice(-2).join('')}
                </div>
              </div>

              {/* Contact Info */}
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>LIÊN HỆ</h3>
                <div className={styles.contactList}>
                  <div className={styles.contactItem}>
                    <MailIcon />
                    <span>{cvProfile.email}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <PhoneIcon />
                    <span>{cvProfile.phone}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <MapPinIcon />
                    <span>{cvProfile.location}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>KỸ NĂNG</h3>
                {cvProfile.skillGroups.map((group) => (
                  <div key={group.title} className={styles.skillGroup}>
                    <h4 className={styles.skillGroupTitle}>{group.title}</h4>
                    <div className={styles.skillTags}>
                      {group.items.map((skill) => (
                        <span key={skill} className={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>NGÔN NGỮ</h3>
                <div className={styles.languageList}>
                  <div className={styles.languageItem}>
                    <span className={styles.languageName}>Tiếng Việt</span>
                    <span className={styles.languageLevel}>Bản ngữ</span>
                  </div>
                  <div className={styles.languageItem}>
                    <span className={styles.languageName}>Tiếng Anh</span>
                    <span className={styles.languageLevel}>Giao tiếp</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>GIẢI THƯỞNG</h3>
                {cvProfile.achievements.map((achievement) => (
                  <div key={achievement.label} className={styles.achievementItem}>
                    <div className={styles.achievementDot} />
                    <div>
                      <p className={styles.achievementLabel}>{achievement.label}</p>
                      <p className={styles.achievementDetail}>{achievement.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Right Column - Main Content */}
            <main className={styles.mainContent}>
              {/* Name & Title */}
              <header className={styles.cvHeader}>
                <h1 className={styles.cvName}>{cvProfile.fullName}</h1>
                <p className={styles.cvHeadline}>{cvProfile.headline}</p>
                <div className={styles.cvTarget}>
                  <span className={styles.targetLabel}>MỤC TIÊU:</span>
                  <span>{cvProfile.desiredRole}</span>
                </div>
              </header>

              {/* Summary */}
              <section className={styles.cvSection}>
                <h2 className={styles.sectionTitle}>
                  <ChevronRightIcon />
                  TÓM TẮT CHUYÊN MÔN
                </h2>
                <p className={styles.summaryText}>{cvProfile.summary}</p>
              </section>

              {/* Education */}
              <section className={styles.cvSection}>
                <h2 className={styles.sectionTitle}>
                  <ChevronRightIcon />
                  HỌC VẤN
                </h2>
                <div className={styles.educationCard}>
                  <div className={styles.educationHeader}>
                    <div>
                      <h3 className={styles.educationSchool}>{cvProfile.education.schoolName}</h3>
                      <p className={styles.educationProgram}>{cvProfile.education.program}</p>
                    </div>
                    <div className={styles.educationPeriod}>
                      <span>{cvProfile.education.period}</span>
                      <span className={styles.educationStatus}>{cvProfile.education.status}</span>
                    </div>
                  </div>
                  <ul className={styles.highlightsList}>
                    {cvProfile.education.highlights.map((item, i) => (
                      <li key={i} className={styles.highlightItem}>
                        <span className={styles.highlightDot} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Projects */}
              <section className={styles.cvSection}>
                <h2 className={styles.sectionTitle}>
                  <ChevronRightIcon />
                  DỰ ÁN NỔI BẬT
                </h2>
                <div className={styles.projectsList}>
                  {cvProfile.projects.map((project) => (
                    <div key={project.name} className={styles.projectCard}>
                      <div className={styles.projectHeader}>
                        <div>
                          <h3 className={styles.projectName}>{project.name}</h3>
                          <p className={styles.projectRole}>{project.role}</p>
                        </div>
                        <span className={styles.projectPeriod}>{project.period}</span>
                      </div>
                      <p className={styles.projectSummary}>{project.summary}</p>
                      <div className={styles.projectImpact}>
                        <span className={styles.impactLabel}>Kết quả:</span> {project.impact}
                      </div>
                      <div className={styles.projectStack}>
                        {project.stack.map((tech) => (
                          <span key={tech} className={styles.stackTag}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Activities */}
              <section className={styles.cvSection}>
                <h2 className={styles.sectionTitle}>
                  <ChevronRightIcon />
                  HOẠT ĐỘNG
                </h2>
                <div className={styles.activitiesList}>
                  {cvProfile.activities.map((activity, i) => (
                    <div key={i} className={styles.activityCard}>
                      <div className={styles.activityHeader}>
                        <div>
                          <h3 className={styles.activityTitle}>{activity.title}</h3>
                          <p className={styles.activityOrg}>{activity.organization}</p>
                        </div>
                        <span className={styles.activityPeriod}>{activity.period}</span>
                      </div>
                      <ul className={styles.activityHighlights}>
                        {activity.highlights.map((h, j) => (
                          <li key={j} className={styles.activityHighlight}>
                            <span className={styles.highlightDot} />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </div>

        {/* AI Coach Sidebar */}
        <aside className={styles.aiSidebar}>
          {/* Readiness Score */}
          <div className={styles.readinessCard}>
            <div className={styles.readinessHeader}>
              <SparkIcon />
              <span>ĐIỂM SẴN SÀNG</span>
            </div>
            <div className={styles.readinessScore} style={{ color: readinessColor }}>
              {cvProfile.readinessScore}%
            </div>
            <div className={styles.readinessBar}>
              <div 
                className={styles.readinessFill} 
                style={{ width: `${cvProfile.readinessScore}%`, backgroundColor: readinessColor }}
              />
            </div>
            <p className={styles.readinessNote}>
              {cvProfile.readinessScore >= 80 
                ? '✓ CV đã sẵn sàng để ứng tuyển'
                : cvProfile.readinessScore >= 60 
                  ? '• Cần hoàn thiện thêm một số mục'
                  : '⚠ Cần bổ sung nhiều thông tin'}
            </p>
          </div>

          {/* Focus Areas */}
          <div className={styles.focusCard}>
            <h3 className={styles.focusTitle}>TRỌNG TÂM CẦN CẢI THIỆN</h3>
            <ul className={styles.focusList}>
              {cvProfile.focusAreas.map((area, i) => (
                <li key={i} className={styles.focusItem}>
                  <span className={styles.focusNumber}>{i + 1}</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Chat */}
          <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <SparkIcon />
              <h3>AI COACH CV</h3>
            </div>
            
            <div ref={chatThreadRef} className={styles.chatMessages}>
              {/* Starter Questions */}
              <div className={styles.starterSection}>
                <p className={styles.starterLabel}>Câu hỏi gợi ý:</p>
                {cvProfile.aiStarterQuestions.map((q, i) => (
                  <button 
                    key={i} 
                    className={styles.starterBtn}
                    onClick={() => submitCvQuestion(q)}
                    disabled={isAsking}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat History */}
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`${styles.chatBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                >
                  {msg.content}
                </div>
              ))}

              {isAsking && (
                <div className={`${styles.chatBubble} ${styles.assistantBubble}`}>
                  Đang phân tích CV và đưa ra gợi ý...
                </div>
              )}
            </div>

            {assistantError && (
              <div className={styles.chatError}>{assistantError}</div>
            )}

            <div className={styles.chatInput}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi AI về CV của bạn..."
                rows={3}
              />
              <button 
                className={styles.sendBtn} 
                onClick={handleAskAi}
                disabled={isAsking}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
