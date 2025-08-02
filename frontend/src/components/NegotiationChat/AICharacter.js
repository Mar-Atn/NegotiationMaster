import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material'
import {
  SmartToy,
  Psychology,
  TrendingUp,
  People,
  VolumeUp,
  VolumeOff,
  RecordVoiceOver,
  Hearing,
  GraphicEq,
  Settings,
  Mic
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import voiceService from '../../services/voiceService'
import voiceApiService from '../../services/voiceApiService'
import { MiniAudioVisualizer } from './AudioVisualizer'

const AICharacter = ({ character, scenario, isVoiceMode = false }) => {
  const [voiceSynthesisStatus, setVoiceSynthesisStatus] = useState('idle') // idle, processing, speaking
  const [characterVoiceSettings, setCharacterVoiceSettings] = useState(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [voiceActivity, setVoiceActivity] = useState({ isActive: false, volume: 0 })

  useEffect(() => {
    if (!character) return
    
    // Initialize character voice settings from ElevenLabs integration
    const loadVoiceSettings = async () => {
      try {
        await voiceApiService.initialize()
        
        if (character.id && voiceApiService.hasVoiceSupport(character.id)) {
          const voiceConfig = voiceApiService.getCharacterVoiceConfig(character.id)
          if (voiceConfig) {
            setCharacterVoiceSettings({
              hasVoiceSupport: true,
              voiceId: voiceConfig.voiceConfig.voiceId,
              personality: voiceConfig.voiceConfig.personality,
              prosody: voiceConfig.voiceConfig.prosody,
              characterName: voiceConfig.character.name,
              communicationStyle: voiceConfig.character.communicationStyle
            })
            console.log(`🎵 Voice support enabled for ${character.name}:`, voiceConfig.voiceConfig.personality)
          }
        } else {
          // Fallback voice settings
          setCharacterVoiceSettings({
            hasVoiceSupport: false,
            voiceId: 'default',
            voiceName: character.name || 'AI Character',
            language: 'en-US',
            accent: 'American',
            gender: 'neutral',
            age: 'adult',
            tone: character.tone || 'professional',
            speed: character.speechSpeed || 1.0,
            pitch: character.speechPitch || 1.0
          })
        }
      } catch (error) {
        console.warn('⚠️ Failed to load voice settings:', error)
        setCharacterVoiceSettings({
          hasVoiceSupport: false,
          voiceId: 'default',
          voiceName: character.name || 'AI Character'
        })
      }
    }
    
    loadVoiceSettings()

    // Listen for voice synthesis events
    voiceService.onPlaybackStateChange((state) => {
      if (state.isPlaying) {
        setVoiceSynthesisStatus('speaking')
      } else {
        setVoiceSynthesisStatus('idle')
      }
    })

    // Listen for voice activity
    voiceService.onVoiceActivity(setVoiceActivity)

    return () => {
      // Cleanup if needed
    }
  }, [character])

  const getPersonalityColor = (trait) => {
    const colors = {
      'aggressive': 'error',
      'collaborative': 'success',
      'analytical': 'info',
      'emotional': 'warning',
      'competitive': 'secondary',
      'cooperative': 'primary'
    }
    return colors[trait.toLowerCase()] || 'default'
  }

  const getVoiceStatusColor = () => {
    switch (voiceSynthesisStatus) {
      case 'speaking': return 'success'
      case 'processing': return 'warning'
      default: return 'default'
    }
  }

  const getVoiceStatusText = () => {
    switch (voiceSynthesisStatus) {
      case 'speaking': return 'Speaking'
      case 'processing': return 'Processing'
      default: return 'Ready'
    }
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    // Could integrate with voice service mute functionality
  }

  if (!character) return null

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        {/* Character Avatar and Name */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Badge
              badgeContent={
                isVoiceMode && voiceSynthesisStatus === 'speaking' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <GraphicEq sx={{ fontSize: 16, color: 'success.main' }} />
                  </motion.div>
                ) : (characterVoiceSettings?.hasVoiceSupport && (
                  <Tooltip title="ElevenLabs Voice Enabled">
                    <Mic sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Tooltip>
                ))
              }
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  border: isVoiceMode ? 2 : 0,
                  borderColor: voiceSynthesisStatus === 'speaking' ? 'success.main' : 'primary.main'
                }}
              >
                <SmartToy sx={{ fontSize: '2rem' }} />
              </Avatar>
            </Badge>
            
            {/* Voice Activity Indicator */}
            {isVoiceMode && voiceSynthesisStatus === 'speaking' && (
              <Box sx={{ position: 'absolute', bottom: 12, right: -8 }}>
                <MiniAudioVisualizer 
                  isPlaying={voiceSynthesisStatus === 'speaking'}
                  size={20}
                />
              </Box>
            )}
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {character.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {character.role}
          </Typography>
          
          {/* Voice Status */}
          {isVoiceMode && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<RecordVoiceOver />}
                label={getVoiceStatusText()}
                size="small"
                color={getVoiceStatusColor()}
                variant={voiceSynthesisStatus === 'speaking' ? 'filled' : 'outlined'}
              />
              <Tooltip title={isAudioEnabled ? 'Mute Character' : 'Unmute Character'}>
                <IconButton
                  size="small"
                  onClick={toggleAudio}
                  color={isAudioEnabled ? 'default' : 'error'}
                >
                  {isAudioEnabled ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Voice Personality Section - Show only in voice mode */}
        <AnimatePresence>
          {isVoiceMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Hearing sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6">Voice Personality</Typography>
                </Box>
                
                {characterVoiceSettings && (
                  <Box sx={{ space: 1 }}>
                    {/* Voice Characteristics */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        label={`${characterVoiceSettings.gender} • ${characterVoiceSettings.age}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={characterVoiceSettings.accent}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                      <Chip
                        label={characterVoiceSettings.tone}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    </Box>
                    
                    {/* Voice Settings */}
                    <Box sx={{ space: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Speech Speed
                        </Typography>
                        <Typography variant="caption">
                          {characterVoiceSettings.speed}x
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={characterVoiceSettings.speed * 50} 
                        sx={{ mb: 1, height: 4, borderRadius: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Voice Pitch
                        </Typography>
                        <Typography variant="caption">
                          {characterVoiceSettings.pitch}x
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={characterVoiceSettings.pitch * 50} 
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isVoiceMode && <Divider sx={{ mb: 2 }} />}

        {/* Character Description */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <People sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">Background</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {character.background}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Personality Traits */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Psychology sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">Personality</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {character.personalityTraits?.map((trait, index) => (
              <Chip
                key={index}
                label={trait}
                size="small"
                color={getPersonalityColor(trait)}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Negotiation Goals */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">Goals</Typography>
          </Box>
          <List dense>
            {character.goals?.map((goal, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={goal.description}
                  secondary={`Priority: ${goal.priority}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Scenario Specific Info */}
        {scenario?.characterContext && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Scenario Context
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scenario.characterContext}
              </Typography>
            </Box>
          </>
        )}

        {/* Voice Synthesis Status */}
        {isVoiceMode && voiceSynthesisStatus === 'processing' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Generating voice response...
              </Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AICharacter