/**
 * Lightweight, safe Markdown renderer with HTML sanitization.
 * Escapes raw HTML first to eliminate script injection and XSS,
 * then converts markdown constructs into semantic, accessible HTML.
 */
export function renderSafeMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Step 1: Escape all raw HTML entities to eliminate script injection & XSS
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Step 2: Extract fenced code blocks (```lang\ncode\n```)
  const codeBlocks: string[] = [];
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const idx = codeBlocks.length;
    const langAttr = lang ? ` data-language="${lang}"` : '';
    codeBlocks.push(
      `<pre class="my-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800"${langAttr}><code>${code.trim()}</code></pre>`
    );
    return `\n\n__CODE_BLOCK_${idx}__\n\n`;
  });

  // Step 3: Inline code (`code`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs sm:text-sm">$1</code>'
  );

  // Step 4: Bold, Italics, Strikethrough
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-500">$1</del>');

  // Step 5: Safe Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    const trimmedUrl = url.trim();
    const isSafeUrl = /^(https?:\/\/|file:\/\/\/|\/|#)/i.test(trimmedUrl);
    if (!isSafeUrl) return text;
    return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">${text}</a>`;
  });

  // Step 6: Process lines for Headings, Lists, Blockquotes, and Paragraphs
  const lines = html.split('\n');
  const result: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push(
        `<p class="my-2 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">${currentParagraph.join('<br />')}</p>`
      );
      currentParagraph = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('__CODE_BLOCK_')) {
      flushParagraph();
      const idx = parseInt(trimmed.replace('__CODE_BLOCK_', '').replace('__', ''), 10);
      if (codeBlocks[idx] !== undefined) {
        result.push(codeBlocks[idx]);
      }
      continue;
    }

    // Headings: # to ###### with optional leading whitespace
    const headingMatch = rawLine.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const classes = [
        'text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-6 mb-4',
        'text-xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-3',
        'text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2',
        'text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5',
        'text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2.5 mb-1',
        'text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-2 mb-1',
      ][level - 1];
      result.push(`<h${level} class="${classes}">${text}</h${level}>`);
      continue;
    }

    // Unordered lists (- or * or +)
    const listMatch = rawLine.match(/^\s*[-*+]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      result.push(
        `<li class="ml-4 list-disc text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">${listMatch[1]}</li>`
      );
      continue;
    }

    // Ordered lists (1. 2. etc.)
    const numListMatch = rawLine.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      flushParagraph();
      result.push(
        `<li class="ml-4 list-decimal text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">${numListMatch[2]}</li>`
      );
      continue;
    }

    // Blockquotes (> text)
    const quoteMatch = rawLine.match(/^\s*&gt;\s+(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      result.push(
        `<blockquote class="border-l-4 border-indigo-500 pl-3.5 py-1 my-2 italic text-slate-700 dark:text-slate-300">${quoteMatch[1]}</blockquote>`
      );
      continue;
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  return result.join('\n');
}
