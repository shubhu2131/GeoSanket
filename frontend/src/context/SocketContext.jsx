import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { token } = useAuth()
  const [liveEvents, setLiveEvents] = useState([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const sock = io(`${SOCKET_URL}/admin`, { auth: { token } })
    socketRef.current = sock

    sock.on('connect', () => setConnected(true))
    sock.on('disconnect', () => setConnected(false))
    sock.on('live:notification', (data) => {
      setLiveEvents(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 50))
    })

    return () => sock.disconnect()
  }, [token])

  return (
    <SocketContext.Provider value={{ liveEvents, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
