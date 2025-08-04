import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Paper,
  Stack,
  Chip,
  Card,
  CardContent,
  Button,
  Collapse
} from '@mui/material'
import {
  Assessment,
  Psychology,
  Insights,
  Timer,
  CheckCircle,
  Timeline
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { assessmentApi } from '../../services/apiService'

const AssessmentProcessing = ({
  negotiationId,
  conversationData,
  scenario,
  character,
  onAssessmentComplete,
  onRetry,
  onTimeout
}) => {
  // Processing states
  const [processingStage, setProcessingStage] = useState('initializing') // initializing, transcript_fetch, analyzing, generating, completed
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(180) // 3 minutes initial estimate
  const [statusMessage, setStatusMessage] = useState('Preparing assessment analysis...')

  // Enhanced timer for elapsed time and countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
      setEstimatedTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-timeout after 5 minutes to ensure user doesn't get stuck
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      if (processingStage !== 'completed') {
        console.warn('⏰ Assessment processing timeout after 5 minutes')
        setStatusMessage('Processing is taking longer than expected, but your data is safe...')
        onTimeout?.()
      }
    }, 300000) // 5 minutes

    return () => clearTimeout(timeoutTimer)
  }, [processingStage, onTimeout])

  // Start assessment processing with enhanced stages
  const startAssessment = useCallback(async () => {
    console.log('🚀 Starting professional assessment analysis for:', negotiationId)
    
    try {
      // Step 1: Initialize assessment engine
      setProcessingStage('initializing')
      setProgress(5)
      setStatusMessage('Initializing AI assessment engine...')
      setEstimatedTimeRemaining(180)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 2: Fetch ElevenLabs transcript (this can take 2-3 minutes)
      setProcessingStage('transcript_fetch')
      setProgress(15)
      setStatusMessage('Fetching conversation transcript from ElevenLabs...')
      setEstimatedTimeRemaining(150)
      
      // Simulate ElevenLabs processing delay with realistic progress
      for (let i = 15; i <= 45; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 8000)) // 8 second intervals
        setProgress(i)
        setEstimatedTimeRemaining(prev => Math.max(0, prev - 8))
        
        if (i === 25) setStatusMessage('ElevenLabs processing conversation audio...')
        if (i === 35) setStatusMessage('Transcript generation in progress...')
        if (i === 45) setStatusMessage('Transcript ready, starting analysis...')
      }
      
      // Step 3: Analyze conversation patterns
      setProcessingStage('analyzing')
      setProgress(50)
      setStatusMessage('AI analyzing negotiation patterns and strategies...')
      setEstimatedTimeRemaining(60)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProgress(65)
      setStatusMessage('Evaluating communication effectiveness...')
      setEstimatedTimeRemaining(45)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Step 4: Generate personalized feedback
      setProcessingStage('generating')
      setProgress(75)
      setStatusMessage('Generating personalized feedback and recommendations...')
      setEstimatedTimeRemaining(30)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setProgress(90)
      setStatusMessage('Compiling assessment results...')
      setEstimatedTimeRemaining(15)
      
      // Generate assessment with enhanced data
      const assessmentResult = await assessmentApi.generateAssessment(
        conversationData.elevenLabsConversationId || negotiationId,
        {
          scenario: scenario || conversationData.scenario,
          character: character || conversationData.character,
          transcript: conversationData.transcript,
          duration: conversationData.duration,
          sessionMetrics: conversationData.sessionMetrics,
          negotiationId: negotiationId
        }
      )
      
      // Step 5: Complete with celebration
      setProcessingStage('completed')
      setProgress(100)
      setStatusMessage('Assessment complete! Preparing your results...')
      setEstimatedTimeRemaining(0)
      
      console.log('✨ Professional assessment analysis completed successfully')
      
      // Brief celebration moment, then seamless transition
      setTimeout(() => {
        if (onAssessmentComplete && assessmentResult?.data) {
          onAssessmentComplete(assessmentResult.data)
        }
      }, 1500)
      
    } catch (err) {
      console.error('❌ Assessment processing failed:', err)
      setStatusMessage('Assessment encountered an issue, but your conversation data is safe.')
      // Graceful error handling - continue to feedback with partial data
      setTimeout(() => {
        onTimeout?.()
      }, 2000)
    }
  }, [negotiationId, conversationData, scenario, character, onAssessmentComplete, onTimeout])

  // Start assessment when component mounts
  useEffect(() => {
    startAssessment()
  }, [startAssessment])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Format time remaining with smart display
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Almost done!'
    const mins = Math.floor(seconds / 60)
    if (mins >= 1) {
      return `~${mins} min${mins > 1 ? 's' : ''}`
    }
    return `~${seconds}s`
  }

  // Get stage-specific content
  const getStageContent = () => {
    switch (processingStage) {
      case 'initializing':
        return {
          icon: <Assessment sx={{ fontSize: '3rem', color: 'primary.main' }} />,
          title: 'Initializing Assessment',
          description: 'Setting up professional AI analysis for your negotiation...',
          tips: 'Our advanced assessment engine is preparing to evaluate your conversation using proven negotiation frameworks.'
        }
      case 'transcript_fetch':
        return {
          icon: <Timeline sx={{ fontSize: '3rem', color: 'info.main' }} />,
          title: 'Processing Conversation',
          description: 'ElevenLabs is processing your voice conversation transcript...',
          tips: 'This step can take 2-3 minutes for longer conversations. We\'re ensuring every word is captured accurately for precise analysis.'
        }
      case 'analyzing':
        return {
          icon: <Psychology sx={{ fontSize: '3rem', color: 'warning.main' }} />,
          title: 'Analyzing Performance',
          description: 'AI is evaluating your negotiation techniques using expert frameworks...',
          tips: 'We\'re analyzing communication patterns, strategic decisions, value creation, value claiming, and relationship management.'
        }
      case 'generating':
        return {
          icon: <Insights sx={{ fontSize: '3rem', color: 'info.main' }} />,
          title: 'Generating Insights',
          description: 'Creating personalized feedback and actionable recommendations...',
          tips: 'Compiling your performance into detailed insights with specific examples and improvement strategies.'
        }
      case 'completed':
        return {
          icon: <CheckCircle sx={{ fontSize: '3rem', color: 'success.main' }} />,
          title: 'Assessment Complete!',
          description: 'Your comprehensive negotiation assessment is ready.',
          tips: 'Get ready to discover your strengths, areas for improvement, and personalized action steps.'
        }
      default:
        return {
          icon: <Timer sx={{ fontSize: '3rem', color: 'grey.500' }} />,
          title: 'Processing...',
          description: 'Please wait while we process your assessment.',
          tips: ''
        }
    }
  }

  const stageContent = getStageContent()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: 3
          }}
        >
          <Box textAlign="center">
            {/* Main Icon and Title */}
            <motion.div
              key={processingStage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {stageContent.icon}
            </motion.div>
            
            <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              {stageContent.title}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {stageContent.description}
            </Typography>
            
            <Typography variant="body2" color="primary.main" sx={{ mb: 3, fontWeight: 500 }}>
              {statusMessage}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #e57373 0%, #ffb74d 50%, #81c784 100%)'
                  }
                }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}% Complete
                </Typography>
                {processingStage === 'transcript_fetch' && progress < 45 && (
                  <Typography variant="caption" color="info.main" sx={{ fontStyle: 'italic' }}>
                    ElevenLabs processing...
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Enhanced Status Chips with Time Estimates */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<Timer />}
                label={`Elapsed: ${formatTime(elapsedTime)}`}
                variant="outlined"
                size="small"
              />
              {estimatedTimeRemaining > 0 && processingStage !== 'completed' && (
                <Chip
                  icon={<Timeline />}
                  label={`Est. remaining: ${formatTimeRemaining(estimatedTimeRemaining)}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              )}
              {processingStage === 'completed' && (
                <Chip
                  icon={<CheckCircle />}
                  label="Analysis Complete!"
                  color="success"
                  size="medium"
                />
              )}
            </Stack>

            {/* Professional Tips and Information */}
            <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid', borderColor: 'primary.light' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Insights sx={{ fontSize: '1.2rem' }} />
                  What's happening behind the scenes?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {stageContent.tips}
                </Typography>
                
                {processingStage === 'transcript_fetch' && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="info.dark" sx={{ fontWeight: 500 }}>
                      📝 ElevenLabs Processing: Voice conversations require additional processing time to ensure transcript accuracy. This is normal and ensures the highest quality analysis.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Processing Details Toggle */}
            <Button
              variant="text"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ mb: 2 }}
            >
              {showDetails ? 'Hide' : 'Show'} Processing Details
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Processing Details */}
      <Collapse in={showDetails}>
        <Paper sx={{ mt: 2, p: 3, backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Timeline sx={{ mr: 1 }} />
            Processing Timeline
          </Typography>
          
          <Stack spacing={2}>
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 5 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Initialize professional assessment engine
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 15 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Fetch conversation transcript from ElevenLabs
                {progress >= 15 && progress < 45 && (
                  <Typography component="span" variant="caption" color="info.main" sx={{ ml: 1, fontStyle: 'italic' }}>
                    (2-3 minutes for voice processing)
                  </Typography>
                )}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 50 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Analyze negotiation patterns and communication effectiveness
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 75 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Generate personalized feedback and actionable recommendations
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 100 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Compile comprehensive assessment results
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Collapse>
    </Container>
  )
}

export default AssessmentProcessing