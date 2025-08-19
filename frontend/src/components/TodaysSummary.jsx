import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function TodaysSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTodaysSummary();
  }, []);

  const loadTodaysSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTodaysSummary();
      if (response.success) {
        setSummary(response.data);
      } else {
        setError('Failed to load today\'s summary');
      }
    } catch (error) {
      console.error('Failed to load today\'s summary:', error);
      setError('Failed to load today\'s summary');
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

  const formatProductivity = (value) => {
    return value?.toFixed(1) || '0.0';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-4">Loading summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-4 text-red-600">{error}</div>
        <div className="text-center">
          <button
            onClick={loadTodaysSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-4">No data available for today</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Summary</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{summary.totalSessions || 0}</div>
          <div className="text-sm text-gray-500">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{formatDuration(summary.totalTime)}</div>
          <div className="text-sm text-gray-500">Total Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{formatDuration(summary.focusTime)}</div>
          <div className="text-sm text-gray-500">Focus Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {formatProductivity(summary.averageProductivity)}/10
          </div>
          <div className="text-sm text-gray-500">Avg Productivity</div>
        </div>
      </div>

      {summary.categoriesBreakdown && Object.keys(summary.categoriesBreakdown).length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Time by Category</h3>
          <div className="space-y-2">
            {Object.entries(summary.categoriesBreakdown).map(([category, time]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-600">{category}</span>
                <span className="font-medium text-gray-800">{formatDuration(time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TodaysSummary;