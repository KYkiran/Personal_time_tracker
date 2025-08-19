import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  RefreshCw, 
  AlertCircle,
  Activity,
  Timer,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/api';

function TodaysSummary({ darkMode }) {
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
        setError("Failed to load today's summary");
      }
    } catch (error) {
      console.error("Failed to load today's summary:", error);
      setError("Failed to load today's summary");
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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => {
    const colorClasses = {
      blue: darkMode 
        ? "bg-blue-900/20 text-blue-400 border-blue-800" 
        : "bg-blue-50 text-blue-600 border-blue-200",
      green: darkMode 
        ? "bg-green-900/20 text-green-400 border-green-800" 
        : "bg-green-50 text-green-600 border-green-200",
      purple: darkMode 
        ? "bg-purple-900/20 text-purple-400 border-purple-800" 
        : "bg-purple-50 text-purple-600 border-purple-200",
      orange: darkMode 
        ? "bg-orange-900/20 text-orange-400 border-orange-800" 
        : "bg-orange-50 text-orange-600 border-orange-200",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`text-xs px-2 py-1 rounded-full ${
              trend > 0 
                ? darkMode 
                  ? 'bg-green-900/20 text-green-400' 
                  : 'bg-green-100 text-green-600'
                : darkMode
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-red-100 text-red-600'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        
        <div>
          <h3 className={`text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold mb-1 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Today's Summary
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {getCurrentDate()}
            </p>
          </div>
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`h-32 rounded-xl animate-pulse ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className={`text-xl font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Unable to load summary
        </h2>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>{error}</p>
        <button
          onClick={loadTodaysSummary}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className={`text-xl font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          No activity today
        </h2>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Start a timer session to track your productivity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Calendar className={`w-7 h-7 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            Today's Summary
          </h1>
          <p className={`mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {getCurrentDate()}
          </p>
        </div>
        <button
          onClick={loadTodaysSummary}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Sessions Completed"
          value={summary.totalSessions || 0}
          subtitle="Focus sessions today"
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Total Time"
          value={formatDuration(summary.totalTime)}
          subtitle="All activities"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Focus Time"
          value={formatDuration(summary.focusTime)}
          subtitle="Deep work sessions"
          color="purple"
        />
        <StatCard
          icon={Award}
          title="Average Productivity"
          value={`${formatProductivity(summary.averageProductivity)}/10`}
          subtitle="Today's performance"
          color="orange"
        />
      </div>

      {/* Progress Section */}
      {summary.totalTime > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Ratio Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-6 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Focus Efficiency
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Focus vs Total Time
              </span>
              <span className={`text-2xl font-bold ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {Math.round((summary.focusTime / summary.totalTime) * 100)}%
              </span>
            </div>
            <div className={`rounded-full h-3 mb-2 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((summary.focusTime / summary.totalTime) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
            <div className={`flex justify-between text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Focus: {formatDuration(summary.focusTime)}</span>
              <span>Total: {formatDuration(summary.totalTime)}</span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-6 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Average Session
                  </span>
                </div>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {summary.totalSessions > 0 
                    ? formatDuration(Math.round(summary.totalTime / summary.totalSessions))
                    : '0h 0m'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Longest Session
                  </span>
                </div>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDuration(summary.longestSession || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Completion Rate
                  </span>
                </div>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {summary.completionRate || 0}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent Sessions */}
      {summary.recentSessions && summary.recentSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {summary.recentSessions.slice(0, 5).map((session, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {session.category}
                    </p>
                    {session.description && (
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {session.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDuration(session.duration)}
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Messages */}
      {summary.totalSessions === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 text-center ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          }`}
        >
          <div className="text-4xl mb-4">🎯</div>
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to start your productive day?
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Head over to the Timer tab to begin your first focus session!
          </p>
        </motion.div>
      )}
      
      {summary.totalSessions > 0 && summary.totalSessions >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 text-center ${
            darkMode 
              ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-800' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`}
        >
          <div className="text-4xl mb-4">🔥</div>
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Amazing work today!
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            You've completed {summary.totalSessions} sessions. Keep up the great momentum!
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default TodaysSummary;
