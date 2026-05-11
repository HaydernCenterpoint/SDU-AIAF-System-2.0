// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Web search & scraping module — zero external dependencies.
 *
 * Provides:
 *  - searchWeb(query)          → DuckDuckGo HTML scrape → list of {title, url, snippet}
 *  - fetchPageText(url)        → fetch a URL and strip HTML to plain text
 *  - detectSearchIntent(msg)   → returns {shouldSearch, query} for a Vietnamese message
 */

const USER_AGENT = 'Mozilla/5.0 (compatible; SaoDoAssistant/1.0; +https://saodo.edu.vn)';
const FETCH_TIMEOUT_MS = Number(process.env.WEB_SEARCH_TIMEOUT_MS || 8000);
const MAX_RESULTS = Number(process.env.WEB_SEARCH_MAX_RESULTS || 5);
const MAX_PAGE_CHARS = Number(process.env.WEB_SCRAPE_MAX_CHARS || 4000);

// ── Intent detection ────────────────────────────────────────────────────────

const SEARCH_TRIGGERS = [
  'tìm', 'search', 'kiếm', 'tra cứu', 'tìm kiếm',
  'tài liệu về', 'học về', 'giải thích', 'định nghĩa',
  'là gì', 'là ai', 'thông tin về', 'cho tôi biết về',
  'cào', 'scrape', 'link', 'url', 'website', 'web',
  'bài viết về', 'nghiên cứu về', 'tìm hiểu',
];

const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;

/**
 * Detect if a message needs a web search or URL scrape.
 * @returns {{ shouldSearch: boolean, query: string | null, urls: string[] }}
 */
export function detectSearchIntent(message) {
  const urls = (message.match(URL_REGEX) || []).slice(0, 3);
  const normalizedMsg = normalizeText(message);
  const hasTrigger = SEARCH_TRIGGERS.some((t) => normalizedMsg.includes(normalizeText(t)));

  if (urls.length > 0) {
    return { shouldSearch: true, query: null, urls };
  }

  if (hasTrigger) {
    // Extract meaningful query by removing trigger words
    const query = extractQuery(message);
    return { shouldSearch: Boolean(query), query, urls: [] };
  }

  return { shouldSearch: false, query: null, urls: [] };
}

function extractQuery(message) {
  // Remove common filler phrases and keep the core topic
  return message
    .replace(/^(bạn ơi|ơi|mình muốn|cho mình|giúp mình|mày|tao|bro)/i, '')
    .replace(/(tìm kiếm|tìm|search|tra cứu|kiếm|cào|scrape)\s+(giúp tao|giúp mình|về|cho mình)?/i, '')
    .replace(/(tài liệu về|thông tin về|bài viết về|học về|nghiên cứu về|tìm hiểu về|giải thích|định nghĩa của|là gì)/i, '')
    .replace(/\?$/, '')
    .trim()
    .slice(0, 200) || null;
}

// ── DuckDuckGo HTML search ──────────────────────────────────────────────────

/**
 * Search the web via DuckDuckGo HTML endpoint.
 * No API key required. Returns up to MAX_RESULTS results.
 * @param {string} query
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
export async function searchWeb(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=vn-vi`;
  try {
    const html = await fetchRaw(url, {
      'Accept': 'text/html',
      'Accept-Language': 'vi,en;q=0.9',
    });
    return parseDuckDuckGoResults(html).slice(0, MAX_RESULTS);
  } catch (err) {
    console.warn('[web-search] DuckDuckGo search failed:', err?.message);
    return [];
  }
}

function parseDuckDuckGoResults(html) {
  const results = [];
  // Extract result blocks: <div class="result__body">
  const blockRegex = /<div[^>]*class="[^"]*result__body[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let blockMatch;

  while ((blockMatch = blockRegex.exec(html)) !== null && results.length < MAX_RESULTS) {
    const block = blockMatch[1];

    // Title + URL
    const titleMatch = block.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    // Snippet
    const snippetMatch = block.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

    if (!titleMatch) continue;

    const rawUrl = titleMatch[1];
    const url = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
    const title = stripTags(titleMatch[2]).trim();
    const snippet = snippetMatch ? stripTags(snippetMatch[1]).trim() : '';

    if (title && url && url.startsWith('http')) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

// ── Page fetcher & HTML stripper ────────────────────────────────────────────

/**
 * Fetch a URL and return clean plain text (HTML stripped).
 * Limits output to MAX_PAGE_CHARS characters.
 * @param {string} url
 * @returns {Promise<{text: string, title: string, url: string} | null>}
 */
export async function fetchPageText(url) {
  try {
    const html = await fetchRaw(url);
    const title = extractTitle(html);
    const text = htmlToText(html).slice(0, MAX_PAGE_CHARS);
    if (!text) return null;
    return { title: title || url, url, text };
  } catch (err) {
    console.warn('[web-search] fetchPageText failed for', url, ':', err?.message);
    return null;
  }
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]).trim() : '';
}

function htmlToText(html) {
  return html
    // Remove script/style/head blocks entirely
    .replace(/<(script|style|head|nav|footer|aside|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // Replace block-level tags with newlines
    .replace(/<\/(p|div|li|h[1-6]|tr|article|section|blockquote)>/gi, '\n')
    // Replace <br>, <hr> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

// ── Low-level fetch ─────────────────────────────────────────────────────────

async function fetchRaw(url, extraHeaders = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        ...extraHeaders,
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    // Limit response size to 500KB to avoid huge pages
    const buffer = await response.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(
      buffer.byteLength > 512_000 ? buffer.slice(0, 512_000) : buffer
    );
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Context builder for AI prompt ──────────────────────────────────────────

/**
 * Run web search and/or scrape URLs, then format results as a text block
 * suitable for injection into an AI prompt.
 *
 * @param {{ query: string | null, urls: string[] }} intent
 * @returns {Promise<{ contextBlock: string, sources: Array<{title,url,type}> }>}
 */
export async function buildWebContext({ query, urls = [] }) {
  const sources = [];
  const sections = [];

  // 1. Scrape explicit URLs first
  if (urls.length > 0) {
    const scraped = await Promise.all(urls.slice(0, 3).map(fetchPageText));
    for (const page of scraped) {
      if (!page) continue;
      sections.push(`=== Nội dung từ ${page.url} ===\n${page.text}`);
      sources.push({ title: page.title || page.url, url: page.url, type: 'web' });
    }
  }

  // 2. If there's a search query, run DuckDuckGo + scrape top result
  if (query) {
    const results = await searchWeb(query);
    if (results.length > 0) {
      // Add snippets from all results
      const snippetBlock = results
        .map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   ${r.snippet}`)
        .join('\n');
      sections.push(`=== Kết quả tìm kiếm cho "${query}" ===\n${snippetBlock}`);

      // Deep-scrape the first result for more content
      const topPage = await fetchPageText(results[0].url);
      if (topPage) {
        sections.push(`=== Nội dung chi tiết từ ${results[0].url} ===\n${topPage.text}`);
      }

      for (const r of results) {
        sources.push({ title: r.title, url: r.url, type: 'web_search' });
      }
    }
  }

  if (sections.length === 0) {
    return { contextBlock: '', sources: [] };
  }

  const contextBlock = `\n--- Thông tin tìm kiếm từ web ---\n${sections.join('\n\n')}\n--- Hết thông tin web ---\n`;
  return { contextBlock, sources };
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}
