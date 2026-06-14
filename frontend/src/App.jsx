import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from './components/LandingPage'
import SearchPage from './components/SearchPage'
import './index.css'

function App() {
  const [page, setPage] = useState('landing')

  return (
    <>
      <div className="noise" />
      <div className="glow-blob" />

      <nav className="nav">
        <div className="nav__brand" onClick={() => setPage('landing')}>
          <div className="nav__brand-dot" />
          jobpilot
        </div>
        <div className="nav__actions">
          <span className="nav__link" onClick={() => setPage('landing')}>Home</span>
          <span className="nav__link nav__link--primary" onClick={() => setPage('search')}>
            Search now
          </span>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {page === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onGetStarted={() => setPage('search')} />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SearchPage onBack={() => setPage('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
