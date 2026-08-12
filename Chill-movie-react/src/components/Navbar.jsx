import { Menu, Search, UserRound, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { getUser, logoutUser } from '../utils/auth'

export default function Navbar({ onSearch }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/home"><Logo /></Link>
        <nav className={`nav-menu ${open ? 'open' : ''}`}>
          <a href="#home" onClick={() => setOpen(false)}>Home</a>
          <a href="#trending" onClick={() => setOpen(false)}>Trending</a>
          <a href="#movies" onClick={() => setOpen(false)}>Movies</a>
          <a href="#my-list" onClick={() => setOpen(false)}>My List</a>
        </nav>
        <div className="nav-right">
          <button className="icon-btn" onClick={onSearch} aria-label="Search"><Search size={20} /></button>
          <button className="profile" onClick={() => alert(`Signed in as ${user?.name || 'Chill user'}`)}>
            <span>{(user?.name || 'C').slice(0, 1).toUpperCase()}</span>
          </button>
          <button className="icon-btn logout-btn" onClick={logout} aria-label="Logout"><LogOut size={17} /></button>
          <button className="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  )
}
