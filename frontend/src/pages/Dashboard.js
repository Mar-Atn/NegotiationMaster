import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/apiService'

// Simple progress trend component
const ProgressTrendIndicator = ({ current, trend, label }) => {
  const getTrendIcon = (trend) => {
    if (trend > 1) return '📈'
    if (trend < -1) return '📉'
    return '➡️'
  }
  
  const getTrendColor = (trend) => {
    if (trend > 1) return 'success.main'
    if (trend < -1) return 'error.main'
    return 'text.secondary'
  }
  
  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" component="div">
        {current}%
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {trend !== 0 && (
        <Typography 
          variant="caption" 
          color={getTrendColor(trend)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          {getTrendIcon(trend)} {trend > 0 ? '+' : ''}{trend.toFixed(1)}/session
        </Typography>
      )}
    </Box>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [scenarios, setScenarios] = useState([])
  const [progress, setProgress] = useState(null)
  const [progressHistory, setProgressHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progressLoading, setProgressLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch scenarios and progress data in parallel
        const [scenariosResponse, progressResponse] = await Promise.all([
          apiClient.get('/scenarios'),
          user?.id ? apiClient.get(`/progress/user/${user.id}`) : Promise.resolve(null)
        ])
        
        // Process scenarios data
        const scenarioData = scenariosResponse.data.data || scenariosResponse.data
        const transformedScenarios = scenarioData.map(scenario => ({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          difficulty: scenario.difficulty,
          completed: false, // TODO: Get actual completion status from user progress
          score: null // TODO: Get actual score from user progress
        }))
        
        setScenarios(transformedScenarios)
        
        // Process progress data
        if (progressResponse && progressResponse.data.success) {
          const progressData = progressResponse.data.data.currentProgress
          const trendsData = progressResponse.data.data.trends || {}
          
          setProgress({
            claimingValue: Math.round(progressData.scores.claiming_value.current),
            creatingValue: Math.round(progressData.scores.creating_value.current),
            managingRelationships: Math.round(progressData.scores.relationship.current),
            overall: Math.round(progressData.scores.overall.current),
            scenariosCompleted: progressData.stats.total_conversations || 0,
            totalScenarios: scenarioData.length,
            streak: progressData.stats.current_streak || 0,
            totalConversations: progressData.stats.total_conversations || 0,
            improvementVelocity: progressData.stats.improvement_velocity || 0,
            consistencyScore: progressData.stats.consistency_score || 0,
            trends: {
              claimingValue: trendsData.claiming_value?.average_per_session || 0,
              creatingValue: trendsData.creating_value?.average_per_session || 0,
              managingRelationships: trendsData.relationship?.average_per_session || 0,
              overall: trendsData.overall?.average_per_session || 0
            }
          })
          
          // Store progress history for potential charts
          setProgressHistory(progressResponse.data.data.skillHistory || [])
        } else {
          // Fallback for new users or when progress API fails
          setProgress({
            claimingValue: 50,
            creatingValue: 50,
            managingRelationships: 50,
            overall: 50,
            scenariosCompleted: 0,
            totalScenarios: scenarioData.length,
            streak: 0,
            totalConversations: 0,
            improvementVelocity: 0,
            consistencyScore: 0,
            trends: {
              claimingValue: 0,
              creatingValue: 0,
              managingRelationships: 0,
              overall: 0
            }
          })
        }
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
        
        // Set fallback progress data on error
        setProgress({
          claimingValue: 50,
          creatingValue: 50,
          managingRelationships: 50,
          overall: 50,
          scenariosCompleted: 0,
          totalScenarios: 7,
          streak: 0,
          totalConversations: 0,
          improvementVelocity: 0,
          consistencyScore: 0,
          trends: {
            claimingValue: 0,
            creatingValue: 0,
            managingRelationships: 0,
            overall: 0
          }
        })
      } finally {
        setLoading(false)
        setProgressLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'success'
    if (difficulty <= 4) return 'warning'
    return 'error'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 70) return 'warning'
    return 'error'
  }

  if (loading || progressLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
          Loading your dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 300 }}>
          We're preparing your personalized negotiation training experience
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unable to load dashboard
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => window.location.reload()}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Welcome Header with Enhanced Visual Hierarchy */}
      <Box sx={{ 
        mb: 4, 
        py: 3,
        px: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 2,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 300, 
            mb: 1,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.125rem' }
          }}>
            Continue your negotiation mastery journey
          </Typography>
        </Box>
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
      </Box>
      
      {/* Primary Metrics - Enhanced Visual Hierarchy */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overall Score - Primary Focus */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            transform: 'scale(1.02)',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { xs: '2.5rem', md: '3rem' }
              }}>
                {progress?.overall || 0}%
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 500, 
                mb: 2,
                opacity: 0.95
              }}>
                Overall Score
              </Typography>
              {progress?.trends?.overall !== 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 0.5,
                    opacity: 0.9
                  }}
                >
                  {progress.trends.overall > 0 ? '📈' : '📉'} 
                  {progress.trends.overall > 0 ? '+' : ''}{progress.trends.overall.toFixed(1)}/session
                </Typography>
              )}
            </Box>
            <CardContent sx={{ pt: 0, color: 'white' }}>
              <LinearProgress 
                variant="determinate" 
                value={progress?.overall || 0}
                sx={{ 
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              />
              <Typography variant="body2" align="center" sx={{ mb: 1, opacity: 0.9 }}>
                {progress?.scenariosCompleted || 0}/{progress?.totalScenarios || 0} conversations completed
              </Typography>
              {progress?.streak > 0 && (
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }} align="center">
                  🔥 {progress.streak} day streak!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Secondary Metrics */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
            },
            transition: 'all 0.3s ease'
          }}>
            <ProgressTrendIndicator
              current={progress?.claimingValue || 0}
              trend={progress?.trends?.claimingValue || 0}
              label="Claiming Value"
            />
            <CardContent sx={{ pt: 0 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress?.claimingValue || 0}
                color={getScoreColor(progress?.claimingValue || 0)}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
            },
            transition: 'all 0.3s ease'
          }}>
            <ProgressTrendIndicator
              current={progress?.creatingValue || 0}
              trend={progress?.trends?.creatingValue || 0}
              label="Creating Value"
            />
            <CardContent sx={{ pt: 0 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress?.creatingValue || 0}
                color={getScoreColor(progress?.creatingValue || 0)}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
            },
            transition: 'all 0.3s ease'
          }}>
            <ProgressTrendIndicator
              current={progress?.managingRelationships || 0}
              trend={progress?.trends?.managingRelationships || 0}
              label="Managing Relationships"
            />
            <CardContent sx={{ pt: 0 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress?.managingRelationships || 0}
                color={getScoreColor(progress?.managingRelationships || 0)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Summary Section */}
      {progress && progress.totalConversations > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progress Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Conversations
                    </Typography>
                    <Typography variant="h6">
                      {progress.totalConversations}
                    </Typography>
                  </Grid>
                  {progress.streak > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Current Streak
                      </Typography>
                      <Typography variant="h6" color="primary">
                        🔥 {progress.streak} days
                      </Typography>
                    </Grid>
                  )}
                  {progress.improvementVelocity !== 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Improvement Trend
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color={progress.improvementVelocity > 0 ? 'success.main' : 'error.main'}
                      >
                        {progress.improvementVelocity > 0 ? '📈' : '📉'} {Math.abs(progress.improvementVelocity).toFixed(1)}/session
                      </Typography>
                    </Grid>
                  )}
                  {progress.consistencyScore > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Consistency
                      </Typography>
                      <Typography variant="h6">
                        {Math.round(progress.consistencyScore)}%
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Scenarios Section with Enhanced Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ 
          fontWeight: 400, 
          mb: 1,
          color: 'text.primary'
        }}>
          Negotiation Scenarios
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Choose a scenario to practice your negotiation skills with AI-powered conversations
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {scenarios.map((scenario) => (
          <Grid item xs={12} sm={6} lg={4} key={scenario.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={`Level ${scenario.difficulty}`}
                    size="small"
                    color={getDifficultyColor(scenario.difficulty)}
                  />
                  {scenario.completed && (
                    <Chip
                      label={`Score: ${scenario.score}`}
                      size="small"
                      color={getScoreColor(scenario.score)}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {scenario.title}
                </Typography>
                
                {scenario.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {scenario.description}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {scenario.completed ? 'Completed' : 'Available'}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="medium" 
                  variant={scenario.completed ? 'outlined' : 'contained'}
                  disabled={!scenario.completed && scenario.difficulty > (progress?.scenariosCompleted || 0) + 1}
                  onClick={() => window.location.href = `/scenario/${scenario.id}`}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {scenario.completed ? 'Practice Again' : 'Start Negotiation'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard