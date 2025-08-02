import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tab,
  Tabs,
  Badge
} from '@mui/material'
import {
  ExpandMore,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Star,
  Assignment,
  People,
  Psychology,
  Timeline,
  EmojiEvents,
  School,
  CheckCircle,
  Warning,
  Lightbulb,
  Analytics,
  BarChart,
  Assessment
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import apiService from '../../services/apiService'

const PerformanceFeedback = ({ 
  negotiationId, 
  onClose, 
  onRetryNegotiation,
  onNextScenario 
}) => {
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    improvements: false,
    milestones: false,
    analytics: false
  })

  useEffect(() => {
    if (negotiationId) {
      fetchPerformanceData()
    }
  }, [negotiationId])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const response = await apiService.get(`/api/negotiations/${negotiationId}/performance`)
      setPerformanceData(response.data)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
      setError('Failed to load performance analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'success.main'
    if (score >= 70) return 'info.main'
    if (score >= 55) return 'warning.main'
    return 'error.main'
  }

  const getRatingIcon = (rating) => {
    switch (rating) {
      case 'excellent': return <Star sx={{ color: 'gold' }} />
      case 'good': return <CheckCircle sx={{ color: 'success.main' }} />
      case 'average': return <Warning sx={{ color: 'warning.main' }} />
      default: return <Assignment sx={{ color: 'error.main' }} />
    }
  }

  const getRatingDescription = (rating) => {
    switch (rating) {
      case 'excellent': return 'Outstanding performance'
      case 'good': return 'Strong performance'
      case 'average': return 'Developing skills'
      default: return 'Needs improvement'
    }
  }

  const getTrendIcon = (trend) => {
    if (trend > 0.1) return <TrendingUp sx={{ color: 'success.main' }} />
    if (trend < -0.1) return <TrendingDown sx={{ color: 'error.main' }} />
    return <TrendingFlat sx={{ color: 'info.main' }} />
  }

  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: isExpanded
    }))
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing your negotiation performance...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments
        </Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchPerformanceData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!performanceData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          No performance data available for this negotiation.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
            Negotiation Performance Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive feedback across three key dimensions
          </Typography>
        </Box>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <CircularProgress
                    variant="determinate"
                    value={performanceData.overall_score}
                    size={120}
                    thickness={6}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {Math.round(performanceData.overall_score)}
                    </Typography>
                    <Typography variant="caption">
                      / 100
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack spacing={2} alignItems="flex-start">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getRatingIcon(performanceData.overall_rating)}
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                      {getRatingDescription(performanceData.overall_rating)}
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {performanceData.overall_feedback}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={`${performanceData.turn_count} turns`} 
                      variant="outlined" 
                      size="small"
                      sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
                    />
                    <Chip 
                      label={`${Math.round(performanceData.conversation_duration_seconds / 60)} min`}
                      variant="outlined"
                      size="small" 
                      sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
                    />
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="Performance Breakdown" icon={<Analytics />} />
          <Tab label="Improvement Plan" icon={<School />} />
          <Tab label="Session Analysis" icon={<BarChart />} />
        </Tabs>

        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Three Dimensions Performance */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Claiming Value */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" color="primary">
                            Claiming Value
                          </Typography>
                          {getRatingIcon(performanceData.claiming_value_rating)}
                        </Stack>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Competitive Effectiveness
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(performanceData.claiming_value_score)}/100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={performanceData.claiming_value_score}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(performanceData.claiming_value_score),
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {performanceData.claiming_value_analysis}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Creating Value */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" color="secondary">
                            Creating Value
                          </Typography>
                          {getRatingIcon(performanceData.creating_value_rating)}
                        </Stack>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Collaborative Problem-solving
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(performanceData.creating_value_score)}/100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={performanceData.creating_value_score}
                            sx={{
                              height: 8,  
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(performanceData.creating_value_score),
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {performanceData.creating_value_analysis}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Managing Relationships */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" color="success">
                            Managing Relationships
                          </Typography>
                          {getRatingIcon(performanceData.managing_relationships_rating)}
                        </Stack>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Interpersonal Dynamics
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(performanceData.managing_relationships_score)}/100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={performanceData.managing_relationships_score}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(performanceData.managing_relationships_score),
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {performanceData.managing_relationships_analysis}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Key Negotiation Moves */}
              {performanceData.negotiation_moves && performanceData.negotiation_moves.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                    Key Negotiation Moves
                  </Typography>
                  <Grid container spacing={2}>
                    {performanceData.negotiation_moves.slice(0, 6).map((move, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Chip 
                                label={move.type} 
                                size="small"
                                color={
                                  move.type === 'competitive' ? 'primary' :
                                  move.type === 'collaborative' ? 'secondary' : 'success'
                                }
                              />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {move.indicator.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                "{move.context.substring(0, 80)}..."
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="improvement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Improvement Suggestions */}
              {performanceData.improvement_suggestions && performanceData.improvement_suggestions.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                    Personalized Development Plan
                  </Typography>
                  <Stack spacing={3}>
                    {performanceData.improvement_suggestions.map((suggestion, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {suggestion.dimension.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              <Chip 
                                label={`${suggestion.priority} priority`}
                                size="small"
                                color={suggestion.priority === 'high' ? 'error' : 'warning'}
                              />
                            </Stack>
                            
                            <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                              <Typography variant="body2">
                                {suggestion.suggestion}
                              </Typography>
                            </Alert>
                            
                            {suggestion.specific_actions && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Specific Actions:
                                </Typography>
                                <List dense>
                                  {suggestion.specific_actions.map((action, actionIndex) => (
                                    <ListItem key={actionIndex} sx={{ pl: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={action}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              )}
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Session Analytics */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Session Metrics
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Speaking Time Distribution
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={performanceData.speaking_time_percentage || 50}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                            {Math.round(performanceData.speaking_time_percentage || 50)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider />
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Total Turns:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {performanceData.turn_count}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Duration:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {Math.round(performanceData.conversation_duration_seconds / 60)} minutes
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Conversation Analysis
                    </Typography>
                    {performanceData.conversation_analysis && (
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Questions Asked:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {performanceData.conversation_analysis.questions_asked || 0}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Information Shared:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {performanceData.conversation_analysis.information_shared || 0} instances
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Value Creation Attempts:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {performanceData.conversation_analysis.value_creation_attempts || 0}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onRetryNegotiation}
            startIcon={<Psychology />}
            size="large"
          >
            Practice Again
          </Button>
          <Button
            variant="contained"
            onClick={onNextScenario}
            startIcon={<EmojiEvents />}
            size="large"
          >
            Next Challenge
          </Button>
          <Button
            variant="text"
            onClick={onClose}
            size="large"
          >
            Back to Dashboard
          </Button>
        </Box>
      </motion.div>
    </Container>
  )
}

export default PerformanceFeedback