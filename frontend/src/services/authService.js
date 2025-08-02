import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const authService = {
  async register(userData) {
    const response = await authAPI.post('/auth/register', {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    })
    return response.data
  },

  async login(email, password) {
    const response = await authAPI.post('/auth/login', {
      email,
      password
    })
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await authAPI.post('/auth/refresh', {
      refreshToken
    })
    return response.data
  },

  async logout(refreshToken) {
    const response = await authAPI.post('/auth/logout', {
      refreshToken
    })
    return response.data
  },

  async logoutAll() {
    const token = localStorage.getItem('accessToken')
    const response = await authAPI.post('/auth/logout-all', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }
}