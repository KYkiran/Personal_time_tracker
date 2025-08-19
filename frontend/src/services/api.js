// API Base URL - Change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// API Service
export const api = {
  // Time Sessions
  async getTimeSessions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/time-sessions?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get time sessions:', error);
      throw error;
    }
  },
  
  async createTimeSession(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/time-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create time session:', error);
      throw error;
    }
  },
  
  async getTodaysSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/time-sessions/today/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get today\'s summary:', error);
      throw error;
    }
  },
  
  // Todos
  async getTodos(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/todos?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get todos:', error);
      throw error;
    }
  },
  
  async createTodo(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  },
  
  async toggleTodo(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw error;
    }
  },
  
  async getTodoStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/stats/dashboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get todo stats:', error);
      throw error;
    }
  },
  
  // Analytics
  async getAnalytics(period = '7d') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  },
  
  async getProductivityAnalytics(period = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/productivity?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get productivity analytics:', error);
      throw error;
    }
  }
};