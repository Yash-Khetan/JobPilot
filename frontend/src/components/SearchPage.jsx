import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = 'http://localhost:3000'

function SearchPage({ onBack }) {
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [stipend, setStipend] = useState('')
  const [jobs, setJobs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!role.trim() || !location.trim()) return

    setLoading(true)
    setError(null)
    setJobs(null)

    try {
      const params = new URLSearchParams({
        role: role.trim(),
        location: location.trim(),
      })
      if (stipend.trim()) params.append('stipend', stipend.trim())

      const res = await fetch(`${API_BASE}/api/scrape/internshala?${params}`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      setJobs(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Can\'t reach the backend. Make sure the Express server is running on port 3000.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-page">
      <motion.button
        className="search-page__back"
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        ← back
      </motion.button>

      <motion.h1
        className="search-page__headline"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        What are you looking for?
      </motion.h1>
      <motion.p
        className="search-page__sub"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        We'll scrape Internshala live. No cached data, no stale listings.
      </motion.p>

      <motion.form
        className="search-form"
        onSubmit={handleSearch}
        id="search-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <div className="search-form__grid">
          <div className="field">
            <label className="field__label" htmlFor="input-role">Role *</label>
            <input
              className="field__input"
              id="input-role"
              type="text"
              placeholder="e.g. Backend Development"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="input-location">Location *</label>
            <input
              className="field__input"
              id="input-location"
              type="text"
              placeholder="e.g. Mumbai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="input-stipend">Min stipend</label>
            <input
              className="field__input"
              id="input-stipend"
              type="text"
              placeholder="e.g. 5000 (optional)"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
            />
          </div>
        </div>

        <button
          className="search-form__btn"
          type="submit"
          disabled={loading || !role.trim() || !location.trim()}
          id="btn-search"
        >
          {loading ? (
            <>
              <span className="loader__ring" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Scraping Internshala...
            </>
          ) : (
            'Search internships'
          )}
        </button>
      </motion.form>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loader__ring" />
            <div className="loader__text">
              Hitting Internshala right now — hang tight...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="empty-state empty-state--error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="empty-state__icon">⚠️</div>
            <h3 className="empty-state__title">Something broke</h3>
            <p className="empty-state__desc">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {jobs && jobs.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="empty-state__icon">🤷</div>
            <h3 className="empty-state__title">Nothing matched</h3>
            <p className="empty-state__desc">
              Try a different role, city, or drop the stipend filter.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {jobs && jobs.length > 0 && (
        <div>
          <div className="results-bar">
            <div className="results-bar__count">
              <span>{jobs.length}</span> internship{jobs.length !== 1 && 's'} found
            </div>
          </div>

          <div className="results-list">
            {jobs.map((job, i) => (
              <motion.div
                className="job"
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              >
                <div className="job__header">
                  <div>
                    <h3 className="job__role">{job.role}</h3>
                    <div className="job__company">{job.company}</div>
                  </div>
                  {job.stipend && <div className="job__pay">{job.stipend}</div>}
                </div>
                <div className="job__loc">📍 {job.location}</div>
                {job.description && <p className="job__desc">{job.description}</p>}
                <a
                  className="job__apply"
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply now →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
