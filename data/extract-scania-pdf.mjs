import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pdfPath = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-05/2025下半年斯堪尼亚发动机手册1125-s.pdf'

const pdfjsLib = await import(path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.mjs'))
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')

const doc = await pdfjsLib.getDocument(pdfPath).promise
console.log(`Pages: ${doc.numPages}`)

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p)
  const content = await page.getTextContent()

  // Group text items by Y position (row)
  const rows = {}
  for (const item of content.items) {
    if (!item.str?.trim()) continue
    const y = Math.round(item.transform[5])
    if (!rows[y]) rows[y] = []
    rows[y].push({ x: item.transform[4], str: item.str })
  }

  const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a)
  console.log(`\n=== PAGE ${p} ===`)
  for (const y of sortedYs) {
    const line = rows[y].sort((a, b) => a.x - b.x).map(i => i.str).join(' ')
    if (line.trim()) console.log(line)
  }
}
