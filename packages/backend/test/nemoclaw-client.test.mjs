import test from 'node:test';
import assert from 'node:assert/strict';

test('xAI API key selects Grok chat completions provider', async () => {
  const previousEnv = { ...process.env };
  const previousFetch = globalThis.fetch;
  const requests = [];

  process.env.SAODO_AGENT_MODE = 'auto';
  process.env.XAI_API_KEY = 'xai-test-key';
  delete process.env.NEMOCLAW_API_URL;
  delete process.env.NEMOCLAW_SANDBOX_NAME;
  delete process.env.OPENCLAW_CLI;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return new Response(
      JSON.stringify({ choices: [{ message: { content: 'Grok trả lời.' } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    const { generateAssistantReply, getAssistantRuntimeStatus } = await import(
      `../src/nemoclaw-client.mjs?xai-test=${Date.now()}`
    );

    const status = getAssistantRuntimeStatus();
    const reply = await generateAssistantReply({
      message: 'xin chào',
      conversation: { id: 'conv-grok', messages: [{ role: 'user', content: 'xin chào' }] },
      catalog: { user: { name: 'Đạt' }, schedule: [], courses: [], documents: [] },
    });

    assert.equal(status.mode, 'xai');
    assert.equal(status.xai, true);
    assert.equal(status.model, 'grok-4.20');
    assert.equal(reply.content, 'Grok trả lời.');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://api.x.ai/v1/chat/completions');
    assert.equal(requests[0].options.headers.Authorization, 'Bearer xai-test-key');

    const body = JSON.parse(requests[0].options.body);
    assert.equal(body.model, 'grok-4.20');
    assert.ok(Array.isArray(body.messages));
  } finally {
    process.env = previousEnv;
    globalThis.fetch = previousFetch;
  }
});

test('explicit xAI mode does not expose or use non-xAI provider keys', async () => {
  const previousEnv = { ...process.env };
  const previousFetch = globalThis.fetch;
  const requests = [];

  process.env.SAODO_AGENT_MODE = 'xai';
  process.env.XAI_API_KEY = 'xai-test-key';
  process.env.NVIDIA_API_KEY = 'nvidia-test-key';
  process.env.OPENAI_API_KEY = 'openai-test-key';
  process.env.OPENROUTER_API_KEY = 'openrouter-test-key';
  process.env.NEMOCLAW_API_URL = 'https://nemoclaw.example.test';
  process.env.NEMOCLAW_SANDBOX_NAME = 'sandbox-test';

  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return new Response(
      JSON.stringify({ choices: [{ message: { content: 'Chỉ Grok trả lời.' } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    const { generateAssistantReply, getAssistantRuntimeStatus } = await import(
      `../src/nemoclaw-client.mjs?xai-isolation-test=${Date.now()}`
    );

    const status = getAssistantRuntimeStatus();
    const reply = await generateAssistantReply({
      message: 'xin chào',
      conversation: { id: 'conv-grok-only', messages: [{ role: 'user', content: 'xin chào' }] },
      catalog: { user: { name: 'Đạt' }, schedule: [], courses: [], documents: [] },
    });

    assert.equal(status.mode, 'xai');
    assert.equal(status.xai, true);
    assert.equal(status.nvidia, false);
    assert.equal(status.openai, false);
    assert.equal(status.openrouter, false);
    assert.equal(status.http, false);
    assert.equal(status.sandbox, null);
    assert.equal(reply.content, 'Chỉ Grok trả lời.');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://api.x.ai/v1/chat/completions');
  } finally {
    process.env = previousEnv;
    globalThis.fetch = previousFetch;
  }
});
