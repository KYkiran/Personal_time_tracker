import React, { useState, useEffect } from "react";
import { Clock, CheckSquare, BarChart3, Calendar, Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "./components/Timer";
import TodoList from "./components/ToDoList";
import Analytics from "./components/Analytics";
import TodaysSummary from "./components/TodaysSummary";

function App() {
  const [activeTab, setActiveTab] = useState("timer");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode !== null ? savedMode === 'true' : systemPrefersDark;
    
    setDarkMode(initialDarkMode);
    applyDarkMode(initialDarkMode);
  }, []);

  const applyDarkMode = (isDark) => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (isDark) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', isDark.toString());
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
  };

  const handleSessionComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTodoChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: "timer", label: "Timer", icon: Clock, description: "Focus sessions" },
    { id: "summary", label: "Summary", icon: Calendar, description: "Daily overview" },
    { id: "todos", label: "Todos", icon: CheckSquare, description: "Task management" },
    { id: "analytics", label: "Analytics", icon: BarChart3, description: "Progress insights" },
  ];

  const renderContent = () => {
    // Pass darkMode prop to all components
    switch (activeTab) {
      case "timer":
        return <Timer onSessionComplete={handleSessionComplete} darkMode={darkMode} />;
      case "summary":
        return <TodaysSummary key={refreshTrigger} darkMode={darkMode} />;
      case "todos":
        return <TodoList onTodoChange={handleTodoChange} darkMode={darkMode} />;
      case "analytics":
        return <Analytics key={refreshTrigger} darkMode={darkMode} />;
      default:
        return <Timer onSessionComplete={handleSessionComplete} darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            darkMode
              ? 'bg-gray-800 text-gray-300 hover:text-white'
              : 'bg-white text-gray-600 hover:text-gray-900'
          }`}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ProductiveApp
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Track your productivity
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{tab.label}</div>
                    <div className={`text-xs ${
                      isActive 
                        ? "text-blue-100" 
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}>
                      {tab.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Theme toggle */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center space-x-3">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </span>
              
              <div className={`relative w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
