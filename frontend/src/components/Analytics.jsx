import React, { useState, useEffect } from "react";
import { Timer, Target, Award, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api";

function Analytics({ darkMode }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAnalytics({ range: timeRange });
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError("Failed to load analytics");
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num) => {
    return num?.toFixed(1) || "0.0";
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Enhanced Card component
  const Card = ({ children, className = "" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-lg border p-6 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } ${className}`}
    >
      {children}
    </motion.div>
  );

  // Stat card component
  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: darkMode 
        ? "bg-blue-900/20 text-blue-400" 
        : "bg-blue-50 text-blue-600",
      green: darkMode 
        ? "bg-green-900/20 text-green-400" 
        : "bg-green-50 text-green-600",
      purple: darkMode 
        ? "bg-purple-900/20 text-purple-400" 
        : "bg-purple-50 text-purple-600",
      orange: darkMode 
        ? "bg-orange-900/20 text-orange-400" 
        : "bg-orange-50 text-orange-600",
    };

    return (
      <Card className="hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className={`text-sm font-medium mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {title}
            </p>
            <p className={`text-2xl font-bold ${
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
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`h-32 rounded-xl ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`h-96 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
            <div className={`h-96 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <div className="text-red-500 mb-4">
          <Activity className="w-12 h-12 mx-auto" />
        </div>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Analytics Dashboard
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Timer}
          title="Total Time"
          value={formatDuration(analytics.timeStats?.totalTime || 0)}
          color="blue"
        />
        <StatCard
          icon={Target}
          title="Focus Time"
          value={formatDuration(analytics.timeStats?.focusTime || 0)}
          color="green"
        />
        <StatCard
          icon={Activity}
          title="Sessions"
          value={analytics.timeStats?.totalSessions || 0}
          color="purple"
        />
        <StatCard
          icon={Award}
          title="Avg Productivity"
          value={`${formatNumber(analytics.productivityStats?.avgProductivity)}/10`}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Time by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analytics.categoryStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Daily Activity
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyStats || []}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip
                  formatter={(value) => [formatDuration(value), "Time"]}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                  }}
                />
                <Bar dataKey="time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Most Productive Day</p>
            <p className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {analytics.insights?.mostProductiveDay || 'No data'}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-green-900/20' : 'bg-green-50'
          }`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Average Session</p>
            <p className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDuration(analytics.insights?.avgSessionDuration || 0)}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
          }`}>
            <Award className={`w-8 h-8 mx-auto mb-2 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Streak</p>
            <p className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {analytics.insights?.currentStreak || 0} days
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
