import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { api } from '../services/api';

function Timer({ onSessionComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionType, setSessionType] = useState('focus');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggle = () => {
    if (!isActive && time === 0) {
      setStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setTime(0);
    setIsActive(false);
    setStartTime(null);
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
        // You might want to show an error message to the user here
        alert('Failed to save session. Please try again.');
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
          {formatTime(time)}
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={toggle}
            className={`flex items-center px-6 py-2 rounded-lg font-semibold transition-colors ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={stop}
            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={time === 0}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop & Save
          </button>
          <button
            onClick={reset}
            className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
          <select 
            value={sessionType} 
            onChange={(e) => setSessionType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isActive}
          >
            <option value="focus">Focus Session</option>
            <option value="break">Break</option>
            <option value="stopwatch">Stopwatch</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Work, Study, Exercise"
            disabled={isActive}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What are you working on?"
            disabled={isActive}
          />
        </div>
      </div>
    </div>
  );
}

export default Timer;