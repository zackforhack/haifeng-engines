const { PDFParse } = require('pdf-parse')
const fs = require('fs')

const buf = fs.readFileSync('/Users/ziqianhuang/Downloads/2026 Volvo Engine Selector.pdf')
const parser = new PDFParse()

parser.parse(buf).then(data => {
  const text = data.text || data.pages?.map(p => p.text).join('\n') || JSON.stringify(data).slice(0, 2000)
  fs.writeFileSync('/Users/ziqianhuang/haifeng-engines/data/volvo-raw.txt', text)
  console.log('Saved to data/volvo-raw.txt')
  console.log('--- PREVIEW ---')
  console.log(text.slice(0, 3000))
}).catch(e => {
  console.error(e.message)
  // Dump the raw parse result structure
  console.log('Keys:', Object.keys(parser))
})
