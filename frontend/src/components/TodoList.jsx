import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Trash2, Edit2, X, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

function TodoList({ onTodoChange, darkMode }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    category: 'General',
    priority: 'medium'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    loadTodos();
  }, [filter]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        if (filter === 'completed') params.completed = 'true';
        if (filter === 'pending') params.completed = 'false';
        if (filter === 'overdue') params.overdue = 'true';
      }
      const response = await api.getTodos(params);
      if (response.success) {
        setTodos(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const todoData = {
        ...newTodo,
        title: newTodo.title.trim(),
        category: newTodo.category.trim() || 'General'
      };
      const response = await api.createTodo(todoData);
      if (response.success) {
        setTodos([response.data, ...todos]);
        setNewTodo({ title: '', category: 'General', priority: 'medium' });
        setShowAddForm(false);
        onTodoChange?.();
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('Failed to create todo. Please try again.');
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await api.toggleTodo(id);
      if (response.success) {
        setTodos(todos.map(todo =>
          todo._id === id ? response.data : todo
        ));
        onTodoChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      const response = await api.deleteTodo(id);
      if (response.success) {
        setTodos(todos.filter(todo => todo._id !== id));
        onTodoChange?.();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const startEditTodo = (todo) => {
    setEditingTodo(todo);
    setShowAddForm(true);
    setNewTodo({
      title: todo.title,
      category: todo.category,
      priority: todo.priority
    });
  };

  const updateTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim() || !editingTodo) return;

    try {
      const response = await api.updateTodo(editingTodo._id, {
        ...newTodo,
        title: newTodo.title.trim(),
        category: newTodo.category.trim() || 'General'
      });
      if (response.success) {
        setTodos(todos.map(todo =>
          todo._id === editingTodo._id ? response.data : todo
        ));
        setEditingTodo(null);
        setNewTodo({ title: '', category: 'General', priority: 'medium' });
        setShowAddForm(false);
        onTodoChange?.();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: darkMode 
        ? 'bg-red-900/30 text-red-300 border-red-700'
        : 'bg-red-100 text-red-800 border-red-300',
      high: darkMode 
        ? 'bg-orange-900/30 text-orange-300 border-orange-700'
        : 'bg-orange-100 text-orange-800 border-orange-300',
      medium: darkMode 
        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: darkMode 
        ? 'bg-green-900/30 text-green-300 border-green-700'
        : 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };

  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterCounts = {
    all: todos.length,
    pending: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => isOverdue(t.dueDate, t.completed)).length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className={`h-8 rounded mb-4 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`h-16 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Todo List
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Todo</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <div className="flex space-x-2">
          {Object.entries(filterCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingTodo ? 'Edit Todo' : 'Add New Todo'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTodo(null);
                  setNewTodo({ title: '', category: 'General', priority: 'medium' });
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={editingTodo ? updateTodo : addTodo} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="What needs to be done?"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    placeholder="e.g., Work, Personal, Shopping"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Priority
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTodo(null);
                    setNewTodo({ title: '', category: 'General', priority: 'medium' });
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTodo ? 'Update' : 'Add'} Todo
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todos List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 rounded-xl border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className={`mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm ? 'No todos match your search' : 'No todos yet'}
              </p>
              <p className={`text-sm ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {!searchTerm && "Add your first todo to get started!"}
              </p>
            </motion.div>
          ) : (
            filteredTodos.map((todo) => (
              <motion.div
                key={todo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
                  todo.completed ? 'opacity-75' : ''
                } ${isOverdue(todo.dueDate, todo.completed) 
                  ? darkMode 
                    ? 'border-red-700 bg-gray-800' 
                    : 'border-red-300 bg-white'
                  : darkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleTodo(todo._id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : darkMode
                          ? 'border-gray-600 hover:border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <CheckSquare className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${
                          todo.completed 
                            ? darkMode
                              ? 'line-through text-gray-400'
                              : 'line-through text-gray-500'
                            : darkMode
                              ? 'text-white'
                              : 'text-gray-900'
                        }`}>
                          {todo.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                      
                      <div className={`flex items-center space-x-4 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span className={`px-2 py-1 rounded text-xs ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {todo.category}
                        </span>
                        {todo.dueDate && (
                          <span className={isOverdue(todo.dueDate, todo.completed) 
                            ? darkMode 
                              ? 'text-red-400 font-medium' 
                              : 'text-red-600 font-medium'
                            : ''
                          }>
                            Due: {formatDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                      
                      {todo.description && (
                        <p className={`text-sm mt-2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startEditTodo(todo)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TodoList;
