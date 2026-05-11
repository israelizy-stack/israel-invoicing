import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getInvoices } from '../lib/storage'
import { calcTotal, fmt, resolveStatus } from '../lib/invoice'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setInvoices(getInvoices().map(inv => ({ ...inv, _status: resolveStatus(inv) })))
  }, [])

  const outstanding = invoices
    .filter(i => i._status === 'sent' || i._status === 'overdue')
    .reduce((sum, i) => sum + calcTotal(i.items, i.taxRate), 0)

  const counts = {
    draft: invoices.filter(i => i._status === 'draft').length,
    sent: invoices.filter(i => i._status === 'sent').length,
    paid: invoices.filter(i => i._status === 'paid').length,
    overdue: invoices.filter(i => i._status === 'overdue').length,
  }

  const stats = [
    { label: 'Outstanding', value: fmt(outstanding), icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Draft', value: counts.draft, icon: Clock, color: 'text-zinc-400' },
    { label: 'Sent', value: counts.sent, icon: CheckCircle, color: 'text-blue-400' },
    { label: 'Overdue', value: counts.overdue, icon: AlertCircle, color: 'text-red-400' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{invoices.length} total</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/invoices/new')}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={`mono text-xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="card overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-zinc-600 mb-4">No invoices yet</p>
            <button className="btn-primary" onClick={() => navigate('/invoices/new')}>Create your first invoice</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Invoice', 'Client', 'Issued', 'Due', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className={`border-b border-[#1e1e1e] hover:bg-[#1e1e1e] cursor-pointer transition-colors ${i === invoices.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-4 py-3 mono text-sm text-amber-400">{inv.number}</td>
                  <td className="px-4 py-3 text-sm text-white">{inv.clientName || <span className="text-zinc-600">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 mono">{inv.issueDate || '—'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 mono">{inv.dueDate || '—'}</td>
                  <td className="px-4 py-3 mono text-sm text-white">{fmt(calcTotal(inv.items, inv.taxRate))}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv._status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
