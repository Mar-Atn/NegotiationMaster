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
  onAssessmentComplete,
  onRetry,
  onTimeout
}) => {
  // Processing states
  const [processingStage, setProcessingStage] = useState('initializing') // initializing, analyzing, generating, completed
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  // Timer for elapsed time display
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Start assessment processing
  const startAssessment = useCallback(async () => {
    console.log('🚀 Starting assessment generation for:', negotiationId)
    
    try {
      // Step 1: Initialize
      setProcessingStage('initializing')
      setProgress(10)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 2: Fetching transcript
      setProcessingStage('analyzing')
      setProgress(30)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Processing conversation
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 4: Generating feedback
      setProcessingStage('generating')
      setProgress(80)
      
      // Generate assessment
      const assessmentResult = await assessmentApi.generateAssessment(
        conversationData.elevenLabsConversationId || negotiationId,
        {
          scenario: conversationData.scenario,
          character: conversationData.character,
          transcript: conversationData.transcript,
          duration: conversationData.duration,
          sessionMetrics: conversationData.sessionMetrics
        }
      )
      
      // Step 5: Complete
      setProcessingStage('completed')
      setProgress(100)
      
      console.log('✅ Assessment generation completed')
      
      // Brief delay to show completion, then pass results
      setTimeout(() => {
        if (onAssessmentComplete && assessmentResult?.data) {
          onAssessmentComplete(assessmentResult.data)
        }
      }, 1000)
      
    } catch (err) {
      console.error('❌ Assessment failed:', err)
      // For now, just log the error - we're removing error handling as requested
    }
  }, [negotiationId, conversationData, onAssessmentComplete])

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

  // Get stage-specific content
  const getStageContent = () => {
    switch (processingStage) {
      case 'initializing':
        return {
          icon: <Assessment sx={{ fontSize: '3rem', color: 'primary.main' }} />,
          title: 'Initializing Assessment',
          description: 'Preparing to analyze your conversation performance...',
          tips: 'Setting up AI analysis engines and processing your conversation data.'
        }
      case 'analyzing':
        return {
          icon: <Psychology sx={{ fontSize: '3rem', color: 'warning.main' }} />,
          title: 'Analyzing Conversation',
          description: 'AI is evaluating your negotiation techniques and strategies...',
          tips: 'This includes analyzing communication patterns, negotiation tactics, and strategic decisions.'
        }
      case 'generating':
        return {
          icon: <Insights sx={{ fontSize: '3rem', color: 'info.main' }} />,
          title: 'Generating Insights',
          description: 'Creating personalized feedback and recommendations...',
          tips: 'Compiling detailed analysis into actionable insights for improvement.'
        }
      case 'completed':
        return {
          icon: <CheckCircle sx={{ fontSize: '3rem', color: 'success.main' }} />,
          title: 'Assessment Complete!',
          description: 'Your personalized feedback is ready.',
          tips: 'Redirecting you to your detailed assessment results...'
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
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {stageContent.description}
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(progress)}% Complete
              </Typography>
            </Box>

            {/* Status Chips */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Chip
                icon={<Timer />}
                label={`Time: ${formatTime(elapsedTime)}`}
                variant="outlined"
                size="small"
              />
              {processingStage === 'completed' && (
                <Chip
                  icon={<CheckCircle />}
                  label="Ready!"
                  color="success"
                  size="small"
                />
              )}
            </Stack>

            {/* Tips and Information */}
            <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                  What's happening?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stageContent.tips}
                </Typography>
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
                  backgroundColor: progress >= 10 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Initialize assessment engine
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 30 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Fetch and process conversation transcript
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 60 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Analyze negotiation patterns and strategies
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: progress >= 80 ? 'success.main' : 'grey.300',
                  mr: 2
                }}
              />
              <Typography variant="body2">
                Generate personalized feedback and scoring
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
                Finalize assessment results
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Collapse>
    </Container>
  )
}

export default AssessmentProcessing