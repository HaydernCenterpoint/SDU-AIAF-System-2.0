'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

type Contact = { name: string; phone?: string | null; zalo?: string | null; email?: string | null; address?: string | null; method?: string; note?: string | null; };
type Job = { id: string; title: string; employer: string; description?: string | null; pay: string; region: string; schedule: string; sourceType: string; riskLevel: string; sourceLabel: string; sourceUrl?: string; tags: string[]; postedAt?: string; expiresAt?: string; contact?: Contact; };
type Source = { id: string; name: string; sourceType: string; count?: number; status?: string; };

const riskBadge: Record<string, { l: string; c: string }> = {
  low: { l: 'Tin cậy cao', c: 'bg-[#EAFBF1] text-[#17834A] ring-[#BCEBCF]' },
  medium: { l: 'Cần xác minh', c: 'bg-[#FFF8D6] text-[#9A6700] ring-[#FFE58A]' },
  high: { l: 'Rủi ro cao', c: 'bg-[#FFF0F0] text-[#E31D1C] ring-[#FFC4C4]' },
};
const srcTone: Record<string, string> = { student: 'bg-[#E9F9FF] text-[#1784DA]', employer: 'bg-[#FFF8D6] text-[#9A6700]', admin: 'bg-[#EAFBF1] text-[#17834A]', crawler: 'bg-[#FFF0F0] text-[#E31D1C]' };
const FILTERS = ['Chí Linh', 'Hải Dương', 'Ca tối', 'Lương theo giờ', 'Nguồn công khai', 'Tin cậy cao'];

