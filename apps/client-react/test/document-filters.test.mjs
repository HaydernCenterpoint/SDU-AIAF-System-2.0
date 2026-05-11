import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDocumentQuery, formatDocumentSize } from '../src/lib/document-filters.mjs';

test('buildDocumentQuery encodes search, tag, and date filters without empty values', () => {
  assert.equal(
    buildDocumentQuery({
      search: ' CSDL nâng cao ',
      tag: 'Cơ sở dữ liệu',
      createdFrom: '2026-04-01',
      updatedFrom: '',
      updatedTo: '2026-04-29',
    }),
    'search=CSDL+n%C3%A2ng+cao&tag=C%C6%A1+s%E1%BB%9F+d%E1%BB%AF+li%E1%BB%87u&createdFrom=2026-04-01&updatedTo=2026-04-29',
  );
});

test('formatDocumentSize renders human-readable file sizes', () => {
  assert.equal(formatDocumentSize(512), '512 B');
  assert.equal(formatDocumentSize(1536), '1.5 KB');
  assert.equal(formatDocumentSize(2.5 * 1024 * 1024), '2.5 MB');
});
