import { apiGet, apiPost, apiPut } from '@/lib/api-client';

export type SchoolId = 'ntd' | 'sdu';

export type AdminUser = {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  faculty?: string;
  className?: string;
  phone?: string;
  createdAt?: string;
};

export type AdminTeacher = {
  id: string;
  teacherId: string;
  fullName: string;
  email: string;
  subject?: string;
  department?: string;
  phone?: string;
  status: string;
  createdAt?: string;
};

export type AdminStatistics = {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalStudents: number;
  totalTeachers: number;
  aiUsage: { totalQueries: number };
};

export type AiLog = {
  userId?: string;
  assistantType?: string;
  message?: string;
  createdAt?: string;
};

export type AdminLog = {
  id: string;
  action: string;
  targetUserId?: string;
  performedBy?: string;
  createdAt: string;
};

/**
 * Admin API.
 * The caller still passes schoolId to remain route-aware on the frontend,
 * while the backend resolves the active school from the authenticated session.
 */
export const adminApi = {
  listUsers: (_schoolId: SchoolId, search = '') =>
    apiGet(`admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getUserDetail: (_schoolId: SchoolId, id: string) =>
    apiGet(`admin/users/${id}`),

  toggleUserStatus: (_schoolId: SchoolId, id: string, status: 'active' | 'locked') =>
    apiPut(`admin/users/${id}/status`, { status }),

  async listStudents(schoolId: SchoolId, params?: { search?: string; page?: number; limit?: number }) {
    const result = await this.listUsers(schoolId, params?.search || '');
    const payload = result.data as { users?: AdminUser[] };
    const students = (payload.users || []).filter((user) => user.role !== 'teacher' && user.role !== 'admin');
    return { ...result, data: { students } };
  },

  createStudent: (_schoolId: SchoolId, data: Partial<AdminUser>) =>
    apiPost('admin/students', data),

  updateStudent: (_schoolId: SchoolId, id: string, data: Partial<AdminUser>) =>
    apiPut(`admin/students/${id}`, data),

  toggleStudentStatus: (_schoolId: SchoolId, id: string, status: 'active' | 'locked') =>
    apiPut(`admin/users/${id}/status`, { status }),

  async listTeachers(schoolId: SchoolId, params?: { search?: string; page?: number; limit?: number }) {
    const result = await this.listUsers(schoolId, params?.search || '');
    const payload = result.data as { users?: AdminUser[] };
    const teachers = (payload.users || [])
      .filter((user) => user.role === 'teacher')
      .map<AdminTeacher>((user) => ({
        id: user.id,
        teacherId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        subject: user.faculty,
        department: user.faculty,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
      }));
    return { ...result, data: { teachers } };
  },

  createTeacher: (_schoolId: SchoolId, data: Partial<AdminTeacher>) =>
    apiPost('admin/teachers', data),

  updateTeacher: (_schoolId: SchoolId, id: string, data: Partial<AdminTeacher>) =>
    apiPut(`admin/teachers/${id}`, data),

  toggleTeacherStatus: (_schoolId: SchoolId, id: string, status: 'active' | 'locked') =>
    apiPut(`admin/users/${id}/status`, { status }),

  getStatistics: (_schoolId: SchoolId) =>
    apiGet('admin/statistics'),

  getAiLogs: (_schoolId: SchoolId) =>
    apiGet('admin/ai-logs'),

  getAdminLogs: (_schoolId: SchoolId) =>
    apiGet('admin/logs'),

  getCatalog: (_schoolId: SchoolId) =>
    apiGet('admin/catalog'),
};
