'use client';

import { FormEvent, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { formatDocumentSize } from '@/lib/document-filters.mjs';
import type { DocumentFilters, DocumentItem } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

const emptyFilters: DocumentFilters = { search: '', tag: '', createdFrom: '', createdTo: '', updatedFrom: '', updatedTo: '' };
const demoOwner = { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' };

const TAG_COLORS = [
  'bg-[#FFE4E1] text-[#C0392B]',
  'bg-[#E8F5E9] text-[#2E7D32]',
  'bg-[#E3F2FD] text-[#1565C0]',
  'bg-[#FFF9C4] text-[#F57F17]',
  'bg-[#F3E5F5] text-[#7B1FA2]',
  'bg-[#E0F7FA] text-[#00695C]',
  'bg-[#FBE9E7] text-[#BF360C]',
];

const MIME_META: Record<string, { label: string; bg: string; color: string }> = {
  'application/pdf': { label: 'PDF', bg: '#FFE4E1', color: '#C0392B' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', bg: '#E8EAF6', color: '#3949AB' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', bg: '#E3F2FD', color: '#1565C0' },
  'application/zip': { label: 'ZIP', bg: '#FFF3E0', color: '#E65100' },
  'application/x-ipynb+json': { label: 'IPYNB', bg: '#F3E5F5', color: '#7B1FA2' },
};

const demoDocuments: DocumentItem[] = [
  mkDoc('demo-ai-1', 'Giáo trình Trí tuệ nhân tạo - Chương 1-4', 'Tổng quan AI, tìm kiếm heuristic, biểu diễn tri thức và suy diễn cho môn Trí tuệ nhân tạo.', ['AI', 'CS405', 'giáo trình', 'ôn thi'], 'AI_chuong_1_4.pdf', 'application/pdf', 8.9, '2026-04-29'),
  mkDoc('demo-flutter-1', 'Slide Lập trình Flutter: State management', 'Provider, Riverpod, Bloc và cách tổ chức trạng thái cho bài thực hành Flutter giữa kỳ.', ['Flutter', 'mobile', 'state', 'thực hành'], 'flutter_state.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5.4, '2026-04-28'),
  mkDoc('demo-csdl-1', 'Ngân hàng đề Cơ sở dữ liệu', 'Tổng hợp câu hỏi SQL, chuẩn hóa dữ liệu, ERD và transaction để luyện thi cuối kỳ.', ['CSDL', 'SQL', 'ôn thi', 'đề cương'], 'ngan_hang_de_csdl.pdf', 'application/pdf', 3.7, '2026-04-27'),
  mkDoc('demo-pttk-1', 'Bài tập lớn Phân tích thiết kế hệ thống', 'Mẫu đặc tả yêu cầu, use case, activity diagram và checklist nộp bài theo nhóm.', ['PTTK', 'UML', 'bài tập lớn', 'nhóm'], 'bai_tap_lon_pttk.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2.6, '2026-04-26'),
  mkDoc('demo-web-1', 'Tài liệu thực hành Web API Node.js', 'REST API, middleware xác thực, upload file và kiểm thử endpoint bằng Postman.', ['Web', 'Node.js', 'API', 'backend'], 'web_api_nodejs.pdf', 'application/pdf', 6.1, '2026-04-25'),
  mkDoc('demo-mang-1', 'Lab Mạng máy tính: VLAN và định tuyến tĩnh', 'Cấu hình VLAN, static route và kiểm tra ping trên Cisco Packet Tracer.', ['Mạng', 'VLAN', 'Packet Tracer', 'lab'], 'lab_vlan.pdf', 'application/pdf', 4.3, '2026-04-24'),
  mkDoc('demo-hdh-1', 'Tóm tắt Hệ điều hành: Process, Thread, Deadlock', 'Sơ đồ ôn tập tiến trình, luồng, đồng bộ và các dạng bài deadlock.', ['Hệ điều hành', 'deadlock', 'ôn tập'], 'he_dieu_hanh.pdf', 'application/pdf', 2.9, '2026-04-23'),
  mkDoc('demo-oop-1', 'Bài tập OOP Java có lời giải', 'Class, interface, kế thừa, đa hình và bài tập quản lý sinh viên.', ['Java', 'OOP', 'bài tập', 'lời giải'], 'oop_java.zip', 'application/zip', 11.2, '2026-04-22'),
];

export function DocumentsPage(_props?: { school?: 'ntd' | 'sdu' }) {
  const { documents, fetchDocuments, uploadDocument, updateDocument, deleteDocument, isLoading } = useAppStore();
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<DocumentFilters>(emptyFilters);
  const [status, setStatus] = useState('');
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({ title: '', description: '', tags: '' });

  const visibleDocs = useMemo(
    () => (documents.length > 0 ? documents : filterDemo(demoDocuments, filters)),
    [documents, filters],
  );

  const activeDetailDoc = useMemo(
    () => visibleDocs.find((document) => document.id === activeDetailId) || null,
    [activeDetailId, visibleDocs],
  );

  useEffect(() => {
    if (token) void fetchDocuments(token, filters);
  }, [fetchDocuments, filters, token]);

  useEffect(() => {
    if (activeDetailId && !activeDetailDoc) {
      setActiveDetailId(null);
      setIsEditingDetail(false);
    }
  }, [activeDetailDoc, activeDetailId]);

  useEffect(() => {
    if (!activeDetailId && !isUploadOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isUploadOpen) setIsUploadOpen(false);
      if (activeDetailId) {
        setActiveDetailId(null);
        setIsEditingDetail(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDetailId, isUploadOpen]);

  const setFilter = (key: keyof DocumentFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openDetailModal = (document: DocumentItem) => {
    setActiveDetailId(document.id);
    setIsEditingDetail(false);
  };

  const closeDetailModal = () => {
    setActiveDetailId(null);
    setIsEditingDetail(false);
  };

  const beginEditDetail = (document: DocumentItem) => {
    setEditDraft({
      title: document.title,
      description: document.description || '',
      tags: document.tags?.join(', ') || '',
    });
    setIsEditingDetail(true);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setStatus('Vui lòng đăng nhập để đăng tài liệu.');
      return;
    }

    const form = event.currentTarget;
    const result = await uploadDocument(token, new FormData(form));
    setStatus(result.success ? 'Đăng tài liệu thành công!' : result.error || 'Không thể đăng tài liệu.');

    if (result.success) {
      form.reset();
      setIsUploadOpen(false);
    }
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !activeDetailId) return;

    const result = await updateDocument(token, activeDetailId, editDraft);
    setStatus(result.success ? 'Đã lưu chỉnh sửa.' : result.error || 'Không thể cập nhật.');

    if (result.success) {
      setIsEditingDetail(false);
    }
  };

  const removeDoc = async (document: DocumentItem) => {
    if (!token) {
      setStatus('Vui lòng đăng nhập.');
      return;
    }

    const result = await deleteDocument(token, document.id);
    setStatus(result.success ? 'Đã xóa tài liệu.' : result.error || 'Không thể xóa.');

    if (result.success) {
      closeDetailModal();
    }
  };

  const downloadDoc = async (document: DocumentItem) => {
    if (document.id.startsWith('demo-')) {
      setStatus('Tài liệu demo chưa có file tải xuống.');
      return;
    }

    if (!token) {
      setStatus('Vui lòng đăng nhập để tải xuống.');
      return;
    }

    const response = await fetch(`${API_BASE}/documents/${document.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setStatus('Không thể tải xuống tài liệu.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.file.originalName || document.title;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Đang tải tài liệu xuống...');
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {status && (
        <div style={statusBannerStyle}>
          {status}
          <button onClick={() => setStatus('')} style={statusCloseButtonStyle}>×</button>
        </div>
      )}

      <div style={filterBarStyle}>
        <div style={filterBarRowStyle}>
          <div style={filterFieldsStyle}>
            <span style={filterIconStyle}>🔍</span>
            <input
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder="Tìm tên, tag..."
              style={{ ...compactInputStyle, width: 170 }}
            />
            <input
              value={filters.tag}
              onChange={(event) => setFilter('tag', event.target.value)}
              placeholder="Tag"
              style={{ ...compactInputStyle, width: 100 }}
            />
            <input
              type="date"
              value={filters.createdFrom}
              onChange={(event) => setFilter('createdFrom', event.target.value)}
              style={compactDateStyle}
            />
            <span style={filterArrowStyle}>→</span>
            <input
              type="date"
              value={filters.createdTo}
              onChange={(event) => setFilter('createdTo', event.target.value)}
              style={compactDateStyle}
            />
            <button onClick={() => setFilters(emptyFilters)} style={btnSecondary}>Xóa</button>
          </div>

          <button onClick={() => setIsUploadOpen(true)} style={{ ...btnPrimary, marginLeft: 'auto' }}>
            Đăng tài liệu
          </button>
        </div>
      </div>

      <div style={cardsGridStyle}>
        {isLoading && <EmptyCard text="Đang tải kho học liệu..." />}
        {!isLoading && visibleDocs.length === 0 && <EmptyCard text="Chưa có tài liệu. Hãy là người đầu tiên đăng tài liệu!" />}

        {!isLoading && visibleDocs.map((doc) => {
          const mime = MIME_META[doc.file?.mimeType || ''] || { label: 'FILE', bg: '#F1F5F9', color: '#475569' };
          const isActive = activeDetailId === doc.id;

          return (
            <article
              key={doc.id}
              onClick={() => openDetailModal(doc)}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                border: isActive ? '2.5px solid #38bdf8' : '2px solid #e2e8f0',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: mime.bg, color: mime.color, fontSize: 11, fontWeight: 900, letterSpacing: '0.06em' }}>
                  {mime.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{fmtDate(doc.updatedAt)}</span>
              </div>

              <h2 style={cardTitleStyle}>{doc.title}</h2>
              <p style={cardDescriptionStyle}>{doc.description || 'Chưa có mô tả.'}</p>
              <TagList tags={doc.tags} />

              <div style={cardMetaRowStyle}>
                <span style={cardMetaFileStyle}>{doc.file?.originalName}</span>
                <span>{formatDocumentSize(doc.file?.size ?? 0)}</span>
              </div>

              <div style={cardActionsStyle} onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => {
                    setActiveDetailId(doc.id);
                    setIsEditingDetail(false);
                  }}
                  style={btnPrimary}
                >
                  Chi tiết
                </button>
                <button onClick={() => void downloadDoc(doc)} style={btnSecondary}>Tải xuống</button>
                {doc.canManage && (
                  <button
                    onClick={() => {
                      setActiveDetailId(doc.id);
                      beginEditDetail(doc);
                    }}
                    style={btnSecondary}
                  >
                    Sửa
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {isUploadOpen && (
        <CenteredModal
          title="Đăng tài liệu"
          subtitle="Tải file lên, thêm mô tả và gắn tag để sinh viên lọc nhanh hơn."
          onClose={() => setIsUploadOpen(false)}
          footer={null}
        >
          <form onSubmit={handleUpload} style={modalFormStyle}>
            <VInput name="title" required placeholder="Tên tài liệu / mã môn" />
            <textarea
              name="description"
              rows={4}
              placeholder="Mô tả ngắn: nội dung, chương, giảng viên..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
            />
            <VInput name="tags" placeholder="Tag: CSDL, CS101, ôn thi" />
            <input name="file" required type="file" style={{ ...inputStyle, paddingTop: 12, paddingBottom: 12 }} />
            <p style={uploadHintStyle}>Tối đa 25 MB/file. Không hỗ trợ `.exe`, `.js`, `.sh`.</p>

            <div style={modalFooterStyle}>
              <button type="button" onClick={() => setIsUploadOpen(false)} style={btnSecondary}>Đóng</button>
              <button type="submit" style={btnPrimary}>Đăng tài liệu</button>
            </div>
          </form>
        </CenteredModal>
      )}

      {activeDetailDoc && (
        <CenteredModal
          title={isEditingDetail ? 'Chỉnh sửa tài liệu' : 'Chi tiết tài liệu'}
          subtitle={isEditingDetail ? 'Cập nhật thông tin hiển thị của tài liệu ngay trong modal này.' : 'Xem nhanh toàn bộ metadata và thao tác trực tiếp trên tài liệu.'}
          onClose={closeDetailModal}
          footer={null}
        >
          {isEditingDetail ? (
            <form onSubmit={submitEdit} style={modalFormStyle}>
              <VInput
                value={editDraft.title}
                onChange={(value) => setEditDraft({ ...editDraft, title: value })}
                placeholder="Tên tài liệu"
                required
              />
              <textarea
                value={editDraft.description}
                onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
                placeholder="Mô tả"
              />
              <VInput
                value={editDraft.tags}
                onChange={(value) => setEditDraft({ ...editDraft, tags: value })}
                placeholder="Tags"
              />

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={() => setIsEditingDetail(false)}
                  style={btnSecondary}
                >
                  Hủy
                </button>
                <button type="submit" style={btnPrimary}>Lưu</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={detailDocTitleStyle}>{activeDetailDoc.title}</p>
                  <p style={detailDocDescriptionStyle}>{activeDetailDoc.description || 'Chưa có mô tả.'}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <TagChip mimeType={activeDetailDoc.file?.mimeType} />
                </div>
              </div>

              <TagList tags={activeDetailDoc.tags} />

              <div style={detailTableStyle}>
                <DetailRow label="Người đăng" value={activeDetailDoc.owner?.email || 'Ẩn danh'} />
                <DetailRow label="Tên file" value={activeDetailDoc.file?.originalName || activeDetailDoc.title} />
                <DetailRow label="Dung lượng" value={formatDocumentSize(activeDetailDoc.file?.size ?? 0)} />
                <DetailRow label="Ngày tạo" value={fmtDate(activeDetailDoc.createdAt)} />
                <DetailRow label="Cập nhật" value={fmtDate(activeDetailDoc.updatedAt)} />
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => void downloadDoc(activeDetailDoc)} style={btnSecondary}>Tải xuống</button>
                {activeDetailDoc.canManage && (
                  <button type="button" onClick={() => beginEditDetail(activeDetailDoc)} style={btnSecondary}>Sửa</button>
                )}
                {activeDetailDoc.canManage && (
                  <button
                    type="button"
                    onClick={() => void removeDoc(activeDetailDoc)}
                    style={{ ...btnSecondary, color: '#ef4444', borderColor: '#fecaca' }}
                  >
                    Xóa
                  </button>
                )}
                <button type="button" onClick={closeDetailModal} style={btnPrimary}>Đóng</button>
              </div>
            </div>
          )}
        </CenteredModal>
      )}
    </div>
  );
}

function mkDoc(id: string, title: string, description: string, tags: string[], fileName: string, mimeType: string, sizeMb: number, date: string): DocumentItem {
  return {
    id,
    title,
    description,
    tags,
    owner: demoOwner,
    file: { originalName: fileName, mimeType, size: Math.round(sizeMb * 1024 * 1024) },
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T15:30:00.000Z`,
    canManage: false,
  };
}

function filterDemo(documents: DocumentItem[], filters: DocumentFilters) {
  const search = norm(filters.search);
  const tag = norm(filters.tag);

  return documents.filter((document) => {
    const haystack = norm([document.title, document.description, document.file.originalName, document.owner.email, document.tags.join(' ')].join(' '));
    const createdAt = document.createdAt.slice(0, 10);
    const updatedAt = document.updatedAt.slice(0, 10);

    if (search && !haystack.includes(search)) return false;
    if (tag && !document.tags.some((item) => norm(item).includes(tag))) return false;
    if (filters.createdFrom && createdAt < filters.createdFrom) return false;
    if (filters.createdTo && createdAt > filters.createdTo) return false;
    if (filters.updatedFrom && updatedAt < filters.updatedFrom) return false;
    if (filters.updatedTo && updatedAt > filters.updatedTo) return false;
    return true;
  });
}

function norm(value?: string) {
  return (value || '').trim().toLocaleLowerCase('vi-VN');
}

function fmtDate(value?: string) {
  if (!value) return 'Chưa rõ';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function TagList({ tags = [] }: { tags?: string[] }) {
  if (!tags.length) {
    return <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Chưa gắn tag</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {tags.map((tag, index) => {
        const classes = TAG_COLORS[index % TAG_COLORS.length]!;
        const [background, color] = classes.split(' ').map((item) => item.replace('bg-[', '').replace('text-[', '').replace(']', ''));
        return (
          <span key={tag} style={{ padding: '4px 10px', borderRadius: 999, background, color, fontSize: 11, fontWeight: 800 }}>
            #{tag}
          </span>
        );
      })}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ ...cardStyle, gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', color: '#64748b', fontWeight: 700, fontSize: 14 }}>
      {text}
    </div>
  );
}

function VInput({ value, onChange, name, required, placeholder }: { value?: string; onChange?: (value: string) => void; name?: string; required?: boolean; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      name={name}
      required={required}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={detailRowStyle}>
      <span style={detailRowLabelStyle}>{label}</span>
      <span style={detailRowValueStyle}>{value}</span>
    </div>
  );
}

function TagChip({ mimeType }: { mimeType?: string }) {
  const mime = MIME_META[mimeType || ''] || { label: 'FILE', bg: '#F1F5F9', color: '#475569' };

  return (
    <span style={{ padding: '5px 12px', borderRadius: 999, background: mime.bg, color: mime.color, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>
      {mime.label}
    </span>
  );
}

function CenteredModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <section
        role="dialog"
        aria-modal={true}
        aria-label={title}
        style={modalCardStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <div style={{ minWidth: 0 }}>
            <p style={sectionTitle}>{title}</p>
            {subtitle && <p style={modalSubtitleStyle}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} style={iconCloseButtonStyle}>Đóng</button>
        </div>

        <div style={modalBodyStyle}>{children}</div>
        {footer}
      </section>
    </div>
  );
}

const statusBannerStyle: CSSProperties = {
  position: 'relative',
  zIndex: 10,
  marginBottom: 16,
  padding: '12px 18px',
  borderRadius: 16,
  background: '#fff',
  border: '2px solid #38bdf8',
  color: '#0369a1',
  fontWeight: 800,
  fontSize: 14,
  boxShadow: '0 2px 12px #38bdf830',
};

const statusCloseButtonStyle: CSSProperties = {
  float: 'right',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 900,
  color: '#0369a1',
};

const filterBarStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  borderRadius: 18,
  padding: '12px 14px',
  border: '1.5px solid #e2e8f0',
  boxShadow: '0 2px 10px rgba(56,189,248,0.06)',
  backdropFilter: 'blur(8px)',
  marginBottom: 20,
  position: 'relative',
  zIndex: 2,
};

const filterBarRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const filterFieldsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  flex: 1,
  minWidth: 280,
};

const filterIconStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: '#0369a1',
  letterSpacing: '0.1em',
  whiteSpace: 'nowrap',
};

const filterArrowStyle: CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 700,
};

const compactInputStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: 12,
  fontWeight: 700,
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
};

const compactDateStyle: CSSProperties = {
  ...compactInputStyle,
  padding: '6px 8px',
  fontSize: 11,
};

const cardsGridStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: 18,
  alignItems: 'stretch',
};

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 22,
  padding: 18,
  border: '2px solid #e2e8f0',
  boxShadow: '0 4px 24px rgba(56,189,248,0.10)',
  backdropFilter: 'blur(8px)',
  position: 'relative',
};

const cardTitleStyle: CSSProperties = {
  margin: '12px 0 6px',
  fontSize: 15,
  fontWeight: 900,
  lineHeight: 1.4,
  color: '#0f172a',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const cardDescriptionStyle: CSSProperties = {
  fontSize: 13,
  color: '#475569',
  fontWeight: 600,
  lineHeight: 1.55,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  marginBottom: 10,
};

const cardMetaRowStyle: CSSProperties = {
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 700,
};

const cardMetaFileStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '70%',
};

const cardActionsStyle: CSSProperties = {
  marginTop: 14,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const sectionTitle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: '#0369a1',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 14,
  border: '2px solid #e2e8f0',
  fontSize: 13,
  fontWeight: 700,
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimary: CSSProperties = {
  padding: '9px 16px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg,#f97316,#ef4444)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.04em',
  boxShadow: '0 2px 12px #ef444430',
  whiteSpace: 'nowrap',
};

const btnSecondary: CSSProperties = {
  padding: '9px 16px',
  borderRadius: 999,
  border: '2px solid #e2e8f0',
  cursor: 'pointer',
  background: '#fff',
  color: '#475569',
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: 'nowrap',
};

const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background: 'rgba(15, 23, 42, 0.35)',
  backdropFilter: 'blur(6px)',
};

const modalCardStyle: CSSProperties = {
  width: 'min(760px, calc(100vw - 32px))',
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
  borderRadius: 28,
  background: 'rgba(255,255,255,0.97)',
  border: '1.5px solid #dbeafe',
  boxShadow: '0 28px 90px rgba(15,23,42,0.22)',
  padding: 22,
};

const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 18,
};

const modalSubtitleStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 1.6,
  fontWeight: 600,
  color: '#64748b',
  maxWidth: 520,
};

const modalBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const iconCloseButtonStyle: CSSProperties = {
  ...btnSecondary,
  padding: '8px 14px',
  flexShrink: 0,
};

const modalFormStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const modalFooterStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: 8,
};

const uploadHintStyle: CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 700,
  marginTop: -2,
};

const detailDocTitleStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1.35,
  fontWeight: 900,
  color: '#0f172a',
  margin: 0,
};

const detailDocDescriptionStyle: CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.7,
  color: '#475569',
  fontWeight: 600,
};

const detailTableStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  borderRadius: 18,
  border: '1px solid #e2e8f0',
  background: '#f8fbff',
  padding: 16,
};

const detailRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: 12,
  alignItems: 'start',
  paddingBottom: 10,
  borderBottom: '1px solid #e2e8f0',
};

const detailRowLabelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: 12,
  fontWeight: 800,
};

const detailRowValueStyle: CSSProperties = {
  color: '#334155',
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.5,
  wordBreak: 'break-word',
};
