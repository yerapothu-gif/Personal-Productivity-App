import './Sidebar.css'

const navItems = [
  { icon: '🏠', label: 'Dashboard', page: 'dashboard' },
  { icon: '📅', label: 'Planner', page: 'planner' },
  { icon: '✅', label: 'To-Do', page: 'todo' },
  { icon: '📓', label: 'Diary', page: 'diary' },
]

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">✿</div>
      {navItems.map(item => (
        <button
          key={item.page}
          className={`nav-btn ${activePage === item.page ? 'active' : ''}`}
          onClick={() => setActivePage(item.page)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-tooltip">{item.label}</span>
        </button>
      ))}
      <div className="sidebar-spacer" />
      <button className="nav-btn" onClick={onLogout}>
        <span className="nav-icon">🚪</span>
        <span className="nav-tooltip">Logout</span>
      </button>
    </nav>
  )
}