import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import SearchPage from "./components/SearchPage";
import AuthPage from "./components/AuthPage";
import "./index.css";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState("landing");

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader__ring" />
      </div>
    );
  }

  return (
    <>
      <div className="noise" />
      <div className="glow-blob" />

      <nav className="nav">
        <div className="nav__brand" onClick={() => setPage("landing")}>
          <div className="nav__brand-dot" />
          jobpilot
        </div>
        <div className="nav__actions">
          <span className="nav__link" onClick={() => setPage("landing")}>
            Home
          </span>
          <span
            className="nav__link"
            onClick={() => setPage("search")}
          >
            Search
          </span>

          {user ? (
            <>
              <span className="nav__user">
                <span className="nav__user-avatar">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="nav__user-name">{user.name?.split(" ")[0]}</span>
              </span>
              <span
                className="nav__link nav__link--logout"
                onClick={() => {
                  logout();
                  setPage("landing");
                }}
              >
                Logout
              </span>
            </>
          ) : (
            <span
              className="nav__link nav__link--primary"
              onClick={() => setPage("auth")}
            >
              Sign in
            </span>
          )}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {page === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage
              onGetStarted={() => setPage("search")}
              onSignIn={() => setPage("auth")}
            />
          </motion.div>
        )}

        {page === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SearchPage onBack={() => setPage("landing")} />
          </motion.div>
        )}

        {page === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthPage onSuccess={() => setPage("search")} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
