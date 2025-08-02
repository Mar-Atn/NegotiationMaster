# Frontend Integration Guide

## React Components Architecture for Chat UI

### Component Hierarchy
```
App
├── AuthProvider (existing)
├── Router
    ├── Login/Register (existing)  
    ├── Dashboard (new)
    ├── ScenariosPage (new)
    └── NegotiationSession (new)
        ├── ScenarioInfo
        ├── ChatInterface
        ├── NegotiationControls
        └── ResultsModal
```

### 1. Dashboard Component

**File:** `src/pages/Dashboard.js`

```javascript
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/apiService'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Box
} from '@mui/material'

const Dashboard = () => {
  const { user } = useAuth()
  const [userProgress, setUserProgress] = useState(null)
  const [recentNegotiations, setRecentNegotiations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [progressRes, negotiationsRes] = await Promise.all([
          apiClient.get('/user/progress'),
          apiClient.get('/negotiations/recent')
        ])
        
        setUserProgress(progressRes.data.data)
        setRecentNegotiations(negotiationsRes.data.data)
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <LinearProgress />

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Welcome back, {user.firstName}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              {userProgress && (
                <Box>
                  <Box mb={2}>
                    <Typography variant="body2">Claiming Value</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={userProgress.claiming_value} 
                    />
                    <Typography variant="caption">
                      {userProgress.claiming_value}/100
                    </Typography>
                  </Box>
                  {/* Repeat for other skills */}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mb: 2 }}
                onClick={() => navigate('/scenarios')}
              >
                Start New Negotiation
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate('/progress')}
              >
                View Full Progress
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
```

### 2. Scenarios Page Component

**File:** `src/pages/ScenariosPage.js`

```javascript
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/apiService'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress
} from '@mui/material'

const ScenariosPage = () => {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await apiClient.get('/scenarios')
        setScenarios(response.data.data)
      } catch (error) {
        console.error('Scenarios fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScenarios()
  }, [])

  const startNegotiation = async (scenarioId) => {
    try {
      const response = await apiClient.post('/negotiations/start', {
        scenario_id: scenarioId
      })
      
      navigate(`/negotiation/${response.data.data.negotiation_id}`)
    } catch (error) {
      console.error('Start negotiation error:', error)  
    }
  }

  if (loading) return <LinearProgress />

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Choose Your Negotiation Scenario
      </Typography>
      
      <Grid container spacing={3}>
        {scenarios.map((scenario) => (
          <Grid item xs={12} md={6} lg={4} key={scenario.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{scenario.title}</Typography>
                  <Chip 
                    label={`Level ${scenario.difficulty}`}
                    color={scenario.difficulty <= 3 ? 'success' : 
                           scenario.difficulty <= 5 ? 'warning' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {scenario.description}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="caption" display="block">
                    Duration: ~{scenario.estimated_duration} minutes
                  </Typography>
                  <Typography variant="caption" display="block">
                    Focus: {scenario.skills_focus.join(', ')}
                  </Typography>
                </Box>

                {scenario.user_best_score && (
                  <Box>
                    <Typography variant="caption" color="success.main">
                      Best Score: {scenario.user_best_score}/100
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={scenario.user_best_score}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => startNegotiation(scenario.id)}
                >
                  {scenario.user_completed ? 'Practice Again' : 'Start Negotiation'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default ScenariosPage
```

### 3. Chat Interface Component

**File:** `src/components/ChatInterface.js`

