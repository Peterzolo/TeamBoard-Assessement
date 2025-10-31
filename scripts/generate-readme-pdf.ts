import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

/**
 * Convert Markdown to HTML (simple implementation)
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Lists
  html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

  // Wrap consecutive list items in ul
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>';
  });

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (!para.trim() || para.trim().startsWith('<')) return para;
    return '<p>' + para + '</p>';
  }).join('\n\n');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate PDF from README
 */
async function generatePdf() {
  const readmePath = path.join(__dirname, '..', 'README.md');
  const outputPath = path.join(__dirname, '..', 'README.pdf');

  console.log('📖 Reading README.md...');
  const markdown = fs.readFileSync(readmePath, 'utf-8');

  console.log('🔄 Converting Markdown to HTML...');
  const htmlContent = markdownToHtml(markdown);

  // Enhanced HTML with styling
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TeamBoard API - Documentation</title>
  <style>
    @page {
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 30px;
      margin-bottom: 20px;
      font-size: 2.5em;
    }
    
    h2 {
      color: #34495e;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 8px;
      margin-top: 25px;
      margin-bottom: 15px;
      font-size: 1.8em;
    }
    
    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.3em;
    }
    
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #e83e8c;
    }
    
    pre {
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      overflow-x: auto;
      margin: 15px 0;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
      color: #333;
      font-size: 0.85em;
      line-height: 1.5;
    }
    
    ul, ol {
      margin-left: 30px;
      margin-bottom: 15px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    a {
      color: #3498db;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    strong {
      color: #2c3e50;
      font-weight: 600;
    }
    
    /* Table of contents styling */
    ul:first-of-type {
      background-color: #f9f9f9;
      border-left: 4px solid #3498db;
      padding: 20px 20px 20px 40px;
      margin: 20px 0;
    }
    
    /* Code blocks in paragraphs */
    p code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    /* Page break before major sections */
    h1 {
      page-break-before: auto;
    }
    
    /* Avoid breaking code blocks across pages */
    pre {
      page-break-inside: avoid;
    }
    
    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #777;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  ${htmlContent}
  <div class="footer">
    <p>TeamBoard Assessment Backend - Documentation</p>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>
</body>
</html>
  `;

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    console.log('📄 Generating PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666; padding: 10px;">
          TeamBoard API Documentation
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666; padding: 10px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
generatePdf().catch((error) => {
  console.error('Failed to generate PDF:', error);
  process.exit(1);
});

