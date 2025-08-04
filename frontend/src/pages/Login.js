import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  
  const { login, isAuthenticated, error, loading, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/sigh-blue.png" 
              alt="NegotiationMaster Logo" 
              sx={{ 
                height: { xs: '50px', sm: '60px' },
                width: 'auto',
                mb: 2,
                maxWidth: '100%'
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Login
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Sign in failed
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Please check your credentials and try again. If you continue to have trouble, 
                <Link component="button" variant="caption" sx={{ ml: 0.5 }} onClick={() => console.log('Contact support')}>contact support</Link>.
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                },
                '&:disabled': {
                  background: 'grey.300',
                  color: 'grey.600'
                },
                transition: 'all 0.2s ease'
              }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Signing you in...
                </Box>
              ) : 'Sign In'}
            </Button>
            
            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/register')
                }}
              >
                Don't have an account? Sign up
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login