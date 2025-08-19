import React, { useState } from 'react';
import { Clock, CheckSquare, BarChart3 } from 'lucide-react';
import Timer from './components/Timer';
import TodoList from './components/ToDoList';
import Analytics from './components/Analytics';
import TodaysSummary from './components/TodaysSummary';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTodoChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'todos', label: 'Todos', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">
            Personal Time Tracker
          </h1>
          <p className="text-gray-600 text-center">
            Track your time, manage your todos, and analyze your productivity
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Timer onSessionComplete={handleSessionComplete} />
              </div>
              <div>
                <TodaysSummary key={refreshTrigger} />
              </div>
            </div>
          )}

          {activeTab === 'todos' && (
            <TodoList onTodoChange={handleTodoChange} />
          )}

          {activeTab === 'analytics' && (
            <Analytics key={refreshTrigger} />
          )}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>Built with React and powered by your productivity data</p>
        </footer>
      </div>
    </div>
  );
}

export default App;