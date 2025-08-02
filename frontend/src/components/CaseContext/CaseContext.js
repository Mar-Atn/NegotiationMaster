import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
  Chip,
  Grid,
  Paper,
  Stack
} from '@mui/material'
import {
  Phone,
  PlayArrow,
  Person,
  Visibility,
  VisibilityOff,
  School
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const CaseContext = ({ scenario, character, onStartConversation }) => {
  const [showConfidential, setShowConfidential] = useState(false)

  if (!scenario || !character) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Loading case context...
        </Typography>
      </Container>
    )
  }

  // Extract general and confidential instructions for the human participant
  const generalInstructions = {
    situation: scenario.scenario_context?.situation || scenario.description,
    background: scenario.scenario_context?.background || 'Context information will be provided.',
    stakes: scenario.scenario_context?.stakes || 'This negotiation involves significant interests for both parties.',
    timeframe: '15-30 minutes',
    objective: 'Practice negotiation skills in a realistic business scenario'
  }

  // Use role1_instructions for human participant's confidential briefing
  const confidentialInstructions = (() => {
    if (scenario.role1_instructions) {
      // Parse role1_instructions if it's a JSON string
      let role1Data = scenario.role1_instructions
      if (typeof role1Data === 'string') {
        try {
          role1Data = JSON.parse(role1Data)
        } catch (e) {
          // If not JSON, treat as plain text
          return {
            yourRole: 'Negotiation participant',
            constraints: [],
            interests: ['Review the scenario instructions'],
            batna: role1Data,
            confidentialInfo: 'Follow your confidential instructions'
          }
        }
      }
      
      return {
        yourRole: role1Data.role || role1Data.your_role || 'Negotiation participant',
        constraints: role1Data.constraints || [],
        interests: role1Data.interests || role1Data.primary_interests || ['Achieve favorable terms'],
        batna: role1Data.batna || role1Data.alternatives || 'You have alternative options if this negotiation fails',
        confidentialInfo: role1Data.confidential_info || role1Data.additional_context || 'Additional context that only you know'
      }
    }
    
    // Fallback to original scenario context if role1_instructions not available
    return {
      yourRole: scenario.scenario_context?.your_role || 'Negotiation participant',
      constraints: scenario.scenario_context?.constraints || [],
      interests: scenario.scenario_context?.interests?.primary || ['Achieve favorable terms', 'Maintain relationship'],
      batna: 'You have alternative options if this negotiation fails',
      confidentialInfo: 'Additional context that only you know will be revealed during the conversation'
    }
  })()

  const aiOpponent = {
    name: character.name,
    role: character.role,
    description: character.description,
    style: character.personality_profile?.negotiation_style || 'Professional',
    background: `${character.name} brings years of experience in ${character.role.replace('_', ' ')} negotiations.`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 300, 
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            {scenario.title}
          </Typography>
          <Chip 
            label={`Level ${scenario.difficulty_level || 1} • ${generalInstructions.timeframe}`}
            sx={{ 
              backgroundColor: 'primary.50',
              color: 'primary.700',
              fontWeight: 500
            }}
          />
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Left Column - Instructions */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* General Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  backgroundColor: 'background.paper'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      General Instructions
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                      (Available to both parties)
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        SITUATION
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {generalInstructions.situation}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        BACKGROUND
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {generalInstructions.background}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        OBJECTIVE
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {generalInstructions.objective}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Confidential Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  border: '2px solid',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  backgroundColor: 'rgba(233, 84, 32, 0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {showConfidential ? <Visibility sx={{ mr: 1 }} /> : <VisibilityOff sx={{ mr: 1 }} />}
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Your Confidential Instructions
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowConfidential(!showConfidential)}
                      sx={{ ml: 'auto', textTransform: 'none' }}
                    >
                      {showConfidential ? 'Hide' : 'Show'}
                    </Button>
                  </Box>
                  
                  {showConfidential && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            YOUR ROLE
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {confidentialInstructions.yourRole}
                          </Typography>
                        </Box>
                        
                        {confidentialInstructions.constraints.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              CONSTRAINTS
                            </Typography>
                            <Stack spacing={0.5}>
                              {confidentialInstructions.constraints.map((constraint, index) => (
                                <Typography 
                                  key={index} 
                                  variant="body2" 
                                  sx={{ lineHeight: 1.6, pl: 1 }}
                                >
                                  • {constraint}
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                        )}
                        
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            YOUR INTERESTS
                          </Typography>
                          <Stack spacing={0.5}>
                            {confidentialInstructions.interests.map((interest, index) => (
                              <Typography 
                                key={index} 
                                variant="body2" 
                                sx={{ lineHeight: 1.6, pl: 1 }}
                              >
                                • {interest}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Grid>

        {/* Right Column - AI Opponent */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card 
              elevation={0}
              sx={{ 
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                height: 'fit-content',
                position: 'sticky',
                top: 24,
                backgroundColor: 'background.paper'
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                {/* AI Avatar */}
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '2rem'
                  }}
                >
                  <Person />
                </Avatar>
                
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                  {aiOpponent.name}
                </Typography>
                
                <Chip
                  label={aiOpponent.style}
                  size="small"
                  sx={{ mb: 2, textTransform: 'capitalize' }}
                />
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ lineHeight: 1.6, mb: 3 }}
                >
                  {aiOpponent.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Start Conversation Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Phone />}
                  onClick={onStartConversation}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  Start Conversation
                </Button>
                
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', mt: 1 }}
                >
                  Voice-powered by ElevenLabs
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CaseContext