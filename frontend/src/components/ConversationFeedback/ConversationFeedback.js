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
  Chip
} from '@mui/material'
import { RestartAlt, Home, Description } from '@mui/icons-material'

const ConversationFeedback = ({ 
  negotiationId,
  scenario,
  character,
  conversationData,
  onRestartScenario, 
  onBackToDashboard
}) => {
  const [transcript, setTranscript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryAttempt, setRetryAttempt] = useState(0)

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

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Conversation Complete
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Scenario: {scenario?.title || 'Unknown'} • Character: {character?.name || 'Unknown'}
            </Typography>
            {elevenLabsId && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Conversation ID: {elevenLabsId}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Transcript Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Description />
              <Typography variant="h5">Conversation Transcript</Typography>
              {!loading && transcript && (
                <Chip 
                  label={`${transcript.transcript?.length || 0} messages`} 
                  color="primary" 
                  size="small" 
                />
              )}
            </Box>

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