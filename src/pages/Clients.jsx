import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Check } from 'lucide-react'
import { getClients, saveClient, deleteClient } from '../lib/storage'
import { uid } from '../lib/storage'

const emptyForm = { name: '', email: '', address: '', phone: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  useEffect(() => { setClients(getClients()) }, [])

  function refresh() { setClients(getClients()) }

  function handleSave() {
    if (!form.name.trim()) return
    const client = { ...form, id: editId || uid() }
    saveClient(client)
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    refresh()
  }

  function startEdit(client) {
    setForm({ name: client.name, email: client.email, address: client.address, phone: client.phone || '' })
    setEditId(client.id)
    setShowForm(true)
  }

  function handleDelete(id) {
    if (confirm('Delete this client?')) {
      deleteClient(id)
      refresh()
    }
  }

  function cancel() {
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{clients.length} saved</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">{editId ? 'Edit Client' : 'New Client'}</h2>
            <button onClick={cancel} className="text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@acme.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <textarea className="input resize-none" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, City, State 00000" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={cancel}>Cancel</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={handleSave}>
              <Check size={14} /> {editId ? 'Update' : 'Save'} Client
            </button>
          </div>
        </div>
      )}

      {/* Client list */}
      <div className="card overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-16 text-center text-zinc-600">
            No clients yet. Add one to auto-fill invoices.
          </div>
        ) : (
          clients.map((client, i) => (
            <div
              key={client.id}
              className={`px-5 py-4 flex items-center justify-between ${i < clients.length - 1 ? 'border-b border-[#1e1e1e]' : ''}`}
            >
              <div>
                <p className="text-white font-medium text-sm">{client.name}</p>
                <div className="flex gap-4 mt-0.5">
                  {client.email && <span className="text-zinc-500 text-xs">{client.email}</span>}
                  {client.phone && <span className="text-zinc-500 text-xs">{client.phone}</span>}
                </div>
                {client.address && (
                  <p className="text-zinc-600 text-xs mt-0.5">{client.address}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost p-2" onClick={() => startEdit(client)}>
                  <Edit size={14} />
                </button>
                <button className="text-zinc-600 hover:text-red-400 transition-colors p-2" onClick={() => handleDelete(client.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
