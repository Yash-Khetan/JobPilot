import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { trackerAPI } from '../utils/api'

// Use environment variable for API URL in production, fallback to localhost for development
// Notice we use the base URL (without /api) because SearchPage appends /api/scrape/internshala
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function SearchPage({ onBack, onSignIn }) {
  const { user } = useAuth()
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [stipend, setStipend] = useState('')
  const [jobs, setJobs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [trackedIds, setTrackedIds] = useState(new Set()) // track which jobs have been saved
  const [trackingId, setTrackingId] = useState(null) // currently saving

  const handleTrack = async (job, index) => {
    if (!user) return
    if (trackedIds.has(index)) return
    setTrackingId(index)
    try {
      await trackerAPI.save({
        role: job.role,
        company: job.company,
        location: job.location,
        stipend: job.stipend,
        description: job.description,
        link: job.link,
        source: job.source || 'internshala',
        status: 'bookmarked',
      })
      setTrackedIds((prev) => new Set(prev).add(index))
    } catch {
      // silent fail
    }
    setTrackingId(null)
  }

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

      const token = localStorage.getItem('jobpilot_token')
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/scrape/internshala?${params}`, { headers })

      if (res.status === 401) {
        setError('__auth__')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && data.message && data.message.includes("upload your resume")) {
          setError('__no_resume__')
          return
        }
        throw new Error(data.message || `Server error: ${res.status}`)
      }

      // Sort jobs by similarityScore descending
      const sortedJobs = data.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
      setJobs(sortedJobs)
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
        We scrape Internshala live, then use your <strong style={{ color: 'var(--color-primary)' }}>Resume Semantic Embeddings</strong> to filter out any internship that is less than an 80% match to your exact skills and projects.
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
        {error && error !== '__auth__' && error !== '__no_resume__' && (
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

      {/* Auth required */}
      <AnimatePresence>
        {error === '__auth__' && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="empty-state__icon">🔒</div>
            <h3 className="empty-state__title">Sign up to search</h3>
            <p className="empty-state__desc">
              You need an account to use the scraper. It only takes a few seconds!
            </p>
            <button
              className="btn btn--primary"
              style={{ marginTop: 20 }}
              onClick={onSignIn}
            >
              Sign up / Sign in
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume required */}
      <AnimatePresence>
        {error === '__no_resume__' && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="empty-state__icon">📄</div>
            <h3 className="empty-state__title">Resume Required</h3>
            <p className="empty-state__desc">
              You need to upload your resume before searching. We use it to filter out irrelevant jobs and only show you highly personalized matches!
            </p>
            <button
              className="btn btn--primary"
              style={{ marginTop: 20 }}
              onClick={onBack}
            >
              Go to Dashboard to Upload
            </button>
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
          <div className="results-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="results-bar__count">
              <span>{jobs.length}</span> personalized internship{jobs.length !== 1 && 's'} found
            </div>
            <div style={{ fontSize: '0.85rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              ✨ &gt;60% Resume Match
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {job.stipend && <div className="job__pay">{job.stipend}</div>}
                    {job.similarityScore && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        ✨ {job.similarityScore.toFixed(0)}% Match
                      </div>
                    )}
                  </div>
                </div>
                <div className="job__loc">📍 {job.location}</div>
                {job.description && <p className="job__desc">{job.description}</p>}
                <div className="job__actions">
                  <a
                    className="job__apply"
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply now →
                  </a>
                  {user ? (
                    <button
                      className={`job__track ${trackedIds.has(i) ? 'job__track--done' : ''}`}
                      onClick={() => handleTrack(job, i)}
                      disabled={trackingId === i || trackedIds.has(i)}
                    >
                      {trackedIds.has(i) ? '✓ Tracked' : trackingId === i ? '...' : '🔖 Track'}
                    </button>
                  ) : (
                    <span className="job__track-hint">Sign in to track</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
