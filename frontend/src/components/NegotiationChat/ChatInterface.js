import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material'
import {
  Person,
  SmartToy,
  Wifi,
  WifiOff,
  Sync,
  Chat,
  Mic,
  VolumeUp
} from '@mui/icons-material'
import { format } from 'date-fns'
import apiClient from '../../services/apiService'
import socketService from '../../services/socketService'
import voiceService from '../../services/voiceService'
import voiceApiService from '../../services/voiceApiService'
import MessageInput from './MessageInput'
import VoiceControls from './VoiceControls'
import AudioVisualizer, { MiniAudioVisualizer } from './AudioVisualizer'
import VoiceTranscript from './VoiceTranscript'

const ChatInterface = ({ negotiation, scenario, character, onNegotiationUpdate }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAITyping, setIsAITyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [currentTab, setCurrentTab] = useState(0) // 0: Chat, 1: Voice
  const [voiceActivity, setVoiceActivity] = useState({ isActive: false, volume: 0, frequencyData: [] })
  const [transcriptText, setTranscriptText] = useState('')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAITyping, transcriptText])

  // Initialize voice API service
  useEffect(() => {
    const initializeVoiceApi = async () => {
      try {
        await voiceApiService.initialize()
        console.log('✅ Voice API service initialized')
      } catch (error) {
        console.warn('⚠️ Voice API service initialization failed:', error.message)
      }
    }

    initializeVoiceApi()
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      const negotiationId = negotiation?.id || negotiation?.negotiation_id
      if (!negotiationId) return
      
      try {
        setLoading(true)
        console.log('📞 Fetching messages for negotiation:', negotiationId)
        const response = await apiClient.get(`/negotiations/${negotiationId}`)
        const rawMessages = response.data.data.messages || []
        
        // Format messages for display with safe JSON parsing
        const formattedMessages = rawMessages.map(msg => {
          let messageType = null
          try {
            if (msg.metadata) {
              // Backend already parses JSON, so handle both string and object
              const metadata = typeof msg.metadata === 'string' 
                ? JSON.parse(msg.metadata) 
                : msg.metadata
              messageType = metadata?.message_type || null
            }
          } catch (error) {
            console.warn('Failed to parse message metadata:', msg.metadata, error)
          }
          
          return {
            id: msg.id,
            content: msg.content,
            sender: msg.sender_type === 'ai' ? 'ai' : 'user',
            timestamp: msg.sent_at,
            messageType
          }
        })
        
        setMessages(formattedMessages)
        console.log('✅ Messages loaded:', formattedMessages.length)
        
        // Update negotiation data
        onNegotiationUpdate(response.data.data)
      } catch (error) {
        console.error('❌ Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [negotiation?.id, negotiation?.negotiation_id, onNegotiationUpdate])

  // Socket.IO setup for real-time messaging and voice
  useEffect(() => {
    const negotiationId = negotiation?.id || negotiation?.negotiation_id
    if (!negotiationId) return

    // Connect to Socket.IO
    socketService.connect()
    
    // Monitor connection status
    socketService.onConnectionStatusChange((statusData) => {
      console.log('🔗 Connection status changed:', statusData)
      setConnectionStatus(statusData.status)
    })
    
    // Join the negotiation room
    socketService.joinNegotiation(negotiationId)

    // Listen for new messages
    socketService.onNewMessage(async (messageData) => {
      const formattedMessage = {
        id: messageData.id,
        content: messageData.content,
        sender: messageData.sender_type === 'ai' ? 'ai' : 'user',
        timestamp: messageData.sent_at,
        messageType: messageData.metadata?.message_type || null,
        hasAudio: messageData.audio_url || messageData.hasAudio
      }
      
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === formattedMessage.id)
        if (exists) return prev
        
        return [...prev, formattedMessage]
      })

      // Generate and play voice for AI messages in voice mode
      if (formattedMessage.sender === 'ai' && isVoiceMode) {
        try {
          if (character?.id && voiceApiService.hasVoiceSupport(character.id)) {
            console.log('🎵 Generating ElevenLabs voice for AI message')
            setIsAISpeaking(true)
            
            // Generate voice synthesis for the AI message content
            const voiceResult = await voiceApiService.generateCharacterSpeech(
              character.id, 
              formattedMessage.content
            )
            
            // Play the synthesized audio
            await voiceService.playAudioResponse(voiceResult.audioData, voiceResult.audioFormat)
            
            setIsAISpeaking(false)
          } else if (formattedMessage.hasAudio) {
            // Fallback to provided audio
            playAIAudioResponse(messageData.audio_data, messageData.audio_format)
          }
        } catch (error) {
          console.error('❌ Failed to generate/play AI voice:', error)
          setIsAISpeaking(false)
          
          // Try fallback audio if available
          if (formattedMessage.hasAudio) {
            playAIAudioResponse(messageData.audio_data, messageData.audio_format)
          }
        }
      }
    })

    // Listen for AI typing indicators
    socketService.onAITyping((data) => {
      if (data.negotiationId === negotiationId) {
        setIsAITyping(data.isTyping)
      }
    })

    // Listen for voice-specific events
    const socket = socketService.getSocket()
    if (socket) {
      // AI voice response received
      socket.on('ai-voice-response', (data) => {
        if (data.negotiationId === negotiationId) {
          playAIAudioResponse(data.audioData, data.format)
        }
      })

      // Speech-to-text results
      socket.on('speech-to-text', (data) => {
        if (data.negotiationId === negotiationId) {
          setTranscriptText(data.transcript)
          if (data.isFinal) {
            // Send as message when transcript is final
            handleSendMessage(data.transcript)
            setTranscriptText('')
          }
        }
      })

      // AI speaking status
      socket.on('ai-speaking', (data) => {
        if (data.negotiationId === negotiationId) {
          setIsAISpeaking(data.isSpeaking)
        }
      })
    }

    // Cleanup function
    return () => {
      socketService.leaveNegotiation(negotiationId)
      socketService.removeAllListeners()
      if (socket) {
        socket.off('ai-voice-response')
        socket.off('speech-to-text')
        socket.off('ai-speaking')
      }
    }
  }, [negotiation?.id, negotiation?.negotiation_id, isVoiceMode])

  const handleSendMessage = async (messageText) => {
    const negotiationId = negotiation?.id || negotiation?.negotiation_id
    if (!messageText.trim() || !negotiationId) return

    const userMessage = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      isTemporary: true,
      isVoiceOrigin: isVoiceMode
    }

    setMessages(prev => [...prev, userMessage])

    try {
      console.log('📤 Sending message to negotiation:', negotiationId)
      const response = await apiClient.post(`/negotiations/${negotiationId}/messages`, {
        content: messageText,
        metadata: {
          voice_mode: isVoiceMode,
          message_source: isVoiceMode ? 'voice' : 'text'
        }
      })

      console.log('✅ Message sent successfully:', response.data)
      
      // Remove temporary message and add real message from response
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => !msg.isTemporary)
        const newMessage = {
          id: response.data.data.message_id,
          content: response.data.data.content,
          sender: 'user',
          timestamp: response.data.data.sent_at,
          isVoiceOrigin: isVoiceMode
        }
        return [...withoutTemp, newMessage]
      })

      // AI response will come via Socket.IO - no need to poll
      
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => !msg.isTemporary))
    }
  }


  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'offer': return 'primary'
      case 'counteroffer': return 'secondary'
      case 'question': return 'info'
      case 'acceptance': return 'success'
      case 'rejection': return 'error'
      default: return 'default'
    }
  }

  const playAIAudioResponse = async (audioData, format = 'mp3') => {
    try {
      // Try to use ElevenLabs voice synthesis first if available
      if (character?.id && voiceApiService.hasVoiceSupport(character.id)) {
        console.log('🎵 Using ElevenLabs voice synthesis for AI response')
        // audioData should be the text content for synthesis
        const voiceResult = await voiceApiService.generateCharacterSpeech(character.id, audioData)
        await voiceService.playAudioResponse(voiceResult.audioData, voiceResult.audioFormat)
      } else {
        // Fallback to basic audio playback
        console.log('🔊 Using basic audio playback')
        await voiceService.playAudioResponse(audioData, format)
      }
    } catch (error) {
      console.error('❌ Failed to play AI audio response:', error)
      // Try fallback audio playback if voice synthesis fails
      try {
        await voiceService.playAudioResponse(audioData, format)
      } catch (fallbackError) {
        console.error('❌ Fallback audio playback also failed:', fallbackError)
      }
    }
  }

  const handleVoiceModeChange = (enabled) => {
    setIsVoiceMode(enabled)
    if (enabled) {
      setCurrentTab(1) // Switch to voice tab
      // Initialize voice service listeners
      voiceService.onVoiceActivity(setVoiceActivity)
    } else {
      // Clean up voice service
      voiceService.stopRecording()
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    if (newValue === 1 && !isVoiceMode) {
      setIsVoiceMode(true)
    }
  }

  const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user'

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          alignItems: 'flex-start'
        }}
      >
        {!isUser && (
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            <SmartToy />
          </Avatar>
        )}
        
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.main' : 'grey.100',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              ...(message.isTemporary && { opacity: 0.7 })
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {message.content}
              </Typography>
              
              {/* Voice/Audio indicators */}
              {message.isVoiceOrigin && (
                <Mic sx={{ fontSize: 16, opacity: 0.7 }} />
              )}
              {message.hasAudio && (
                <VolumeUp sx={{ fontSize: 16, opacity: 0.7 }} />
              )}
            </Box>
            
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {message.messageType && (
                <Chip
                  size="small"
                  label={message.messageType}
                  color={getMessageTypeColor(message.messageType)}
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    color: isUser ? 'white' : undefined,
                    borderColor: isUser ? 'rgba(255,255,255,0.5)' : undefined
                  }}
                />
              )}
              
              {message.isVoiceOrigin && (
                <Chip
                  size="small"
                  label="Voice"
                  icon={<Mic />}
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    color: isUser ? 'white' : undefined,
                    borderColor: isUser ? 'rgba(255,255,255,0.5)' : undefined
                  }}
                />
              )}
            </Box>
          </Paper>
          
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
              textAlign: isUser ? 'right' : 'left'
            }}
          >
            {format(new Date(message.timestamp), 'HH:mm')}
          </Typography>
        </Box>

        {isUser && (
          <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
            <Person />
          </Avatar>
        )}
      </Box>
    )
  }

  const TypingIndicator = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2
      }}
    >
      <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
        <SmartToy />
      </Avatar>
      
      <Paper
        elevation={1}
        sx={{
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CircularProgress size={16} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {character?.name} is {isAISpeaking ? 'speaking' : 'thinking'}...
          </Typography>
          {isAISpeaking && <MiniAudioVisualizer isPlaying={true} size={16} />}
        </Box>
      </Paper>
    </Box>
  )

  const ConnectionStatusIndicator = () => {
    const getStatusInfo = () => {
      switch (connectionStatus) {
        case 'connected':
        case 'reconnected':
          return { color: 'success', icon: <Wifi />, text: 'Connected' }
        case 'connecting':
          return { color: 'info', icon: <Sync sx={{ animation: 'spin 1s linear infinite' }} />, text: 'Connecting...' }
        case 'disconnected':
        case 'error':
        case 'reconnect_error':
          return { color: 'error', icon: <WifiOff />, text: 'Connection issues' }
        case 'reconnect_failed':
          return { color: 'error', icon: <WifiOff />, text: 'Connection failed' }
        default:
          return { color: 'warning', icon: <Sync />, text: 'Unknown status' }
      }
    }

    const { color, icon, text } = getStatusInfo()

    if (connectionStatus === 'connected' || connectionStatus === 'reconnected') {
      return null // Don't show indicator when connected
    }

    return (
      <Alert 
        severity={color} 
        variant="outlined" 
        sx={{ mb: 1, fontSize: '0.8rem' }}
        icon={icon}
      >
        {text}
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Connection Status */}
      <Box sx={{ p: 1, flexShrink: 0 }}>
        <ConnectionStatusIndicator />
      </Box>

      {/* Mode Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ minHeight: 40 }}
        >
          <Tab 
            icon={<Chat />} 
            label="Text Chat" 
            sx={{ fontSize: '0.8rem', minHeight: 40 }} 
          />
          <Tab 
            icon={<Mic />} 
            label="Voice Chat" 
            sx={{ 
              fontSize: '0.8rem', 
              minHeight: 40,
              color: isVoiceMode ? 'primary.main' : undefined
            }} 
          />
        </Tabs>
      </Box>

      {/* Scenario Context */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Scenario Context
        </Typography>
        <Typography variant="body2">
          {scenario?.context}
        </Typography>
      </Box>

      {/* Voice Controls - Show when voice mode is active */}
      {isVoiceMode && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <VoiceControls
            negotiationId={negotiation?.id || negotiation?.negotiation_id}
            disabled={false}
            onModeChange={handleVoiceModeChange}
            isVoiceMode={isVoiceMode}
          />
        </Box>
      )}

      {/* Audio Visualizer - Show when voice mode is active */}
      {isVoiceMode && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <AudioVisualizer
            voiceActivity={voiceActivity}
            isRecording={voiceService.getRecordingState().isRecording}
            isPlaying={voiceService.getPlaybackState().isPlaying}
            height={60}
            barCount={24}
          />
        </Box>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Box>
              {isVoiceMode ? (
                <Mic sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              ) : (
                <SmartToy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              )}
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start Your Negotiation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isVoiceMode 
                  ? `Speak to begin the conversation with ${character?.name}`
                  : `Begin the conversation with ${character?.name}`
                }
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isAITyping && <TypingIndicator />}
            {/* Voice Transcript Display */}
            {transcriptText && isVoiceMode && (
              <VoiceTranscript 
                text={transcriptText} 
                isInterim={true}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input - Show only in text mode */}
      {!isVoiceMode && (
        <Box sx={{ flexShrink: 0 }}>
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isAITyping}
            placeholder={`Message ${character?.name}...`}
          />
        </Box>
      )}

      {/* Voice Input Info - Show in voice mode */}
      {isVoiceMode && (
        <Box sx={{ p: 2, textAlign: 'center', flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary">
            Use voice controls above to speak with {character?.name}
          </Typography>
        </Box>
      )}
    </Card>
  )
}

export default ChatInterface