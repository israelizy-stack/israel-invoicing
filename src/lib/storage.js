const KEYS = {
  INVOICES: 'inv_invoices',
  CLIENTS: 'inv_clients',
  SETTINGS: 'inv_settings',
  COUNTER: 'inv_counter',
}

const defaults = {
  settings: {
    businessName: '',
    address: '',
    email: '',
    logo: null,
    defaultTaxRate: 0,
    defaultPaymentTerms: 30,
    currency: 'USD',
  },
}

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getInvoices() {
  return load(KEYS.INVOICES, [])
}

export function saveInvoice(invoice) {
  const invoices = getInvoices()
  const idx = invoices.findIndex(i => i.id === invoice.id)
  if (idx >= 0) {
    invoices[idx] = invoice
  } else {
    invoices.unshift(invoice)
  }
  save(KEYS.INVOICES, invoices)
}

export function deleteInvoice(id) {
  const invoices = getInvoices().filter(i => i.id !== id)
  save(KEYS.INVOICES, invoices)
}

export function getInvoice(id) {
  return getInvoices().find(i => i.id === id) || null
}

export function getClients() {
  return load(KEYS.CLIENTS, [])
}

export function saveClient(client) {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === client.id)
  if (idx >= 0) {
    clients[idx] = client
  } else {
    clients.unshift(client)
  }
  save(KEYS.CLIENTS, clients)
}

export function deleteClient(id) {
  const clients = getClients().filter(c => c.id !== id)
  save(KEYS.CLIENTS, clients)
}

export function getSettings() {
  return load(KEYS.SETTINGS, defaults.settings)
}

export function saveSettings(settings) {
  save(KEYS.SETTINGS, settings)
}

export function nextInvoiceNumber() {
  const n = load(KEYS.COUNTER, 0) + 1
  save(KEYS.COUNTER, n)
  return `INV-${String(n).padStart(3, '0')}`
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
