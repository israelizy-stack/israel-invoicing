export function calcLineTotal(item) {
  return (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
}

export function calcSubtotal(items) {
  return items.reduce((sum, item) => sum + calcLineTotal(item), 0)
}

export function calcTax(subtotal, taxRate) {
  return subtotal * ((parseFloat(taxRate) || 0) / 100)
}

export function calcTotal(items, taxRate) {
  const sub = calcSubtotal(items)
  return sub + calcTax(sub, taxRate)
}

export function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function resolveStatus(invoice) {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.status === 'draft') return 'draft'
  const due = invoice.dueDate ? new Date(invoice.dueDate) : null
  if (due && due < new Date()) return 'overdue'
  return invoice.status || 'draft'
}

export function emptyItem() {
  return { id: Math.random().toString(36).slice(2), description: '', qty: 1, rate: '' }
}

export function newInvoice(number, settings) {
  const today = new Date().toISOString().slice(0, 10)
  const terms = settings?.defaultPaymentTerms || 30
  const due = new Date()
  due.setDate(due.getDate() + terms)
  return {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    number,
    status: 'draft',
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: today,
    dueDate: due.toISOString().slice(0, 10),
    items: [emptyItem()],
    taxRate: settings?.defaultTaxRate ?? 0,
    notes: '',
    stripeLink: '',
    createdAt: new Date().toISOString(),
  }
}
