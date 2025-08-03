import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Fade
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
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

  // Navigation guard for assessment phase
  useEffect(() => {
    if (currentPhase === 'assessment') {
      const handleBeforeUnload = (event) => {
        const message = 'Your assessment is still processing. Are you sure you want to leave?'
        event.returnValue = message
        return message
      }
      
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [currentPhase])

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
      console.log('🏁 Conversation ended, checking for automatic assessment trigger...', conversationResults)
      setConversationData(conversationResults)
      
      // Check if conversation should trigger automatic assessment
      if (conversationResults.shouldTriggerAssessment) {
        console.log('🎯 Triggering automatic assessment flow')
        setCurrentPhase('assessment')
      } else {
        console.log('⚠️ Skipping assessment - conversation too short or errored')
        setCurrentPhase('feedback')
      }
    } catch (error) {
      console.error('❌ Error processing conversation end:', error)
      setAssessmentError(error.message)
      // Still proceed to feedback, which will handle the error gracefully
      setCurrentPhase('feedback')
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
    // Check if assessment is in progress
    if (currentPhase === 'assessment') {
      console.warn('⚠️ User trying to navigate away during assessment')
      // Could add confirmation dialog here if needed
    }
    navigate('/dashboard')
  }

  const handleRestartScenario = () => {
    // Generate new negotiation ID for restart
    const newNegotiationId = `neg-${scenarioId}-${user?.id || 'anon'}-${Date.now()}`
    setNegotiationId(newNegotiationId)
    console.log('🔄 Restarting scenario with new negotiation ID:', newNegotiationId)
    
    // Reset all state
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

  // Assessment phase handlers
  const handleAssessmentComplete = (assessmentResult) => {
    console.log('✅ Assessment completed successfully:', assessmentResult)
    setAssessmentData(assessmentResult)
    setAssessmentLoading(false)
    setAssessmentError(null)
    setCurrentPhase('feedback')
  }

  const handleAssessmentRetry = () => {
    console.log('🔄 Retrying assessment')
    setAssessmentError(null)
    // Assessment component will handle the retry internally
  }

  const handleAssessmentTimeout = () => {
    console.warn('⏰ Assessment timed out')
    setAssessmentError('Assessment is taking longer than expected. You can continue to see your conversation transcript.')
    setCurrentPhase('feedback')
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading negotiation scenario...
        </Typography>
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

      {/* Phase Content */}
      <Fade in={currentPhase === 'context'} mountOnEnter unmountOnExit>
        <Box sx={{ display: currentPhase === 'context' ? 'block' : 'none' }}>
          <CaseContext
            scenario={scenario}
            character={character}
            onStartConversation={handleStartConversation}
          />
        </Box>
      </Fade>

      <Fade in={currentPhase === 'conversation'} mountOnEnter unmountOnExit>
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

      <Fade in={currentPhase === 'assessment'} mountOnEnter unmountOnExit>
        <Box sx={{ display: currentPhase === 'assessment' ? 'block' : 'none' }}>
          <AssessmentProcessing
            negotiationId={conversationData?.negotiationId || negotiationId}
            conversationData={conversationData}
            onAssessmentComplete={handleAssessmentComplete}
            onRetry={handleAssessmentRetry}
            onTimeout={handleAssessmentTimeout}
          />
        </Box>
      </Fade>

      <Fade in={currentPhase === 'feedback'} mountOnEnter unmountOnExit>
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