'use client';

import { useState } from 'react';

const NTD_PRIMARY = '#4D97FF';
const NTD_PRIMARY_DARK = '#0F3460';
const NTD_ACCENT = '#FCDC62';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', emoji: '📚' },
  { id: 'toan', label: 'Toán', emoji: '📐' },
  { id: 'van', label: 'Ngữ văn', emoji: '📖' },
  { id: 'anh', label: 'Tiếng Anh', emoji: '🌍' },
  { id: 'ly', label: 'Vật lý', emoji: '⚡' },
  { id: 'hoa', label: 'Hóa học', emoji: '🧪' },
  { id: 'sinh', label: 'Sinh học', emoji: '🧬' },
  { id: 'su', label: 'Lịch sử', emoji: '🏛️' },
  { id: 'dia', label: 'Địa lý', emoji: '🌍' },
  { id: 'gdcd', label: 'GDCD', emoji: '⚖️' },
];

const DEMO_DOCS = [
  { id: 'd1', title: 'Tổng hợp công thức Toán lớp 12', subject: 'toan', type: 'PDF', size: 4.2, pages: 28, updated: '2026-04-28', color: '#4D97FF', featured: true, desc: 'Tất cả công thức: đạo hàm, tích phân, số phức, hình học không gian, xác suất.' },
  { id: 'd2', title: 'Bộ đề thi thử Toán 2026 (50 đề)', subject: 'toan', type: 'PDF', size: 18.7, pages: 320, updated: '2026-05-02', color: '#4D97FF', featured: true, desc: 'Bộ đề thi thử theo cấu trúc BGD 2026, có lời giải chi tiết và phân tích.' },
  { id: 'd3', title: 'Ngữ văn 12: Phân tích tác phẩm trọng tâm', subject: 'van', type: 'PDF', size: 6.1, pages: 95, updated: '2026-04-20', color: '#10B981', featured: true, desc: 'Phân tích Văn học, Nghị luận xã hội, Nghị luận văn học - đầy đủ.' },
  { id: 'd4', title: 'Từ vựng & Ngữ pháp Tiếng Anh ôn thi THPT', subject: 'anh', type: 'PDF', size: 3.8, pages: 64, updated: '2026-04-25', color: '#F59E0B', featured: false, desc: '3500 từ vựng theo chủ đề, ngữ pháp trọng tâm, bài tập vận dụng.' },
  { id: 'd5', title: 'Lý thuyết Vật lý 12: 8 chương', subject: 'ly', type: 'PDF', size: 5.5, pages: 72, updated: '2026-04-18', color: '#8B5CF6', featured: false, desc: 'Tóm tắt lý thuyết từng chương, công thức quan trọng, mẹo nhớ nhanh.' },
  { id: 'd6', title: 'Bộ đề thi thử Lý 2026 (30 đề)', subject: 'ly', type: 'PDF', size: 12.3, pages: 210, updated: '2026-05-01', color: '#8B5CF6', featured: false, desc: 'Đề thi thử có ma trận, đáp án và giải thích chi tiết từng phương án.' },
  { id: 'd7', title: 'Hóa học hữu cơ: Lý thuyết + Bài tập', subject: 'hoa', type: 'PDF', size: 7.2, pages: 110, updated: '2026-04-22', color: '#EF4444', featured: false, desc: 'Tổng hợp phản ứng hữu cơ, đồng phân, danh pháp và 200 bài tập.' },
  { id: 'd8', title: 'Sinh học 12: Di truyền học full', subject: 'sinh', type: 'PDF', size: 8.9, pages: 130, updated: '2026-04-15', color: '#06B6D4', featured: false, desc: 'ADN, ARN, Protein, Quy luật di truyền, Di truyền quần thể, Ứng dụng di truyền.' },
  { id: 'd9', title: 'Đề minh họa BGD 2026 - Tất cả môn', subject: 'all', type: 'PDF', size: 45.0, pages: 450, updated: '2026-05-05', color: '#4D97FF', featured: true, desc: 'Bộ đề minh họa chính thức của Bộ GD&ĐT năm 2026, đầy đủ các môn.' },
  { id: 'd10', title: 'Lịch sử 12: Timeline & Sơ đồ ôn tập', subject: 'su', type: 'PPTX', size: 22.1, pages: 88, updated: '2026-04-10', color: '#F97316', featured: false, desc: 'Sơ đồ timeline lịch sử Việt Nam & Thế giới, các mốc quan trọng.' },
  { id: 'd11', title: 'Địa lý tự nhiên & Kinh tế Việt Nam', subject: 'dia', type: 'PDF', size: 9.4, pages: 140, updated: '2026-04-12', color: '#22C55E', featured: false, desc: 'Địa lý tự nhiên, địa lý dân cư, địa lý các vùng kinh tế Việt Nam.' },
  { id: 'd12', title: 'GDCD 12: Tóm tắt và bài tập', subject: 'gdcd', type: 'PDF', size: 2.8, pages: 45, updated: '2026-04-08', color: '#EC4899', featured: false, desc: 'Tóm tắt 9 chủ đề GDCD, câu hỏi tình huống và đáp án.' },
];

