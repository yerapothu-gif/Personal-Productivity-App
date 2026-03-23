import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import './Planner.css'

// ── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelectDate, tasksByDate }) {
  const today = dayjs()
  const [viewDate, setViewDate] = useState(dayjs(selectedDate))
  const [pickerMode, setPickerMode] = useState(null)
  const yearScrollRef = useRef(null)

  const startOfMonth = viewDate.startOf('month')
  const daysInMonth = viewDate.daysInMonth()
  const firstDayOfWeek = startOfMonth.day()

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const years = []
  for (let y = 2020; y <= 2035; y++) years.push(y)

  const isPast = (day) => {
    if (!day) return false
    return viewDate.date(day).isBefore(today, 'day')
  }
  const isToday = (day) => day && viewDate.date(day).isSame(today, 'day')
  const isSelected = (day) => day && viewDate.date(day).isSame(dayjs(selectedDate), 'day')
  const hasTask = (day) => {
    if (!day) return false
    const key = viewDate.date(day).format('YYYY-MM-DD')
    return tasksByDate?.[key]?.some(s => s.task)
  }

  const handleDayClick = (day) => {
    if (!day) return
    onSelectDate(viewDate.date(day).format('YYYY-MM-DD'))
  }

  const openYearPicker = () => {
    setPickerMode('year')
    setTimeout(() => {
      if (yearScrollRef.current) {
        const idx = years.indexOf(viewDate.year())
        yearScrollRef.current.scrollTop = idx * 36 - 72
      }
    }, 50)
  }

  return (
    <div className="mini-cal">
      <div className="mc-header">
        <button className="mc-nav" onClick={() => setViewDate(v => v.subtract(1, 'month'))}>‹</button>
        <div className="mc-title-group">
          <button className="mc-title-btn" onClick={() => setPickerMode(pickerMode === 'month' ? null : 'month')}>
            {viewDate.format('MMMM')}
          </button>
          <button className="mc-title-btn" onClick={() => pickerMode === 'year' ? setPickerMode(null) : openYearPicker()}>
            {viewDate.year()}
          </button>
        </div>
        <button className="mc-nav" onClick={() => setViewDate(v => v.add(1, 'month'))}>›</button>
      </div>

      {pickerMode === 'month' && (
        <div className="mc-picker mc-month-picker">
          {months.map((m, i) => (
            <button
              key={m}
              className={`mc-pick-btn ${viewDate.month() === i ? 'active' : ''}`}
              onClick={() => { setViewDate(v => v.month(i)); setPickerMode(null) }}
            >{m}</button>
          ))}
        </div>
      )}

      {pickerMode === 'year' && (
        <div className="mc-picker mc-year-picker" ref={yearScrollRef}>
          {years.map(y => (
            <button
              key={y}
              className={`mc-pick-btn mc-year-btn ${viewDate.year() === y ? 'active' : ''}`}
              onClick={() => { setViewDate(v => v.year(y)); setPickerMode(null) }}
            >{y}</button>
          ))}
        </div>
      )}

      {!pickerMode && (
        <>
          <div className="mc-weekdays">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <span key={i} className="mc-wd">{d}</span>
            ))}
          </div>
          <div className="mc-grid">
            {days.map((day, i) => (
              <button
                key={i}
                className={[
                  'mc-day',
                  !day ? 'mc-empty' : '',
                  isToday(day) ? 'mc-today' : '',
                  isSelected(day) ? 'mc-selected' : '',
                  isPast(day) ? 'mc-past' : '',
                  hasTask(day) ? 'mc-has-task' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
                disabled={!day}
              >
                {day || ''}
                {hasTask(day) && <span className="mc-dot" />}
              </button>
            ))}
          </div>
          <div className="mc-legend">
            <span className="mc-leg-dot" /> has tasks &nbsp;·&nbsp; <span className="mc-leg-past">past</span> read-only
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Planner ─────────────────────────────────────────────────────────────
export default function Planner({ mini }) {
  const today = dayjs().format('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState([])
  const [editingHour, setEditingHour] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tasksByDate, setTasksByDate] = useState({})
  const currentHour = new Date().getHours()

  const isPastDate = dayjs(selectedDate).isBefore(dayjs(today), 'day')
  const isTodaySelected = selectedDate === today

  useEffect(() => {
    fetchPlanner(selectedDate)
  }, [selectedDate])

  const fetchPlanner = async (date) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) { setError('Not logged in'); setLoading(false); return }
      const res = await axios.get(`/api/planner/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const fetched = res.data.slots || []
      setSlots(fetched)
      setTasksByDate(prev => ({ ...prev, [date]: fetched }))
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load planner')
    } finally {
      setLoading(false)
    }
  }

  const saveSlot = async (hour) => {
    if (isPastDate) return
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put(`/api/planner/${selectedDate}`,
        { hour, task: editVal },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updated = res.data.slots
      setSlots(updated)
      setTasksByDate(prev => ({ ...prev, [selectedDate]: updated }))
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message)
    } finally {
      setEditingHour(null)
      setEditVal('')
    }
  }

  const getSlotHour = (hourStr) => {
    const h = parseInt(hourStr)
    const isPM = hourStr.includes('PM')
    return isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h)
  }

  const displaySlots = mini ? slots.slice(0, 7) : slots
  const completedCount = slots.filter(s => s.task).length
  const totalSlots = slots.length

  if (loading) return (
    <div className="planner-loading">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  )

  if (error) return <div className="planner-error">⚠️ {error}</div>

  if (mini) return (
    <div className="planner-wrap mini">
      <div className="slots-list">
        {displaySlots.map(slot => {
          const slotHour = getSlotHour(slot.hour)
          const isCurrent = isTodaySelected && slotHour === currentHour
          return (
            <div key={slot.hour} className={`slot ${isCurrent ? 'current' : ''} ${slot.task ? 'has-task' : ''}`}>
              {isCurrent && <div className="current-bar" />}
              <span className="slot-time">{slot.hour}</span>
              <span className="slot-dot" />
              <span className={`slot-task ${!slot.task ? 'empty' : ''}`}>{slot.task || '-'}</span>
              {isCurrent && <span className="now-badge">NOW</span>}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="planner-full-layout">
      <div className="planner-main">
        <div className="planner-date-bar">
          <div className="planner-date-info">
            <span className="planner-date-label">
              {isTodaySelected ? 'Today — ' : ''}{dayjs(selectedDate).format('dddd, MMMM D')}
            </span>
            {isPastDate
              ? <span className="planner-past-badge">📜 Past — read only</span>
              : <span className="planner-hint">Click any slot to edit ✏️</span>
            }
          </div>
          {!isPastDate && (
            <div className="planner-progress">
              <span className="progress-text">{completedCount}/{totalSlots}</span>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${totalSlots ? (completedCount/totalSlots)*100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        {isPastDate && (
          <div className="past-banner">
            ✨ You're viewing a past day. Tasks are locked — but the memories live here.
          </div>
        )}

        <div className="slots-list">
          {displaySlots.map(slot => {
            const slotHour = getSlotHour(slot.hour)
            const isCurrent = isTodaySelected && slotHour === currentHour
            const canEdit = !isPastDate

            return (
              <div
                key={slot.hour}
                className={[
                  'slot',
                  isCurrent ? 'current' : '',
                  slot.task ? 'has-task' : '',
                  isPastDate ? 'locked' : '',
                ].filter(Boolean).join(' ')}
              >
                {isCurrent && <div className="current-bar" />}
                <span className="slot-time">{slot.hour}</span>
                <span className="slot-dot" />

                {editingHour === slot.hour ? (
                  <input
                    className="slot-edit-input"
                    value={editVal}
                    autoFocus
                    placeholder="What's planned? ✨"
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveSlot(slot.hour)
                      if (e.key === 'Escape') { setEditingHour(null); setEditVal('') }
                    }}
                    onBlur={() => saveSlot(slot.hour)}
                  />
                ) : (
                  <span
                    className={`slot-task ${!slot.task ? 'empty' : ''} ${!canEdit ? 'no-cursor' : ''}`}
                    onClick={() => {
                      if (!canEdit) return
                      setEditingHour(slot.hour)
                      setEditVal(slot.task)
                    }}
                  >
                    {slot.task || (isPastDate ? '—' : 'Free slot — click to add')}
                  </span>
                )}

                {isCurrent && <span className="now-badge">NOW</span>}
                {slot.task && isPastDate && <span className="task-done-badge">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="planner-sidebar-right">
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasksByDate={tasksByDate}
        />
        <div className="quick-jumps">
          <button className={`qj-btn ${isTodaySelected ? 'active' : ''}`} onClick={() => setSelectedDate(today)}>Today</button>
          <button className="qj-btn" onClick={() => setSelectedDate(dayjs().add(1,'day').format('YYYY-MM-DD'))}>Tomorrow</button>
          <button className="qj-btn" onClick={() => setSelectedDate(dayjs().add(7,'day').format('YYYY-MM-DD'))}>+7 days</button>
        </div>
      </div>
    </div>
  )
}