export function CoursesPage() {
  const { token } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Job | null>(null);
  const [filter, setFilter] = useState('');
  const [postOpen, setPostOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }), [token]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/jobs`, { headers }).then(r => r.ok ? r.json() : { jobs: [] }),
      fetch(`${API}/job-sources`, { headers }).then(r => r.ok ? r.json() : { sources: [] }),
    ]).then(([j, s]) => { setJobs(j.jobs || []); setSources(s.sources || []); }).finally(() => setLoading(false));
  }, [token, headers]);

  const filtered = useMemo(() => {
    if (!filter) return jobs;
    const q = filter.toLowerCase();
    return jobs.filter(j => `${j.title} ${j.region} ${j.tags.join(' ')} ${j.pay} ${j.sourceLabel} ${j.riskLevel}`.toLowerCase().includes(q));
  }, [jobs, filter]);

  const toggleSave = (id: string) => setSaved(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handlePost = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    if (!title) return;
    fetch(`${API}/jobs`, {
      method: 'POST', headers, body: JSON.stringify({
        title, employer: fd.get('employer'), pay: fd.get('pay'), region: fd.get('region') || 'Chí Linh',
        schedule: fd.get('schedule'), contactName: fd.get('cname'), contactPhone: fd.get('cphone'),
        contactZalo: fd.get('czalo'), contactEmail: fd.get('cemail'), contactMethod: fd.get('cmethod'),
      })
    }).then(r => r.json()).then(d => { if (d.job) { setJobs(p => [d.job, ...p]); setPostOpen(false); } });
  };

  const ago = (d?: string) => { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m} phút trước`; if (m < 1440) return `${Math.floor(m / 60)} giờ trước`; return `${Math.floor(m / 1440)} ngày trước`; };

  return (
    <section className="space-y-5">
      {/* Header */}
      <header className="academic-card relative overflow-hidden bg-white/88 p-6 shadow-[0_24px_70px_rgba(23,132,218,0.12)]">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#1784DA]/18 blur-sm" />
        <div className="absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-[#F7D428]/22 blur-sm" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31D1C]">Công việc</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#112641]">Việc làm quanh Chí Linh – Hải Dương</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#64748B]">
              Hệ thống tự động cào dữ liệu từ nguồn công khai và hiển thị việc làm quanh khu vực Sao Đỏ. Bấm <strong>Liên hệ</strong> để xem chi tiết thông tin liên lạc.
            </p>
          </div>
          <button onClick={() => setPostOpen(true)} className="student-os-hover rounded-2xl bg-gradient-to-r from-[#E31D1C] via-[#FF6A1A] to-[#1784DA] px-5 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(227,29,28,0.22)]">Đăng việc nhanh</button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-4">
          {/* Filters */}
          <div className="rounded-[28px] border border-[#D7F3FF] bg-white/90 p-4 shadow-[0_18px_48px_rgba(23,132,218,0.08)]">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(p => p === f ? '' : f)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${filter === f ? 'border-[#1784DA] bg-[#1784DA] text-white' : 'border-[#BFEFFF] bg-[#F8FDFF] text-[#1784DA] hover:bg-[#E9F9FF]'}`}>{f}</button>
              ))}
            </div>
          </div>

          {/* Job Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1784DA] border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[28px] border border-[#D7F3FF] bg-white p-12 text-center">
              <p className="text-lg font-black text-[#112641]">Không tìm thấy công việc</p>
              <p className="mt-2 text-sm text-[#64748B]">Thử bỏ bộ lọc hoặc đăng việc mới.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map(job => {
                const r = riskBadge[job.riskLevel] || riskBadge.medium;
                return (
                  <article key={job.id} className="rounded-[28px] border border-[#D7F3FF] bg-white p-5 shadow-[0_18px_48px_rgba(23,132,218,0.08)] transition hover:shadow-[0_24px_60px_rgba(23,132,218,0.14)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${srcTone[job.sourceType] || srcTone.crawler}`}>{job.sourceLabel}</span>
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${r.c}`}>{r.l}</span>
                    </div>
                    <h2 className="mt-4 text-xl font-black leading-7 text-[#112641]">{job.title}</h2>
                    <p className="mt-2 text-sm font-bold text-[#64748B]">{job.employer}</p>
                    {job.postedAt && <p className="mt-1 text-[11px] font-semibold text-[#8A9AAF]">Đăng {ago(job.postedAt)}</p>}
                    <div className="mt-4 grid gap-2 text-sm font-bold text-[#334155] sm:grid-cols-3">
                      <Inf l="Lương" v={job.pay} /><Inf l="Khu vực" v={job.region} /><Inf l="Thời gian" v={job.schedule} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map(t => <span key={t} className="rounded-full bg-[#F1F5FF] px-3 py-1 text-xs font-black text-[#64748B]">{t}</span>)}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => setSelected(job)} className="rounded-2xl bg-[#112641] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1784DA]">Liên hệ</button>
                      <button onClick={() => toggleSave(job.id)} className={`rounded-2xl border px-4 py-2.5 text-sm font-black transition ${saved.has(job.id) ? 'border-[#17834A] bg-[#EAFBF1] text-[#17834A]' : 'border-[#BFEFFF] bg-white text-[#1784DA]'}`}>
                        {saved.has(job.id) ? '✓ Đã lưu' : 'Lưu'}
                      </button>
                      <button className="rounded-2xl border border-[#FFC4C4] bg-[#FFF8F8] px-4 py-2.5 text-sm font-black text-[#E31D1C]">Báo cáo</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#BFEFFF] bg-[#F8FDFF] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Đăng việc nhanh</p>
            <h2 className="mt-2 text-lg font-black text-[#112641]">Tạo cơ hội cho sinh viên</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">Bài đăng hiển thị ngay với nhãn nguồn. Bấm Liên hệ để xem chi tiết.</p>
            <button onClick={() => setPostOpen(true)} className="mt-4 w-full rounded-2xl bg-[#E31D1C] px-4 py-3 text-sm font-black text-white">Tạo bài đăng</button>
          </section>
          <section className="rounded-[28px] border border-[#FFE58A] bg-[#FFFBE8] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9A6700]">Nguồn đang quét</p>
            <div className="mt-4 space-y-3">
              {sources.map(s => (
                <div key={s.id} className="rounded-2xl bg-white/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-[#112641]">{s.name}</p>
                    <span className="rounded-full bg-[#E9F9FF] px-2.5 py-1 text-xs font-black text-[#1784DA]">{s.count ?? 0}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#64748B]">{s.sourceType} · {s.status}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] border border-[#FFC4C4] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31D1C]">Cảnh báo an toàn</p>
            <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-[#64748B]">
              <li>● Không chuyển khoản hoặc đặt cọc trước khi xác minh.</li>
              <li>● Ưu tiên nguồn nhà trường, doanh nghiệp rõ địa chỉ.</li>
              <li>● Bấm Báo cáo nếu bài yêu cầu phí hồ sơ.</li>
            </ul>
          </section>
        </aside>
      </div>

      {/* Contact Detail Modal */}
      {selected && <ContactModal job={selected} onClose={() => setSelected(null)} />}

      {/* Quick Post Dialog */}
      {postOpen && <PostDialog onClose={() => setPostOpen(false)} onSubmit={handlePost} />}
    </section>
  );
}

function ContactModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const c = job.contact;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#112641]/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[32px] border border-[#BFEFFF] bg-white shadow-[0_30px_90px_rgba(17,38,65,0.3)]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-[#E6EEFF] p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Chi tiết công việc</p>
              <h2 className="mt-2 text-xl font-black text-[#112641] leading-7">{job.title}</h2>
              <p className="mt-1 text-sm font-bold text-[#64748B]">{job.employer}</p>
            </div>
            <button onClick={onClose} className="shrink-0 rounded-full bg-[#F1F5FF] p-2 text-[#112641] transition hover:bg-[#E6EEFF]" aria-label="Đóng">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A9AAF] mb-2">Mô tả công việc</p>
              <p className="text-sm font-semibold leading-6 text-[#334155]">{job.description}</p>
            </div>
          )}

          {/* Job Info Grid */}
          <div className="grid gap-2 sm:grid-cols-3">
            <Inf l="Lương" v={job.pay} /><Inf l="Khu vực" v={job.region} /><Inf l="Thời gian" v={job.schedule} />
          </div>

          {/* Contact Section */}
          {c && (
            <div className="rounded-2xl border border-[#BFEFFF] bg-gradient-to-br from-[#F0F9FF] to-[#F8FDFF] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA] mb-4">Thông tin liên hệ</p>
              <div className="space-y-3">
                {c.name && <CRow icon="👤" label="Người liên hệ" value={c.name} />}
                {c.phone && <CRow icon="📞" label="Số điện thoại" value={c.phone} href={`tel:${c.phone.replace(/[.\s]/g, '')}`} />}
                {c.zalo && <CRow icon="💬" label="Zalo" value={c.zalo} href={`https://zalo.me/${c.zalo.replace(/[.\s]/g, '')}`} />}
                {c.email && <CRow icon="📧" label="Email" value={c.email} href={`mailto:${c.email}`} />}
                {c.address && <CRow icon="📍" label="Địa chỉ" value={c.address} />}

                {/* Google Maps embed + Directions */}
                {c.address && (() => {
                  const q = encodeURIComponent(c.address);
                  return (
                    <div className="mt-1 space-y-2">
                      <div className="overflow-hidden rounded-2xl border border-[#D7F3FF] shadow-sm">
                        <iframe
                          title="Bản đồ vị trí"
                          src={`https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="180"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl border border-[#1784DA] bg-[#E9F9FF] px-4 py-2.5 text-sm font-black text-[#1784DA] transition hover:bg-[#1784DA] hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                        Chỉ đường đến đây
                      </a>
                    </div>
                  );
                })()}

                {c.method && <CRow icon="📋" label="Cách liên hệ" value={c.method} highlight />}
                {c.note && (
                  <div className="mt-3 rounded-xl border border-[#FFE58A] bg-[#FFFBE8] p-3">
                    <p className="text-xs font-black text-[#9A6700]">📌 Ghi chú</p>
                    <p className="mt-1 text-sm font-semibold text-[#64748B] leading-6">{c.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source info */}
          {job.sourceUrl && job.sourceUrl.startsWith('http') && (
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-[#D7F3FF] bg-white p-3 text-center text-sm font-black text-[#1784DA] transition hover:bg-[#E9F9FF]">
              🔗 Xem bài đăng gốc
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CRow({ icon, label, value, href, highlight }: { icon: string; label: string; value: string; href?: string; highlight?: boolean }) {
  const content = href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#1784DA] underline underline-offset-2 hover:text-[#112641]">{value}</a> : <span>{value}</span>;
  return (
    <div className={`flex gap-3 rounded-xl p-2.5 ${highlight ? 'bg-[#E9F9FF]' : ''}`}>
      <span className="shrink-0 text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8A9AAF]">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-[#112641] break-words">{content}</p>
      </div>
    </div>
  );
}

function Inf({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-2xl border border-[#E6EEFF] bg-white p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8A9AAF]">{l}</p>
      <p className="mt-1 text-sm font-black text-[#112641]">{v}</p>
    </div>
  );
}

function PostDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const mapQuery = address || 'Sao Đỏ, Chí Linh, Hải Dương';

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => { setLocating(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#112641]/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={onSubmit} className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-[#BFEFFF] bg-white shadow-[0_30px_90px_rgba(17,38,65,0.28)]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white rounded-t-[32px] p-6 pb-4 border-b border-[#E6EEFF]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1784DA]">Đăng việc nhanh</p>
              <h2 className="mt-2 text-2xl font-black text-[#112641]">Tạo bài đăng mới</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-[#F1F5FF] px-3 py-2 text-sm font-black text-[#112641]">Đóng</button>
          </div>
        </div>
        <div className="p-6 pt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FI name="title" label="Tên công việc *" ph="VD: Gia sư Toán lớp 9" req />
            <FI name="employer" label="Đơn vị/người đăng" ph="VD: CLB Sinh viên" />
            <FI name="pay" label="Lương" ph="VD: 100.000đ/giờ" />
            <FI name="region" label="Khu vực" ph="VD: Chí Linh" />
            <div className="sm:col-span-2"><FI name="schedule" label="Thời gian *" ph="VD: 18:00 - 22:00" req /></div>
          </div>
          {/* Location Picker */}
          <div className="rounded-2xl border border-[#BFEFFF] bg-gradient-to-br from-[#F0F9FF] to-[#F8FDFF] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1784DA] mb-3 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Vị trí công việc
            </p>
            <div className="flex gap-2 mb-3">
              <input name="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ: VD: 24 Thái Học, Sao Đỏ" className="flex-1 rounded-xl border border-[#D7F3FF] bg-white px-3.5 py-2.5 text-sm font-bold text-[#112641] outline-none transition focus:border-[#1784DA] focus:ring-4 focus:ring-[#1784DA]/10" />
              <button type="button" onClick={useCurrentLocation} disabled={locating} className="shrink-0 rounded-xl bg-[#1784DA] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#1269B0] disabled:opacity-50 flex items-center gap-1.5" title="Dùng vị trí hiện tại">
                {locating ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14 2.83 2.83m4.48 4.48 2.83 2.83"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3m7-10h3M2 12h3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 3"/></svg>
                )}
                <span className="hidden sm:inline">{locating ? 'Đang lấy...' : 'Vị trí của tôi'}</span>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#D7F3FF] shadow-sm" style={{ height: 180 }}>
              <iframe title="Vị trí công việc" width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} />
            </div>
            <p className="mt-2 text-[10px] font-semibold text-[#94A3B8]">📍 Bản đồ cập nhật theo địa chỉ bạn nhập.</p>
          </div>
          {/* Contact info */}
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">Thông tin liên hệ</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FI name="cname" label="Tên liên hệ" ph="Họ tên" />
            <FI name="cphone" label="SĐT" ph="0xxx.xxx.xxx" />
            <FI name="czalo" label="Zalo" ph="Số Zalo" />
            <FI name="cemail" label="Email" ph="email@..." />
            <div className="sm:col-span-2"><FI name="cmethod" label="Cách liên hệ" ph="VD: Nhắn Zalo trước 21h" /></div>
          </div>
          <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-[#E31D1C] to-[#1784DA] px-5 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(227,29,28,0.2)]">Đăng ngay</button>
        </div>
      </form>
    </div>
  );
}

function FI({ name, label, ph, req }: { name: string; label: string; ph: string; req?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">{label}</span>
      <input name={name} placeholder={ph} required={req}
        className="w-full rounded-2xl border border-[#D7F3FF] bg-[#F8FDFF] px-4 py-3 text-sm font-bold text-[#112641] outline-none transition focus:border-[#1784DA] focus:bg-white focus:ring-4 focus:ring-[#1784DA]/10" />
    </label>
  );
}
