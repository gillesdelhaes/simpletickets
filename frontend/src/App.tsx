import { Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'

// Placeholder — replaced when each chunk is built
function Placeholder({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs text-brand-primary tracking-widest uppercase mb-3">
          Coming in next chunk
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">{name}</h1>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Splash — active until auth is wired up (Chunk 05) */}
      <Route path="/" element={<Splash />} />

      {/* Auth — Chunk 05 */}
      <Route path="/login" element={<Placeholder name="Login" />} />

      {/* End user — Chunk 16 */}
      <Route path="/dashboard" element={<Placeholder name="My Tickets" />} />
      <Route path="/tickets/new" element={<Placeholder name="New Ticket" />} />
      <Route path="/tickets/:id" element={<Placeholder name="Ticket Detail" />} />

      {/* Technician — Chunks 17 & 18 */}
      <Route path="/queue" element={<Placeholder name="Ticket Queue" />} />
      <Route path="/queue/mine" element={<Placeholder name="My Queue" />} />
      <Route path="/search" element={<Placeholder name="Search" />} />

      {/* Reporting — Chunk 25 */}
      <Route path="/reports" element={<Placeholder name="Reports" />} />

      {/* Admin — Chunk 19 */}
      <Route path="/admin/users" element={<Placeholder name="User Management" />} />
      <Route path="/admin/categories" element={<Placeholder name="Categories" />} />
      <Route path="/admin/sla" element={<Placeholder name="SLA Policies" />} />
      <Route path="/admin/settings" element={<Placeholder name="Settings" />} />
      <Route path="/admin/audit" element={<Placeholder name="Audit Log" />} />
    </Routes>
  )
}
