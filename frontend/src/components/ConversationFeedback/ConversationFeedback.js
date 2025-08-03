import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Grid,
  LinearProgress,
  Divider,
  Collapse,
  Paper
} from '@mui/material'
import { 
  RestartAlt, 
  Home, 
  Description, 
  TrendingUp,
  Psychology,
  Star,
  ExpandMore,
  ExpandLess,
  Assessment
} from '@mui/icons-material'

const ConversationFeedback = ({ 
  negotiationId,
  scenario,
  character,
  conversationData,
  assessmentData,
  assessmentLoading,
  assessmentError,
  onRestartScenario, 
  onBackToDashboard
}) => {
  const [transcript, setTranscript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [showTranscripts, setShowTranscripts] = useState(false)

  // Get ElevenLabs conversation ID from conversationData
  const elevenLabsId = conversationData?.elevenLabsConversationId

  const fetchTranscript = async (retryCount = 0) => {
    if (!elevenLabsId) {
      setError('No ElevenLabs conversation ID found')
      return
    }

    setLoading(true)
    setError(null)
    if (retryCount === 0) setRetryAttempt(0)

    try {
      console.log(`🎵 Fetching transcript for conversation ID: ${elevenLabsId} (attempt ${retryCount + 1})`)
      
      const url = `/api/voice/transcript/${elevenLabsId}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        const { status, transcript } = data.data
        console.log(`📊 Conversation status: ${status}, Messages: ${transcript?.length || 0}`)
        
        // If still processing, retry after delay - ElevenLabs can take 2-3 minutes for longer conversations
        if (status === 'processing' && transcript.length === 0 && retryCount < 40) {
          const waitTime = retryCount < 10 ? 5000 : 10000  // 5s for first 10 tries, then 10s
          const totalWaitTime = Math.round((retryCount * 5 + (retryCount > 10 ? (retryCount - 10) * 5 : 0)) / 60 * 10) / 10
          console.log(`⏳ Conversation still processing, retrying in ${waitTime/1000}s... (${retryCount + 1}/40, ${totalWaitTime}min elapsed)`)
          setRetryAttempt(retryCount + 1)
          setTimeout(() => {
            fetchTranscript(retryCount + 1)
          }, waitTime)
          return
        }
        
        // If done or has messages, display the transcript
        if (status === 'done' || transcript.length > 0) {
          setTranscript(data.data)
          setLoading(false)
          console.log('✅ Transcript loaded successfully:', {
            status,
            messageCount: transcript.length
          })
        } else {
          // Max retries reached or other status
          setError(`Conversation status: ${status}. Transcript may not be ready yet.`)
          setLoading(false)
        }
      } else {
        console.error('❌ API returned error:', data.error)
        setError(data.error || 'Failed to fetch transcript')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Network/fetch error:', err)
      setError('Network error: ' + err.message)
      setLoading(false)
    }
  }

  // Auto-fetch transcript when conversation ends
  useEffect(() => {
    console.log('🔄 ConversationFeedback useEffect triggered:', {
      elevenLabsId,
      conversationData,
      hasElevenLabsId: !!elevenLabsId
    })
    
    if (elevenLabsId) {
      console.log('🎯 ConversationFeedback received ElevenLabs ID:', elevenLabsId)
      // Immediately show loading state to inform user
      setLoading(true)
      setError(null)
      setRetryAttempt(0)
      // Small delay to ensure UI updates, then start fetching
      setTimeout(() => {
        fetchTranscript()
      }, 100)
    } else {
      console.warn('⚠️ No ElevenLabs ID provided to ConversationFeedback')
    }
  }, [elevenLabsId])

  // Assessment display components
  const renderScoreCard = (title, score, color, icon) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ color, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color, mb: 1 }}>
          {score}/100
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={score} 
          sx={{ 
            mt: 2, 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: color
            }
          }} 
        />
      </CardContent>
    </Card>
  )

  const renderFeedbackSection = (title, content, examples = []) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: examples.length > 0 ? 2 : 0, lineHeight: 1.6 }}>
          {typeof content === 'string' ? content : content?.content || ''}
        </Typography>
        {examples.length > 0 && (
          <Stack spacing={1}>
            {examples.slice(0, 2).map((example, index) => (
              <Paper key={index} sx={{ p: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, color: 'text.secondary' }}>
                  "{example.quote}"
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {example.concept || example.issue || example.technique}: {example.impact || example.suggestion}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎯 Negotiation Assessment Complete
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Scenario: {scenario?.title || 'Unknown'} • Character: {character?.name || 'Unknown'}
            </Typography>
            {elevenLabsId && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                Conversation ID: {elevenLabsId}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Assessment Results - Primary Content */}
        {assessmentData && (
          <>
            {/* Performance Scores */}
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment color="primary" />
                  Your Negotiation Performance
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    {renderScoreCard(
                      'Overall Score', 
                      Math.round(assessmentData.scores?.overall || 70), 
                      '#4caf50',
                      <Star sx={{ fontSize: '2rem' }} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {renderScoreCard(
                      'Claiming Value', 
                      Math.round(assessmentData.scores?.claimingValue || 70), 
                      '#2196f3',
                      <TrendingUp sx={{ fontSize: '2rem' }} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {renderScoreCard(
                      'Creating Value', 
                      Math.round(assessmentData.scores?.creatingValue || 70), 
                      '#ff9800',
                      <Psychology sx={{ fontSize: '2rem' }} />
                    )}
                  </Grid>
                </Grid>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {renderScoreCard(
                      'Relationship Mgmt', 
                      Math.round(assessmentData.scores?.relationshipManagement || 70), 
                      '#9c27b0',
                      <Psychology sx={{ fontSize: '2rem' }} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' }}>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                          Performance Percentile
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                          {assessmentData.percentile || 50}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Better than {assessmentData.percentile || 50}% of users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Professional Feedback Sections */}
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  📋 Professional Assessment Feedback
                </Typography>
                
                {/* Executive Summary */}
                {assessmentData.executiveSummary && (
                  <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        💼 Executive Summary
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {assessmentData.executiveSummary}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* What Was Done Well */}
                {assessmentData.whatWasDoneWell && renderFeedbackSection(
                  '✅ What Was Done Well',
                  assessmentData.whatWasDoneWell,
                  assessmentData.whatWasDoneWell?.examples || []
                )}

                {/* Areas for Improvement */}
                {assessmentData.areasForImprovement && renderFeedbackSection(
                  '🎯 Areas for Improvement',
                  assessmentData.areasForImprovement,
                  assessmentData.areasForImprovement?.examples || []
                )}

                {/* Next Steps */}
                {assessmentData.nextStepsFocusAreas && (
                  <Card sx={{ backgroundColor: 'info.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        🚀 Next Steps & Focus Areas
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {assessmentData.nextStepsFocusAreas}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Show Assessment Loading State */}
        {!assessmentData && assessmentLoading && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Generating Your Assessment...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a moment while we analyze your performance
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Show Assessment Error */}
        {!assessmentData && assessmentError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Assessment processing encountered an issue: {assessmentError}
            <br />You can still view your conversation transcript below.
          </Alert>
        )}

        {/* Transcript Section - Hidden Behind Button */}
        <Card>
          <CardContent>
            <Button
              variant="outlined"
              onClick={() => setShowTranscripts(!showTranscripts)}
              startIcon={<Description />}
              endIcon={showTranscripts ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 2 }}
            >
              {showTranscripts ? 'Hide' : 'Show'} Conversation Transcript
              {!loading && transcript && (
                <Chip 
                  label={`${transcript.transcript?.length || 0} messages`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>

            <Collapse in={showTranscripts}>
              <Box>
                {elevenLabsId && !transcript && !loading && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Your conversation transcript is being processed by ElevenLabs. This may take a few moments.
                  </Alert>
                )}

            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2, textAlign: 'center' }}>
                  {transcript?.status === 'processing' 
                    ? (
                      <>
                        🔄 ElevenLabs is processing your conversation...<br />
                        <small>This can take 2-3 minutes for longer conversations.</small>
                        {retryAttempt > 0 && (
                          <><br /><small>Checking progress... (attempt {retryAttempt}/40)</small></>
                        )}
                      </>
                    )
                    : (
                      <>
                        📝 Preparing your conversation transcript...<br />
                        <small>Please wait while we fetch your conversation from ElevenLabs.</small>
                      </>
                    )
                  }
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                <Button onClick={fetchTranscript} sx={{ ml: 2 }}>
                  Retry
                </Button>
              </Alert>
            )}

            {transcript && transcript.transcript && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {transcript.transcript.map((message, index) => (
                  <Card 
                    key={index}
                    sx={{ 
                      backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                      border: `1px solid ${message.role === 'user' ? '#2196f3' : '#9e9e9e'}`
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {message.role === 'user' ? 'You' : character?.name || 'AI Agent'}
                      </Typography>
                      <Typography variant="body1">
                        {message.message}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

                {!elevenLabsId && (
                  <Alert severity="warning">
                    No ElevenLabs conversation ID available for transcript retrieval.
                  </Alert>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={onRestartScenario}
          >
            Practice Again
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={onBackToDashboard}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

export default ConversationFeedback