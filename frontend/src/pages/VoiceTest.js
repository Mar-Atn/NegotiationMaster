import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import VoiceConversation from '../components/VoiceConversation/VoiceConversation'

// Temporary test page for voice functionality without authentication
function VoiceTest() {
  // Mock character data for Sarah Chen
  const mockCharacter = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Sarah Chen',
    description: 'Experienced used car dealer',
    role: 'seller',
    voice_id: '9BWtsMINqrJLrRacOk9x'
  }

  // Mock scenario data
  const mockScenario = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Used Car Purchase Negotiation',
    description: 'Negotiate the purchase of a used vehicle'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          🎤 Voice Conversation Test
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Testing voice conversation with Sarah Chen (Car Dealer)
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          This is a temporary test page to verify voice functionality. 
          Say "Hi Sarah, I'm interested in buying a car" to start the conversation.
        </Typography>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <VoiceConversation 
          character={mockCharacter}
          scenario={mockScenario}
        />
      </Box>
    </Container>
  )
}

export default VoiceTest