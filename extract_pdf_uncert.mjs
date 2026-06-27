import { readFileSync } from 'fs';

// Load pdfjs-dist (legacy build for Node.js)
const pdfjsLib = await import('/Users/ziqianhuang/haifeng-engines/node_modules/pdfjs-dist/legacy/build/pdf.mjs');

const PDF_PATH = "/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-05/2026 现代柴油机- 无排放认证（20260508）DX37  CN.pdf";

const data = readFileSync(PDF_PATH);
const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
const pdfDocument = await loadingTask.promise;

console.log(`Total pages: ${pdfDocument.numPages}`);

for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
  const page = await pdfDocument.getPage(pageNum);
  const textContent = await page.getTextContent();

  console.log(`\n====== PAGE ${pageNum} ======`);

  // Get items with their positions
  const items = textContent.items.map(item => ({
    text: item.str,
    x: Math.round(item.transform[4]),
    y: Math.round(item.transform[5]),
    width: Math.round(item.width),
    height: Math.round(item.height)
  }));

  // Sort by y (descending, top to bottom) then x (left to right)
  items.sort((a, b) => b.y - a.y || a.x - b.x);

  // Group by approximate y position (rows)
  const rows = [];
  let currentRow = [];
  let currentY = null;
  const Y_THRESHOLD = 5;

  for (const item of items) {
    if (item.text.trim() === '') continue;

    if (currentY === null || Math.abs(item.y - currentY) <= Y_THRESHOLD) {
      currentRow.push(item);
      currentY = item.y;
    } else {
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [item];
      currentY = item.y;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  // Print each row
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    const rowText = row.map(i => i.text.trim()).filter(t => t).join(' | ');
    if (rowText) {
      console.log(`  [y=${row[0].y}] ${rowText}`);
    }
  }
}