const SUBJECT_COLORS: Record<string, string> = {
  toan: '#4D97FF', van: '#10B981', anh: '#F59E0B', ly: '#8B5CF6',
  hoa: '#EF4444', sinh: '#06B6D4', su: '#F97316', dia: '#22C55E', gdcd: '#EC4899',
};

export function NtdDocumentsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const filtered = DEMO_DOCS.filter(d => {
    const matchCat = activeCategory === 'all' || d.subject === activeCategory || activeCategory === 'd';
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = DEMO_DOCS.filter(d => d.featured);

  const selected = DEMO_DOCS.find(d => d.id === selectedDoc);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[24px] border border-[#dbeafe] bg-gradient-to-br from-white via-[#f0f7ff] to-[#eff6ff] p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${NTD_PRIMARY}20` }}>📚</span>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: NTD_PRIMARY }}>Thư viện tài liệu</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: NTD_PRIMARY_DARK }}>
          Tài liệu ôn thi đại học
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Hệ thống tài liệu ôn thi tốt nghiệp THPT & xét tuyển đại học 2026
        </p>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              className="w-full rounded-full border-2 border-[#dbeafe] bg-white py-3 pl-11 pr-5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4D97FF] focus:ring-4 focus:ring-[#4D97FF]/10"
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      {search === '' && (
        <div>
          <h2 className="mb-3 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Nổi bật</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                className="group text-left rounded-2xl border-2 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: selectedDoc === doc.id ? doc.color : `${doc.color}30` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: `${doc.color}15`, color: doc.color }}>📄</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: doc.color }}>{doc.type}</span>
                    <p className="text-xs text-slate-400">{doc.size} MB · {doc.pages} trang</p>
                  </div>
                </div>
                <h3 className="font-black text-slate-800 transition-colors group-hover:text-[#4D97FF]">{doc.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{doc.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${doc.color}15`, color: doc.color }}>{doc.subject.toUpperCase()}</span>
                  <span className="text-[10px] text-slate-400">Cập nhật: {doc.updated}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="mb-3 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>Danh mục</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === 'all' ? 'all' : cat.id)}
              className="rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:scale-95"
              style={activeCategory === (cat.id === 'all' ? 'all' : cat.id) ? {
                background: cat.id === 'all' ? `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_PRIMARY_DARK})` : `${SUBJECT_COLORS[cat.id] || NTD_PRIMARY}15`,
                borderColor: cat.id === 'all' ? 'transparent' : (SUBJECT_COLORS[cat.id] || NTD_PRIMARY),
                color: cat.id === 'all' ? 'white' : (SUBJECT_COLORS[cat.id] || NTD_PRIMARY),
              } : {
                borderColor: `${SUBJECT_COLORS[cat.id] || '#94a3b8'}40`,
                color: '#64748b',
                background: 'white',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div>
        <h2 className="mb-3 text-lg font-black" style={{ color: NTD_PRIMARY_DARK }}>
          {filtered.length} tài liệu {activeCategory !== 'all' ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'tất cả'}
        </h2>
        <div className="space-y-3">
          {filtered.map(doc => {
            const isSelected = selectedDoc === doc.id;
            return (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDoc(isSelected ? null : doc.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDoc(isSelected ? null : doc.id); } }}
                className="w-full text-left rounded-2xl border-2 border-slate-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ borderColor: isSelected ? doc.color : undefined }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${doc.color}12` }}>
                    📄
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-800">{doc.title}</h3>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: `${doc.color}15`, color: doc.color }}>{doc.type}</span>
                    </div>
                    <p className="text-sm text-slate-500">{doc.desc}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400">{doc.size} MB</span>
                      <span className="text-xs font-semibold text-slate-400">{doc.pages} trang</span>
                      <span className="text-xs font-semibold text-slate-400">Cập nhật {doc.updated}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      className="rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all active:scale-95"
                      style={{ borderColor: doc.color, color: doc.color, background: `${doc.color}10` }}
                      onClick={e => e.stopPropagation()}
                    >
                      Tải về ↓
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <h4 className="font-black text-slate-800">Nội dung tài liệu</h4>
                    <p className="mt-2 text-sm text-slate-600">{doc.desc}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${NTD_PRIMARY}, ${NTD_PRIMARY_DARK})` }}>
                        📖 Đọc online
                      </button>
                      <button className="rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all active:scale-95" style={{ borderColor: `${NTD_PRIMARY}40`, color: NTD_PRIMARY }}>
                        📤 Chia sẻ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
            <span className="text-5xl">📭</span>
            <p className="mt-4 text-lg font-black text-slate-400">Không tìm thấy tài liệu</p>
            <p className="mt-1 text-sm text-slate-400">Thử tìm kiếm với từ khóa khác.</p>
          </div>
        )}
      </div>
    </section>
  );
}
