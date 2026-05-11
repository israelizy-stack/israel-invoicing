import { useEffect, useRef, useState } from 'react'
import { Check, Upload, X } from 'lucide-react'
import { getSettings, saveSettings } from '../lib/storage'

export default function Settings() {
  const [form, setForm] = useState({
    businessName: '',
    address: '',
    email: '',
    logo: null,
    defaultTaxRate: 0,
    defaultPaymentTerms: 30,
    currency: 'USD',
  })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    setForm({ ...form, ...getSettings() })
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('logo', ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Business profile & defaults</p>
        </div>
        <button
          className={`btn-primary flex items-center gap-2 transition-all ${saved ? 'bg-green-500 hover:bg-green-400' : ''}`}
          onClick={handleSave}
        >
          <Check size={14} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Business info */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Business Information</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Business Name</label>
            <input className="input" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Your Company LLC" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="billing@yourcompany.com" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder={"123 Business Ave\nSuite 100\nCity, State 00000"}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Business Logo</h2>
        <div className="flex items-center gap-4">
          {form.logo ? (
            <div className="relative">
              <img src={form.logo} alt="logo" className="h-16 object-contain rounded border border-[#2a2a2a] bg-[#111] p-2" />
              <button
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white hover:bg-red-400"
                onClick={() => set('logo', null)}
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <div
              className="h-16 w-32 border-2 border-dashed border-[#2a2a2a] rounded flex items-center justify-center text-zinc-600 cursor-pointer hover:border-amber-400/30 hover:text-zinc-400 transition-colors"
              onClick={() => fileRef.current.click()}
            >
              <Upload size={20} />
            </div>
          )}
          <div>
            <button className="btn-secondary text-xs" onClick={() => fileRef.current.click()}>
              {form.logo ? 'Replace Logo' : 'Upload Logo'}
            </button>
            <p className="text-zinc-600 text-xs mt-1">PNG, JPG, SVG — stored locally</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
      </div>

      {/* Defaults */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Invoice Defaults</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Default Tax Rate (%)</label>
            <input
              className="input mono"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.defaultTaxRate}
              onChange={e => set('defaultTaxRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Payment Terms (days)</label>
            <input
              className="input mono"
              type="number"
              min="0"
              value={form.defaultPaymentTerms}
              onChange={e => set('defaultPaymentTerms', parseInt(e.target.value) || 30)}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
