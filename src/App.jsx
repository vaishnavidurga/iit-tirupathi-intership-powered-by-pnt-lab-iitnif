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
    const timer = setTimeout(() => setLoading(false), 3000) // 3-second splash
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div style={styles.splashContainer}>
        <img src="Screenshot 2025-11-20 194447.png" alt="Logo" style={styles.logo} />
      </div>
    )
  }

  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Redirect root to login first */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} /> {/* Login page first */}
          <Route path="/landing" element={<Landing />} /> {/* Home / Landing page */}
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

// CSS-in-JS styles
const styles = {
  splashContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#282c34',
    animation: 'fadeInOut 3s forwards',
  },
  logo: {
    width: '200px',
    animation: 'bounce 2s infinite',
  },
}

// Add keyframe animations
const styleSheet = document.styleSheets[0]
styleSheet.insertRule(`
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}`, styleSheet.cssRules.length)

styleSheet.insertRule(`
@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}`, styleSheet.cssRules.length)
