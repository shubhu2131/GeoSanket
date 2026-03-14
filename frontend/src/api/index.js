import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
})

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gs_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('gs_token')
    window.location.href = '/admin/login'
  }
  return Promise.reject(err)
})

export default API

// API helpers
export const login = (phone, password) => API.post('/api/auth/login', { phone, password })
export const getZones = () => API.get('/api/zones')
export const createZone = (data) => API.post('/api/zones', data)
export const deleteZone = (id) => API.delete(`/api/zones/${id}`)
export const getProjects = () => API.get('/api/projects')
export const createProject = (data) => API.post('/api/projects', data)
export const deleteProject = (id) => API.delete(`/api/projects/${id}`)
export const getOverview = () => API.get('/api/analytics/overview')
export const getTimeline = (days = 7) => API.get(`/api/analytics/timeline?days=${days}`)
export const getByZone = () => API.get('/api/analytics/by-zone')
export const getUsers = () => API.get('/api/admin/users')
export const manualNotify = (userId, zoneId) => API.post('/api/admin/notify/manual', { userId, zoneId })
