import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    console.log('🔐 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      headers: config.headers
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.response?.headers
    })

    const originalRequest = error.config

    // Handle expired tokens (403 Forbidden)
    if (error.response?.status === 403 && error.response?.data?.code === 'TOKEN_INVALID') {
      console.log('🔄 Token expired, forcing re-login...')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken') 
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        processQueue(null, accessToken)
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Assessment API methods
export const assessmentApi = {
  /**
   * Generate a comprehensive professional assessment for a conversation
   */
  async generateAssessment(conversationId, scenarioData = null, userHistory = null) {
    try {
      console.log('🎯 Generating assessment for conversation:', conversationId)
      
      const response = await apiClient.post('/assessment/generate', {
        conversationId,
        scenarioData,
        userHistory
      })
      
      console.log('✅ Assessment generated successfully:', {
        conversationId,
        assessmentId: response.data.data?.assessmentId,
        overallScore: response.data.data?.scores?.overall
      })
      
      return response.data
      
    } catch (error) {
      console.error('❌ Assessment generation failed:', error)
      throw new Error(error.response?.data?.error || 'Failed to generate assessment')
    }
  },

  /**
   * Get assessment results for a specific negotiation/conversation
   */
  async getAssessmentResults(negotiationId) {
    try {
      const response = await apiClient.get(`/assessment/results/${negotiationId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get assessment results:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve assessment results')
    }
  },

  /**
   * Get assessment status (processing, completed, failed)
   */
  async getAssessmentStatus(negotiationId) {
    try {
      const response = await apiClient.get(`/assessment/status/${negotiationId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get assessment status:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve assessment status')
    }
  },

  /**
   * Get comprehensive feedback for a conversation
   */
  async getComprehensiveFeedback(negotiationId) {
    try {
      const response = await apiClient.get(`/assessment/feedback/${negotiationId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get comprehensive feedback:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve feedback')
    }
  },

  /**
   * Get user's assessment history
   */
  async getUserAssessmentHistory(userId) {
    try {
      const response = await apiClient.get(`/assessment/history/${userId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get user assessment history:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve assessment history')
    }
  },

  /**
   * Get user's progress summary across all assessments
   */
  async getUserProgress(userId) {
    try {
      const response = await apiClient.get(`/assessment/progress/${userId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get user progress:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve user progress')
    }
  },

  /**
   * Retry a failed assessment
   */
  async retryAssessment(negotiationId) {
    try {
      const response = await apiClient.post(`/assessment/retry/${negotiationId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to retry assessment:', error)
      throw new Error(error.response?.data?.error || 'Failed to retry assessment')
    }
  },

  /**
   * Get assessment criteria for a scenario
   */
  async getAssessmentCriteria(scenarioId) {
    try {
      const response = await apiClient.get(`/assessment/criteria/${scenarioId}`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to get assessment criteria:', error)
      throw new Error(error.response?.data?.error || 'Failed to retrieve assessment criteria')
    }
  }
}

export default apiClient