import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Star,
  LocalFireDepartment,
  Refresh,
  EmojiEvents
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { progressApi } from '../../services/apiService'
import {
  SkillProgressionChart,
  ScoreRadarChart,
  ImprovementVelocityChart
} from '../ProgressCharts'

const ProgressDashboard = () => {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchProgressData = async (selectedTimeframe = timeframe) => {
    try {
      setError(null)
      const response = await progressApi.getUserProgress(user.id, selectedTimeframe)
      setProgressData(response.data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch progress data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchProgressData()
    }
  }, [user?.id, timeframe])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchProgressData()
  }

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value)
    setLoading(true)
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" fontSize="small" />
    if (trend < 0) return <TrendingDown color="error" fontSize="small" />
    return <TrendingFlat color="disabled" fontSize="small" />
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return 'success'
    if (trend < 0) return 'error'
    return 'default'
  }

  const formatTimeframeLabel = (tf) => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 3 Months',
      '1y': 'Last Year'
    }
    return labels[tf] || tf
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  if (!progressData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No progress data available. Complete your first negotiation to see your progress!
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Progress
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={handleTimeframeChange}
              label="Timeframe"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 3 Months</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Key Insights */}
      <AnimatePresence>
        {progressData.insights && progressData.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {progressData.insights.map((insight, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ 
                    background: insight.type === 'positive_trend' ? 
                      'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)' :
                      insight.type === 'consistency' ?
                      'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' :
                      'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {insight.type === 'positive_trend' && <TrendingUp color="success" />}
                        {insight.type === 'consistency' && <LocalFireDepartment color="warning" />}
                        {insight.type === 'strength' && <Star color="primary" />}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {insight.type === 'positive_trend' && 'Great Progress!'}
                          {insight.type === 'consistency' && 'Streak Alert!'}
                          {insight.type === 'strength' && 'Your Strength'}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {insight.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Scores Overview - All Four Scores in Single Row */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Overall Score - First in Row but Narrower */}
          {progressData.currentProgress.scores.overall && (
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Overall Score
                      </Typography>
                      {getTrendIcon(progressData.currentProgress.scores.overall.trend)}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {Math.round(progressData.currentProgress.scores.overall.current)}
                        <Typography variant="h6" component="span" sx={{ opacity: 0.8, ml: 1 }}>
                          /100
                        </Typography>
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={progressData.currentProgress.scores.overall.current}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 2,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        size="small"
                        label={`Best: ${Math.round(progressData.currentProgress.scores.overall.best)}`}
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${progressData.currentProgress.scores.overall.trend > 0 ? '+' : ''}${progressData.currentProgress.scores.overall.trend.toFixed(1)}`}
                        sx={{ 
                          backgroundColor: getTrendColor(progressData.currentProgress.scores.overall.trend) === 'success' ? 'rgba(76, 175, 80, 0.8)' : 
                                          getTrendColor(progressData.currentProgress.scores.overall.trend) === 'error' ? 'rgba(244, 67, 54, 0.8)' : 
                                          'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}

          {/* Sub-Scores - Three Skills in Same Row */}
          {['claiming_value', 'creating_value', 'relationship'].map((skill, index) => {
            const skillLabels = {
              claiming_value: 'Claiming Value',
              creating_value: 'Creating Value',
              relationship: 'Managing Relationships'
            }
            
            const scoreData = progressData.currentProgress.scores[skill]
            if (!scoreData) return null
            
            return (
              <Grid item xs={12} sm={6} md={3} key={skill}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h3">
                          {skillLabels[skill]}
                        </Typography>
                        {getTrendIcon(scoreData.trend)}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {Math.round(scoreData.current)}
                          <Typography variant="h6" component="span" color="textSecondary">
                            /100
                          </Typography>
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={scoreData.current}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 2,
                          backgroundColor: 'rgba(0,0,0,0.1)'
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={`Best: ${Math.round(scoreData.best)}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${scoreData.trend > 0 ? '+' : ''}${scoreData.trend.toFixed(1)}`}
                          color={getTrendColor(scoreData.trend)}
                          variant="filled"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {progressData.currentProgress.stats.total_conversations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Conversations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <LocalFireDepartment color="warning" />
                <Typography variant="h4" color="warning.main" sx={{ ml: 1 }}>
                  {progressData.currentProgress.stats.current_streak}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Current Streak (days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <EmojiEvents color="success" />
                <Typography variant="h4" color="success.main" sx={{ ml: 1 }}>
                  {progressData.currentProgress.stats.achievements_unlocked}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Achievements Unlocked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Math.round(progressData.currentProgress.stats.improvement_velocity * 10) / 10}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Improvement Velocity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SkillProgressionChart
            data={progressData.skillHistory}
            title={`Skill Progression (${formatTimeframeLabel(timeframe)})`}
            height={400}
          />
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <ScoreRadarChart
            currentScores={progressData.currentProgress.scores}
            bestScores={{
              claiming_value: progressData.currentProgress.scores.claiming_value.best,
              creating_value: progressData.currentProgress.scores.creating_value.best,
              relationship: progressData.currentProgress.scores.relationship.best
            }}
            height={400}
          />
        </Grid>
        
        <Grid item xs={12}>
          <ImprovementVelocityChart
            trends={progressData.trends}
            title="Improvement Trends by Skill"
          />
        </Grid>
      </Grid>

      {/* Milestone Progress */}
      {progressData.milestoneProgress && progressData.milestoneProgress.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Milestones
          </Typography>
          <Grid container spacing={2}>
            {progressData.milestoneProgress.map((milestone, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  opacity: milestone.achieved ? 1 : 0.7,
                  border: milestone.achieved ? '2px solid' : '1px solid',
                  borderColor: milestone.achieved ? 'success.main' : 'divider'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {milestone.name}
                      </Typography>
                      {milestone.achieved && <EmojiEvents color="success" />}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={milestone.progress_percentage}
                      color={milestone.achieved ? 'success' : 'primary'}
                      sx={{ height: 6, borderRadius: 3, mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {Math.round(milestone.current_score)}/{milestone.threshold} points
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}

export default ProgressDashboard