```javascript
import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

const ChatInterface = ({ negotiationId, aiCharacter }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !negotiationId) return

    // Join negotiation room
    socket.emit('join-negotiation', { negotiation_id: negotiationId })

    // Listen for messages
    socket.on('message-received', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('ai-message', (message) => {
      setMessages(prev => [...prev, message])
      setAiTyping(false)
    })

    socket.on('ai-typing', ({ typing }) => {
      setAiTyping(typing)
    })

    // Cleanup
    return () => {
      socket.off('message-received')
      socket.off('ai-message') 
      socket.off('ai-typing')
      socket.emit('leave-negotiation', { negotiation_id: negotiationId })
    }
  }, [socket, negotiationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    socket.emit('send-message', {
      negotiation_id: negotiationId,
      content: newMessage.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    })

    setNewMessage('')
    setAiTyping(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2 }}>{aiCharacter?.name?.[0]}</Avatar>
          <Box>
            <Typography variant="h6">{aiCharacter?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {aiCharacter?.role}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2,
          px: 1
        }}
      >
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isUser={message.sender_type === 'user'}
          />
        ))}
        
        {aiTyping && (
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
              {aiCharacter?.name?.[0]}
            </Avatar>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center">
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {aiCharacter?.name} is thinking...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 1 }}
          />
          <IconButton 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}

const MessageBubble = ({ message, isUser }) => (
  <Box 
    display="flex" 
    justifyContent={isUser ? 'flex-end' : 'flex-start'}
    mb={2}
  >
    {!isUser && (
      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>AI</Avatar>
    )}
    
    <Paper
      sx={{
        p: 2,
        maxWidth: '70%',
        backgroundColor: isUser ? 'primary.main' : 'grey.100',
        color: isUser ? 'primary.contrastText' : 'text.primary',
        borderRadius: 2
      }}
    >
      <Typography variant="body1">{message.content}</Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          opacity: 0.7,
          display: 'block',
          mt: 1
        }}
      >
        {new Date(message.timestamp).toLocaleTimeString()}
      </Typography>
    </Paper>
    
    {isUser && (
      <Avatar sx={{ ml: 2, width: 32, height: 32 }}>U</Avatar>
    )}
  </Box>
)

export default ChatInterface
```

### 4. Socket Hook

**File:** `src/hooks/useSocket.js`

```javascript
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import io from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, token])

  return socket
}
```

### 5. Negotiation Session Page

**File:** `src/pages/NegotiationSession.js`

```javascript
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/apiService'
import ChatInterface from '../components/ChatInterface'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'

const NegotiationSession = () => {
  const { negotiationId } = useParams()
  const navigate = useNavigate()
  const [negotiation, setNegotiation] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [finalScore, setFinalScore] = useState(null)

  useEffect(() => {
    const fetchNegotiation = async () => {
      try {
        const response = await apiClient.get(`/negotiations/${negotiationId}`)
        const data = response.data.data
        
        setNegotiation(data)
        setScenario(data.scenario)
        
        if (data.status === 'completed') {
          setShowResults(true)
          setFinalScore(data.final_score)
        }
      } catch (error) {
        console.error('Negotiation fetch error:', error)
        navigate('/scenarios')
      } finally {
        setLoading(false)
      }
    }

    if (negotiationId) {
      fetchNegotiation()
    }
  }, [negotiationId, navigate])

  if (loading) return <LinearProgress />

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Scenario Info Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {scenario?.title}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={2}>
              {scenario?.description}
            </Typography>

            <Box mb={2}>
              <Typography variant="subtitle2">Your Role:</Typography>
              <Typography variant="body2">
                {scenario?.user_role}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2">Objective:</Typography>
              <Typography variant="body2">
                {scenario?.user_objective}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/scenarios')}
            >
              Exit Negotiation
            </Button>
          </Paper>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%', p: 2 }}>
            {negotiation && scenario && (
              <ChatInterface
                negotiationId={negotiationId}
                aiCharacter={scenario.ai_character}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Results Modal */}
      <Dialog 
        open={showResults} 
        onClose={() => setShowResults(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Negotiation Complete!</DialogTitle>
        <DialogContent>
          {finalScore && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Performance
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2">Claiming Value</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={finalScore.claiming_value}
                />
                <Typography variant="caption">
                  {finalScore.claiming_value}/100
                </Typography>
              </Box>

              {/* Repeat for other scores */}
              
              <Box mt={3}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/scenarios')}
                  sx={{ mr: 2 }}
                >
                  Try Another Scenario
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  View Dashboard
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default NegotiationSession
```

### Installation & Setup

**Required Dependencies:**
```bash
cd frontend
npm install @mui/icons-material socket.io-client
```

**Environment Variables (.env):**
```
REACT_APP_API_URL=http://localhost:5000
```

**Router Setup (App.js):**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// ... other imports

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scenarios" element={<ProtectedRoute><ScenariosPage /></ProtectedRoute>} />
          <Route path="/negotiation/:negotiationId" element={<ProtectedRoute><NegotiationSession /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
```

This guide provides Frontend Wizard with complete component architecture that will work seamlessly with Backend Captain's APIs once they're implemented.