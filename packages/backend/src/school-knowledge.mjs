import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSchoolId } from './schools.mjs';

const KNOWLEDGE_FILENAME = 'admissions-knowledge.json';
const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadSchoolAdmissionsKnowledge(schoolId) {
  const normalizedSchoolId = normalizeSchoolId(schoolId);
  const knowledgePath = join(__dirname, '..', 'schools', normalizedSchoolId, KNOWLEDGE_FILENAME);

  if (!existsSync(knowledgePath)) {
    return null;
  }

  return JSON.parse(readFileSync(knowledgePath, 'utf8'));
}
