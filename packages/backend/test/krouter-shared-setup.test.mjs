import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

test('krouter is the default shared runtime and only reports configured when its key exists', async () => {
  const previousEnv = { ...process.env };

  delete process.env.SAODO_AGENT_MODE;
  delete process.env.KROUTER_API_KEY;
  delete process.env.XAI_API_KEY;
  delete process.env.NEMOCLAW_API_URL;
  delete process.env.NEMOCLAW_SANDBOX_NAME;
  delete process.env.OPENCLAW_CLI;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const { getAssistantRuntimeStatus } = await import(
      `../src/nemoclaw-client.mjs?krouter-default-mode-test=${Date.now()}`
    );

    const fallbackStatus = getAssistantRuntimeStatus();
    assert.equal(fallbackStatus.mode, 'krouter');
    assert.equal(fallbackStatus.krouter, true);
    assert.equal(fallbackStatus.configured, false);

    process.env.KROUTER_API_KEY = 'krouter-test-key';
    const { getAssistantRuntimeStatus: getConfiguredStatus } = await import(
      `../src/nemoclaw-client.mjs?krouter-default-mode-configured-test=${Date.now()}`
    );
    const configuredStatus = getConfiguredStatus();
    assert.equal(configuredStatus.mode, 'krouter');
    assert.equal(configuredStatus.configured, true);
  } finally {
    process.env = previousEnv;
  }
});

test('auto mode prefers KRouter over xAI when both keys are present', async () => {
  const previousEnv = { ...process.env };

  process.env.SAODO_AGENT_MODE = 'auto';
  process.env.KROUTER_API_KEY = 'krouter-test-key';
  process.env.XAI_API_KEY = 'xai-test-key';
  delete process.env.NEMOCLAW_API_URL;
  delete process.env.NEMOCLAW_SANDBOX_NAME;
  delete process.env.OPENCLAW_CLI;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const { getAssistantRuntimeStatus } = await import(
      `../src/nemoclaw-client.mjs?krouter-priority-test=${Date.now()}`
    );

    const status = getAssistantRuntimeStatus();
    assert.equal(status.mode, 'krouter');
    assert.equal(status.krouter, true);
    assert.equal(status.xai, false);
    assert.equal(status.model, 'cx/gpt-5.4');
  } finally {
    process.env = previousEnv;
  }
});

test('local fallback copy recommends the shared KRouter setup', async () => {
  const previousEnv = { ...process.env };

  process.env.SAODO_AGENT_MODE = 'auto';
  delete process.env.KROUTER_API_KEY;
  delete process.env.XAI_API_KEY;
  delete process.env.NEMOCLAW_API_URL;
  delete process.env.NEMOCLAW_SANDBOX_NAME;
  delete process.env.OPENCLAW_CLI;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const { generateAssistantReply } = await import(
      `../src/nemoclaw-client.mjs?krouter-fallback-copy-test=${Date.now()}`
    );

    const reply = await generateAssistantReply({
      message: 'abcxyz',
      conversation: { id: 'conv-krouter-copy', messages: [{ role: 'user', content: 'abcxyz' }] },
      catalog: { user: { name: 'Đạt' }, schedule: [], courses: [], documents: [] },
    });

    assert.match(reply.content, /KROUTER_API_KEY/);
    assert.match(reply.content, /SAODO_AGENT_MODE=krouter/);
    assert.doesNotMatch(reply.content, /XAI_API_KEY/);
  } finally {
    process.env = previousEnv;
  }
});

test('seed conversation data for both schools references the shared KRouter setup', () => {
  const saoDoData = read('data/schools/sao-do/user-data.json');
  const ntdData = read('data/schools/nguyen-thi-due/user-data.json');

  for (const source of [saoDoData, ntdData]) {
    assert.match(source, /KROUTER_API_KEY/);
    assert.doesNotMatch(source, /XAI_API_KEY/);
  }
});

test('configured KRouter failure returns an upstream failure notice instead of a setup prompt', async () => {
  const previousEnv = { ...process.env };
  const previousFetch = globalThis.fetch;

  process.env.SAODO_AGENT_MODE = 'krouter';
  process.env.KROUTER_API_KEY = 'krouter-test-key';
  delete process.env.XAI_API_KEY;
  delete process.env.NEMOCLAW_API_URL;
  delete process.env.NEMOCLAW_SANDBOX_NAME;
  delete process.env.OPENCLAW_CLI;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: 'upstream failed' } }),
    { status: 502, headers: { 'Content-Type': 'application/json' } },
  );

  try {
    const { generateAssistantReply } = await import(
      `../src/nemoclaw-client.mjs?krouter-upstream-failure-test=${Date.now()}`
    );

    const reply = await generateAssistantReply({
      message: 'ban la ai',
      conversation: { id: 'conv-krouter-down', messages: [{ role: 'user', content: 'ban la ai' }] },
      catalog: { user: { name: 'Đạt' }, schedule: [], courses: [], documents: [] },
    });

    assert.match(reply.content, /KRouter đang tạm thời không phản hồi/i);
    assert.doesNotMatch(reply.content, /KROUTER_API_KEY/);
  } finally {
    process.env = previousEnv;
    globalThis.fetch = previousFetch;
  }
});
