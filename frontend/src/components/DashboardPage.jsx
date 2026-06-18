// src/components/DashboardPage.jsx — Kanban board for job application tracking
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { trackerAPI } from '../utils/api'

const COLUMNS = [
  { id: 'bookmarked', label: 'Bookmarked', emoji: '🔖', color: '#f5c542' },
  { id: 'applied',    label: 'Applied',    emoji: '📨', color: '#60a5fa' },
  { id: 'interview',  label: 'Interview',  emoji: '🎙️', color: '#a78bfa' },
  { id: 'offered',    label: 'Offered',    emoji: '🎉', color: '#34d399' },
  { id: 'rejected',   label: 'Rejected',   emoji: '✕',  color: '#f87171' },
]

function DashboardPage({ onSignIn }) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [editingNotes, setEditingNotes] = useState(null) // job id
  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const notesRef = useRef(null)

  // Fetch all tracked jobs on mount
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await trackerAPI.getAll()
      setJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchJobs()
  }, [user, fetchJobs])

  // Focus textarea when editing notes
  useEffect(() => {
    if (editingNotes && notesRef.current) {
      notesRef.current.focus()
    }
  }, [editingNotes])

  // ── Drag handlers ──
  const handleDragStart = (e, jobId) => {
    setDraggedId(jobId)
    e.dataTransfer.effectAllowed = 'move'
    // Make the drag image slightly transparent
    if (e.target) {
      e.target.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1'
    setDraggedId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  const handleDragLeave = () => {
    setDragOverCol(null)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverCol(null)

    if (!draggedId) return

    const job = jobs.find((j) => j.id === draggedId)
    if (!job || job.status === newStatus) {
      setDraggedId(null)
      return
    }

    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === draggedId ? { ...j, status: newStatus } : j))
    )

    try {
      await trackerAPI.update(draggedId, { status: newStatus })
    } catch {
      // Revert on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === draggedId ? { ...j, status: job.status } : j))
      )
    }

    setDraggedId(null)
  }

  // ── Delete ──
  const handleDelete = async (jobId) => {
    const prev = [...jobs]
    setJobs((j) => j.filter((x) => x.id !== jobId))
    try {
      await trackerAPI.remove(jobId)
    } catch {
      setJobs(prev) // revert
    }
  }

  // ── Notes ──
  const startEditNotes = (job) => {
    setEditingNotes(job.id)
    setNotesText(job.notes || '')
  }

  const saveNotes = async () => {
    if (!editingNotes) return
    setSavingNotes(true)
    try {
      await trackerAPI.update(editingNotes, { notes: notesText })
      setJobs((prev) =>
        prev.map((j) => (j.id === editingNotes ? { ...j, notes: notesText } : j))
      )
    } catch {
      // silent fail
    }
    setSavingNotes(false)
    setEditingNotes(null)
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="dashboard-gate">
        <div className="dashboard-gate__icon">🔒</div>
        <h2 className="dashboard-gate__title">Sign in to access your Dashboard</h2>
        <p className="dashboard-gate__sub">
          Track your applications, manage your pipeline, and never lose sight of an opportunity.
        </p>
        <button className="btn btn--primary" onClick={onSignIn}>
          Sign in
        </button>
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Your Pipeline</h1>
        </div>
        <div className="loader" style={{ paddingTop: 80 }}>
          <div className="loader__ring" />
          <div className="loader__text">Loading your tracked jobs...</div>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Your Pipeline</h1>
        </div>
        <div className="empty-state empty-state--error">
          <div className="empty-state__icon">⚠️</div>
          <h3 className="empty-state__title">Something went wrong</h3>
          <p className="empty-state__desc">{error}</p>
        </div>
      </div>
    )
  }

  const grouped = {}
  COLUMNS.forEach((col) => {
    grouped[col.id] = jobs.filter((j) => j.status === col.id)
  })

  const totalJobs = jobs.length

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Your Pipeline</h1>
          <p className="dashboard__sub">
            {totalJobs === 0
              ? 'No jobs tracked yet — search and bookmark some!'
              : `${totalJobs} job${totalJobs !== 1 ? 's' : ''} across ${COLUMNS.filter((c) => grouped[c.id].length > 0).length} stages`}
          </p>
        </div>
      </div>

      {totalJobs === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state__icon">📋</div>
          <h3 className="empty-state__title">Your board is empty</h3>
          <p className="empty-state__desc">
            Head to the Search page, find internships, and click "Track" to add them here.
          </p>
        </motion.div>
      ) : (
        <div className="kanban">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`kanban__col ${dragOverCol === col.id ? 'kanban__col--drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="kanban__col-header" style={{ '--col-color': col.color }}>
                <span className="kanban__col-emoji">{col.emoji}</span>
                <span className="kanban__col-label">{col.label}</span>
                <span className="kanban__col-count">{grouped[col.id].length}</span>
              </div>

              <div className="kanban__cards">
                <AnimatePresence>
                  {grouped[col.id].map((job) => (
                    <motion.div
                      key={job.id}
                      className={`kanban__card ${draggedId === job.id ? 'kanban__card--dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onDragEnd={handleDragEnd}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="kanban__card-top">
                        <h4 className="kanban__card-role">{job.role}</h4>
                        <button
                          className="kanban__card-delete"
                          onClick={() => handleDelete(job.id)}
                          title="Remove from tracker"
                        >
                          ×
                        </button>
                      </div>

                      <div className="kanban__card-company">{job.company}</div>

                      {job.location && (
                        <div className="kanban__card-meta">📍 {job.location}</div>
                      )}
                      {job.stipend && (
                        <div className="kanban__card-stipend">{job.stipend}</div>
                      )}

                      {/* Notes */}
                      {editingNotes === job.id ? (
                        <div className="kanban__card-notes-editor">
                          <textarea
                            ref={notesRef}
                            className="kanban__card-notes-input"
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add your notes..."
                            rows={3}
                          />
                          <div className="kanban__card-notes-actions">
                            <button
                              className="kanban__card-notes-save"
                              onClick={saveNotes}
                              disabled={savingNotes}
                            >
                              {savingNotes ? '...' : 'Save'}
                            </button>
                            <button
                              className="kanban__card-notes-cancel"
                              onClick={() => setEditingNotes(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="kanban__card-notes-btn"
                          onClick={() => startEditNotes(job)}
                        >
                          {job.notes ? '📝 ' + job.notes.slice(0, 40) + (job.notes.length > 40 ? '...' : '') : '+ Add notes'}
                        </button>
                      )}

                      <a
                        className="kanban__card-link"
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View listing →
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {grouped[col.id].length === 0 && (
                  <div className="kanban__empty">
                    Drop jobs here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
