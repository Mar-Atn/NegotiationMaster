import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  ArrowBack,
  Settings,
  Help,
  Pause
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/apiService'
import ChatInterface from '../components/NegotiationChat/ChatInterface'
import NegotiationProgress from '../components/NegotiationChat/NegotiationProgress'
import AICharacter from '../components/NegotiationChat/AICharacter'

const NegotiationChat = () => {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [scenario, setScenario] = useState(null)
  const [negotiation, setNegotiation] = useState(null)
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeNegotiation = async () => {
      try {
        setLoading(true)
        
        console.log('🚀 Initializing negotiation for scenario:', scenarioId)
        
        // Fetch scenario details
        const scenarioResponse = await apiClient.get(`/scenarios/${scenarioId}`)
        const scenarioData = scenarioResponse.data.data || scenarioResponse.data
        setScenario(scenarioData)
        console.log('📋 Scenario loaded:', scenarioData)
        
        // Start negotiation session
        const negotiationResponse = await apiClient.post(`/scenarios/${scenarioId}/start`)
        const negotiationData = negotiationResponse.data.data || negotiationResponse.data
        setNegotiation(negotiationData)
        console.log('🎯 Negotiation started:', negotiationData)
        
        // Try to get character ID from negotiation response
        const characterId = negotiationData?.characterId || 
                           negotiationData?.character_id || 
                           negotiationData?.aiCharacterId ||
                           negotiationData?.ai_character_id
        
        console.log('🤖 Looking for character ID:', { negotiationData, characterId })
        
        // First, try to fetch character from dedicated endpoint if we have an ID
        if (characterId && characterId !== 'undefined') {
          try {
            console.log('📞 Fetching character from API:', characterId)
            const characterResponse = await apiClient.get(`/characters/${characterId}`)
            const characterData = characterResponse.data.data || characterResponse.data
            setCharacter(characterData)
            console.log('✅ Character loaded from API:', characterData)
          } catch (characterError) {
            console.warn('⚠️ Failed to fetch character from API, falling back to scenario config:', characterError.message)
            // Fall back to scenario character config
            setCharacterFromScenario(scenarioData)
          }
        } else {
          console.log('⚠️ No character ID found, using scenario character config')
          setCharacterFromScenario(scenarioData)
        }
        
        // Helper function to set character from scenario config
        function setCharacterFromScenario(scenarioData) {
          if (scenarioData?.ai_character_config) {
            const config = scenarioData.ai_character_config
            setCharacter({
              id: 'scenario-character',
              name: config.name,
              role: config.role,
              personality: config.personality,
              background: config.initial_position,
              personalityTraits: [config.negotiation_style],
              goals: [{ 
                description: config.initial_position, 
                priority: 'high' 
              }]
            })
            console.log('✅ Character created from scenario config:', config.name)
          } else {
            console.error('❌ No character data available in scenario')
          }
        }
        
      } catch (err) {
        console.error('❌ Failed to initialize negotiation:', err)
        setError(err.response?.data?.error || 'Failed to start negotiation')
      } finally {
        setLoading(false)
      }
    }

    if (scenarioId) {
      initializeNegotiation()
    }
  }, [scenarioId])

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={handleBackToDashboard}>
          <ArrowBack />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card sx={{ mb: 2, flexShrink: 0 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Back to Dashboard">
                <IconButton onClick={handleBackToDashboard}>
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Typography variant="h5" component="h1">
                {scenario?.title}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Pause Negotiation">
                <span>
                  <IconButton disabled>
                    <Pause />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Settings">
                <span>
                  <IconButton disabled>
                    <Settings />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Help">
                <span>
                  <IconButton disabled>
                    <Help />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - AI Character */}
        <Grid item xs={12} md={3}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {character && (
              <AICharacter 
                character={character}
                scenario={scenario}
              />
            )}
          </Box>
        </Grid>

        {/* Center - Chat Interface */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {negotiation && (
              <ChatInterface 
                negotiation={negotiation}
                scenario={scenario}
                character={character}
                onNegotiationUpdate={setNegotiation}
              />
            )}
          </Box>
        </Grid>

        {/* Right Sidebar - Progress Tracking */}
        <Grid item xs={12} md={3}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {negotiation && (
              <NegotiationProgress 
                negotiation={negotiation}
                scenario={scenario}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default NegotiationChat