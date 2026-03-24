import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import './Diary.css'

const MOODS = ['😊', '😌', '😔', '😤', '🥰', '😴', '🤔', '🥳']

// ── Diary Mini Calendar ──────────────────────────────────────────────────────
function DiaryCalendar({ selectedDate, onSelectDate, entryDates }) {
  const today = dayjs()
  const [viewDate, setViewDate] = useState(dayjs(selectedDate))

  const startOfMonth = viewDate.startOf('month')
  const daysInMonth  = viewDate.daysInMonth()
  const firstDOW     = startOfMonth.day()

  const days = []
  for (let i = 0; i < firstDOW; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const isToday    = d => d && viewDate.date(d).isSame(today, 'day')
  const isSelected = d => d && viewDate.date(d).isSame(dayjs(selectedDate), 'day')
  const hasEntry   = d => {
    if (!d) return false
    return entryDates.has(viewDate.date(d).format('YYYY-MM-DD'))
  }

  return (
    <div className="diary-mini-cal">
      <div className="dmc-header">
        <button className="dmc-nav" onClick={() => setViewDate(v => v.subtract(1, 'month'))}>‹</button>
        <span className="dmc-title">{viewDate.format('MMMM YYYY')}</span>
        <button className="dmc-nav" onClick={() => setViewDate(v => v.add(1, 'month'))}>›</button>
      </div>
      <div className="dmc-weekdays">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="dmc-wd">{d}</span>
        ))}
      </div>
      <div className="dmc-grid">
        {days.map((day, i) => (
          <button
            key={i}
            className={[
              'dmc-day',
              !day       ? 'dmc-empty'    : '',
              isToday(day)    ? 'dmc-today'    : '',
              isSelected(day) ? 'dmc-selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => day && onSelectDate(viewDate.date(day).format('YYYY-MM-DD'))}
            disabled={!day}
          >
            {day || ''}
            {hasEntry(day) && <span className="dmc-dot" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Diary Component ─────────────────────────────────────────────────────
export default function Diary({ syncDate }) {
  const today = dayjs().format('YYYY-MM-DD')

  const [selectedDate, setSelectedDate] = useState(syncDate || today)
  const [content, setContent]     = useState('')
  const [mood, setMood]           = useState('')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'unsaved'
  const [loading, setLoading]     = useState(true)
  const [allEntries, setAllEntries] = useState([])   // [{date, mood, content}]
  const [plannerTasks, setPlannerTasks] = useState([]) // completed tasks from planner

  const saveTimer = useRef(null)
  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  // ── Load all entries (for calendar dots + past list) ────────────────────
  const loadAllEntries = async () => {
    try {
      const res = await axios.get('/api/diary', { headers: authHeader })
      setAllEntries(res.data)
    } catch (e) {
      console.error('Failed to load entries', e)
    }
  }

  // ── Load single entry for selected date ────────────────────────────────
  const loadEntry = async (date) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/diary/${date}`, { headers: authHeader })
      setContent(res.data.content || '')
      setMood(res.data.mood || '')
      setSaveStatus('saved')
    } catch (e) {
      console.error('Failed to load entry', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Load planner tasks for the selected date (bonus: completed summary) ──
  const loadPlannerTasks = async (date) => {
    try {
      const res = await axios.get(`/api/planner/${date}`, { headers: authHeader })
      const done = (res.data.slots || []).filter(s => s.task)
      setPlannerTasks(done)
    } catch (e) {
      setPlannerTasks([])
    }
  }

  useEffect(() => {
    loadAllEntries()
  }, [])

  useEffect(() => {
    loadEntry(selectedDate)
    loadPlannerTasks(selectedDate)
  }, [selectedDate])

  // Sync with parent date (planner date) if passed
  useEffect(() => {
    if (syncDate && syncDate !== selectedDate) setSelectedDate(syncDate)
  }, [syncDate])

  // ── Auto-save (debounced 1.2s) ─────────────────────────────────────────
  const autoSave = useCallback(async (text, currentMood) => {
    setSaveStatus('saving')
    try {
      await axios.put(
        `/api/diary/${selectedDate}`,
        { content: text, mood: currentMood },
        { headers: authHeader }
      )
      setSaveStatus('saved')
      loadAllEntries() // refresh dots
    } catch (e) {
      setSaveStatus('unsaved')
    }
  }, [selectedDate])

  const handleContentChange = (e) => {
    const val = e.target.value
    setContent(val)
    setSaveStatus('unsaved')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(val, mood), 1200)
  }

  const handleMoodSelect = async (m) => {
    const next = m === mood ? '' : m
    setMood(next)
    await autoSave(content, next)
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const entryDates = new Set(allEntries.filter(e => e.content).map(e => e.date))
  const wordCount  = content.trim() ? content.trim().split(/\s+/).length : 0
  const isToday    = selectedDate === today

  const pastEntries = [...allEntries]
    .filter(e => e.content)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15)

  const dateLabel = isToday
    ? 'Today'
    : dayjs(selectedDate).format('dddd, MMMM D, YYYY')

  const saveLabel = saveStatus === 'saved'
    ? '✓ Saved'
    : saveStatus === 'saving'
    ? 'Saving...'
    : '● Unsaved'

  if (loading) return (
    <div className="diary-loading">
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </div>
  )

  return (
    <div className="diary-layout">

      {/* ── Left: Editor ─────────────────────────────────────────────────── */}
      <div className="diary-main">

        {/* Date Bar */}
        <div className="diary-date-bar">
          <div>
            <div className="diary-date-label">{dateLabel} ✨</div>
            <div className="diary-date-sub">
              {isToday ? 'Write freely — auto-saved as you type' : 'Viewing a past entry'}
            </div>
          </div>
        </div>

        {/* Mood Picker */}
        <div className="mood-row">
          <span className="mood-label">MOOD</span>
          <div className="mood-options">
            {MOODS.map(m => (
              <button
                key={m}
                className={`mood-btn ${mood === m ? 'selected' : ''}`}
                onClick={() => handleMoodSelect(m)}
                title={m}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="diary-editor-card">
          <textarea
            className="diary-textarea"
            placeholder="Dear diary… what's on your mind today? 🌸&#10;&#10;Write freely. This space is yours."
            value={content}
            onChange={handleContentChange}
            spellCheck
          />
          <div className="diary-editor-footer">
            <span className="diary-word-count">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span className={`diary-save-status ${saveStatus}`}>
              <span className={`save-dot ${saveStatus === 'saving' ? 'pulse' : ''}`} />
              {saveLabel}
            </span>
          </div>
        </div>

        {/* Completed Tasks Summary (Bonus) */}
        <div className="diary-tasks-summary">
          <div className="diary-tasks-title">
            <div className="diary-tasks-icon">📅</div>
            {isToday ? "Today's Planner" : `${dayjs(selectedDate).format('MMM D')} Planner`}
          </div>
          {plannerTasks.length === 0 ? (
            <p className="diary-no-tasks">No tasks planned for this day 🌿</p>
          ) : (
            <div className="diary-task-chips">
              {plannerTasks.map(t => (
                <span key={t.hour} className="diary-task-chip">
                  <span className="chip-check">✓</span>
                  {t.hour} — {t.task}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Right Sidebar ─────────────────────────────────────────────────── */}
      <div className="diary-sidebar-right">

        <DiaryCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          entryDates={entryDates}
        />

        {/* Quick jumps */}
        <div className="diary-quick-jumps">
          <button className={`dqj-btn ${isToday ? 'active' : ''}`} onClick={() => setSelectedDate(today)}>Today</button>
          <button className="dqj-btn" onClick={() => setSelectedDate(dayjs().subtract(1,'day').format('YYYY-MM-DD'))}>Yesterday</button>
          <button className="dqj-btn" onClick={() => setSelectedDate(dayjs().subtract(7,'day').format('YYYY-MM-DD'))}>–7 days</button>
        </div>

        {/* Past Entries */}
        <div className="diary-past-entries">
          <div className="diary-past-title">📖 Past Entries</div>
          {pastEntries.length === 0 ? (
            <p className="diary-no-entries">No entries yet 🌸</p>
          ) : (
            <div className="diary-past-list">
              {pastEntries.map(e => (
                <div
                  key={e.date}
                  className={`diary-past-item ${e.date === selectedDate ? 'active-entry' : ''}`}
                  onClick={() => setSelectedDate(e.date)}
                >
                  <div>
                    <div className="diary-past-date">{dayjs(e.date).format('MMM D, YYYY')}</div>
                    <div className="diary-past-snippet">{e.content.slice(0, 40)}…</div>
                  </div>
                  {e.mood && <span className="diary-past-mood">{e.mood}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}