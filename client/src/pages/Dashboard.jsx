import AuraSpheres from '../components/AuraSpheres'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <AuraSpheres />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '32px', color: '#3a1a26' }}>
          Welcome, <span style={{ color: '#e8638c', fontStyle: 'italic' }}>{user?.name} ✨</span>
        </h1>
        <p style={{ color: '#c07090', margin: '10px 0 24px', fontSize: '14px' }}>Dashboard coming soon 🌸</p>
        <button onClick={logout} style={{ background: 'linear-gradient(135deg,#f4a7bb,#e8638c)', border: 'none', borderRadius: '14px', color: 'white', padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-b)', fontSize: '14px' }}>
          Logout
        </button>
      </div>
    </div>
  )
}