'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/admin-api';
import type { SchoolConfig } from '@/lib/school-config';
import styles from './ManagementTable.module.css';

type Props = {
  school: SchoolConfig;
};

export function StudentManagement({ school }: Props) {
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<AdminUser | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await adminApi.listStudents(school.id, { search });
      if (result) {
        const data = result.data as { students?: AdminUser[]; users?: AdminUser[] };
        setStudents(data.students ?? data.users ?? []);
      }
    } catch {
      // Graceful handling
    } finally {
      setIsLoading(false);
    }
  }, [school.id, search]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  async function handleToggleStatus(student: AdminUser) {
    try {
      const next = student.status === 'locked' ? 'active' : 'locked';
      await adminApi.toggleStudentStatus(school.id, student.id, next);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, status: next } : s))
      );
    } catch {
      // Error handling
    }
  }

  return (
    <>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.headerBadge}>{school.shortName}</div>
            <h1 className={styles.headerTitle}>Quản lý {school.studentLabel}</h1>
            <p className={styles.headerSub}>
              Danh sách {school.studentLabel.toLowerCase()} — {school.name}
            </p>
          </div>
          <div className={styles.headerActions}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm kiếm ${school.studentLabel.toLowerCase()}...`}
              className={styles.searchInput}
              aria-label={`Tìm kiếm ${school.studentLabel.toLowerCase()}`}
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{school.studentIdLabel}</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>{school.id === 'ntd' ? 'Lớp' : 'Khoa'}</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className={styles.emptyRow}>Đang tải dữ liệu...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyRow}>Không tìm thấy {school.studentLabel.toLowerCase()} nào.</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.idCell}>{student.studentId}</td>
                    <td className={styles.nameCell}>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{school.id === 'ntd' ? student.className : student.faculty}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${student.status === 'active' ? styles.statusActive : styles.statusLocked}`}>
                        {student.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedStudent(student)}
                        aria-label="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                      <button
                        className={student.status === 'active' ? styles.lockBtn : styles.unlockBtn}
                        onClick={() => handleToggleStatus(student)}
                        aria-label={student.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {student.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail modal */}
      {selectedStudent && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedStudent(null)} role="dialog" aria-modal="true">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Thông tin {school.studentLabel}</h2>
            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>{school.studentIdLabel}</span>
                <span className={styles.modalValue}>{selectedStudent.studentId}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Họ tên</span>
                <span className={styles.modalValue}>{selectedStudent.fullName}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Email</span>
                <span className={styles.modalValue}>{selectedStudent.email}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>{school.id === 'ntd' ? 'Lớp' : 'Khoa'}</span>
                <span className={styles.modalValue}>{school.id === 'ntd' ? selectedStudent.className : selectedStudent.faculty}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Trạng thái</span>
                <span className={`${styles.statusBadge} ${selectedStudent.status === 'active' ? styles.statusActive : styles.statusLocked}`}>
                  {selectedStudent.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
              {selectedStudent.phone && (
                <div className={styles.modalField}>
                  <span className={styles.modalLabel}>Số điện thoại</span>
                  <span className={styles.modalValue}>{selectedStudent.phone}</span>
                </div>
              )}
            </div>
            <button className={styles.modalClose} onClick={() => setSelectedStudent(null)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}
