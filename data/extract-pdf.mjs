import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createRequire } from 'module'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workerPath = path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
GlobalWorkerOptions.workerSrc = workerPath

const data = new Uint8Array(fs.readFileSync('/Users/ziqianhuang/Downloads/2026 Volvo Engine Selector.pdf'))
const doc = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise

console.log('Total pages:', doc.numPages)

let fullText = ''
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i)
  const content = await page.getTextContent()
  const pageText = content.items.map(item => item.str).join(' ')
  fullText += `\n--- PAGE ${i} ---\n` + pageText
}

fs.writeFileSync('/Users/ziqianhuang/haifeng-engines/data/volvo-raw.txt', fullText)
console.log('Saved to data/volvo-raw.txt')
console.log('\n--- PREVIEW (first 3000 chars) ---')
console.log(fullText.slice(0, 3000))
