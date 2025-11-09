import { io } from 'socket.io-client'

// Get API URL and strip /api if present (socket.io connects to base server URL)
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://swiftcrm-backend-masterunion.onrender.com/api'
  // Remove /api from the end if present
  return apiUrl.replace(/\/api\/?$/, '') || 'https://swiftcrm-backend-masterunion.onrender.com'
}

const SOCKET_URL = getSocketURL()

let socket = null

export const connectSocket = (token) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect()
    socket = null
  }

  if (!token) {
    console.warn('No token provided for socket connection')
    return null
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    path: '/socket.io/'
  })

  socket.on('connect', () => {
    console.log('Socket connected successfully to:', SOCKET_URL)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message || error)
    console.error('Attempted to connect to:', SOCKET_URL)
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

