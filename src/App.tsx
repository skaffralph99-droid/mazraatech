import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Lands from './pages/Lands'
import LandDetail from './pages/LandDetail'
import NewCost from './pages/NewCost'
import Equipment from './pages/Equipment'
import Workers from './pages/Workers'
import Login from './pages/Login'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-farm-bg flex flex-col items-center justify-center">
      <div className="text-6xl mb-4 animate-float">🌾</div>
      <p className="text-gradient text-xl font-black tracking-wider">MazraaTech</p>
    </div>
  )
  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lands" element={<Lands />} />
          <Route path="/lands/:id" element={<LandDetail />} />
          <Route path="/costs/new" element={<NewCost />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/workers" element={<Workers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
