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

export interface StudentProfile {
  id: string;
  name: string;
  school: string;
  major: string;
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
}

export interface DocumentItem {
  id: string;
  title: string;
  meta: string;
  note: string;
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

export type AppTab = 'dashboard' | 'chat' | 'schedule' | 'documents' | 'reminders' | 'courses' | 'grades';
