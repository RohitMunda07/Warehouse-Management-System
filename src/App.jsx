import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import Placeholder from './pages/Placeholder.jsx'
import './styles/App.css'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/receiving" element={<Placeholder title="Receiving" />} />
        <Route path="/shipping" element={<Placeholder title="Shipping" />} />
        <Route path="/reports" element={<Placeholder title="Reports" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  )
}
