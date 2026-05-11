import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import InvoiceBuilder from './pages/InvoiceBuilder'
import InvoiceView from './pages/InvoiceView'
import Clients from './pages/Clients'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices/new" element={<InvoiceBuilder />} />
          <Route path="/invoices/:id" element={<InvoiceView />} />
          <Route path="/invoices/:id/edit" element={<InvoiceBuilder />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
