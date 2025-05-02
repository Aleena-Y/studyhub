import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroFlow() {
  const themes = {
    lavender: {
      name: 'Lavender Dream',
      primary: '#7a3ff6',
      secondary: '#ffc0cb',
      background: 'linear-gradient(to bottom right, #f3e7ff, #f8f8f8)',
      accent: '#00c896',
      warning: '#ffb347',
      neutral: '#f0f0f0',
      text: '#333333',
      circleBorder: '#e0e0e0',
      taskBg: '#f9f9f9',
    },
    ocean: {
      name: 'Ocean Breeze',
      primary: '#4285f4',
      secondary: '#a7d7f9',
      background: 'linear-gradient(to bottom right, #e6f4ff, #f5f9fc)',
      accent: '#34a853',
      warning: '#fbbc05',
      neutral: '#eceff1',
      text: '#1a3a5f',
      circleBorder: '#c9e2f8',
      taskBg: '#edf5fd',
    },
    sunset: {
      name: 'Sunset Glow',
      primary: '#ff7043',
      secondary: '#ffccbc',
      background: 'linear-gradient(to bottom right, #fff3e0, #fffaf5)',
      accent: '#7cb342',
      warning: '#ffa000',
      neutral: '#f5f5f5',
      text: '#5d4037',
      circleBorder: '#ffe0b2',
      taskBg: '#fff8e1',
    },
    dark: {
      name: 'Night Mode',
      primary: '#bb86fc',
      secondary: '#3700b3',
      background: 'linear-gradient(to bottom right, #121212, #1e1e1e)',
      accent: '#03dac6',
      warning: '#ff9e00',
      neutral: '#333333',
      text: '#e1e1e1',
      circleBorder: '#2d2d2d',
      taskBg: '#292929',
    },
    forest: {
      name: 'Forest Retreat',
      primary: '#2e7d32',
      secondary: '#a5d6a7',
      background: 'linear-gradient(to bottom right, #e8f5e9, #f1f8e9)',
      accent: '#1976d2',
      warning: '#ff8f00',
      neutral: '#f1f1f1',
      text: '#1b5e20',
      circleBorder: '#c8e6c9',
      taskBg: '#e8f5e9',
    }
  };

  // States
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('selectedSound') || 'bell';
  });
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('selectedTheme') || 'lavender';
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [progress, setProgress] = useState(100);
  const [animateCircle, setAnimateCircle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [animation, setAnimation] = useState('');

  const timerRef = useRef(null);
  const theme = themes[selectedTheme];
  
  // Play notification sound
  const playSound = () => {
    const audio = new Audio(`/sounds/${selectedSound}.wav`);
    audio.play();
  };
  
  // Load saved data from localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem('pomodoro_tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    
    const storedFocusTime = localStorage.getItem('focusTime');
    if (storedFocusTime) setFocusTime(Number(storedFocusTime));
    
    const storedBreakTime = localStorage.getItem('breakTime');
    if (storedBreakTime) setBreakTime(Number(storedBreakTime));
    
    const storedLongBreakTime = localStorage.getItem('longBreakTime');
    if (storedLongBreakTime) setLongBreakTime(Number(storedLongBreakTime));
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Update timer when focus/break time changes
  useEffect(() => {
    if (!isRunning) {
      if (isFocus) {
        setTimeLeft(focusTime * 60);
      } else {
        // Check if it's time for a long break (every 4 pomodoros)
        const isLongBreak = pomodoroCount > 0 && pomodoroCount % 4 === 0;
        setTimeLeft(isLongBreak ? longBreakTime * 60 : breakTime * 60);
      }
    }
  }, [focusTime, breakTime, longBreakTime, isFocus]);

  // Main timer logic
  useEffect(() => {
    if (isRunning) {
      const totalTime = isFocus 
        ? focusTime * 60 
        : (pomodoroCount > 0 && pomodoroCount % 4 === 0) ? longBreakTime * 60 : breakTime * 60;
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          // Calculate progress percentage
          const newProgress = ((prev - 1) / totalTime) * 100;
          setProgress(newProgress);
          
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playSound();
            setAnimateCircle(true);
            
            // If focus period ended, increment pomodoro count
            if (isFocus) {
              setPomodoroCount(prev => prev + 1);
            }
            
            // Toggle between focus and break
            setIsFocus(prevIsFocus => !prevIsFocus);
            
            // Reset timer after animation completes
            setTimeout(() => {
              setAnimateCircle(false);
              const newIsFocus = !isFocus;
              const newTime = newIsFocus 
                ? focusTime * 60 
                : (!newIsFocus && pomodoroCount % 4 === 0) ? longBreakTime * 60 : breakTime * 60;
              setTimeLeft(newTime);
              setProgress(100);
              setIsRunning(true);
            }, 2000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isFocus, focusTime, breakTime, longBreakTime, pomodoroCount]);

  // Save timer settings to localStorage
  useEffect(() => {
    localStorage.setItem('focusTime', focusTime);
    localStorage.setItem('breakTime', breakTime);
    localStorage.setItem('longBreakTime', longBreakTime);
  }, [focusTime, breakTime, longBreakTime]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('selectedTheme', selectedTheme);
  }, [selectedTheme]);

  const handleStart = () => {
    if (!isRunning) {
      setAnimation('pulse');
      setTimeout(() => setAnimation(''), 1000);
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setAnimation('shake');
    setTimeout(() => setAnimation(''), 500);
    setIsRunning(false);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsFocus(true);
    setTimeLeft(focusTime * 60);
    setProgress(100);
    setAnimation('rotate');
    setTimeout(() => setAnimation(''), 500);
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

  // Dynamic styling based on current theme
  const dynamicStyles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.5s ease',
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'row',
      padding: '2rem',
      gap: '2rem',
      flex: 1,
    },
    container: {
      flex: 2,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      color: theme.primary,
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: `${theme.primary}22`,
      borderBottom: `1px solid ${theme.primary}33`,
    },
    circleWrapper: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    circleOuterBorder: {
      width: '19rem',
      height: '19rem',
      borderRadius: '50%',
      background: `conic-gradient(${theme.primary} ${progress}%, ${theme.circleBorder} 0%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: `0 0 30px ${theme.primary}44`,
      transition: 'all 1s ease',
      animation: animateCircle ? 'pulse 1s ease infinite' : 'none',
    },
    circle: {
      width: '17rem',
      height: '17rem',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      boxShadow: `inset 0 4px 20px rgba(0,0,0,0.1)`,
      animation: animation ? `${animation} 0.5s ease` : 'none',
    },
    timer: {
      fontSize: '3rem',
      fontWeight: 'bold',
      margin: 0,
      color: theme.text,
      textShadow: `0 2px 5px ${theme.primary}33`,
    },
    mode: {
      marginTop: '1rem',
      backgroundColor: theme.secondary,
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      color: theme.text,
      fontWeight: 'bold',
      boxShadow: `0 2px 10px ${theme.primary}22`,
    },
    controls: {
      marginTop: '2rem',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1rem',
    },
    startButton: {
      backgroundColor: theme.accent,
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
    pauseButton: {
      backgroundColor: theme.warning,
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
    resetButton: {
      backgroundColor: theme.neutral,
      color: theme.text,
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
    settingsButton: {
      background: 'none',
      border: 'none',
      color: theme.primary,
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
    },
    settingsPanel: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '20px',
      marginTop: '1rem',
      boxShadow: `0 10px 25px ${theme.primary}22`,
      transition: 'all 0.3s ease',
      animation: showSettings ? 'slideDown 0.3s ease' : 'none',
    },
    settingsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    settingsTitle: {
      color: theme.primary,
      marginBottom: '1rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    input: {
      width: '60px',
      padding: '0.5rem',
      borderRadius: '10px',
      border: `1px solid ${theme.primary}33`,
      textAlign: 'center',
      fontFamily: "'Poppins', sans-serif",
    },
    select: {
      padding: '0.5rem',
      borderRadius: '8px',
      border: `1px solid ${theme.primary}33`,
      background: 'white',
      color: theme.text,
      fontFamily: "'Poppins', sans-serif",
    },
    themeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    themeOption: (themeName) => ({
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      background: themes[themeName].primary,
      cursor: 'pointer',
      border: selectedTheme === themeName ? `3px solid ${themes[themeName].accent}` : 'none',
      boxShadow: `0 2px 5px ${themes[themeName].primary}77`,
      transition: 'all 0.2s ease',
    }),
    taskList: {
      flex: 1,
      padding: '1.5rem',
      background: 'white',
      borderRadius: '20px',
      boxShadow: `0 4px 15px ${theme.primary}22`,
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content',
      minWidth: '300px',
    },
    taskCount: {
      fontSize: '0.9rem',
      color: `${theme.text}99`,
      marginTop: '0.5rem',
      marginBottom: '1rem',
    },
    taskHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    taskTitle: {
      color: theme.primary,
      margin: 0,
      fontWeight: 'bold',
    },
    taskInput: {
      display: 'flex',
      marginBottom: '1rem',
      gap: '0.5rem',
    },
    taskField: {
      flex: 1,
      padding: '0.75rem',
      borderRadius: '10px',
      border: `1px solid ${theme.primary}33`,
      fontFamily: "'Poppins', sans-serif",
    },
    addTaskBtn: {
      backgroundColor: theme.primary,
      color: '#fff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: `0 2px 5px ${theme.primary}44`,
      transition: 'all 0.2s ease',
    },
    taskUl: {
      listStyle: 'none',
      paddingLeft: 0,
      margin: 0,
      overflow: 'auto',
      maxHeight: '50vh',
    },
    taskItem: (completed) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: theme.taskBg,
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '10px',
      borderLeft: `4px solid ${completed ? theme.accent : theme.primary}`,
      opacity: completed ? 0.6 : 1,
      textDecoration: completed ? 'line-through' : 'none',
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.3s ease',
    }),
    taskCheckbox: {
      width: '1.2rem',
      height: '1.2rem',
      marginRight: '0.75rem',
      accentColor: theme.primary,
    },
    taskText: {
      flex: 1,
    },
    taskActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    taskBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      opacity: 0.7,
      transition: 'all 0.2s ease',
    },
    pomodoroCount: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    pomodoroIcon: (filled) => ({
      fontSize: '1.2rem',
      color: filled ? theme.accent : `${theme.primary}44`,
      transition: 'all 0.3s ease',
    }),
    themeTooltip: {
      position: 'absolute',
      background: 'white',
      padding: '0.3rem 0.5rem',
      borderRadius: '5px',
      fontSize: '0.8rem',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    footer: {
      textAlign: 'center',
      padding: '1rem',
      borderTop: `1px solid ${theme.primary}22`,
      color: `${theme.text}99`,
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={dynamicStyles.page}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
          @keyframes rotate {
            0% { transform: rotate(0); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .theme-option:hover .theme-tooltip {
            opacity: 1;
          }
          
          * {
            box-sizing: border-box;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${theme.neutral};
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${theme.primary}66;
            border-radius: 10px;
          }
          
          button:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
          }
        `}
      </style>
      
      <header style={dynamicStyles.header}>
        <h1 style={dynamicStyles.title}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span> Pomodoro Flow
        </h1>
        <div>
          <button 
            style={dynamicStyles.settingsButton} 
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
        </div>
      </header>
      
      <div style={dynamicStyles.contentWrapper}>
        <div style={dynamicStyles.container}>
          {showSettings && (
            <div style={dynamicStyles.settingsPanel}>
              <h3 style={dynamicStyles.settingsTitle}>⚙️ Settings</h3>
              
              <div style={dynamicStyles.settingsRow}>
                <div style={dynamicStyles.inputGroup}>
                  <label>Focus Time:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={focusTime}
                    onChange={(e) => setFocusTime(Number(e.target.value))}
                    style={dynamicStyles.input}
                  />
                  <span>min</span>
                </div>
                
                <div style={dynamicStyles.inputGroup}>
                  <label>Short Break:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={breakTime}
                    onChange={(e) => setBreakTime(Number(e.target.value))}
                    style={dynamicStyles.input}
                  />
                  <span>min</span>
                </div>
                
                <div style={dynamicStyles.inputGroup}>
                  <label>Long Break:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={longBreakTime}
                    onChange={(e) => setLongBreakTime(Number(e.target.value))}
                    style={dynamicStyles.input}
                  />
                  <span>min</span>
                </div>
              </div>
              
              <div style={dynamicStyles.settingsRow}>
                <div style={dynamicStyles.inputGroup}>
                  <label>Notification Sound:</label>
                  <select
                    value={selectedSound}
                    onChange={(e) => {
                      setSelectedSound(e.target.value);
                      localStorage.setItem('selectedSound', e.target.value);
                    }}
                    style={dynamicStyles.select}
                  >
                    <option value="bell">🔔 Bell</option>
                    <option value="gong">🎐 Gong</option>
                    <option value="tick">⏱️ Tick</option>
                    <option value="birds">🐦 Birds</option>
                    <option value="ocean">🌊 Ocean</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label>Theme:</label>
                <div style={dynamicStyles.themeGrid}>
                  {Object.keys(themes).map(themeName => (
                    <div
                      key={themeName}
                      className="theme-option"
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedTheme(themeName)}
                    >
                      <div 
                        style={dynamicStyles.themeOption(themeName)}
                        onMouseOver={(e) => {
                          const tooltip = e.currentTarget.nextElementSibling;
                          if (tooltip) tooltip.style.opacity = '1';
                        }}
                        onMouseOut={(e) => {
                          const tooltip = e.currentTarget.nextElementSibling;
                          if (tooltip) tooltip.style.opacity = '0';
                        }}
                      ></div>
                      <div style={dynamicStyles.themeTooltip}>
                        {themes[themeName].name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div style={dynamicStyles.circleWrapper}>
            <div style={dynamicStyles.circleOuterBorder}>
              <div style={dynamicStyles.circle}>
                <h2 style={dynamicStyles.timer}>{formatTime(timeLeft)}</h2>
                <span style={dynamicStyles.mode}>
                  {isFocus ? '🧠 Focus Mode' : pomodoroCount % 4 === 0 && pomodoroCount > 0 ? '☕ Long Break' : '☕ Short Break'}
                </span>
                
                <div style={dynamicStyles.pomodoroCount}>
                  {[...Array(4)].map((_, i) => (
                    <span 
                      key={i} 
                      style={dynamicStyles.pomodoroIcon(i < pomodoroCount % 4 || (pomodoroCount % 4 === 0 && pomodoroCount > 0 && i === 3))}
                    >
                      ●
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div style={dynamicStyles.controls}>
            <div style={dynamicStyles.buttons}>
              <button style={dynamicStyles.startButton} onClick={handleStart}>▶ Start</button>
              <button style={dynamicStyles.pauseButton} onClick={handlePause}>⏸ Pause</button>
              <button style={dynamicStyles.resetButton} onClick={handleReset}>🔁 Reset</button>
            </div>
          </div>
        </div>

        <div style={dynamicStyles.taskList}>
          <div style={dynamicStyles.taskHeader}>
            <h2 style={dynamicStyles.taskTitle}>📝 Tasks</h2>
          </div>
          
          <p style={dynamicStyles.taskCount}>
            {tasks.filter(t => t.completed).length}/{tasks.length} completed
          </p>
          
          <div style={dynamicStyles.taskInput}>
            <input
              type="text"
              placeholder="Enter a task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              style={dynamicStyles.taskField}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} style={dynamicStyles.addTaskBtn}>
              {editingIndex !== null ? '✏️ Update' : '➕ Add'}
            </button>
          </div>
          
          <ul style={dynamicStyles.taskUl}>
            {tasks.map((task, idx) => (
              <li key={idx} style={dynamicStyles.taskItem(task.completed)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => handleToggleComplete(idx)}
                    style={dynamicStyles.taskCheckbox}
                  />
                  <span style={dynamicStyles.taskText}>{task.text}</span>
                </div>
                
                <div style={dynamicStyles.taskActions}>
                  <button 
                    onClick={() => handleEditTask(idx)} 
                    style={{
                      ...dynamicStyles.taskBtn,
                      color: theme.primary,
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(idx)} 
                    style={{
                      ...dynamicStyles.taskBtn,
                      color: '#ff5555',
                    }}
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
            {tasks.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem 1rem', 
                color: `${theme.text}66`,
                fontStyle: 'italic',
                animation: 'fadeIn 0.5s ease',
              }}>
                No tasks yet. Add one to get started!
              </div>
            )}
          </ul>
        </div>
      </div>
      <div style={{ flex: 1 }}>
      <iframe
  title="User Selected Spotify Playlist"
  style={{ borderRadius: '12px' }}
  src="https://open.spotify.com/embed/playlist/0Ufqa7lyr7CLHmI41q7U4c?utm_source=generator&theme=0"
  width="80%"
  height="352"
  frameBorder="0"
  allowFullScreen
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
/>

      </div>
      <footer style={dynamicStyles.footer}>
        <p>Stay focused, stay productive!</p>
      </footer>
    </div>
  );
}
