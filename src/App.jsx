import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import { connectSocket, disconnectSocket } from './utils/socket'
import PrivateRoute from './utils/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Profile from './pages/Profile'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    // Connect to socket when authenticated
    if (isAuthenticated && token) {
      const socket = connectSocket(token)
      
      // Handle socket errors
      if (socket) {
        socket.on('error', (error) => {
          console.error('Socket error:', error)
        })
      }
    } else {
      disconnectSocket()
    }

    return () => {
      // Don't disconnect on unmount if still authenticated
      // Socket will be reused if user navigates between pages
    }
  }, [isAuthenticated, token])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App

