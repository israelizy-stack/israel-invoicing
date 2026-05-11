import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Selectors injected by browser extensions that pollute the captured DOM
const EXTENSION_SELECTORS = [
  '[id^="chrome-extension-"]',
  '[class^="chrome-extension-"]',
  '[id^="__crx"]',
  '[data-lastpass-icon-root]',
  '[data-dashlane-rid]',
  '[id^="bitwarden"]',
  'grammarly-extension',
  'grammarly-mirror',
  '[data-grammarly-shadow-root]',
]

export async function exportInvoicePDF(elementId, filename = 'invoice.pdf') {
  const el = document.getElementById(elementId)
  if (!el) throw new Error('PDF element not found')

  // Temporarily hide extension-injected elements so they don't appear in the export
  const hidden = /** @type {HTMLElement[]} */ ([])
  EXTENSION_SELECTORS.forEach(sel => {
    el.querySelectorAll(sel).forEach(node => {
      /** @type {HTMLElement} */ (node).style.setProperty('display', 'none', 'important')
      hidden.push(/** @type {HTMLElement} */ (node))
    })
  })

  let canvas
  try {
    canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
  } finally {
    // Always restore visibility regardless of capture outcome
    hidden.forEach(node => node.style.removeProperty('display'))
  }

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const ratio = canvas.width / canvas.height
  const imgH = pageW / ratio

  if (imgH <= pageH) {
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH)
  } else {
    let y = 0
    while (y < canvas.height) {
      const sliceH = Math.min((pageH / pageW) * canvas.width, canvas.height - y)
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = sliceH
      const ctx = sliceCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, -y)
      const sliceData = sliceCanvas.toDataURL('image/png')
      if (y > 0) pdf.addPage()
      pdf.addImage(sliceData, 'PNG', 0, 0, pageW, (sliceH / canvas.width) * pageW)
      y += sliceH
    }
  }

  pdf.save(filename)
}
