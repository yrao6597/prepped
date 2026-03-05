export function printToPdf(title: string, renderedHtml: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Pop-up blocked — please allow pop-ups for this site and try again.")
    return
  }

  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #111;
            padding: 40px 48px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 28px; }
          h2 { font-size: 14px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          h3 { font-size: 13px; font-weight: 600; margin-top: 16px; margin-bottom: 4px; }
          p { margin-bottom: 8px; }
          ul, ol { padding-left: 20px; margin-bottom: 8px; }
          li { margin-bottom: 3px; }
          strong { font-weight: 600; }
          @media print {
            body { padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Generated ${date}</div>
        ${renderedHtml}
        <script>window.print();<\/script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
