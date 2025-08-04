import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Stack,
  Fade,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Button,
  CircularProgress
} from '@mui/material'
import {
  Pause,
  PlayArrow,
  CallEnd,
  Mic,
  MicOff,
  VolumeUp,
  Person,
  RecordVoiceOver,
  Hearing,
  Sync,
  ErrorOutline,
  Wifi,
  PlayCircle,
  SmartToy
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useConversation } from '@elevenlabs/react'
import voiceService from '../../services/voiceService'
import socketService from '../../services/socketService'
import voiceApiService from '../../services/voiceApiService'

const VoiceConversation = ({ 
  character, 
  scenario, 
  negotiationId,
  onEndConversation,
  onPause,
  onResume,
  onMessageReceived,
  onTranscriptUpdate
}) => {
  // Core conversation state
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationTime, setConversationTime] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  
  // Conversation data
  const [transcript, setTranscript] = useState([])
  const [currentUserTranscript, setCurrentUserTranscript] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [elevenLabsConversationId, setElevenLabsConversationId] = useState(null)
  const [sessionState, setSessionState] = useState('idle') // idle, initializing, ready, listening, speaking, processing, error
  
  // Speech recognition
  const [speechRecognition, setSpeechRecognition] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)
  
  // Connection and error handling
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // Audio analysis
  const [voiceActivity, setVoiceActivity] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Note: Real-time assessment removed per PRD scope correction
  
  // Refs
  const timerRef = useRef(null)
  const speechRecognitionRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const conversationRef = useRef(null)

  // ElevenLabs conversation hook - following proven tutorial pattern
  const addMessage = useCallback((speaker, text) => {
    const message = { 
      speaker, 
      text, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    }
    setTranscript(prev => {
      const newTranscript = [...prev, message]
      
      // Call the transcript update callback if provided
      if (onTranscriptUpdate) {
        onTranscriptUpdate(newTranscript)
      }
      
      return newTranscript
    })
    setConversationHistory(prev => [...prev, { speaker, text }])
    
    // Call the message callback if provided
    if (onMessageReceived) {
      onMessageReceived(message)
    }
  }, [onMessageReceived, onTranscriptUpdate])

  const handleMessage = useCallback((message) => {
    console.log('📥 Received ElevenLabs message:', message)
    
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('🎉 ElevenLabs conversation started:', message)
        addMessage('System', `Connected to ${character?.name || 'AI Character'} - you can begin speaking`)
        setSessionState('ready')
        setConnectionStatus('connected')
        setIsListening(true)
        break
        
      case 'user_transcript':
        if (message.user_transcript && message.user_transcript.trim()) {
          console.log('👤 User transcript:', message.user_transcript)
          addMessage('You', message.user_transcript)
          setCurrentUserTranscript('')
          setIsListening(false)
          setIsProcessing(true)
        }
        break
        
      case 'agent_response':
        if (message.agent_response && message.agent_response.trim()) {
          console.log('🤖 AI response:', message.agent_response)
          addMessage(character?.name || 'AI', message.agent_response)
          setIsProcessing(false)
          setIsSpeaking(true)
        }
        break
        
      // Additional message types that might be used
      case 'user_speech_complete':
      case 'speech_complete':
        if (message.transcript && message.transcript.trim()) {
          console.log('👤 User speech complete:', message.transcript)
          addMessage('You', message.transcript)
        }
        break
        
      case 'agent_speech_complete':
      case 'response_complete':
        if (message.text && message.text.trim()) {
          console.log('🤖 Agent speech complete:', message.text)
          addMessage(character?.name || 'AI', message.text)
        }
        break
        
      case 'audio_event':
        console.log('🔊 Audio event received')
        setIsSpeaking(true)
        // Audio handled automatically by SDK
        setTimeout(() => {
          setIsSpeaking(false)
          setIsListening(true)
        }, 1500) // Give time for audio to play
        break
        
      default:
        console.log('❓ Unknown message type:', message.type, message)
    }
  }, [character?.name, addMessage])

  // ElevenLabs useConversation hook - CRITICAL for voice functionality
  const conversation = useConversation({
    apiKey: 'sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43',
    onConnect: () => {
      console.log('🔗 Connected to ElevenLabs')
      setConnectionStatus('connected')
      setSessionState('connected')
    },
    onMessage: handleMessage,
    onAudio: (audioBuffer) => {
      console.log('🎵 Received audio buffer:', audioBuffer)
      setIsSpeaking(true)
      // SDK handles audio playback automatically
      setTimeout(() => {
        setIsSpeaking(false)
        setIsListening(true)
      }, 1000)
    },
    onError: (error) => {
      console.error('❌ ElevenLabs conversation error:', error)
      setError(`Voice service error: ${error.message}`)
      setSessionState('error')
      setConnectionStatus('error')
      setIsActive(false)
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from ElevenLabs')
      setConnectionStatus('disconnected')
      setSessionState('idle')
      setIsActive(false)
      
      // Log the conversation ID for transcript fetching
      if (elevenLabsConversationId) {
        console.log('📝 Conversation finalized, ID available for transcript:', elevenLabsConversationId)
        
        // If disconnect happened unexpectedly (not during manual end), trigger assessment
        if (sessionState !== 'ending' && conversationTime > 30) {
          console.log('🎯 Unexpected disconnect detected, triggering assessment automatically')
          
          const conversationResults = {
            negotiationId: negotiationId || `negotiation-${Date.now()}`,
            elevenLabsConversationId: elevenLabsConversationId,
            transcript: transcript,
            conversationHistory: conversationHistory,
            duration: conversationTime,
            character: character,
            scenario: scenario,
            endedAt: new Date().toISOString(),
            sessionMetrics: {
              totalMessages: transcript.length,
              userMessages: transcript.filter(t => t.speaker === 'You' || t.speaker === 'user').length,
              aiMessages: transcript.filter(t => t.speaker !== 'You' && t.speaker !== 'user' && t.speaker !== 'System').length,
              averageResponseTime: 2.5,
              hadFallbackTranscript: false,
              endedBy: 'system_disconnect'
            },
            metadata: {
              source: 'elevenlabs_voice_conversation',
              hasElevenLabsId: true,
              clientTranscriptLength: transcript.length,
              usedFallbackTranscript: false,
              conversationDuration: conversationTime,
              endType: 'unexpected_disconnect'
            },
            shouldTriggerAssessment: true
          }
          
          onEndConversation?.(conversationResults)
        }
      }
    }
  })

  // Timer effect for conversation duration
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setConversationTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [isActive, isPaused])

  // Component initialization effect (without auto-starting conversation)
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        console.log('🎤 Initializing VoiceConversation component')
        
        // Check speech recognition support (doesn't require user gesture)
        checkSpeechRecognitionSupport()
        
        // Initialize basic socket connections (doesn't require user gesture)
        if (!socketService.isConnected()) {
          socketService.connect()
        }
        
        // Setup basic listeners (doesn't require user gesture)
        setupWebSocketListeners()
        
        if (mounted) {
          setIsInitialized(true)
          setSessionState('idle')
          console.log('✅ Component initialized, waiting for user to start conversation')
        }
      } catch (error) {
        console.error('❌ Failed to initialize voice conversation component:', error)
        if (mounted) {
          setError(error.message)
          setSessionState('error')
        }
      }
    }

    initialize()

    return () => {
      mounted = false
      cleanup()
    }
  }, [character?.id, scenario?.id, negotiationId])

  // Check browser speech recognition support
  const checkSpeechRecognitionSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      console.log('✅ Speech Recognition API supported')
    } else {
      setSpeechSupported(false)
      console.warn('⚠️ Speech Recognition API not supported in this browser')
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
    }
  }, [])

  // Initialize services that require user gesture
  const initializeServicesWithUserGesture = useCallback(async () => {
    try {
      setSessionState('initializing')
      console.log('🔧 Initializing voice services with user gesture...')

      // Initialize voice API service
      if (!voiceApiService.isInitialized) {
        await voiceApiService.initialize()
      }

      // Setup voice service event listeners
      setupVoiceServiceListeners()

      console.log('✅ Voice services initialized successfully with user gesture')
    } catch (error) {
      console.error('❌ Failed to initialize services:', error)
      throw new Error(`Service initialization failed: ${error.message}`)
    }
  }, [])

  // Setup WebSocket event listeners for conversational AI
  const setupWebSocketListeners = useCallback(() => {
    if (!socketService.getSocket()) return

    const socket = socketService.getSocket()

    // Connection status monitoring
    socketService.onConnectionStatusChange((status) => {
      setConnectionStatus(status.status)
      if (status.status === 'connected') {
        setError(null)
        setRetryCount(0)
      } else if (status.status === 'disconnected') {
        handleConnectionLoss()
      }
    })

    // Conversational AI session events
    socket.on('conversational-session-ready', handleSessionReady)
    socket.on('conversational-audio-chunk', handleIncomingAudioChunk)
    socket.on('conversational-transcript', handleTranscriptUpdate)
    socket.on('conversational-speaking-status', handleSpeakingStatusUpdate)
    socket.on('conversational-session-ended', handleSessionEnded)
    socket.on('conversational-session-error', handleSessionError)

    console.log('🔗 WebSocket listeners configured')
  }, [])

  // Setup voice service event listeners
  const setupVoiceServiceListeners = useCallback(() => {
    // Session state changes
    voiceService.onSessionStateChange(handleVoiceServiceStateChange)
    
    // Transcript updates
    voiceService.onTranscript(handleVoiceServiceTranscript)
    
    // Recording state changes
    voiceService.onRecordingStateChange(handleRecordingStateChange)
    
    // Playback state changes
    voiceService.onPlaybackStateChange(handlePlaybackStateChange)
    
    // Voice activity detection
    voiceService.onVoiceActivity(handleVoiceActivity)
    
    // Error handling
    voiceService.onError(handleVoiceServiceError)

    console.log('🎵 Voice service listeners configured')
  }, [])

  // Wait for socket connection with timeout
  const waitForSocketConnection = useCallback(async (maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      if (socketService.isConnected()) {
        console.log('✅ Socket connected successfully')
        return true
      }
      
      if (i === 0) {
        console.log('⏳ Waiting for socket connection...')
        socketService.connect() // Ensure connection attempt
      }
      
      // Wait 500ms before next check
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    throw new Error('Failed to establish socket connection after ' + maxAttempts + ' attempts')
  }, [])

  // Start ElevenLabs conversation - following proven tutorial pattern
  const startConversation = useCallback(async () => {
    try {
      console.log('🚀 Starting ElevenLabs conversation with character:', character?.name)
      console.log('Current conversation state:', conversation)
      setIsStarting(true)
      setSessionState('connecting')
      setError(null)

      // Get case-specific agent configuration from our backend
      const response = await fetch('http://localhost:5000/api/voice/create-agent-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName: character?.name || 'Sarah Chen',
          scenarioId: scenario?.id,
          scenarioContext: scenario
        })
      })
      
      const agentSession = await response.json()
      
      if (!agentSession.success) {
        throw new Error(agentSession.error || 'Failed to create agent session')
      }
      
      console.log('Agent session data:', agentSession.data)
      console.log('Prompt length:', agentSession.data.prompt?.length)
      
      // Start session with case-specific prompt override
      const sessionConfig = {
        agentId: agentSession.data.agentId,
        overrides: {
          agent: {
            prompt: {
              prompt: agentSession.data.prompt
            }
          }
        }
      }
      
      console.log('Starting session with config:', {
        agentId: sessionConfig.agentId,
        hasOverrides: !!sessionConfig.overrides,
        promptLength: sessionConfig.overrides?.agent?.prompt?.prompt?.length
      })
      
      // Start session and capture the conversation ID
      const conversationId = await conversation.startSession(sessionConfig)
      
      // Store the ElevenLabs conversation ID for transcript retrieval
      if (conversationId) {
        setElevenLabsConversationId(conversationId)
        console.log('🎯 ElevenLabs Conversation ID captured:', conversationId)
      }
      
      setIsActive(true)
      setIsStarting(false)
      console.log('✅ ElevenLabs conversation started successfully')
      
    } catch (error) {
      console.error('❌ Failed to start ElevenLabs conversation:', error)
      setError(`Failed to start conversation: ${error.message}`)
      setSessionState('error')
      setIsStarting(false)
      setIsActive(false)
    }
  }, [character, conversation])

  // Initialize browser speech recognition
  const initializeSpeechRecognition = useCallback(async () => {
    if (!speechSupported) return

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      // Configure speech recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      // Event handlers
      recognition.onstart = () => {
        console.log('🎯 Speech recognition started')
        setIsRecognizing(true)
        setIsListening(true)
      }

      recognition.onresult = handleSpeechRecognitionResult
      recognition.onerror = handleSpeechRecognitionError
      recognition.onend = handleSpeechRecognitionEnd

      speechRecognitionRef.current = recognition
      setSpeechRecognition(recognition)

      // Start speech recognition
      recognition.start()

      // Also start voice service recording for audio streaming
      await voiceService.startConversationalRecording(sessionId)

      console.log('✅ Speech recognition initialized')
    } catch (error) {
      console.error('❌ Failed to initialize speech recognition:', error)
      setError(`Speech recognition failed: ${error.message}`)
    }
  }, [speechSupported, sessionId])

  // Handle speech recognition results
  const handleSpeechRecognitionResult = useCallback((event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // Update current user transcript (for interim results)
    setCurrentUserTranscript(interimTranscript)

    // Handle final transcript
    if (finalTranscript) {
      const transcriptEntry = {
        id: Date.now(),
        speaker: 'user',
        text: finalTranscript,
        timestamp: new Date().toISOString(),
        isFinal: true
      }

      setTranscript(prev => [...prev, transcriptEntry])
      setCurrentUserTranscript('')
      console.log('📝 Final user transcript:', finalTranscript)
    }
  }, [])

  // Handle speech recognition errors
  const handleSpeechRecognitionError = useCallback((event) => {
    console.error('❌ Speech recognition error:', event.error)
    
    if (event.error === 'not-allowed') {
      setError('Microphone permission denied. Please allow microphone access and refresh.')
    } else if (event.error === 'no-speech') {
      console.log('⏸️ No speech detected, restarting recognition...')
      // Restart recognition after a brief pause
      setTimeout(() => {
        if (speechRecognitionRef.current && isActive && !isPaused) {
          speechRecognitionRef.current.start()
        }
      }, 1000)
    } else if (event.error === 'network') {
      console.log('🔄 Network error in speech recognition - using fallback mode')
      // Instead of failing, trigger a character response after recording
      triggerFallbackCharacterResponse()
    } else {
      setError(`Speech recognition error: ${event.error}`)
    }
  }, [isActive, isPaused])

  // Fallback character response when speech recognition fails
  const triggerFallbackCharacterResponse = useCallback(() => {
    console.log('🤖 Triggering fallback character response')
    
    // Simulate a generic user input to trigger character response
    const fallbackUserInput = "I'd like to continue our negotiation."
    
    // Add fake transcript entry to show user spoke
    const transcriptEntry = {
      speaker: 'user',
      text: fallbackUserInput + ' (voice detected - speech recognition unavailable)',
      timestamp: new Date().toISOString(),
      isFinal: true
    }
    
    setTranscript(prev => [...prev, transcriptEntry])
    
    // Trigger character response via socket
    if (sessionId && socketService.isConnected()) {
      console.log('📤 Sending fallback message to character:', fallbackUserInput)
      socketService.emit('conversational-user-input', {
        sessionId: sessionId,
        message: fallbackUserInput,
        timestamp: new Date().toISOString()
      })
    }
  }, [sessionId])

  // Handle speech recognition end
  const handleSpeechRecognitionEnd = useCallback(() => {
    console.log('🔚 Speech recognition ended')
    setIsRecognizing(false)
    
    // Restart if conversation is still active
    if (isActive && !isPaused && sessionState !== 'speaking') {
      setTimeout(() => {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.start()
        }
      }, 500)
    }
  }, [isActive, isPaused, sessionState])

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up VoiceConversation component')

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }

    // End conversational session
    if (sessionId) {
      voiceService.endConversationalSession(sessionId)
    }

    // Stop voice service recording
    voiceService.stopConversationalRecording()

    // Cleanup voice service
    voiceService.cleanup()

    // Remove socket listeners
    socketService.removeVoiceListeners()
  }, [sessionId])

  // WebSocket event handlers
  const handleSessionReady = useCallback((data) => {
    console.log('✅ Conversational session ready:', data)
    setSessionState('ready')
    setIsProcessing(false)
  }, [])

  const handleIncomingAudioChunk = useCallback((data) => {
    console.log('🔊 Received AI audio chunk')
    setIsSpeaking(true)
    setIsListening(false)
    setSessionState('speaking')
  }, [])

  const handleTranscriptUpdate = useCallback((data) => {
    console.log('📝 Transcript update:', data)
    
    if (data.type === 'agent') {
      const transcriptEntry = {
        id: Date.now(),
        speaker: 'ai',
        text: data.transcript,
        timestamp: data.timestamp,
        isFinal: data.isFinal,
        characterName: character.name
      }

      if (data.isFinal) {
        setTranscript(prev => [...prev, transcriptEntry])
      }
    }
  }, [character])

  const handleSpeakingStatusUpdate = useCallback((data) => {
    console.log('🗣️ Speaking status update:', data)
    setIsSpeaking(data.isActive)
    
    if (data.isActive) {
      setSessionState('speaking')
      // Pause speech recognition while AI is speaking
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
    } else {
      setSessionState('listening')
      setIsListening(true)
      // Resume speech recognition after AI finishes speaking
      setTimeout(() => {
        if (speechRecognitionRef.current && isActive && !isPaused) {
          speechRecognitionRef.current.start()
        }
      }, 500)
    }
  }, [isActive, isPaused])

  const handleSessionEnded = useCallback((data) => {
    console.log('🏁 Conversational session ended:', data)
    setIsActive(false)
    setSessionState('idle')
    setIsSpeaking(false)
    setIsListening(false)
  }, [])

  const handleSessionError = useCallback((data) => {
    console.error('❌ Conversational session error:', data)
    setError(`Conversational AI error: ${data.error}`)
    setSessionState('error')
  }, [])

  // Voice service event handlers
  const handleVoiceServiceStateChange = useCallback((stateData) => {
    console.log('🎵 Voice service state change:', stateData)
    
    if (stateData.state === 'listening') {
      setIsListening(true)
      setIsSpeaking(false)
      setIsProcessing(false)
    } else if (stateData.state === 'speaking') {
      setIsSpeaking(true)
      setIsListening(false)
      setIsProcessing(false)
    } else if (stateData.state === 'processing') {
      setIsProcessing(true)
    }
  }, [])

  const handleVoiceServiceTranscript = useCallback((transcript) => {
    console.log('📝 Voice service transcript:', transcript)
    // This handles transcripts from the voice service
  }, [])

  const handleRecordingStateChange = useCallback((recordingData) => {
    console.log('🎙️ Recording state change:', recordingData)
  }, [])

  const handlePlaybackStateChange = useCallback((playbackData) => {
    console.log('🔊 Playback state change:', playbackData)
    setIsSpeaking(playbackData.isPlaying)
  }, [])

  const handleVoiceActivity = useCallback((activityData) => {
    setVoiceActivity(activityData)
    setAudioLevel(activityData.volume || 0)
    
    // Send voice activity to backend
    if (sessionId && socketService.isConnected()) {
      socketService.getSocket().emit('voice-activity', {
        sessionId,
        isActive: activityData.isActive,
        volume: activityData.volume,
        timestamp: Date.now()
      })
    }
  }, [sessionId])

  const handleVoiceServiceError = useCallback((error) => {
    console.error('❌ Voice service error:', error)
    setError(error)
  }, [])

  const handleConnectionLoss = useCallback(() => {
    console.warn('⚠️ Connection lost, attempting to reconnect...')
    setConnectionStatus('disconnected')
    setError('Connection lost. Attempting to reconnect...')
    
    // Attempt to reconnect with exponential backoff
    const attemptReconnect = () => {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1)
          socketService.connect()
        }, delay)
      } else {
        setError('Failed to reconnect. Please refresh the page.')
        setSessionState('error')
      }
    }

    attemptReconnect()
  }, [retryCount])

  // Control functions
  const handlePause = useCallback(async () => {
    try {
      console.log('⏸️ Pausing conversation')
      setIsPaused(true)
      setIsListening(false)
      
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
      
      // Pause voice service recording
      voiceService.pauseRecording()
      
      onPause?.()
    } catch (error) {
      console.error('❌ Failed to pause conversation:', error)
      setError(`Failed to pause: ${error.message}`)
    }
  }, [onPause])

  const handleResume = useCallback(async () => {
    try {
      console.log('▶️ Resuming conversation')
      setIsPaused(false)
      setIsListening(true)
      setError(null)
      
      // Resume voice service recording
      voiceService.resumeRecording()
      
      // Restart speech recognition
      if (speechRecognitionRef.current && sessionState !== 'speaking') {
        speechRecognitionRef.current.start()
      }
      
      onResume?.()
    } catch (error) {
      console.error('❌ Failed to resume conversation:', error)
      setError(`Failed to resume: ${error.message}`)
    }
  }, [onResume, sessionState])

  const handleEndConversation = useCallback(async () => {
    try {
      console.log('🛑 Ending ElevenLabs conversation')
      setIsActive(false)
      setIsListening(false)
      setIsSpeaking(false)
      setSessionState('ending')
      
      // End ElevenLabs conversation using SDK pattern
      await conversation.endSession()
      
      // Debug conversation data capture
      console.log('🔍 Conversation end debug:', {
        transcriptLength: transcript.length,
        conversationHistoryLength: conversationHistory.length,
        capturedElevenLabsId: elevenLabsConversationId,
        fallbackElevenLabsId: conversation?.id || conversation?.conversationId || sessionId,
        conversationTime,
        hasConversation: !!conversation
      })

      // Create fallback transcript if no messages captured
      let finalTranscript = transcript
      if (transcript.length === 0 && conversationTime > 30) {
        console.warn('⚠️ No transcript captured, creating fallback with conversation duration data')
        finalTranscript = [
          {
            speaker: 'System',
            message: `Voice conversation completed with ${character?.name || 'AI Character'}`,
            id: Date.now(),
            timestamp: new Date().toISOString()
          },
          {
            speaker: 'You',
            message: '[Voice conversation - transcript not captured]',
            id: Date.now() + 1,
            timestamp: new Date().toISOString()
          },
          {
            speaker: character?.name || 'AI',
            message: '[AI responses during voice conversation]',
            id: Date.now() + 2,
            timestamp: new Date().toISOString()
          }
        ]
      }

      // Prepare conversation data for automatic assessment trigger
      const conversationResults = {
        negotiationId: negotiationId || `negotiation-${Date.now()}`,
        elevenLabsConversationId: elevenLabsConversationId || conversation?.id || conversation?.conversationId || sessionId,
        transcript: finalTranscript,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : [
          { speaker: 'System', text: `Voice conversation with ${character?.name || 'AI Character'}` }
        ],
        duration: conversationTime,
        character: character,
        scenario: scenario,
        endedAt: new Date().toISOString(),
        sessionMetrics: {
          totalMessages: finalTranscript.length,
          userMessages: finalTranscript.filter(t => t.speaker === 'You' || t.speaker === 'user').length,
          aiMessages: finalTranscript.filter(t => t.speaker !== 'You' && t.speaker !== 'user').length,
          averageResponseTime: 2.5,
          hadFallbackTranscript: transcript.length === 0 && finalTranscript.length > 0
        },
        metadata: {
          source: 'elevenlabs_voice_conversation',
          hasElevenLabsId: !!(conversation?.id || conversation?.conversationId || sessionId),
          clientTranscriptLength: transcript.length,
          usedFallbackTranscript: transcript.length === 0 && finalTranscript.length > 0,
          conversationDuration: conversationTime
        },
        // Flag to trigger automatic assessment
        shouldTriggerAssessment: true
      }
      
      console.log('📊 Conversation results prepared for automatic assessment:', conversationResults)
      
      // Reset state
      setConnectionStatus('disconnected')
      setSessionState('ended')
      
      // Call parent with conversation results to trigger automatic assessment flow
      onEndConversation?.(conversationResults)
      console.log('✅ ElevenLabs conversation ended successfully - assessment flow will start automatically')
    } catch (error) {
      console.error('❌ Failed to end ElevenLabs conversation:', error)
      setError(`Failed to end conversation: ${error.message}`)
      
      // Still call onEndConversation with basic data even on error
      const basicResults = {
        negotiationId: negotiationId || `negotiation-${Date.now()}`,
        transcript: transcript,
        conversationHistory: conversationHistory,
        duration: conversationTime,
        character: character,
        scenario: scenario,
        endedAt: new Date().toISOString(),
        error: error.message,
        shouldTriggerAssessment: conversationTime > 30 // Only trigger if conversation was meaningful
      }
      onEndConversation?.(basicResults)
    }
  }, [conversation, onEndConversation, negotiationId, transcript, conversationHistory, conversationTime, character, scenario, elevenLabsConversationId, sessionId])

  const handleRetry = useCallback(async () => {
    try {
      console.log('🔄 Retrying conversation initialization')
      setError(null)
      setRetryCount(0)
      setSessionState('idle')
      setIsStarting(false)
      setIsActive(false)
      
      // Reset any existing sessions
      if (sessionId) {
        try {
          await voiceService.endConversationalSession(sessionId)
        } catch (e) {
          console.warn('Failed to end existing session during retry:', e)
        }
        setSessionId(null)
      }
      
      // Clean up any existing speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
        speechRecognitionRef.current = null
      }
      
      console.log('✅ Reset complete, ready for new attempt')
    } catch (error) {
      console.error('❌ Retry reset failed:', error)
      setError(`Reset failed: ${error.message}`)
    }
  }, [sessionId])

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusText = () => {
    if (sessionState === 'error') return 'Error'
    if (isStarting) return 'Starting conversation...'
    if (sessionState === 'initializing') return 'Initializing...'
    if (!isActive && isInitialized) return 'Ready to start'
    if (!isInitialized) return 'Loading...'
    if (isPaused) return 'Paused'
    if (isProcessing) return 'Processing...'
    if (isSpeaking) return `${character.name} is speaking...`
    if (isListening) return 'Listening...'
    return 'Ready'
  }

  const getStatusColor = () => {
    if (sessionState === 'error') return 'error.main'
    if (isStarting || sessionState === 'initializing' || isProcessing) return 'warning.main'
    if (!isActive && isInitialized) return 'info.main'
    if (!isInitialized) return 'text.secondary'
    if (isPaused) return 'warning.main'
    if (isSpeaking) return 'primary.main'
    if (isListening) return 'success.main'
    return 'text.secondary'
  }

  const getConnectionIcon = () => {
    if (connectionStatus === 'connected') return <Wifi color="success" />
    if (connectionStatus === 'disconnected') return <ErrorOutline color="error" />
    return <Sync color="warning" />
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 300, mb: 1 }}>
            {scenario?.title || 'Voice Conversation'}
          </Typography>
          
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {formatTime(conversationTime)}
            </Typography>
            
            <Divider orientation="vertical" flexItem />
            
            <Stack direction="row" spacing={1} alignItems="center">
              {getConnectionIcon()}
              <Typography variant="caption" color="text.secondary">
                {connectionStatus}
              </Typography>
            </Stack>
            
            {sessionId && (
              <>
                <Divider orientation="vertical" flexItem />
                <Chip 
                  label={`Session: ${sessionId.slice(-8)}`} 
                  size="small" 
                  variant="outlined" 
                />
              </>
            )}
          </Stack>

          {!speechSupported && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
            </Alert>
          )}
        </Box>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              sessionState === 'error' && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                  startIcon={<Sync />}
                  sx={{ 
                    color: 'error.contrastText',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Reset
                </Button>
              )
            }
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Main Conversation Interface */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* AI Character Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: sessionState === 'error' ? 'error.main' : 'grey.200',
              borderRadius: 3,
              mb: 4,
              position: 'relative'
            }}
          >
            {/* Processing Indicator */}
            {(sessionState === 'initializing' || isProcessing) && (
              <LinearProgress 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0,
                  borderRadius: '12px 12px 0 0'
                }} 
              />
            )}

            {/* AI Avatar with Enhanced Animations */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: isSpeaking ? 'primary.dark' : (isListening ? 'success.main' : 'primary.main'),
                  color: 'primary.contrastText',
                  fontSize: '3rem',
                  transition: 'all 0.3s ease',
                  ...(isSpeaking && {
                    animation: 'pulse 1.5s infinite'
                  }),
                  ...(isListening && {
                    animation: 'breathe 2s infinite'
                  })
                }}
              >
                <Person sx={{ fontSize: '3rem' }} />
              </Avatar>
              
              {/* Speaking Indicator */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#4CAF50',
                      borderRadius: '50%',
                      padding: 8
                    }}
                  >
                    <RecordVoiceOver sx={{ color: 'white', fontSize: '1rem' }} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Listening Indicator */}
              <AnimatePresence>
                {isListening && !isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#2196F3',
                      borderRadius: '50%',
                      padding: 8
                    }}
                  >
                    <Hearing sx={{ color: 'white', fontSize: '1rem' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing Indicator */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      padding: 8
                    }}
                  >
                    <Sync 
                      sx={{ 
                        color: 'white', 
                        fontSize: '1rem',
                        animation: 'spin 1s linear infinite'
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Audio Level Indicator */}
              {voiceActivity && audioLevel > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'grey.300',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      backgroundColor: 'success.main',
                      width: `${Math.min(100, audioLevel)}%`,
                      transition: 'width 0.1s ease'
                    }}
                  />
                </Box>
              )}
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
              {character?.name || 'AI Assistant'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {character?.role?.replace('_', ' ') || 'Conversational AI'}
            </Typography>

            {/* Enhanced Status with ARIA live region */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: getStatusColor(),
                fontWeight: 500,
                mb: 2
              }}
              aria-live="polite"
              aria-atomic="true"
              role="status"
            >
              {getStatusText()}
            </Typography>

            {/* Start Conversation Button */}
            {!isActive && isInitialized && sessionState !== 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={startConversation}
                  disabled={isStarting || !speechSupported}
                  startIcon={
                    isStarting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PlayCircle />
                    )
                  }
                  sx={{
                    mt: 2,
                    mb: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      boxShadow: '0 4px 8px 3px rgba(33, 203, 243, .4)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      color: 'grey.600',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {isStarting ? 'Starting Conversation...' : 'Start Voice Conversation'}
                </Button>
                
                {!speechSupported && (
                  <Alert severity="warning" sx={{ mt: 2, maxWidth: 400 }}>
                    Speech recognition is not supported in this browser. Voice conversation features will be limited.
                  </Alert>
                )}
              </motion.div>
            )}

            {/* Current User Transcript (Interim) */}
            {currentUserTranscript && (
              <Box
                sx={{
                  backgroundColor: 'grey.100',
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                  border: '1px dashed',
                  borderColor: 'primary.main'
                }}
              >
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                  You're saying...
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {currentUserTranscript}
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Real-Time Assessment - TO BE IMPLEMENTED IN SPRINT 1 */}
      {/* {isActive && transcript.length > 0 && showAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <RealTimeAssessment
            transcript={transcript}
            isMinimized={assessmentMinimized}
            onToggleMinimize={() => setAssessmentMinimized(!assessmentMinimized)}
          />
        </motion.div>
      )} */}

      {/* Enhanced Live Transcript */}
        {transcript.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                maxHeight: 250,
                overflow: 'auto'
              }}
              ref={conversationRef}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Live Transcript ({transcript.length} messages)
                </Typography>
                <Chip 
                  label={`${sessionState}`} 
                  size="small" 
                  color={sessionState === 'listening' ? 'success' : sessionState === 'speaking' ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Stack>
              
              <Stack spacing={2}>
                {transcript.slice(-8).map((entry, index) => (
                  <Box
                    key={entry.id || index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: entry.speaker === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        backgroundColor: entry.speaker === 'user' ? 'primary.main' : 'grey.200',
                        color: entry.speaker === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        p: 2,
                        borderBottomRightRadius: entry.speaker === 'user' ? 0 : 2,
                        borderBottomLeftRadius: entry.speaker === 'user' ? 2 : 0
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {entry.text}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        alignSelf: entry.speaker === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {entry.speaker === 'user' ? 'You' : (entry.characterName || character?.name)} • {
                        new Date(entry.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      }
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </motion.div>
        )}
      </Box>

      {/* Enhanced Control Buttons - Only show when conversation is active */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1.5, md: 2 }, 
            mb: 2,
            flexWrap: 'wrap',
            px: { xs: 2, md: 0 }
          }}>
          {/* Pause/Resume Button - Enhanced for Mobile */}
          <IconButton
            onClick={isPaused ? handleResume : handlePause}
            disabled={sessionState === 'error' || sessionState === 'initializing'}
            sx={{
              backgroundColor: isPaused ? 'warning.main' : 'background.paper',
              color: isPaused ? 'white' : 'text.primary',
              border: '2px solid',
              borderColor: isPaused ? 'warning.main' : 'grey.200',
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              minWidth: 44, // WCAG touch target minimum
              minHeight: 44,
              '&:hover': {
                backgroundColor: isPaused ? 'warning.dark' : 'grey.50',
                borderColor: isPaused ? 'warning.dark' : 'grey.300',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                transform: 'scale(1.05)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:disabled': {
                backgroundColor: 'grey.100',
                color: 'grey.400'
              },
              transition: 'all 0.2s ease'
            }}
            aria-label={isPaused ? 'Resume conversation' : 'Pause conversation'}
          >
            {isPaused ? <PlayArrow sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} /> : <Pause sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />}
          </IconButton>

          {/* Microphone Toggle Button - Enhanced for Mobile */}
          <IconButton
            onClick={() => {
              if (isRecognizing) {
                speechRecognitionRef.current?.stop()
              } else {
                speechRecognitionRef.current?.start()
              }
            }}
            disabled={sessionState === 'error' || sessionState === 'initializing' || !speechSupported}
            sx={{
              backgroundColor: isRecognizing ? 'success.main' : 'background.paper',
              color: isRecognizing ? 'white' : 'text.primary', 
              border: '2px solid',
              borderColor: isRecognizing ? 'success.main' : 'grey.200',
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              minWidth: 44, // WCAG touch target minimum
              minHeight: 44,
              '&:hover': {
                backgroundColor: isRecognizing ? 'success.dark' : 'grey.50',
                borderColor: isRecognizing ? 'success.dark' : 'grey.300',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                transform: 'scale(1.05)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:disabled': {
                backgroundColor: 'grey.100',
                color: 'grey.400'
              },
              transition: 'all 0.2s ease'
            }}
            aria-label={isRecognizing ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {isRecognizing ? <Mic sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} /> : <MicOff sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />}
          </IconButton>

          {/* Manual Character Response Trigger (fallback for speech recognition issues) */}
          <IconButton
            onClick={triggerFallbackCharacterResponse}
            disabled={sessionState === 'error' || sessionState === 'initializing' || isSpeaking}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              border: '1px solid',
              borderColor: 'primary.main',
              width: 64,
              height: 64,
              '&:hover': {
                backgroundColor: 'primary.dark',
                borderColor: 'primary.dark',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              },
              '&:disabled': {
                backgroundColor: 'grey.100',
                color: 'grey.400'
              }
            }}
            title="Trigger AI Response (if speech recognition fails)"
          >
            <SmartToy sx={{ fontSize: '2rem' }} />
          </IconButton>

          {/* End Conversation Button - Enhanced for Mobile */}
          <IconButton
            onClick={handleEndConversation}
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              border: '2px solid',
              borderColor: 'error.main',
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              minWidth: 44, // WCAG touch target minimum
              minHeight: 44,
              '&:hover': {
                backgroundColor: 'error.dark',
                borderColor: 'error.dark',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                transform: 'scale(1.05)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              transition: 'all 0.2s ease'
            }}
            aria-label="End conversation"
          >
            <CallEnd sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
          </IconButton>
        </Box>
        </motion.div>
      )}

      {/* Status Text - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Stack spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ textAlign: 'center' }}
          >
            {sessionState === 'error' && 'Please check your connection and try again'}
            {isStarting && 'Setting up your conversation...'}
            {sessionState === 'initializing' && 'Initializing voice services...'}
            {sessionState === 'ready' && 'Ready to start speaking'}
            {sessionState === 'listening' && 'Speak naturally • AI will respond automatically'}
            {sessionState === 'speaking' && `${character?.name || 'AI'} is responding...`}
            {sessionState === 'processing' && 'Processing your message...'}
            {isPaused && 'Conversation paused • Click play to resume'}
            {!isActive && isInitialized && sessionState !== 'error' && !isStarting && 'Click the button above to start your voice conversation'}
            {!isInitialized && 'Loading conversation interface...'}
          </Typography>

          {/* Connection Quality Indicator */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? 'success.main' : 
                                connectionStatus === 'disconnected' ? 'error.main' : 'warning.main',
                animation: connectionStatus === 'connecting' ? 'pulse 1s infinite' : 'none'
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
              {connectionStatus === 'connecting' && 'Connecting...'}
            </Typography>
            
            {speechSupported && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Chip 
                  icon={<Mic />}
                  label="Speech Enabled" 
                  size="small" 
                  variant="outlined"
                  color="success"
                />
              </>
            )}
          </Stack>
        </Stack>
      </motion.div>

      {/* Enhanced Global Styles for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(25, 118, 210, 0.1);
            transform: scale(1.05);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
            transform: scale(1);
          }
        }

        @keyframes breathe {
          0% { 
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(76, 175, 80, 0.1);
            transform: scale(1.02);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
            transform: scale(1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Real-Time Assessment removed per PRD Sprint 1 scope correction */}
    </Container>
  )
}

export default VoiceConversation