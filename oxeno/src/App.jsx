import { useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Footer from './components/Footer/Footer.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('home') // 'home' | 'login' | 'signup' | 'dashboard'

  return (
    <div className="app">
      {page === 'home' && <Navbar onNavigate={setPage} />}
      <main className="app-main">
        {page === 'home' && <Home />}
        {page === 'login' && <Login onNavigate={setPage} />}
        {page === 'signup' && <SignUp onNavigate={setPage} />}
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      </main>
      {page === 'home' && <Footer />}
    </div>
  )
}

export default App