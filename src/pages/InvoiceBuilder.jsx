import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import {
  getSettings, getClients, saveInvoice, getInvoice, nextInvoiceNumber,
} from '../lib/storage'
import {
  calcLineTotal, calcSubtotal, calcTax, calcTotal, fmt, emptyItem, newInvoice,
} from '../lib/invoice'

export default function InvoiceBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [invoice, setInvoice] = useState(null)
  const [clients, setClients] = useState([])
  const [settings, setSettings] = useState({})
  const [showClientDrop, setShowClientDrop] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const s = getSettings()
    setSettings(s)
    setClients(getClients())
    if (isEdit) {
      const existing = getInvoice(id)
      if (existing) setInvoice(existing)
      else navigate('/')
    } else {
      setInvoice(newInvoice(nextInvoiceNumber(), s))
    }
  }, [id])

  if (!invoice) return <div className="p-8 text-zinc-500">Loading…</div>

  function set(field, value) {
    setInvoice(prev => ({ ...prev, [field]: value }))
  }

  function setItem(idx, field, value) {
    setInvoice(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setInvoice(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(idx) {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== idx) : prev.items,
    }))
  }

  function applyClient(client) {
    setInvoice(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
    }))
    setShowClientDrop(false)
  }

  async function handleSave(status) {
    setSaving(true)
    const updated = { ...invoice, status: status || invoice.status }
    saveInvoice(updated)
    setSaving(false)
    navigate(`/invoices/${updated.id}`)
  }

  const subtotal = calcSubtotal(invoice.items)
  const tax = calcTax(subtotal, invoice.taxRate)
  const total = subtotal + tax

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="mono text-amber-400 text-sm mt-0.5">{invoice.number}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn-secondary" onClick={() => handleSave('draft')} disabled={saving}>Save Draft</button>
          <button className="btn-primary" onClick={() => handleSave('sent')} disabled={saving}>Save & Send</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Client */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Bill To</h2>
            {clients.length > 0 && (
              <div className="relative">
                <button
                  className="btn-ghost flex items-center gap-1 text-xs"
                  onClick={() => setShowClientDrop(v => !v)}
                >
                  Load Client <ChevronDown size={12} />
                </button>
                {showClientDrop && (
                  <div className="absolute right-0 top-8 z-10 bg-[#1e1e1e] border border-[#2a2a2a] rounded shadow-xl min-w-48">
                    {clients.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors"
                        onClick={() => applyClient(c)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Client Name</label>
              <input className="input" value={invoice.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={invoice.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="client@example.com" />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input resize-none" rows={2} value={invoice.clientAddress} onChange={e => set('clientAddress', e.target.value)} placeholder="123 Main St, City, State" />
            </div>
          </div>
        </div>

        {/* Dates & meta */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Invoice Details</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Invoice Number</label>
              <input className="input mono" value={invoice.number} onChange={e => set('number', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Issue Date</label>
                <input className="input mono" type="date" value={invoice.issueDate} onChange={e => set('issueDate', e.target.value)} />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input className="input mono" type="date" value={invoice.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Stripe Payment Link</label>
              <input className="input" value={invoice.stripeLink} onChange={e => set('stripeLink', e.target.value)} placeholder="https://buy.stripe.com/..." />
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-semibold text-white">Line Items</h2>
        </div>
        <div className="p-5">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-3 mb-2">
            {['Description', 'Qty', 'Rate', 'Total', ''].map(h => (
              <span key={h} className="label">{h}</span>
            ))}
          </div>
          {/* Items */}
          <div className="space-y-2">
            {invoice.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-3 items-center">
                <input
                  className="input"
                  value={item.description}
                  onChange={e => setItem(idx, 'description', e.target.value)}
                  placeholder="Service or product description"
                />
                <input
                  className="input mono text-right"
                  type="number"
                  min="0"
                  value={item.qty}
                  onChange={e => setItem(idx, 'qty', e.target.value)}
                />
                <input
                  className="input mono text-right"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={e => setItem(idx, 'rate', e.target.value)}
                  placeholder="0.00"
                />
                <span className="mono text-sm text-white text-right pr-1">
                  {fmt(calcLineTotal(item))}
                </span>
                <button
                  className="text-zinc-600 hover:text-red-400 transition-colors flex items-center justify-center"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn-ghost flex items-center gap-2 mt-4 text-zinc-400" onClick={addItem}>
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        {/* Totals */}
        <div className="border-t border-[#2a2a2a] px-5 py-4">
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex gap-8 text-zinc-400">
              <span>Subtotal</span>
              <span className="mono w-28 text-right">{fmt(subtotal)}</span>
            </div>
            <div className="flex gap-8 items-center text-zinc-400">
              <div className="flex items-center gap-2">
                <span>Tax</span>
                <input
                  className="input mono w-16 text-right py-1 px-2"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={invoice.taxRate}
                  onChange={e => set('taxRate', e.target.value)}
                />
                <span className="text-zinc-600">%</span>
              </div>
              <span className="mono w-28 text-right">{fmt(tax)}</span>
            </div>
            <div className="flex gap-8 text-white font-semibold text-base border-t border-[#2a2a2a] pt-2 mt-1 w-64 justify-between">
              <span>Total</span>
              <span className="mono text-amber-400">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5">
        <label className="label">Notes / Payment Instructions</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={invoice.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Payment due within 30 days. Thank you for your business."
        />
      </div>
    </div>
  )
}
