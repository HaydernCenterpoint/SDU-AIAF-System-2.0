import type { AccountType } from '@/lib/account-types';

export interface StudentProfile {
  id: string;
  name: string;
  school: string;
  major: string;
}

export interface AuthUser {
  id: string;
  studentId: string;
  schoolId?: string;
  schoolName?: string;
  fullName: string;
  faculty: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string | null;
  profile?: StudentProfileDetails | null;
  role?: string;
  accountType?: AccountType;
  status?: string;
}

export interface AcademicInfo {
  status?: string;
  studentCode?: string;
  recordCode?: string;
  entryDate?: string;
  className?: string;
  campus?: string;
  educationLevel?: string;
  trainingType?: string;
  faculty?: string;
  major?: string;
  specialization?: string;
  cohort?: string;
  courseRange?: string;
  schoolName?: string;
  gpa?: string;
  creditsCompleted?: number;
  totalCredits?: number;
}

export interface PersonalInfo {
  fullName?: string;
  dateOfBirth?: string;
  ethnicity?: string;
  religion?: string;
  nationality?: string;
  region?: string;
  identityNumber?: string;
  issuedDate?: string;
  issuedBy?: string;
  subjectGroup?: string;
  unionDate?: string;
  partyDate?: string;
  phone?: string;
  email?: string;
  contactAddress?: string;
  permanentAddress?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  healthStatus?: string;
}

export interface FamilyInfo {
  fatherName?: string;
  fatherBirthYear?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherBirthYear?: string;
  motherOccupation?: string;
  motherPhone?: string;
}

export interface StudentProfileDetails {
  avatarUrl?: string | null;
  academicInfo?: AcademicInfo | null;
  personalInfo?: PersonalInfo | null;
  familyInfo?: FamilyInfo | null;
}

export interface DashboardStats {
  classesToday: number;
  reminders: number;
  documents: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  room: string;
  type: string;
  day?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  owner: {
    id: string;
    email: string;
    role?: string;
  };
  file: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
  canManage: boolean;
  meta?: string;
  note?: string;
}

export interface DocumentFilters {
  search?: string;
  tag?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources: MessageSource[];
}

export interface MessageSource {
  title: string;
  type: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface BootstrapData {
  user: StudentProfile;
  stats: DashboardStats;
  suggestions: string[];
  schedule: ScheduleItem[];
  documents: DocumentItem[];
  conversations: ConversationSummary[];
  conversationDetails: Record<string, ConversationDetail>;
}

export type AppTab = 'dashboard' | 'chat' | 'schedule' | 'documents' | 'reminders' | 'notifications' | 'statistics' | 'courses' | 'grades' | 'health' | 'learningspace';

export interface ChatSendResult {
  conversation: ConversationSummary;
  message: ChatMessage;
}

export interface AssistantRuntimeStatus {
  mode: string;
  configured: boolean;
  http: boolean;
  sandbox: string | null;
  openclawCli: boolean;
  openai: boolean;
  openrouter: boolean;
  xai: boolean;
  krouter?: boolean;
  model: string | null;
  timeoutMs: number;
}
