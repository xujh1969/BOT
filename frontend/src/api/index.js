import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const login = async (password) => {
  const response = await api.post('/login', { password })
  return response.data
}

export const logout = async () => {
  const response = await api.post('/logout')
  return response.data
}

export const checkAuth = async () => {
  const response = await api.get('/check-auth')
  return response.data
}

export const changePassword = async (adminPassword, newPassword) => {
  const response = await api.post('/change-password', { adminPassword, newPassword })
  return response.data
}

export const getOpportunities = async (status = '') => {
  const response = await api.get('/opportunities', { params: { status } })
  return response.data
}

export const createOpportunity = async (name) => {
  const response = await api.post('/opportunities', { name })
  return response.data
}

export const getOpportunity = async (id) => {
  const response = await api.get(`/opportunities/${id}`)
  return response.data
}

export const updateOpportunity = async (id, data) => {
  const response = await api.post(`/opportunities/${id}/update`, data)
  return response.data
}

export const deleteOpportunity = async (id) => {
  const response = await api.post(`/opportunities/${id}/delete`)
  return response.data
}

export const archiveOpportunity = async (id) => {
  const response = await api.post(`/opportunities/${id}/archive`)
  return response.data
}

export const unarchiveOpportunity = async (id) => {
  const response = await api.post(`/opportunities/${id}/unarchive`)
  return response.data
}

export const createNode = async (opportunityId, data) => {
  const response = await api.post(`/opportunities/${opportunityId}/nodes/create`, data)
  return response.data
}

export const updateNode = async (id, data) => {
  const response = await api.post(`/nodes/${id}/update`, data)
  return response.data
}

export const deleteNode = async (id) => {
  const response = await api.post(`/nodes/${id}/delete`)
  return response.data
}

export const saveAllNodes = async (opportunityId, nodes) => {
  const response = await api.post(`/opportunities/${opportunityId}/save-all`, { nodes })
  return response.data
}

export default api
