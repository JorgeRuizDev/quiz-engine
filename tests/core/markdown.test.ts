import { describe, expect, it } from 'bun:test';
import { renderSafeMarkdown } from '../../src/core/utils/markdown';

describe('Markdown Sanitizer & Renderer (Core Utils)', () => {
  it('escapes script tags and malicious attributes to prevent XSS', () => {
    const maliciousInput = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const output = renderSafeMarkdown(maliciousInput);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('<img');
    expect(output).toContain('&lt;script&gt;');
    expect(output).toContain('&lt;img');
  });

  it('renders all heading levels correctly including ## headings and indented headings', () => {
    const input = '# Title 1\n\n## Subtitle 2\n\n### Section 3\n#### Concept 4\n  ## Indented Subtitle';
    const output = renderSafeMarkdown(input);
    expect(output).toContain('<h1');
    expect(output).toContain('Title 1</h1>');
    expect(output).toContain('<h2');
    expect(output).toContain('Subtitle 2</h2>');
    expect(output).toContain('<h3');
    expect(output).toContain('Section 3</h3>');
    expect(output).toContain('<h4');
    expect(output).toContain('Concept 4</h4>');
    expect(output).toContain('Indented Subtitle</h2>');
  });

  it('renders fenced code blocks and inline code safely', () => {
    const input = 'Here is `inline code` and a block:\n\n```python\nprint("hello")\n```';
    const output = renderSafeMarkdown(input);
    expect(output).toContain('<code class="px-1.5 py-0.5');
    expect(output).toContain('inline code');
    expect(output).toContain('<pre');
    expect(output).toContain('data-language="python"');
    expect(output).toContain('print(&quot;hello&quot;)');
  });

  it('renders bold, italic, and strikethrough formatting', () => {
    const input = 'This is **bold**, *italic*, and ~~struck~~ text.';
    const output = renderSafeMarkdown(input);
    expect(output).toContain('<strong class="font-bold');
    expect(output).toContain('bold</strong>');
    expect(output).toContain('<em class="italic');
    expect(output).toContain('italic</em>');
    expect(output).toContain('<del class="line-through');
    expect(output).toContain('struck</del>');
  });

  it('renders blockquotes, unordered lists, and ordered lists', () => {
    const input = '> Important quote\n\n- Bullet 1\n- Bullet 2\n\n1. Step 1\n2. Step 2';
    const output = renderSafeMarkdown(input);
    expect(output).toContain('<blockquote');
    expect(output).toContain('Important quote</blockquote>');
    expect(output).toContain('<li class="ml-4 list-disc');
    expect(output).toContain('Bullet 1</li>');
    expect(output).toContain('<li class="ml-4 list-decimal');
    expect(output).toContain('Step 1</li>');
  });

  it('renders safe links with target="_blank" and rel="noopener noreferrer"', () => {
    const input = 'Check [Documentation](https://example.com/docs) and [Local](#section).';
    const output = renderSafeMarkdown(input);
    expect(output).toContain('<a href="https://example.com/docs" target="_blank" rel="noopener noreferrer"');
    expect(output).toContain('Documentation</a>');
    expect(output).toContain('<a href="#section" target="_blank" rel="noopener noreferrer"');
  });

  it('handles empty or whitespace string without error', () => {
    expect(renderSafeMarkdown('')).toBe('');
    expect(renderSafeMarkdown('   ')).toBe('');
  });
});
