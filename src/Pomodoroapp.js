import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroFlow() {
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('selectedSound') || 'bell';
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const timerRef = useRef(null);
  const playSound = () => {
    const audio = new Audio(`/sounds/${selectedSound}.wav`);
    audio.play();
  };
  
  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pomodoro_tasks');
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    setTimeLeft(focusTime * 60);
  }, [focusTime]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playSound(); // 🎵 Play sound when the timer ends
            setIsFocus(!isFocus);
            const newTime = isFocus ? breakTime * 60 : focusTime * 60;
            setTimeout(() => {
              setTimeLeft(newTime);
              setIsRunning(true);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isFocus]);

  const handleStart = () => {
    if (!isRunning) setIsRunning(true);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsFocus(true);
    setTimeLeft(focusTime * 60);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    if (editingIndex !== null) {
      const updated = [...tasks];
      updated[editingIndex].text = newTask.trim();
      setTasks(updated);
      setEditingIndex(null);
    } else {
      setTasks([...tasks, { text: newTask.trim(), completed: false }]);
    }
    setNewTask('');
  };

  const handleEditTask = (index) => {
    setNewTask(tasks[index].text);
    setEditingIndex(index);
  };

  const handleDeleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
    if (editingIndex === index) {
      setNewTask('');
      setEditingIndex(null);
    }
  };
  const handleToggleComplete = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🌿 Pomodoro Flow</h1>

        <div style={styles.circleWrapper}>
          <div style={styles.circle}>
            <h2 style={styles.timer}>{formatTime(timeLeft)}</h2>
            <span style={styles.mode}>
              {isFocus ? '🧠 Focus Mode' : '☕ Break Time'}
            </span>
          </div>
        </div>

        <div style={styles.inputs}>
          <div style={styles.inputGroup}>
            <label>Focus (min)</label>
            <input
              type="number"
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Break (min)</label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.buttons}>
          <button style={styles.startButton} onClick={handleStart}>▶ Start</button>
          <button style={styles.resetButton} onClick={handleReset}>🔁 Reset</button>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
  <label style={{ fontWeight: 'bold' }}>🔔 Alarm Sound: </label>
  <select
    value={selectedSound}
    onChange={(e) => {
      setSelectedSound(e.target.value);
      localStorage.setItem('selectedSound', e.target.value);
    }}
    style={{
      marginLeft: '1rem',
      padding: '0.5rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
    }}
  >
    <option value="bell">🔔 Bell</option>
    <option value="gong">🎐 Gong</option>
    <option value="tick">⏱️ Tick</option>
  </select>
</div>

      </div>

      <div style={styles.taskList}>
        <h2 style={{ marginBottom: '1rem', color: '#7a3ff6' }}>📝 Tasks</h2>
        <div style={styles.taskInput}>
          <input
            type="text"
            placeholder="Enter a task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={styles.taskField}
          />
          <button onClick={handleAddTask} style={styles.addTaskBtn}>
            {editingIndex !== null ? '✏ Update' : '➕ Add'}
          </button>
        </div>
        <ul style={styles.taskUl}>
          {tasks.map((task, idx) => (
            <li key={idx} style={{ 
              ...styles.taskItem, 
              opacity: task.completed ? 0.5 : 1, 
              textDecoration: task.completed ? 'line-through' : 'none' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => handleToggleComplete(idx)}
                  style={{ marginRight: '0.75rem' }}
                />
                <span>{task.text}</span>
              </div>
              <button onClick={() => handleEditTask(idx)} style={styles.taskBtn}>✏</button>
              <button onClick={() => handleDeleteTask(idx)} style={styles.taskBtn}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'row',
    padding: '2rem',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f3e7ff, #f8f8f8)',
    gap: '2rem',
  },
  container: {
    flex: 2,
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  title: {
    color: '#7a3ff6',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  circleWrapper: {
    height: '66vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: '66vh',
    height: '66vh',
    borderRadius: '50%',
    border: '16px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  timer: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: 0,
  },
  mode: {
    marginTop: '1rem',
    backgroundColor: '#ffc0cb',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: '#6b1e45',
    fontWeight: 'bold',
  },
  inputs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1rem',
  },
  input: {
    width: '60px',
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
    marginTop: '0.5rem',
    textAlign: 'center',
  },
  buttons: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  startButton: {
    backgroundColor: '#00c896',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  taskList: {
    flex: 1,
    padding: '1rem',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
  },
  taskInput: {
    display: 'flex',
    marginBottom: '1rem',
    gap: '0.5rem',
  },
  taskField: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
  },
  addTaskBtn: {
    backgroundColor: '#7a3ff6',
    color: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  taskUl: {
    listStyle: 'none',
    paddingLeft: 0,
    margin: 0,
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f9f9f9',
    padding: '0.5rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '10px',
  },
  taskBtn: {
    marginLeft: '0.1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};
