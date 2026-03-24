import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import './Todo.css'

export default function Todo({ mini }) {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('All') // All, Pending, Completed
  
  // Add new task state
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')
  const [newTaskDate, setNewTaskDate] = useState('')

  // Edit task state
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Drag and Drop state
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('ppa-todos')
    if (saved) setTodos(JSON.parse(saved))
    else setThemeSeed()
  }, [])

  const setThemeSeed = () => {
    setTodos([
      { id: '1', text: 'Drink enough water 💧', completed: false, priority: 'High', dueDate: dayjs().format('YYYY-MM-DD') },
      { id: '2', text: 'Organize my desk 🌸', completed: true, priority: 'Low', dueDate: '' },
    ])
  }

  useEffect(() => {
    if (todos.length > 0) localStorage.setItem('ppa-todos', JSON.stringify(todos))
  }, [todos])

  // Actions
  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newTodo = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDate
    }
    setTodos(prev => [newTodo, ...prev])
    setNewTaskText('')
    setNewTaskDate('')
    setNewTaskPriority('Medium')
  }

  const toggleComplete = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const startEdit = (todo) => {
    if (mini) return
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = (id) => {
    if (!editText.trim()) return deleteTodo(id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText } : t))
    setEditingId(null)
  }

  // Drag functionality
  const handleDragStart = (e, index) => {
    if (mini || filter !== 'All') return // don't drag if filtered or mini
    dragItem.current = index
    e.dataTransfer.effectAllowed = "move"
    // Slight delay to allow drag image processing before ghosting
    setTimeout(() => {
      e.target.classList.add('dragging')
    }, 0)
  }
  
  const handleDragEnter = (e, index) => {
    if (mini || filter !== 'All') return
    e.preventDefault()
    dragOverItem.current = index
  }
  
  const handleDragEnd = (e) => {
    if (mini || filter !== 'All') return
    e.target.classList.remove('dragging')
    const _todos = [...todos]
    const draggedItemContent = _todos.splice(dragItem.current, 1)[0]
    _todos.splice(dragOverItem.current, 0, draggedItemContent)
    
    dragItem.current = null
    dragOverItem.current = null
    setTodos(_todos)
  }

  // Filter and display logic
  const filteredTodos = todos.filter(t => {
    if (filter === 'Completed') return t.completed
    if (filter === 'Pending') return !t.completed
    return true
  })

  // Mini display slices top 5 padding Tasks
  const displayTodos = mini ? filteredTodos.slice(0, 5) : filteredTodos

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  const getPriorityColor = (pri) => {
    if (pri === 'High') return '#ff7597' // pd
    if (pri === 'Medium') return '#ffa6c9' // pm
    return '#ffd4e5' // brightened ps
  }

  if (mini) {
    return (
      <div className="todo-mini-wrap">
        <div className="todo-progress-mini">
          <span>{completedCount} of {totalCount} done</span>
          <div className="pb-bg"><div className="pb-fill" style={{ width: `${totalCount ? (completedCount/totalCount)*100 : 0}%`}} /></div>
        </div>
        <div className="todo-mini-list">
          {displayTodos.length === 0 ? (
            <div className="todo-mini-empty">Nothing to do today 🌸</div>
          ) : (
            displayTodos.map((todo) => (
              <div key={todo.id} className={`todo-item-mini ${todo.completed ? 'completed' : ''}`}>
                <button className="todo-check" onClick={() => toggleComplete(todo.id)}>
                   {todo.completed && '✓'}
                </button>
                <span className="todo-title-mini">{todo.text}</span>
                <span className="todo-pri-dot" style={{ background: getPriorityColor(todo.priority) }} />
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="todo-layout">
      
      {/* Todo Header */}
      <div className="todo-header">
        <div className="todo-header-info">
          <h2>Task Settings 🎀</h2>
          <p>Organize your beautiful day.</p>
        </div>
        <div className="todo-progress">
          <span className="progress-text">{completedCount} of {totalCount} done</span>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${totalCount ? (completedCount/totalCount)*100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Add Task Box */}
      <form className="todo-add-box" onSubmit={handleAdd}>
        <input 
          type="text" 
          className="todo-input-main" 
          placeholder="Add a new cute task... ✨" 
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
        />
        <div className="todo-add-controls">
          <input 
            type="date" 
            className="todo-date-input" 
            value={newTaskDate}
            onChange={e => setNewTaskDate(e.target.value)}
          />
          <select 
            className="todo-priority-select"
            value={newTaskPriority}
            onChange={e => setNewTaskPriority(e.target.value)}
          >
            <option value="Low">Low Priority 🤍</option>
            <option value="Medium">Medium Priority 🌸</option>
            <option value="High">High Priority 🌺</option>
          </select>
          <button type="submit" className="todo-add-btn" disabled={!newTaskText.trim()}>Add Task</button>
        </div>
      </form>

      {/* Filters */}
      <div className="todo-filters">
        {['All', 'Pending', 'Completed'].map(f => (
          <button 
            key={f}
            className={`todo-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="todo-list">
        {displayTodos.length === 0 ? (
          <div className="todo-empty-state">
            <div className="empty-icon">🌸</div>
            <p>Nothing to do today</p>
            <span>Time to relax!</span>
          </div>
        ) : (
          displayTodos.map((todo, idx) => (
            <div 
              key={todo.id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              draggable={filter === 'All'}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="todo-drag-handle">{filter === 'All' ? '⋮⋮' : ''}</div>
              
              <button className="todo-check" onClick={() => toggleComplete(todo.id)}>
                {todo.completed && '✓'}
              </button>

              <div className="todo-content">
                {editingId === todo.id ? (
                  <input 
                    className="todo-edit-input"
                    value={editText}
                    autoFocus
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(todo.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <span className="todo-text" onClick={() => startEdit(todo)}>{todo.text}</span>
                )}
                
                <div className="todo-meta">
                  <span className="todo-pri-badge" style={{ color: getPriorityColor(todo.priority), backgroundColor: `${getPriorityColor(todo.priority)}22` }}>
                    <span className="todo-pri-dot" style={{ backgroundColor: getPriorityColor(todo.priority) }}></span>
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="todo-date-badge">📅 {dayjs(todo.dueDate).format('MMM D')}</span>
                  )}
                </div>
              </div>

              <button className="todo-delete" onClick={() => deleteTodo(todo.id)}>✕</button>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
