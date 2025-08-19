// Utility functions for the Time Tracker app

/**
 * Format time in seconds to HH:MM:SS format
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration in seconds to human-readable format (e.g., "2h 30m")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0h 0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes}m`;
};

/**
 * Format date string to localized date format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error('Invalid date:', dateString);
    return '';
  }
};

/**
 * Check if a date is overdue (past current date)
 */
export const isOverdue = (dueDate, completed = false) => {
  if (!dueDate || completed) return false;
  
  try {
    return new Date(dueDate) < new Date();
  } catch (error) {
    console.error('Invalid due date:', dueDate);
    return false;
  }
};

/**
 * Get priority color classes for styling
 */
export const getPriorityColor = (priority) => {
  const colors = {
    urgent: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };
  return colors[priority] || colors.medium;
};

/**
 * Format number to fixed decimal places
 */
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return '0.0';
  return Number(num).toFixed(decimals);
};

/**
 * Generate color for category visualization
 */
export const getCategoryColor = (index) => {
  return `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
};

/**
 * Validate todo data before submission
 */
export const validateTodo = (todo) => {
  const errors = [];
  
  if (!todo.title || !todo.title.trim()) {
    errors.push('Title is required');
  }
  
  if (todo.title && todo.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (todo.category && todo.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }
  
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (todo.priority && !validPriorities.includes(todo.priority)) {
    errors.push('Invalid priority level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate time session data before submission
 */
export const validateTimeSession = (session) => {
  const errors = [];
  
  if (!session.sessionType) {
    errors.push('Session type is required');
  }
  
  if (!session.category || !session.category.trim()) {
    errors.push('Category is required');
  }
  
  if (!session.duration || session.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }
  
  if (!session.startTime || !session.endTime) {
    errors.push('Start time and end time are required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Debounce function to limit API calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};