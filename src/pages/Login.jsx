import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const nav = useNavigate()

  function submit(e){
    e.preventDefault()
    const user = {name: name || 'User', email}
    localStorage.setItem('soilUser', JSON.stringify(user))
    // after login we show the landing/hero content before heading to dashboard
    nav('/landing')
  }

  return (
    <div>
      <h2>Login / Demo Session</h2>
      <div className="card">
        <form onSubmit={submit} style={{display:'grid',gap:8}}>
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn">Start Session</button>
        </form>
        <div style={{marginTop:8,fontSize:12,color:'#666'}}>This demo uses localStorage for a simple session; not for production authentication.</div>
      </div>
    </div>
  )
}
