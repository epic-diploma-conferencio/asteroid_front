const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatInline = (value: string) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

export const renderMarkdown = (markdown: string) => {
  const blocks = markdown.trim().split(/\n{2,}/);

  return blocks
    .map((block) => {
      const lines = block.trim().split('\n');
      const firstLine = lines[0] ?? '';

      if (firstLine.startsWith('```') && block.endsWith('```')) {
        const code = block.replace(/^```[a-z]*\n?/i, '').replace(/\n```$/, '');
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }

      if (/^!\[[^\]]*]\([^)]+\)$/.test(firstLine)) {
        const match = firstLine.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
        if (!match) {
          return '';
        }
        const [, alt, src] = match;
        return `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`;
      }

      if (firstLine.startsWith('# ')) {
        return `<h1>${formatInline(firstLine.slice(2))}</h1>`;
      }

      if (firstLine.startsWith('## ')) {
        return `<h2>${formatInline(firstLine.slice(3))}</h2>`;
      }

      if (firstLine.startsWith('### ')) {
        return `<h3>${formatInline(firstLine.slice(4))}</h3>`;
      }

      if (lines.every((line) => line.startsWith('- '))) {
        const items = lines.map((line) => `<li>${formatInline(line.slice(2))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }

      if (lines.every((line) => /^\d+\.\s/.test(line))) {
        const items = lines
          .map((line) => `<li>${formatInline(line.replace(/^\d+\.\s/, ''))}</li>`)
          .join('');
        return `<ol>${items}</ol>`;
      }

      return `<p>${lines.map((line) => formatInline(line)).join('<br />')}</p>`;
    })
    .join('');
};
