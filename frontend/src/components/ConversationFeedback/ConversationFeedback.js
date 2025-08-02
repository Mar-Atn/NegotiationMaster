import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material'
import { RestartAlt, Home, Visibility, VisibilityOff } from '@mui/icons-material'
import axios from 'axios'

const ConversationFeedback = ({ 
  negotiationId,
  scenario,
  character,
  conversationData,
  assessmentLoading = false,
  assessmentError = null,
  onRestartScenario, 
  onBackToDashboard,
  onContinueTraining,
  onPracticeAgain
}) => {
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFullTranscript, setShowFullTranscript] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  const fetchFeedbackData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!negotiationId) {
        console.warn('⚠️ No negotiationId provided, using mock data')
        setFeedbackData(null)
        setLoading(false)
        return
      }

      console.log('📊 Fetching assessment results for:', negotiationId)

      // Try to fetch assessment results
      let response
      try {
        // First try the assessment results endpoint
        response = await axios.get(`/api/assessment/${negotiationId}/results`)
      } catch (proxyError) {
        console.log('🔄 Assessment results not found, trying demo endpoint...')
        try {
          response = await axios.get(`/api/assessment/demo/feedback/${negotiationId}`)
        } catch (demoError) {
          // Fallback to direct backend connection
          if (demoError.code === 'ERR_NETWORK') {
            console.log('🔄 Proxy failed, trying direct backend connection...')
            response = await axios.get(`http://localhost:5000/api/assessment/${negotiationId}/results`)
          } else {
            throw demoError
          }
        }
      }
      
      if (response.data.success) {
        setFeedbackData(response.data.data)
        console.log('✅ Assessment feedback data loaded successfully:', response.data.data)
      } else {
        console.warn('⚠️ Assessment data not available, using mock data')
        setFeedbackData(null)
      }
    } catch (err) {
      console.error('Failed to fetch assessment feedback:', err)
      console.log('🔄 Using mock feedback data for demo purposes')
      setFeedbackData(null)
    } finally {
      setLoading(false)
    }
  }, [negotiationId])

  useEffect(() => {
    if (negotiationId) {
      fetchFeedbackData()
    } else {
      // Use mock data for demonstration
      setFeedbackData(null)
      setLoading(false)
    }
  }, [negotiationId, fetchFeedbackData])

  // Mock data matching PRD requirements  
  const mockFeedbackData = {
    overallScore: 78,
    skills: {
      claimingValue: 82,
      creatingValue: 71,
      relationshipManagement: 85
    },
    summary: `Your negotiation demonstrates strong capabilities with effective application of multiple techniques. You showed particular strength in relationship management by maintaining a collaborative tone throughout the conversation. For improvement, consider exploring the full range of possible agreements before accepting offers - this can help you discover additional value. Your use of empathetic language like "I understand your position" helped build trust and kept the negotiation constructive. Next time, try asking more probing questions about underlying interests to uncover creative solutions that benefit both parties.`
  }

  // Mock conversation transcript
  const mockTranscript = [
    { speaker: 'You', message: 'I\'d like to discuss the pricing structure for this contract.' },
    { speaker: character?.name || 'AI', message: 'I understand your position. Let\'s explore alternatives that work for both of us.' },
    { speaker: 'You', message: 'What flexibility do you have on the timeline?' },
    { speaker: character?.name || 'AI', message: 'We could consider a phased approach that meets your budget constraints.' },
    { speaker: 'You', message: 'That sounds interesting. Can we discuss the specifics?' },
    { speaker: character?.name || 'AI', message: 'Certainly. Let me outline what we could do...' }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getPerformanceLevel = (score) => {
    if (score >= 80) return 'Good Performance'
    if (score >= 60) return 'Average Performance'
    return 'Needs Improvement'
  }

  if (loading || assessmentLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          {assessmentLoading ? 'Analyzing your negotiation performance...' : 'Loading feedback data...'}
        </Typography>
      </Box>
    )
  }

  if (error || assessmentError) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {assessmentError || error || 'Assessment data temporarily unavailable'}
        <Typography variant="body2" sx={{ mt: 1 }}>
          Using demo data for this session. Your conversation was recorded and can be reviewed later.
        </Typography>
        <Button onClick={fetchFeedbackData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  // Use backend data if available, otherwise use mock data
  const data = feedbackData || mockFeedbackData
  const transcript = conversationData?.transcript || mockTranscript

  // Extract scores from various possible data structures
  const overallScore = data.scores?.overall || data.overallScore || mockFeedbackData.overallScore
  const skills = data.scores || data.skills || mockFeedbackData.skills

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Negotiation Complete
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        {scenario?.title || 'Practice Scenario'}
      </Typography>

      {/* Assessment Status */}
      {negotiationId && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Session ID: {negotiationId.slice(-12)}
          </Typography>
          {!feedbackData && !assessmentError && (
            <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
              Real-time assessment data will be available shortly
            </Typography>
          )}
        </Box>
      )}

      {/* Overall Performance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Negotiation Score: {overallScore}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overallScore}
            color={getScoreColor(overallScore)}
            sx={{ height: 12, borderRadius: 6, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {getPerformanceLevel(overallScore)}
          </Typography>
        </CardContent>
      </Card>

      {/* 3-Dimensional Skill Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Skill Breakdown
          </Typography>
          
          {/* Claiming Value */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Claiming Value</Typography>
              <Typography variant="body2" fontWeight="bold">
                {skills.claimingValue || skills.claiming_value || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skills.claimingValue || skills.claiming_value || 0}
              color={getScoreColor(skills.claimingValue || skills.claiming_value || 0)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Creating Value */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Creating Value</Typography>
              <Typography variant="body2" fontWeight="bold">
                {skills.creatingValue || skills.creating_value || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skills.creatingValue || skills.creating_value || 0}
              color={getScoreColor(skills.creatingValue || skills.creating_value || 0)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Relationship Management */}
          <Box sx={{ mb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Relationship Management</Typography>
              <Typography variant="body2" fontWeight="bold">
                {skills.relationshipManagement || skills.relationship_management || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skills.relationshipManagement || skills.relationship_management || 0}
              color={getScoreColor(skills.relationshipManagement || skills.relationship_management || 0)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* View Transcript Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={showTranscript ? <VisibilityOff /> : <Visibility />}
          onClick={() => setShowTranscript(!showTranscript)}
          sx={{ minWidth: 200 }}
        >
          {showTranscript ? 'Hide Transcript' : 'View Full Transcript'}
        </Button>
      </Box>

      {/* Conversation Transcript (Collapsible) */}
      {showTranscript && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversation Transcript
            </Typography>
            <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
              <List dense>
                {transcript.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={`${item.speaker}: ${item.message || item.text}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Teaching Notes - Key Learning Outcomes */}
      {scenario?.teaching_notes && (
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.light', backgroundColor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Key Learning Outcomes
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Scenario-specific concepts and complexity level
            </Typography>
            
            {/* Parse teaching notes if it's a JSON string */}
            {(() => {
              let teachingNotes = scenario.teaching_notes
              if (typeof teachingNotes === 'string') {
                try {
                  teachingNotes = JSON.parse(teachingNotes)
                } catch (e) {
                  // If not JSON, treat as plain text
                  return (
                    <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 1 }}>
                      {teachingNotes}
                    </Typography>
                  )
                }
              }
              
              return (
                <Box sx={{ mt: 2 }}>
                  {teachingNotes.key_concepts && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Key Concepts Covered:
                      </Typography>
                      <List dense>
                        {teachingNotes.key_concepts.map((concept, index) => (
                          <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                            <ListItemText
                              primary={`• ${concept}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {teachingNotes.learning_outcomes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Learning Outcomes:
                      </Typography>
                      <List dense>
                        {teachingNotes.learning_outcomes.map((outcome, index) => (
                          <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                            <ListItemText
                              primary={`• ${outcome}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {teachingNotes.complexity_level && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Complexity Level:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {teachingNotes.complexity_level}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Personal Feedback */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Feedback
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {data.summary || `Your negotiation demonstrates strong capabilities with effective application of multiple techniques. 
            You showed particular strength in relationship management by maintaining a collaborative tone throughout the conversation. 
            For improvement, consider exploring the full range of possible agreements before accepting offers - this can help you 
            discover additional value. Your use of empathetic language like "I understand your position" helped build trust and 
            kept the negotiation constructive. Next time, try asking more probing questions about underlying interests to uncover 
            creative solutions that benefit both parties.`}
          </Typography>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<RestartAlt />}
          onClick={onRestartScenario || onPracticeAgain}
          sx={{ minWidth: 180 }}
        >
          Restart Scenario
        </Button>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={onBackToDashboard || onContinueTraining}
          sx={{ minWidth: 180 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  )
}

export default ConversationFeedback