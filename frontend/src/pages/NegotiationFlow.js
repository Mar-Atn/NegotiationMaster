import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Fade,
  Snackbar,
  Chip,
  LinearProgress
} from '@mui/material'
import { ArrowBack, CheckCircle, Info } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/apiService'
import CaseContext from '../components/CaseContext/CaseContext'
import VoiceConversation from '../components/VoiceConversation/VoiceConversation'
import ConversationFeedback from '../components/ConversationFeedback/ConversationFeedback'
import AssessmentProcessing from '../components/AssessmentProcessing/AssessmentProcessing'

const NegotiationFlow = () => {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [currentPhase, setCurrentPhase] = useState('context') // 'context', 'conversation', 'assessment', 'feedback'
  const [scenario, setScenario] = useState(null)
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversationData, setConversationData] = useState(null)
  const [negotiationId, setNegotiationId] = useState(null)
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [assessmentError, setAssessmentError] = useState(null)
  const [assessmentData, setAssessmentData] = useState(null)
  const [showProgressRecovery, setShowProgressRecovery] = useState(false)
  const [recoveredProgress, setRecoveredProgress] = useState(null)

  // Enhanced navigation guard for assessment and conversation phases
  useEffect(() => {
    let handleBeforeUnload = null
    
    if (currentPhase === 'assessment') {
      handleBeforeUnload = (event) => {
        const message = 'Your assessment is still processing. Leaving now will lose your progress. Are you sure?'
        event.returnValue = message
        return message
      }
    } else if (currentPhase === 'conversation' && conversationData) {
      handleBeforeUnload = (event) => {
        const message = 'Your conversation is in progress. Leaving now will end the session. Are you sure?'
        event.returnValue = message
        return message
      }
    }
    
    if (handleBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [currentPhase, conversationData])

  // Progress persistence - save state to sessionStorage
  useEffect(() => {
    if (negotiationId && currentPhase !== 'context') {
      const progressData = {
        negotiationId,
        currentPhase,
        timestamp: Date.now(),
        conversationData: conversationData ? {
          duration: conversationData.duration,
          elevenLabsConversationId: conversationData.elevenLabsConversationId,
          shouldTriggerAssessment: conversationData.shouldTriggerAssessment
        } : null,
        assessmentData: assessmentData ? { scores: assessmentData.scores } : null
      }
      
      sessionStorage.setItem(`negotiation_progress_${scenarioId}`, JSON.stringify(progressData))
      console.log('💾 Progress saved to session storage:', progressData)
    }
  }, [currentPhase, conversationData, assessmentData, negotiationId, scenarioId])

  // Restore progress on component mount
  useEffect(() => {
    const restoreProgress = () => {
      try {
        const savedProgress = sessionStorage.getItem(`negotiation_progress_${scenarioId}`)
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress)
          const ageMinutes = (Date.now() - progressData.timestamp) / (1000 * 60)
          
          // Only restore if less than 30 minutes old
          if (ageMinutes < 30) {
            console.log('🔄 Restoring previous session progress:', progressData)
            
            // Show recovery notification
            setRecoveredProgress(progressData)
            setShowProgressRecovery(true)
            
            if (progressData.conversationData) {
              setConversationData(progressData.conversationData)
            }
            if (progressData.assessmentData) {
              setAssessmentData(progressData.assessmentData)
            }
            
            // Only restore to assessment or feedback phases
            if (progressData.currentPhase === 'assessment' || progressData.currentPhase === 'feedback') {
              setCurrentPhase(progressData.currentPhase)
            }
            
            // Auto-hide recovery notification after 5 seconds
            setTimeout(() => {
              setShowProgressRecovery(false)
            }, 5000)
          } else {
            // Clean up old progress
            sessionStorage.removeItem(`negotiation_progress_${scenarioId}`)
          }
        }
      } catch (error) {
        console.warn('Failed to restore progress:', error)
        sessionStorage.removeItem(`negotiation_progress_${scenarioId}`)
      }
    }
    
    if (scenarioId && !loading) {
      restoreProgress()
    }
  }, [scenarioId, loading])

  useEffect(() => {
    const loadScenarioData = async () => {
      try {
        setLoading(true)
        
        // Generate unique negotiation ID for this session
        const newNegotiationId = `neg-${scenarioId}-${user?.id || 'anon'}-${Date.now()}`
        setNegotiationId(newNegotiationId)
        console.log('🎯 Generated negotiation ID:', newNegotiationId)
        
        // Fetch scenario details
        const scenarioResponse = await apiClient.get(`/scenarios/${scenarioId}`)
        const scenarioData = scenarioResponse.data.data || scenarioResponse.data
        setScenario(scenarioData)
        
        // Find the appropriate character for this scenario
        const charactersResponse = await apiClient.get('/characters')
        const characters = charactersResponse.data.data || charactersResponse.data
        
        // Match character based on scenario's AI character config
        const matchedCharacter = characters.find(char => 
          char.name === scenarioData.ai_character_config?.name ||
          char.role === scenarioData.ai_character_config?.role
        ) || characters[0] // Fallback to first character
        
        setCharacter(matchedCharacter)
        
      } catch (err) {
        console.error('Failed to load scenario data:', err)
        setError('Failed to load negotiation scenario. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (scenarioId) {
      loadScenarioData()
    }
  }, [scenarioId, user?.id])

  const handleStartConversation = () => {
    setCurrentPhase('conversation')
  }

  const handleEndConversation = async (conversationResults) => {
    try {
      console.log('🏁 Conversation ended, initiating seamless assessment transition...', conversationResults)
      setConversationData(conversationResults)
      
      // Always trigger assessment for meaningful conversations
      // The assessment component will handle all edge cases gracefully
      if (conversationResults.shouldTriggerAssessment && conversationResults.duration > 10) {
        console.log('🚀 Initiating seamless transition to assessment processing')
        
        // Brief pause to let conversation UI settle, then seamlessly transition
        setTimeout(() => {
          setCurrentPhase('assessment')
          console.log('✨ Seamless transition to assessment phase completed')
        }, 800)
      } else {
        console.log('⚠️ Skipping assessment - conversation too brief or incomplete')
        setCurrentPhase('feedback')
      }
    } catch (error) {
      console.error('❌ Error processing conversation end:', error)
      setAssessmentError('Assessment transition failed: ' + error.message)
      // Gracefully continue to feedback with error context
      setTimeout(() => {
        setCurrentPhase('feedback')
      }, 1000)
    }
  }

  const triggerAssessmentAnalysis = async (negotiationIdParam, conversationResults) => {
    try {
      const analysisNegotiationId = negotiationIdParam || negotiationId
      console.log('📊 Triggering assessment analysis for:', analysisNegotiationId)
      
      // Call the assessment API to analyze the conversation
      const response = await apiClient.post(`/assessment/${analysisNegotiationId}/analyze`, {
        scenario: scenario,
        character: character,
        transcript: conversationResults.transcript,
        elevenLabsConversationId: conversationResults.elevenLabsConversationId,
        conversationHistory: conversationResults.conversationHistory,
        duration: conversationResults.duration,
        sessionMetrics: conversationResults.sessionMetrics,
        endedAt: conversationResults.endedAt
      })
      
      if (response.data.success) {
        console.log('✅ Assessment analysis initiated successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Assessment analysis failed')
      }
    } catch (error) {
      console.error('❌ Failed to trigger assessment analysis:', error)
      
      // If assessment fails, we'll continue to feedback but log the issue
      // The ConversationFeedback component can handle missing assessment data gracefully
      if (error.response?.status === 404) {
        console.warn('⚠️ Assessment endpoint not found - using mock data for demo')
      } else {
        console.error('Assessment analysis error:', error.response?.data || error.message)
      }
      
      throw error
    }
  }

  const handlePauseConversation = () => {
    // Handle pause logic
    console.log('🔄 Conversation paused')
  }

  const handleResumeConversation = () => {
    // Handle resume logic
    console.log('▶️ Conversation resumed')
  }

  const handleBackToDashboard = () => {
    // Check if assessment is in progress and show confirmation
    if (currentPhase === 'assessment') {
      const confirmLeave = window.confirm(
        'Your assessment is still processing. Leaving now will lose your progress. Are you sure you want to continue?'
      )
      if (!confirmLeave) {
        return // Cancel navigation
      }
      console.warn('⚠️ User confirmed navigation away during assessment')
    }
    
    // Clean up progress data when intentionally leaving
    if (scenarioId) {
      sessionStorage.removeItem(`negotiation_progress_${scenarioId}`)
    }
    
    navigate('/dashboard')
  }

  const handleRestartScenario = () => {
    // Clean up any saved progress
    if (scenarioId) {
      sessionStorage.removeItem(`negotiation_progress_${scenarioId}`)
    }
    
    // Generate new negotiation ID for restart
    const newNegotiationId = `neg-${scenarioId}-${user?.id || 'anon'}-${Date.now()}`
    setNegotiationId(newNegotiationId)
    console.log('🔄 Restarting scenario with fresh state and new negotiation ID:', newNegotiationId)
    
    // Reset all state for clean restart
    setCurrentPhase('context')
    setConversationData(null)
    setAssessmentError(null)
    setAssessmentLoading(false)
    setAssessmentData(null)
  }

  const handleContinueTraining = () => {
    console.log('🎯 Continue Training clicked')
    navigate('/dashboard')
  }

  const handlePracticeAgain = () => {
    console.log('🔄 Practice Again clicked')
    handleRestartScenario()
  }

  // Assessment phase handlers with seamless transitions
  const handleAssessmentComplete = (assessmentResult) => {
    console.log('✅ Assessment completed successfully:', assessmentResult)
    setAssessmentData(assessmentResult)
    setAssessmentLoading(false)
    setAssessmentError(null)
    
    // Seamless transition to feedback with results
    console.log('🎯 Initiating seamless transition to feedback phase')
    setTimeout(() => {
      setCurrentPhase('feedback')
      console.log('✨ Seamless transition to feedback phase completed')
    }, 600)
  }

  const handleAssessmentRetry = () => {
    console.log('🔄 Retrying assessment')
    setAssessmentError(null)
    // Assessment component will handle the retry internally
  }

  const handleAssessmentTimeout = () => {
    console.warn('⏰ Assessment processing taking longer than expected')
    setAssessmentError('Assessment is taking longer than expected. We\'ll continue processing in the background while you review your conversation.')
    
    // Graceful transition to feedback even on timeout
    setTimeout(() => {
      setCurrentPhase('feedback')
      console.log('⏰ Graceful timeout transition to feedback completed')
    }, 800)
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 4,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 400 }}>
            Preparing Your Negotiation
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
            Setting up the scenario, AI character, and conversation environment for your training session
          </Typography>
          
          {/* Progress indicators */}
          <Box sx={{ mt: 4, width: '100%', maxWidth: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {showProgressRecovery ? 'Restoring progress...' : 'Loading scenario details'}
              </Typography>
              <Typography variant="caption" color="primary.main">60%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={60} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton onClick={handleBackToDashboard} size="small">
              <ArrowBack />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    )
  }

  if (!scenario || !character) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Scenario or character data not found. Please select a valid scenario.
        </Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Progress Recovery Notification */}
      <Snackbar
        open={showProgressRecovery}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: 24 }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            minWidth: 300,
            '& .MuiAlert-message': { width: '100%' }
          }}
          icon={<CheckCircle />}
          onClose={() => setShowProgressRecovery(false)}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Welcome back! Progress restored.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {recoveredProgress?.currentPhase === 'assessment' && 'Continuing assessment processing...'}
              {recoveredProgress?.currentPhase === 'feedback' && 'Your results are ready to review.'}
              {recoveredProgress?.currentPhase === 'conversation' && 'Your conversation session was restored.'}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Back Button - Only show in context phase */}
      {currentPhase === 'context' && (
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}>
          <IconButton 
            onClick={handleBackToDashboard}
            sx={{ 
              backgroundColor: 'background.paper',
              boxShadow: 1,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>
      )}

      {/* Phase Content with Professional Seamless Transitions */}
      <Fade in={currentPhase === 'context'} mountOnEnter unmountOnExit timeout={{ enter: 800, exit: 600 }}>
        <Box sx={{ display: currentPhase === 'context' ? 'block' : 'none' }}>
          <CaseContext
            scenario={scenario}
            character={character}
            onStartConversation={handleStartConversation}
          />
        </Box>
      </Fade>

      <Fade in={currentPhase === 'conversation'} mountOnEnter unmountOnExit timeout={{ enter: 800, exit: 600 }}>
        <Box sx={{ display: currentPhase === 'conversation' ? 'block' : 'none' }}>
          <VoiceConversation
            scenario={scenario}
            character={character}
            negotiationId={negotiationId}
            onEndConversation={handleEndConversation}
            onPause={handlePauseConversation}
            onResume={handleResumeConversation}
          />
        </Box>
      </Fade>

      <Fade in={currentPhase === 'assessment'} mountOnEnter unmountOnExit timeout={{ enter: 800, exit: 600 }}>
        <Box sx={{ display: currentPhase === 'assessment' ? 'block' : 'none' }}>
          <AssessmentProcessing
            negotiationId={conversationData?.negotiationId || negotiationId}
            conversationData={conversationData}
            scenario={scenario}
            character={character}
            onAssessmentComplete={handleAssessmentComplete}
            onRetry={handleAssessmentRetry}
            onTimeout={handleAssessmentTimeout}
          />
        </Box>
      </Fade>

      <Fade in={currentPhase === 'feedback'} mountOnEnter unmountOnExit timeout={{ enter: 800, exit: 600 }}>
        <Box sx={{ display: currentPhase === 'feedback' ? 'block' : 'none' }}>
          <ConversationFeedback
            negotiationId={conversationData?.negotiationId || negotiationId}
            scenario={scenario}
            character={character}
            conversationData={conversationData}
            assessmentData={assessmentData}
            assessmentLoading={assessmentLoading}
            assessmentError={assessmentError}
            onBackToDashboard={handleBackToDashboard}
            onRestartScenario={handleRestartScenario}
            onContinueTraining={handleContinueTraining}
            onPracticeAgain={handlePracticeAgain}
          />
        </Box>
      </Fade>
    </Box>
  )
}

export default NegotiationFlow