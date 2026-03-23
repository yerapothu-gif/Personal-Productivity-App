import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuraSpheres from '../components/AuraSpheres'
import Sidebar from '../components/Sidebar'
import Planner from './Planner'
import './Dashboard.css'

export default function Dashboard() {
  const [activePage, setActivePage] = useState('planner')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const pageTitle = () => {
    if (activePage === 'dashboard') return <>{greeting}, <span>{user?.name || 'lovely'} ✨</span></>
    if (activePage === 'planner') return <>Daily <span>Planner 📅</span></>
    if (activePage === 'todo') return <>My <span>To-Dos ✅</span></>
    return <>Dear <span>Diary 📓</span></>
  }

  return (
    <div className="app-layout">
      <AuraSpheres />
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />
      <main className="main-content">

        <div className="main-header">
          <h1 className="main-title">{pageTitle()}</h1>
          <div className="date-pill">🌸 {today}</div>
        </div>

        {activePage === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="dash-card span-col-2">
              <div className="dash-card-title">
                <div className="dash-icon">📅</div>
                Today's Schedule
              </div>
              <Planner mini={true} />
            </div>
            <div className="dash-card">
              <div className="dash-card-title">
                <div className="dash-icon">✨</div>
                Quick Actions
              </div>
              <div className="quick-actions">
                <button className="qa-btn" onClick={() => setActivePage('planner')}>Open Planner →</button>
                <button className="qa-btn" onClick={() => setActivePage('todo')}>Open To-Do →</button>
                <button className="qa-btn" onClick={() => setActivePage('diary')}>Open Diary →</button>
              </div>
            </div>
          </div>
        )}

        {activePage === 'planner' && (
          <div className="page-card">
            <Planner mini={false} />
          </div>
        )}

        {activePage === 'todo' && (
          <div className="page-card coming-soon">
            <div>📋</div>
            <p>To-Do coming soon!</p>
          </div>
        )}

        {activePage === 'diary' && (
          <div className="page-card coming-soon">
            <div>📓</div>
            <p>Diary coming soon!</p>
          </div>
        )}

      </main>
    </div>
  )
}
