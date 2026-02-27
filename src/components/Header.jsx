import React, {useEffect, useState} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header(){
  const loc = useLocation()
  const nav = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(()=>{
    const raw = localStorage.getItem('soilUser')
    if(raw) setUser(JSON.parse(raw))
  }, [loc])

  function logout(){
    localStorage.removeItem('soilUser')
    setUser(null)
    nav('/')
  }

  return (
    <header className="header">
      <div className="inner" style={{maxWidth:1200, margin:'0 auto'}}>
        <div className="logo">
          {/* replace the blue "SS" block with your college logo */}
          <div className="mark" style={{padding:2}}>
            {/* replace the src below with the actual logo file you have attached */}
            <img
              src="/assets/college-logo.png"
              alt="College logo"
              style={{width:'100%',height:'100%',objectFit:'contain',borderRadius:6}}
            />
          </div>
          <div>
            <div style={{fontWeight:700}}>SoilSense</div>
            <div style={{fontSize:12,opacity:0.9}}>Precision Agriculture — Velagapudi Ramakrishna Siddhartha Engineering College</div>
          </div>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/satellite">Satellite</Link>
          <Link to="/validation">Validation</Link>
          <Link to="/irrigation">Irrigation</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/documentation">Docs</Link>
          <Link to="/about">About</Link>
          <Link to="/settings">Settings</Link>
          {user ? (
            <span style={{marginLeft:12}}>
              <span style={{opacity:0.9, marginRight:8}}>Hi, {user.name}</span>
              <button className="btn" onClick={logout}>Logout</button>
            </span>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
