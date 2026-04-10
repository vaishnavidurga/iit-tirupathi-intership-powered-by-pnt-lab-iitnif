import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Satellite from './pages/Satellite'
import Validation from './pages/Validation'
import Irrigation from './pages/Irrigation'
import Analytics from './pages/Analytics'
import Documentation from './pages/Documentation'
import About from './pages/About'
import Settings from './pages/Settings'
import Login from './pages/Login'

import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  /* Splash Screen */
  if (loading) {
    return (
      <div className="splash-container">
        <img
          src="Screenshot 2025-11-20 194447.png"
          className="splash-logo"
          alt="logo"
        />
      </div>
    )
  }

  return (
    <div className="app-root">

      {/* Premium Background */}
      <div className="farm-bg"/>
      <div className="farm-field"/>
      <div className="rain"/>

      <Header />

      <main className="main-content">
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          <Route path="/landing" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/satellite" element={<Satellite />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/irrigation" element={<Irrigation />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          
        </Routes>
      </main>

      <Footer />

    </div>
  )
}