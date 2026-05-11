'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { SchoolId, AdminStatistics, AiLog, AdminLog } from '@/lib/admin-api';
import type { SchoolConfig } from '@/lib/school-config';
import styles from './SchoolAdminDashboard.module.css';

type Props = {
  school: SchoolConfig;
};

const defaultStats: AdminStatistics = {
  totalUsers: 0,
  activeUsers: 0,
  lockedUsers: 0,
  totalStudents: 0,
  totalTeachers: 0,
  aiUsage: { totalQueries: 0 },
};

export function SchoolAdminDashboard({ school }: Props) {
  const [stats, setStats] = useState<AdminStatistics>(defaultStats);
  const [aiLogs, setAiLogs] = useState<AiLog[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statResult, aiResult, logResult] = await Promise.all([
        adminApi.getStatistics(school.id).catch(() => null),
        adminApi.getAiLogs(school.id).catch(() => null),
        adminApi.getAdminLogs(school.id).catch(() => null),
      ]);
      if (statResult) setStats((statResult.data as { statistics: AdminStatistics }).statistics ?? defaultStats);
      if (aiResult) setAiLogs((aiResult.data as { logs: AiLog[] }).logs ?? []);
      if (logResult) setAdminLogs((logResult.data as { logs: AdminLog[] }).logs ?? []);
    } catch {
      // API errors handled gracefully — dashboard shows zeros
    } finally {
      setIsLoading(false);
    }
  }, [school.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const statCards = [
    { label: `Tổng ${school.studentLabel.toLowerCase()}`, value: stats.totalStudents, icon: '🎓' },
    { label: `Tổng ${school.teacherLabel.toLowerCase()}`, value: stats.totalTeachers, icon: '👨‍🏫' },
    { label: 'Người dùng hoạt động', value: stats.activeUsers, icon: '✅' },
    { label: 'Tài khoản bị khóa', value: stats.lockedUsers, icon: '🔒' },
    { label: 'Lượt AI hỏi đáp', value: stats.aiUsage.totalQueries, icon: '🤖' },
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: '👥' },
  ];

  return (
    <>
      {/* ── Header ── */}
      <section className={styles.headerCard}>
        <div className={styles.headerBadge}>{school.shortName}</div>
        <h1 className={styles.headerTitle}>Dashboard Tổng quan</h1>
        <p className={styles.headerSub}>{school.name} — Hệ thống quản trị</p>
      </section>

      {/* ── Stats Grid ── */}
      <div className={styles.statGrid}>
        {statCards.map((card) => (
          <article key={card.label} className={styles.statCard}>
            <div className={styles.statIcon}>{card.icon}</div>
            <div>
              <p className={styles.statLabel}>{card.label}</p>
              <p className={styles.statValue}>
                {isLoading ? '—' : card.value.toLocaleString('vi-VN')}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* ── Chart placeholder ── */}
      <section className={styles.chartCard}>
        <h2 className={styles.sectionTitle}>Thống kê hoạt động</h2>
        <div className={styles.barChart}>
          {statCards.slice(0, 4).map((card, i) => (
            <div key={i} className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max(12, Math.min(100, (card.value / Math.max(stats.totalUsers, 1)) * 100))}%`,
                  background: `var(--admin-primary)`,
                  opacity: 0.6 + i * 0.1,
                }}
              />
              <span className={styles.barLabel}>{card.label.split(' ').slice(-1)[0]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Logs ── */}
      <div className={styles.logsGrid}>
        <section className={styles.logCard}>
          <h2 className={styles.sectionTitle}>Lịch sử truy vấn AI</h2>
          <div className={styles.logList}>
            {aiLogs.length > 0
              ? aiLogs.slice(0, 8).map((log, i) => (
                <div key={i} className={styles.logItem}>
                  <span className={styles.logDot} />
                  <span>{log.assistantType ?? 'AI'} · {log.message ?? '—'}</span>
                </div>
              ))
              : <p className={styles.emptyState}>Chưa có dữ liệu truy vấn AI.</p>
            }
          </div>
        </section>

        <section className={styles.logCard}>
          <h2 className={styles.sectionTitle}>Nhật ký quản trị</h2>
          <div className={styles.logList}>
            {adminLogs.length > 0
              ? adminLogs.slice(0, 8).map((log) => (
                <div key={log.id} className={styles.logItem}>
                  <span className={styles.logDot} />
                  <span>{log.action} · {log.targetUserId ?? ''}</span>
                </div>
              ))
              : <p className={styles.emptyState}>Chưa có nhật ký hoạt động.</p>
            }
          </div>
        </section>
      </div>
    </>
  );
}
