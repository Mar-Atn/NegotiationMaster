import React, { useState } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Stack,
  Alert
} from '@mui/material'
import { Description } from '@mui/icons-material'
import TranscriptDisplay from '../components/VoiceConversation/TranscriptDisplay'

const TranscriptTest = () => {
  const [conversationId, setConversationId] = useState('conv_6401k1phxhyzfz2va165272pmakz')
  const [showTranscript, setShowTranscript] = useState(false)

  const handleShowTranscript = () => {
    if (conversationId.trim()) {
      setShowTranscript(true)
    }
  }

  const handleCloseTranscript = () => {
    setShowTranscript(false)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Transcript Display Test
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Test the ElevenLabs conversation transcript display
          </Typography>
        </Box>

        {!showTranscript ? (
          <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description />
                Enter Conversation ID
              </Typography>
              
              <Alert severity="info">
                Enter an ElevenLabs conversation ID to fetch and display the transcript.
              </Alert>

              <TextField
                label="Conversation ID"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                fullWidth
                placeholder="conv_..."
                helperText="Example: conv_6401k1phxhyzfz2va165272pmakz"
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleShowTranscript}
                disabled={!conversationId.trim()}
                startIcon={<Description />}
              >
                View Transcript
              </Button>
            </Stack>
          </Paper>
        ) : (
          <TranscriptDisplay 
            conversationId={conversationId}
            onClose={handleCloseTranscript}
          />
        )}
      </Stack>
    </Container>
  )
}

export default TranscriptTest