'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { askCvCoach, fetchStudentProfile } from '@/lib/cv-api';
import { buildDemoCvProfile } from '@/lib/cv-demo';
import type { CvAchievement, CvActivity, CvProject, CvSkillGroup } from '@/lib/cv-demo';
import type { SchoolSlug } from '@/lib/school-site';
import type { StudentProfileDetails } from '@/types';

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M7 10h10" />
      <path d="M7 14h7" />
      <path d="M5 19l-1-4V6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4A2.8 2.8 0 0 1 17.2 16H9z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

type CvChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function StudentCvPage({ school = 'sdu' }: { school?: SchoolSlug }) {
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
        <StudentCvContent school={school} />
      </AppShell>
    </ProtectedRoute>
  );
}

export default function CvPage() {
  return <StudentCvPage school="sdu" />;
}

function StudentCvContent({ school }: { school: SchoolSlug }) {
  const { user, token } = useAuthStore();
  const [profileDetails, setProfileDetails] = useState<StudentProfileDetails | null>(null);
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<CvChatMessage[]>([]);
  const [assistantError, setAssistantError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
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
        // Use demo CV fallback when profile API is unavailable.
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

  const readinessTone = cvProfile.readinessScore >= 80 ? 'text-[#1784DA]' : 'text-[#E31D1C]';
  const readinessLabel = cvProfile.readinessScore >= 80 ? 'Đã có nền tốt để mang đi ứng tuyển' : 'Cần làm rõ thêm trước khi gửi đi';

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
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      },
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
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
        },
      ]);
      setConversationId(result.conversationId);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'AI chưa phản hồi được cho CV này');
    } finally {
      setIsAsking(false);
    }
  }

  function handleAskAi() {
    void submitCvQuestion(question);
  }

  function handleStarterQuestion(item: string) {
    if (isAsking) return;
    void submitCvQuestion(item);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    handleAskAi();
  }

  return (
    <section className="space-y-6">
      <header className="rounded-[30px] border border-[#CFE8FF] bg-[linear-gradient(135deg,#F7FCFF_0%,#EAF8FF_52%,#FFF6D9_100%)] p-6 shadow-[0_18px_42px_rgba(23,132,218,0.08)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">
              <SparkIcon />
              CV của bạn
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#112641] sm:text-4xl">
              CV được dựng tự động từ hồ sơ học tập hiện tại
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#4B5D73] sm:text-base">
              Màn hình này dựng sẵn một bản CV tổng quan để học sinh nhìn thấy điểm mạnh, điểm yếu và có thể hỏi AI ngay trên chính nội dung CV đang hiển thị.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Mức sẵn sàng" value={`${cvProfile.readinessScore}%`} note={readinessLabel} toneClass={readinessTone} />
            <MetricCard label="Mục tiêu hiện tại" value={cvProfile.desiredRole} note="AI sẽ góp ý đúng theo hướng này" toneClass="text-[#112641]" />
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-[#D8E9FF] bg-white p-4 shadow-[0_20px_50px_rgba(17,38,65,0.08)] sm:p-6">
            <div className="mx-auto max-w-[860px] rounded-[28px] border border-[#E6EEF9] bg-white p-6 shadow-[0_18px_40px_rgba(17,38,65,0.08)] sm:p-8">
              <div className="flex flex-col gap-5 border-b border-[#E9F2FB] pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">{school === 'ntd' ? 'Student CV Demo' : 'Career CV Demo'}</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-[#112641]">{cvProfile.fullName}</h2>
                  <p className="mt-2 text-base font-bold text-[#1784DA]">{cvProfile.headline}</p>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#53657C]">{cvProfile.summary}</p>
                </div>

                <div className="rounded-[24px] bg-[#F6FBFF] p-4 text-sm font-semibold text-[#37506A]">
                  <p>{cvProfile.email}</p>
                  <p className="mt-1">{cvProfile.phone}</p>
                  <p className="mt-1">{cvProfile.location}</p>
                  <div className="mt-4 rounded-2xl bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#E31D1C]">
                    Mục tiêu nghề nghiệp: {cvProfile.desiredRole}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_280px]">
                <div className="space-y-6">
                  <CvSection title="Học vấn">
                    <article className="rounded-[24px] border border-[#E6EEF9] bg-[#FAFDFF] p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-black text-[#112641]">{cvProfile.education.schoolName}</h3>
                          <p className="mt-1 text-sm font-bold text-[#1784DA]">{cvProfile.education.program}</p>
                        </div>
                        <div className="text-sm font-bold text-[#5A6D84]">
                          <p>{cvProfile.education.period}</p>
                          <p className="mt-1 text-[#E31D1C]">{cvProfile.education.status}</p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-[#53657C]">
                        {cvProfile.education.highlights.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </article>
                  </CvSection>

                  <CvSection title="Dự án nổi bật">
                    <div className="space-y-3">
                      {cvProfile.projects.map((project) => <ProjectCard key={project.name} project={project} />)}
                    </div>
                  </CvSection>

                  <CvSection title="Hoạt động">
                    <div className="space-y-3">
                      {cvProfile.activities.map((activity) => <ActivityCard key={`${activity.title}-${activity.organization}`} activity={activity} />)}
                    </div>
                  </CvSection>
                </div>

                <div className="space-y-5">
                  <CvSection title="Kỹ năng cốt lõi">
                    <div className="space-y-3">
                      {cvProfile.skillGroups.map((group) => <SkillGroupCard key={group.title} group={group} />)}
                    </div>
                  </CvSection>

                  <CvSection title="Điểm nhấn">
                    <div className="space-y-3">
                      {cvProfile.achievements.map((achievement) => <AchievementCard key={achievement.label} achievement={achievement} />)}
                    </div>
                  </CvSection>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {cvProfile.focusAreas.map((item, index) => (
              <article key={item} className="rounded-[24px] border border-[#D7EBFF] bg-white p-5 shadow-[0_14px_34px_rgba(23,132,218,0.06)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1784DA]">Trọng tâm {index + 1}</p>
                <h3 className="mt-3 text-base font-black text-[#112641]">{item}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#60748B]">
                  Đây là nhóm việc nên tối ưu tiếp theo để CV rõ giá trị hơn khi gửi cho nhà tuyển dụng hoặc chương trình học bổng.
                </p>
              </article>
            ))}
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-[30px] border border-[#D8E9FF] bg-white shadow-[0_18px_44px_rgba(17,38,65,0.08)]">
            <div className="border-b border-[#E7F0FA] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#1784DA]">
                  <SparkIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">AI Coach CV</p>
                  <h2 className="text-2xl font-black text-[#112641]">Hỏi AI về CV này</h2>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-[26px] border border-[#DCEBFF] bg-[#FBFDFF]">
                <div ref={chatThreadRef} className="max-h-[580px] min-h-[520px] overflow-y-auto px-4 py-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {cvProfile.aiStarterQuestions.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleStarterQuestion(item)}
                          disabled={isAsking}
                          className="flex w-full items-start gap-3 rounded-[22px] border border-[#D7EBFF] bg-white px-4 py-3 text-left text-sm font-black text-[#1784DA] transition hover:border-[#1784DA] hover:bg-[#F2FAFF] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6FF] text-[#1784DA]">
                            <ChatIcon />
                          </span>
                          <span className="leading-6">{item}</span>
                        </button>
                      ))}
                    </div>

                    {chatMessages.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-[#D7E6F8] bg-white/90 px-4 py-3 text-sm font-semibold leading-6 text-[#60748B]">
                        Chọn một bubble để gửi ngay, hoặc nhập câu hỏi cụ thể về bullet, dự án, kỹ năng và minh chứng ở ô bên dưới.
                      </div>
                    ) : null}

                    {chatMessages.map((message) => (
                      <CvChatBubble key={message.id} role={message.role}>
                        {message.content}
                      </CvChatBubble>
                    ))}

                    {isAsking ? (
                      <CvChatBubble role="assistant">
                        AI đang đọc CV và soát lại từng ý để phản hồi...
                      </CvChatBubble>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-[#E7F0FA] bg-white px-4 py-4">
                  {assistantError ? (
                    <div className="mb-3 rounded-[18px] border border-[#FFD5D5] bg-[#FFF5F5] px-4 py-3 text-sm font-bold text-[#C53030]">
                      {assistantError}
                    </div>
                  ) : null}

                  <div className="flex items-end gap-3">
                    <textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      rows={3}
                      placeholder="Hỏi về một bullet, dự án hay kỹ năng cụ thể..."
                      className="min-h-[108px] flex-1 resize-none rounded-[22px] border border-[#D8E9FF] bg-white px-4 py-3 text-sm font-semibold text-[#112641] outline-none transition placeholder:text-[#8AA0B8] focus:border-[#1784DA] focus:ring-4 focus:ring-[#BFE8FF]"
                    />
                    <button
                      onClick={handleAskAi}
                      disabled={isAsking}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#E31D1C_0%,#F97316_100%)] text-white shadow-[0_16px_34px_rgba(227,29,28,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label={isAsking ? 'AI đang đọc CV' : 'Gửi câu hỏi CV cho AI'}
                    >
                      {isAsking ? <SparkIcon /> : <SendIcon />}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] font-semibold text-[#7C8FA5]">Enter để gửi ngay · Shift+Enter để xuống dòng</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  toneClass,
}: {
  label: string;
  value: string;
  note: string;
  toneClass: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-[0_12px_28px_rgba(17,38,65,0.06)] backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#72859B]">{label}</p>
      <p className={`mt-3 text-xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5E738B]">{note}</p>
    </article>
  );
}

function CvChatBubble({
  role,
  children,
}: {
  role: CvChatMessage['role'];
  children: ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-[24px] px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
          isUser
            ? 'bg-[linear-gradient(135deg,#E31D1C_0%,#F97316_100%)] text-white'
            : 'border border-[#DCEBFF] bg-white text-[#40566F]'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#1784DA]">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SkillGroupCard({ group }: { group: CvSkillGroup }) {
  return (
    <article className="rounded-[22px] border border-[#E4EEF9] bg-[#FAFDFF] p-4">
      <p className="text-sm font-black text-[#112641]">{group.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span key={item} className="rounded-full bg-[#EAF6FF] px-3 py-1.5 text-xs font-black text-[#1784DA]">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: CvProject }) {
  return (
    <article className="rounded-[24px] border border-[#E4EEF9] bg-[#FAFDFF] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg font-black text-[#112641]">{project.name}</h4>
          <p className="mt-1 text-sm font-bold text-[#1784DA]">{project.role}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#5C728C]">{project.period}</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#556A82]">{project.summary}</p>
      <p className="mt-3 rounded-[18px] bg-white px-4 py-3 text-sm font-bold text-[#112641]">{project.impact}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span key={item} className="rounded-full border border-[#DCEBFF] bg-white px-3 py-1 text-xs font-black text-[#1784DA]">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

function ActivityCard({ activity }: { activity: CvActivity }) {
  return (
    <article className="rounded-[24px] border border-[#E4EEF9] bg-[#FAFDFF] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-base font-black text-[#112641]">{activity.title}</h4>
          <p className="mt-1 text-sm font-bold text-[#1784DA]">{activity.organization}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#5C728C]">{activity.period}</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-[#556A82]">
        {activity.highlights.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </article>
  );
}

function AchievementCard({ achievement }: { achievement: CvAchievement }) {
  return (
    <article className="rounded-[22px] border border-[#E4EEF9] bg-[#FAFDFF] p-4">
      <p className="text-sm font-black text-[#112641]">{achievement.label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#556A82]">{achievement.detail}</p>
    </article>
  );
}
