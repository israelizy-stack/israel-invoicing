import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Download, Edit, Trash2, ExternalLink, ArrowLeft } from 'lucide-react'
import { getInvoice, getSettings, saveInvoice, deleteInvoice } from '../lib/storage'
import { calcLineTotal, calcSubtotal, calcTax, calcTotal, fmt, resolveStatus } from '../lib/invoice'
import { exportInvoicePDF } from '../lib/pdf'
import StatusBadge from '../components/StatusBadge'

const STATUS_OPTIONS = ['draft', 'sent', 'paid']

export default function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [settings, setSettings] = useState({})
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const inv = getInvoice(id)
    if (!inv) { navigate('/'); return }
    setInvoice(inv)
    setSettings(getSettings())
  }, [id])

  if (!invoice) return null

  const status = resolveStatus(invoice)
  const subtotal = calcSubtotal(invoice.items)
  const tax = calcTax(subtotal, invoice.taxRate)
  const total = subtotal + tax

  function changeStatus(s) {
    const updated = { ...invoice, status: s }
    saveInvoice(updated)
    setInvoice(updated)
  }

  function handleDelete() {
    if (confirm(`Delete ${invoice.number}? This cannot be undone.`)) {
      deleteInvoice(invoice.id)
      navigate('/')
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportInvoicePDF('invoice-pdf-target', `${invoice.number}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <button className="btn-ghost flex items-center gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                (invoice.status === s || (s === 'overdue' && status === 'overdue'))
                  ? 'border-amber-400/50 text-amber-400 bg-amber-400/10'
                  : 'border-[#2a2a2a] text-zinc-500 hover:text-white hover:border-[#3a3a3a]'
              }`}
            >
              Mark {s}
            </button>
          ))}
          {invoice.stripeLink && (
            <a href={invoice.stripeLink} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-1.5">
              <ExternalLink size={13} /> Pay Link
            </a>
          )}
          <button className="btn-secondary flex items-center gap-1.5" onClick={() => navigate(`/invoices/${id}/edit`)}>
            <Edit size={13} /> Edit
          </button>
          <button className="btn-primary flex items-center gap-1.5" onClick={handleExport} disabled={exporting}>
            <Download size={13} /> {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
          <button className="btn-danger flex items-center gap-1.5" onClick={handleDelete}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* PDF-ready invoice card */}
      <div id="invoice-pdf-target" className="bg-white text-black rounded-lg overflow-hidden shadow-2xl" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ background: '#0f0f0f', color: 'white', padding: '40px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Business info */}
            <div>
              {settings.logo && (
                <img src={settings.logo} alt="logo" style={{ height: 48, marginBottom: 12, objectFit: 'contain' }} />
              )}
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: 'white' }}>
                {settings.businessName || 'Your Business'}
              </div>
              {settings.address && (
                <div style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'pre-line' }}>{settings.address}</div>
              )}
              {settings.email && (
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{settings.email}</div>
              )}
            </div>
            {/* Invoice number + status */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#fbbf24', letterSpacing: 1 }}>
                {invoice.number}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '36px 48px', background: 'white' }}>
          {/* Bill to + dates row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#6b7280', marginBottom: 6 }}>Bill To</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>{invoice.clientName || '—'}</div>
              {invoice.clientEmail && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{invoice.clientEmail}</div>}
              {invoice.clientAddress && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Row label="Issue Date" value={invoice.issueDate} />
              <Row label="Due Date" value={invoice.dueDate} />
            </div>
          </div>

          {/* Line items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                {['Description', 'Qty', 'Rate', 'Total'].map(h => (
                  <th key={h} style={{
                    textAlign: h === 'Description' ? 'left' : 'right',
                    padding: '8px 12px',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: '#9ca3af',
                    fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px', fontSize: 14, color: '#111' }}>{item.description || '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, color: '#374151', textAlign: 'right', fontFamily: 'monospace' }}>{item.qty}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, color: '#374151', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(parseFloat(item.rate) || 0)}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, color: '#111', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(calcLineTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ minWidth: 240 }}>
              <TotalRow label="Subtotal" value={fmt(subtotal)} />
              {parseFloat(invoice.taxRate) > 0 && (
                <TotalRow label={`Tax (${invoice.taxRate}%)`} value={fmt(tax)} />
              )}
              <div style={{ borderTop: '2px solid #111', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: '#d97706' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#9ca3af', marginBottom: 6 }}>Notes</div>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{invoice.notes}</p>
            </div>
          )}

          {/* Stripe link */}
          {invoice.stripeLink && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: '#fef9f0', borderRadius: 6, border: '1px solid #fde68a' }}>
              <span style={{ fontSize: 12, color: '#92400e' }}>Pay online: </span>
              <span style={{ fontSize: 12, color: '#d97706', fontFamily: 'monospace' }}>{invoice.stripeLink}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#9ca3af', marginRight: 12 }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'white' }}>{value || '—'}</span>
    </div>
  )
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#374151' }}>{value}</span>
    </div>
  )
}
