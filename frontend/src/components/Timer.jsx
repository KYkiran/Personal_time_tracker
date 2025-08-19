import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

function Timer({ onSessionComplete, darkMode }) {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionType, setSessionType] = useState('focus');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Add refs to track real time
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastUpdateRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Store the actual start time
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        lastUpdateRef.current = Date.now();
      }

      // Create interval
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setTime(elapsed);
        lastUpdateRef.current = now;
      }, 1000);

      // Handle visibility change
      const handleVisibilityChange = () => {
        if (!document.hidden && isActive && startTimeRef.current) {
          // Tab became visible - sync with real time
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000);
          setTime(elapsed);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(intervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isActive]);

  const toggle = () => {
    if (!isActive && time === 0) {
      setStartTime(new Date());
      startTimeRef.current = Date.now();
    } else if (!isActive && time > 0) {
      // Resuming - adjust start time to account for elapsed time
      startTimeRef.current = Date.now() - (time * 1000);
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setTime(0);
    setIsActive(false);
    setStartTime(null);
    startTimeRef.current = null;
    lastUpdateRef.current = null;
    clearInterval(intervalRef.current);
  };

  const stop = async () => {
    if (time > 0 && startTime) {
      const endTime = new Date();
      const sessionData = {
        sessionType,
        category,
        description: description.trim(),
        duration: time,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        completed: true
      };

      try {
        await api.createTimeSession(sessionData);
        onSessionComplete?.();
        reset();
      } catch (error) {
        console.error('Failed to save session:', error);
        alert('Failed to save session. Please try again.');
      }
    }
  };

  // Rest of your component remains the same...
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Continue with the rest of your existing component code...


  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = (time % 60) / 60;
  const strokeDashoffset = circumference * (1 - progress);

  const sessionColors = {
    focus: 'text-blue-600 border-blue-500',
    break: 'text-green-600 border-green-500',
    work: 'text-purple-600 border-purple-500'
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Timer
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl border p-6 mb-6 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Session Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Session Type
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  disabled={isActive}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="focus">Focus Session</option>
                  <option value="break">Break</option>
                  <option value="work">Work Session</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isActive}
                  placeholder="e.g., Work, Study, Exercise"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isActive}
                placeholder="What are you working on?"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className={`flex flex-col items-center justify-center rounded-2xl shadow-lg border p-8 mb-6 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative mb-6">
          <svg
            className="transform -rotate-90 w-64 h-64"
            viewBox="0 0 264 264"
          >
            {/* Background circle */}
            <circle
              cx="132"
              cy="132"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={darkMode ? 'text-gray-700' : 'text-gray-200'}
            />
            {/* Progress circle */}
            <motion.circle
              cx="132"
              cy="132"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${sessionColors[sessionType]} transition-colors duration-300`}
              animate={{
                strokeDashoffset: strokeDashoffset
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(time)}
              </div>
              <div className={`text-sm font-medium ${sessionColors[sessionType]} capitalize`}>
                {sessionType} Session
              </div>
              {category !== 'General' && (
                <div className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {category}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description display */}
        {description && (
          <div className="text-center mb-6 max-w-md">
            <p className={`text-sm italic ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "{description}"
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={`flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all duration-200 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </motion.button>
        
        {time > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stop}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200"
          >
            <Square className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* Session info */}
      {time > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 text-center text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {isActive ? 'Session in progress' : 'Session paused'} • Started at{' '}
          {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </motion.div>
      )}
    </div>
  );
}

export default Timer;
