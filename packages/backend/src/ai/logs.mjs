import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOG_PATH = join(__dirname, '..', '..', 'data', 'ai-queries.jsonl');

export function logAiQuery(entry) {
  const logPath = process.env.SAODO_AI_LOG_PATH || DEFAULT_LOG_PATH;
  try {
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${JSON.stringify({ ...entry, createdAt: entry.createdAt || new Date().toISOString() })}\n`);
  } catch {
    // Logging must never break chat responses.
  }
}
