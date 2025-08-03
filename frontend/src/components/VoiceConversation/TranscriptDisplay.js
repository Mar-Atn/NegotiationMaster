import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent
} from '@mui/material'
import {
  Visibility,
  Person,
  SmartToy,
  AccessTime
} from '@mui/icons-material'
import voiceApiService from '../../services/voiceApiService'

const TranscriptDisplay = ({ conversationId, onClose }) => {
  const [transcript, setTranscript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTranscript = async () => {
    if (!conversationId) {
      setError('No conversation ID provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await voiceApiService.getConversationTranscript(conversationId)
      setTranscript(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch transcript')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString()
  }

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user'
    
    return (
      <Card 
        key={index} 
        sx={{ 
          mb: 2, 
          backgroundColor: isUser ? '#e3f2fd' : '#f5f5f5',
          border: `1px solid ${isUser ? '#2196f3' : '#9e9e9e'}`
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Chip
              icon={isUser ? <Person /> : <SmartToy />}
              label={isUser ? 'You' : 'AI Agent'}
              color={isUser ? 'primary' : 'default'}
              size="small"
              sx={{ minWidth: 80 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {message.message || message.content}
              </Typography>
              {message.timestamp && (
                <Typography variant="caption" color="text.secondary">
                  <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                  {formatTimestamp(message.timestamp)}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Paper sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Conversation Transcript
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={fetchTranscript}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'View Transcript'}
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outlined">
                Close
              </Button>
            )}
          </Stack>
        </Box>

        {conversationId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Conversation ID:</strong> {conversationId}
            </Typography>
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {transcript && (
          <Box>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant="h6">
                Conversation Details
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {transcript.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Messages:</strong> {transcript.metadata?.messageCount || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fetched:</strong> {formatTimestamp(transcript.metadata?.fetchedAt)}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Messages ({transcript.transcript?.length || 0})
            </Typography>

            {transcript.transcript && transcript.transcript.length > 0 ? (
              <Stack spacing={2}>
                {transcript.transcript.map((message, index) => renderMessage(message, index))}
              </Stack>
            ) : (
              <Alert severity="warning">
                No messages found in this conversation.
              </Alert>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  )
}

export default TranscriptDisplay