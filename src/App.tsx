import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Calendar from './components/calendar/calendar'
import Navbar from './components/navbar'
import Login from './components/profile/login'
import Profile from './components/profile/profile'
import Register from './components/profile/register'
import TodoList from './components/todos/TodoList'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<TodoList />} />
      </Routes>
    </Router>
  )
}

export default App
