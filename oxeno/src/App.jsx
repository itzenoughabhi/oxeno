import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home.jsx'
import Footer from './components/Footer/Footer.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Home />
      </main>
      <Footer />
    </div>
  )
}

export default App

