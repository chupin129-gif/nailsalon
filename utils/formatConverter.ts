/**
 * formatConverter.ts
 * 
 * Provides pristine formatting conversions for Naver Blog SmartEditor ONE,
 * Instagram, Threads, and Daangn Market.
 * 
 * CRITICAL FEATURE:
 * Guarantees that when copying from a dark-themed application,
 * the resulting HTML is explicitly formatted with high-contrast, black/dark colors (#111111, #000000)
 * and white/light container backgrounds (#ffffff, #fff8fa).
 * This completely prevents the notorious "white text on white canvas" bug when pasting
 * into Naver SmartEditor ONE, Google Docs, Microsoft Word, or email clients.
 */

/**
 * Escapes HTML special characters to prevent XSS or broken tags.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts Markdown text into rich, light-themed, Naver SmartEditor ONE-compatible HTML.
 * All colors are explicitly styled with high-contrast text (#111111, #000000) and cute
 * salon-friendly pink highlights (#ffe6ef, #ff4b8b).
 */
export function convertToNaverSmartEditorHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .split('\n');

  const htmlChunks: string[] = [];
  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteBuffer.length > 0) {
      const content = blockquoteBuffer.join('<br style="line-height: 1.7;" />');
      htmlChunks.push(
        `<blockquote style="margin: 22px 0; padding: 16px 20px; background-color: #fff0f5; border-left: 4px solid #ff4b8b; color: #222222; font-size: 15px; line-height: 1.75; border-radius: 0 8px 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;">${content}</blockquote>`
      );
      blockquoteBuffer = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Blockquote handling
    if (line.startsWith('>')) {
      inBlockquote = true;
      const quoteText = line.replace(/^>\s*/, '');
      blockquoteBuffer.push(formatInlineMarkdown(quoteText));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Empty line / paragraph break
    if (!line) {
      htmlChunks.push(
        `<p style="margin: 0 0 16px 0; line-height: 1.85; font-size: 16px; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;">&nbsp;</p>`
      );
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      htmlChunks.push(
        `<hr style="margin: 32px auto; border: 0; border-top: 1.5px dashed #f472b6; width: 80%;" />`
      );
      continue;
    }

    // H2 Heading (##)
    if (line.startsWith('## ')) {
      const headingText = line.replace(/^##\s+/, '');
      htmlChunks.push(
        `<h2 style="margin: 36px 0 16px 0; font-size: 20px; font-weight: 700; color: #000000; border-left: 4px solid #ff4b8b; padding-left: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">✨ ${formatInlineMarkdown(headingText)}</h2>`
      );
      continue;
    }

    // H3 Heading (###)
    if (line.startsWith('### ')) {
      const headingText = line.replace(/^###\s+/, '');
      htmlChunks.push(
        `<h3 style="margin: 26px 0 12px 0; font-size: 17px; font-weight: 700; color: #222222; border-left: 3px solid #f472b6; padding-left: 8px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">${formatInlineMarkdown(headingText)}</h3>`
      );
      continue;
    }

    // Photo Placement Placeholder
    if (line.includes('[📸 사진:') || line.startsWith('[사진:')) {
      const desc = line.replace(/^\[(📸\s*)?사진:\s*/, '').replace(/\]$/, '');
      htmlChunks.push(
        `<div style="margin: 24px auto; padding: 18px 20px; border: 2px dashed #f472b6; background-color: #fff8fa; text-align: center; border-radius: 10px; color: #d6336c; font-size: 14px; font-weight: 700; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
          📸 [사진 들어갈 자리: ${escapeHtml(desc)}]
        </div>`
      );
      continue;
    }

    // 3-sec GIF / Short Video Placeholder
    if (line.includes('[✨ 3초 실물 광택') || line.includes('[🎬 영상') || line.includes('[움짤')) {
      htmlChunks.push(
        `<div style="margin: 24px auto; padding: 18px 20px; border: 2px dashed #a855f7; background-color: #faf5ff; text-align: center; border-radius: 10px; color: #7e22ce; font-size: 14px; font-weight: 700; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
          ✨ [3초 실물 광택 움짤 / 동영상 들어갈 자리]
        </div>`
      );
      continue;
    }

    // Map Marker Placeholder
    if (line.includes('[📍 지도:')) {
      const place = line.replace(/^\[📍\s*지도:\s*/, '').replace(/\]$/, '');
      htmlChunks.push(
        `<div style="margin: 22px auto; padding: 14px 18px; border: 1.5px solid #86efac; background-color: #f0fdf4; border-radius: 8px; color: #166534; font-size: 14px; font-weight: 700; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
          📍 [네이버 지도 장소 첨부: ${escapeHtml(place)}]
        </div>`
      );
      continue;
    }

    // Sticker Placeholder
    if (line.includes('[😊 스티커:')) {
      const sticker = line.replace(/^\[😊\s*스티커:\s*/, '').replace(/\]$/, '');
      htmlChunks.push(
        `<div style="margin: 16px auto; text-align: center; color: #ec4899; font-size: 13px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
          [스티커 배치: ${escapeHtml(sticker)}]
        </div>`
      );
      continue;
    }

    // List Item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.replace(/^[-*]\s+/, '');
      htmlChunks.push(
        `<p style="margin: 0 0 10px 0; padding-left: 14px; font-size: 16px; line-height: 1.85; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;">• ${formatInlineMarkdown(itemText)}</p>`
      );
      continue;
    }

    // Standard Paragraph
    htmlChunks.push(
      `<p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.85; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;">${formatInlineMarkdown(line)}</p>`
    );
  }

  flushBlockquote();

  // Wrap in a pristine, pure-white container with explicit dark text to avoid theme color inheritance
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif; font-size: 16px; line-height: 1.85; color: #111111; background-color: #ffffff; padding: 8px 0;">
${htmlChunks.join('\n')}
</div>
  `.trim();
}

/**
 * Formats inline markdown like **bold**, *italic*, and `code` with high-contrast inline styles.
 */
function formatInlineMarkdown(text: string): string {
  // Bold: **text** -> high-contrast black with cute pink highlight marker
  let formatted = text.replace(/\*\*(.*?)\*\*/g, (_, p1) => {
    return `<strong style="font-weight: 700; color: #000000; background-color: #ffe6ef; padding: 2px 6px; border-radius: 4px;">${p1}</strong>`;
  });

  // Italic: *text*
  formatted = formatted.replace(/\*(.*?)\*/g, (_, p1) => {
    return `<em style="font-style: italic; color: #333333;">${p1}</em>`;
  });

  return formatted;
}

/**
 * Converts Markdown text into clean, unformatted plain text.
 * Strips markdown symbols (##, **, etc.) while preserving natural paragraph spacing,
 * emojis, and clear bracketed markers.
 * Ideal for Instagram captions, Threads, and KakaoTalk.
 */
export function convertToCleanPlainText(markdown: string): string {
  if (!markdown) return '';

  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    // Remove Markdown headings: ## Title -> Title
    .replace(/^#{1,6}\s+(.*)$/gm, '$1')
    // Remove Markdown bold: **text** -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove Markdown italic: *text* -> text
    .replace(/\*(.*?)\*/g, '$1')
    // Remove Markdown blockquotes: > text -> text
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules: --- -> (empty line)
    .replace(/^(---|___|\*\*\*)$/gm, '')
    // Normalize excessive empty lines (3+ down to 2)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Copies both text/html and text/plain to the user's clipboard.
 * Guarantees that Naver Blog receives rich light HTML with #111111 dark text,
 * and text-only apps receive clean plain text.
 */
export async function copyDualFormattedContent(
  markdownContent: string,
  options?: {
    isHtmlPreferred?: boolean;
    plainTextOverride?: string;
  }
): Promise<boolean> {
  const cleanHtml = convertToNaverSmartEditorHtml(markdownContent);
  const cleanPlain = options?.plainTextOverride || convertToCleanPlainText(markdownContent);

  // Modern Clipboard API supporting multiple MIME types
  if (navigator.clipboard && typeof navigator.clipboard.write === 'function' && window.ClipboardItem) {
    try {
      const blobHtml = new Blob([cleanHtml], { type: 'text/html' });
      const blobText = new Blob([cleanPlain], { type: 'text/plain' });

      const clipboardItem = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      });

      await navigator.clipboard.write([clipboardItem]);
      return true;
    } catch (err) {
      console.warn('ClipboardItem write failed, falling back to execCommand:', err);
    }
  }

  // Fallback using an invisible contenteditable element
  try {
    const container = document.createElement('div');
    container.contentEditable = 'true';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.opacity = '0';
    container.innerHTML = cleanHtml;

    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const successful = document.execCommand('copy');

    if (selection) {
      selection.removeAllRanges();
    }
    document.body.removeChild(container);

    if (successful) return true;
  } catch (err) {
    console.warn('execCommand HTML fallback failed:', err);
  }

  // Final fallback: plain text writeText
  try {
    await navigator.clipboard.writeText(cleanPlain);
    return true;
  } catch (err) {
    console.error('All clipboard methods failed:', err);
    return false;
  }
}
