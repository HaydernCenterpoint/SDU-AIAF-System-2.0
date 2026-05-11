import type { AuthUser } from '@/types';

export interface LearningMetrics {
  overallGPA: number;
  semesterGPAs: Record<string, number>;
  subjectPerformance: Record<string, SubjectGrade>;
  strongestSubjects: string[];
  weakestSubjects: string[];
  improvementTrend: 'improving' | 'declining' | 'stable';
  attendanceRate: number;
}

export interface SubjectGrade {
  subject: string;
  score: number;
  credits: number;
  semester: string;
  rank?: number;
  classAverage?: number;
}

export interface LearningPattern {
  mostProductiveHours: string[];
  preferredStudyDuration: number;
  studyFrequency: 'daily' | 'weekly' | 'occasional';
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  breaksBetweenSessions: number;
}

export interface StudentLearningProfile {
  student: AuthUser;
  metrics: LearningMetrics;
  patterns: LearningPattern;
  goals: LearningGoals;
  recentPerformance: RecentPerformanceSnapshot;
  contextSummary: string;
}

export interface LearningGoals {
  shortTerm: string[];
  longTerm: string[];
  targetGPA: number;
  targetRank: string;
  scholarships: string[];
}

export interface RecentPerformanceSnapshot {
  lastUpdated: string;
  recentGrades: SubjectGrade[];
  averageScore: number;
  comparedToClass: string;
  strengthsThisSemester: string[];
  areasToImprove: string[];
}

export interface AIRecommendation {
  type: 'study_plan' | 'resource' | 'improvement' | 'motivation' | 'schedule';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  subject?: string;
  actionableSteps: string[];
  expectedImpact: string;
}

export interface ReasoningContext {
  profile: StudentLearningProfile;
  currentQuestion: string;
  conversationHistory: ReasoningMessage[];
  relevantMetrics: string[];
}

export interface ReasoningMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIRecommendationSummary {
  totalRecommendations: number;
  highPriority: number;
  byType: Record<string, number>;
  topRecommendation?: AIRecommendation;
}

export interface StudentProfileBuildInput {
  user: AuthUser;
  grades?: SubjectGrade[];
  schedule?: Array<{ title: string; time: string; room: string }>;
  recentActivities?: string[];
}
