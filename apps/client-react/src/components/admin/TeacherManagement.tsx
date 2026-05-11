'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminTeacher } from '@/lib/admin-api';
import type { SchoolConfig } from '@/lib/school-config';
import styles from './ManagementTable.module.css';

type Props = {
  school: SchoolConfig;
};

export function TeacherManagement({ school }: Props) {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);

  const loadTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await adminApi.listTeachers(school.id, { search });
      if (result) {
        const data = result.data as { teachers?: AdminTeacher[] };
        setTeachers(data.teachers ?? []);
      }
    } catch {
      // Graceful handling
    } finally {
      setIsLoading(false);
    }
  }, [school.id, search]);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  async function handleToggleStatus(teacher: AdminTeacher) {
    try {
      const next = teacher.status === 'locked' ? 'active' : 'locked';
      await adminApi.toggleTeacherStatus(school.id, teacher.id, next);
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? { ...t, status: next } : t))
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
            <h1 className={styles.headerTitle}>Quản lý {school.teacherLabel}</h1>
            <p className={styles.headerSub}>
              Danh sách {school.teacherLabel.toLowerCase()} — {school.name}
            </p>
          </div>
          <div className={styles.headerActions}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm kiếm ${school.teacherLabel.toLowerCase()}...`}
              className={styles.searchInput}
              aria-label={`Tìm kiếm ${school.teacherLabel.toLowerCase()}`}
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
                <th>{school.teacherIdLabel}</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>{school.id === 'ntd' ? 'Bộ môn' : 'Khoa'}</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className={styles.emptyRow}>Đang tải dữ liệu...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyRow}>Không tìm thấy {school.teacherLabel.toLowerCase()} nào.</td></tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className={styles.idCell}>{teacher.teacherId}</td>
                    <td className={styles.nameCell}>{teacher.fullName}</td>
                    <td>{teacher.email}</td>
                    <td>{school.id === 'ntd' ? teacher.subject : teacher.department}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${teacher.status === 'active' ? styles.statusActive : styles.statusLocked}`}>
                        {teacher.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedTeacher(teacher)}
                        aria-label="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                      <button
                        className={teacher.status === 'active' ? styles.lockBtn : styles.unlockBtn}
                        onClick={() => handleToggleStatus(teacher)}
                        aria-label={teacher.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {teacher.status === 'active' ? 'Khóa' : 'Mở khóa'}
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
      {selectedTeacher && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedTeacher(null)} role="dialog" aria-modal="true">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Thông tin {school.teacherLabel}</h2>
            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>{school.teacherIdLabel}</span>
                <span className={styles.modalValue}>{selectedTeacher.teacherId}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Họ tên</span>
                <span className={styles.modalValue}>{selectedTeacher.fullName}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Email</span>
                <span className={styles.modalValue}>{selectedTeacher.email}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>{school.id === 'ntd' ? 'Bộ môn' : 'Khoa'}</span>
                <span className={styles.modalValue}>{school.id === 'ntd' ? selectedTeacher.subject : selectedTeacher.department}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Trạng thái</span>
                <span className={`${styles.statusBadge} ${selectedTeacher.status === 'active' ? styles.statusActive : styles.statusLocked}`}>
                  {selectedTeacher.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
              {selectedTeacher.phone && (
                <div className={styles.modalField}>
                  <span className={styles.modalLabel}>Số điện thoại</span>
                  <span className={styles.modalValue}>{selectedTeacher.phone}</span>
                </div>
              )}
            </div>
            <button className={styles.modalClose} onClick={() => setSelectedTeacher(null)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}
