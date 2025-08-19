import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { api } from '../services/api';

function TodoList({ onTodoChange }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', category: 'General', priority: 'medium' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Todo List</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Todo
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'overdue', label: 'Overdue' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              filter === filterOption.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Add Todo Form */}
      {showAddForm && (
        <form onSubmit={addTodo} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Todo title"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category"
                value={newTodo.category}
                onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Add Todo
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewTodo({ title: '', category: 'General', priority: 'medium' });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'all' ? 'No todos found. Add one to get started!' : `No ${filter} todos found.`}
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className={`p-4 border rounded-lg transition-all ${
                todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTodo(todo._id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {todo.completed && <CheckSquare className="w-3 h-3" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <span className="text-xs text-gray-500">{todo.category}</span>
                      {todo.dueDate && (
                        <span className={`text-xs ${
                          isOverdue(todo.dueDate, todo.completed)
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          Due: {formatDate(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;