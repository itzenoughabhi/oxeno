import { useState } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomerSignUp from "./pages/CustomerSignUp.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import Footer from "./components/Footer/Footer.jsx";
import {
  clearSession,
  getStoredSession,
  saveSession,
} from "./services/session.js";
import "./App.css";

function App() {
  const [page, setPage] = useState("home"); // 'home' | 'login' | 'signup' | 'dashboard'
  const [account, setAccount] = useState(() => getStoredSession());

  function handleLogin(loginAccount, remember, accessToken) {
    setAccount(saveSession(loginAccount, remember, accessToken));
    setPage(
      loginAccount.user.role === "customer"
        ? "customer-dashboard"
        : "dashboard",
    );
  }

  function handleLogout() {
    clearSession();
    setAccount(null);
    setPage("home");
  }

  function handleCustomerSessionExpired() {
    clearSession();
    setAccount(null);
    setPage("customer-login");
  }

  return (
    <div className="app">
      {page === "home" && (
        <Navbar
          onNavigate={setPage}
          account={account}
          onLogout={handleLogout}
        />
      )}
      <main className="app-main">
        {page === "home" && <Home account={account} />}
        {page === "login" && (
          <Login onNavigate={setPage} onLogin={handleLogin} />
        )}
        {page === "signup" && <SignUp onNavigate={setPage} />}
        {page === "customer-login" && (
          <CustomerLogin onNavigate={setPage} onLogin={handleLogin} />
        )}
        {page === "customer-signup" && (
          <CustomerSignUp onNavigate={setPage} onLogin={handleLogin} />
        )}
        {page === "dashboard" && (
          <Dashboard
            onNavigate={setPage}
            account={account}
            onLogout={handleLogout}
          />
        )}
        {page === "customer-dashboard" && (
          <CustomerDashboard
            onNavigate={setPage}
            account={account}
            onLogout={handleLogout}
            onSessionExpired={handleCustomerSessionExpired}
          />
        )}
      </main>
      {page === "home" && <Footer />}
    </div>
  );
}

export default App;
