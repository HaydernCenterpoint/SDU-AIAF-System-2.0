'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

interface Grade {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: number;
  letterGrade: string;
  semester: string;
}

export function GradesPage() {
  const { token } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/grades`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setGrades(data.grades || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  const gpa =
    grades.length > 0 && totalCredits > 0
      ? (grades.reduce((sum, grade) => sum + grade.grade * grade.credits, 0) / totalCredits).toFixed(2)
      : '0.00';

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Điểm số</p>
        <h1 className="mt-1 text-2xl font-black text-text">Kết quả học tập</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="GPA tích lũy" value={loading ? '...' : gpa} primary />
        <Summary label="Số môn đã học" value={loading ? '...' : String(grades.length)} />
        <Summary label="Tổng tín chỉ" value={loading ? '...' : String(totalCredits)} />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-black text-text">Bảng điểm</h2>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm font-semibold text-text-muted">Đang tải bảng điểm...</p>
        ) : grades.length === 0 ? (
          <p className="p-8 text-center text-sm font-semibold text-text-muted">Chưa có điểm môn nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-alt text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-black">Mã môn</th>
                  <th className="px-5 py-3 font-black">Tên môn</th>
                  <th className="px-5 py-3 text-center font-black">TC</th>
                  <th className="px-5 py-3 text-center font-black">Điểm</th>
                  <th className="px-5 py-3 text-center font-black">Chữ</th>
                  <th className="px-5 py-3 text-center font-black">Học kỳ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-primary-bg/50">
                    <td className="px-5 py-4 font-bold text-primary">{grade.courseCode}</td>
                    <td className="px-5 py-4 font-semibold text-text">{grade.courseName}</td>
                    <td className="px-5 py-4 text-center text-text-sub">{grade.credits}</td>
                    <td className="px-5 py-4 text-center font-black text-text">{grade.grade}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-primary-bg px-3 py-1 text-xs font-black text-primary">
                        {grade.letterGrade}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-text-sub">{grade.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

function Summary({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-card ${primary ? 'border-primary-border bg-primary-bg' : 'border-border bg-white'}`}>
      <p className="text-sm font-bold text-text-sub">{label}</p>
      <p className={`mt-2 text-3xl font-black ${primary ? 'text-primary' : 'text-text'}`}>{value}</p>
    </div>
  );
}
