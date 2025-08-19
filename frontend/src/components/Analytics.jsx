import React, { useState, useEffect } from 'react';
import { Timer, Target, Award, Activity } from 'lucide-react';
import { api } from '../services/api';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAnalytics(period);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num) => {
    return num?.toFixed(1) || '0.0';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-red-600">{error}</div>
        <div className="text-center">
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatDuration(analytics.timeStats?.totalTime || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Focus Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatDuration(analytics.timeStats?.focusTime || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.timeStats?.totalSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Productivity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.productivityStats?.avgProductivity)}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Time by Category</h3>
          <div className="space-y-3">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={`${category._id}-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{
                      backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                    }}
                  ></div>
                  <span className="text-gray-700">{category._id || 'Uncategorized'}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">
                    {formatDuration(category.totalTime)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({category.sessionCount} sessions)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todo Stats */}
      {analytics.todoStats && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Todo Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {analytics.todoStats.totalTodos || 0}
              </div>
              <div className="text-sm text-gray-500">Total Todos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.todoStats.completedTodos || 0}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.todoStats.totalTodos > 0 
                  ? Math.round((analytics.todoStats.completedTodos / analytics.todoStats.totalTodos) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(analytics.todoStats.avgActualTime || 0)}m
              </div>
              <div className="text-sm text-gray-500">Avg Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;