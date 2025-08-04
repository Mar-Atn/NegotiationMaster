import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket
    }

    // Connect to backend Socket.IO server
    // In development, connect directly to backend port since proxy doesn't work for WebSocket
    const socketUrl = process.env.NODE_ENV === 'development' 
      ? window.location.origin.replace(':3000', ':5001')
      : (process.env.REACT_APP_API_URL || window.location.origin)
    
    console.log('🔌 Connecting to Socket.IO server at:', socketUrl)
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    })

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket.id)
      this.notifyConnectionStatus('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason)
      this.notifyConnectionStatus('disconnected', reason)
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.socket.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Socket.IO connection error:', error)
      this.notifyConnectionStatus('error', error.message)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts')
      this.notifyConnectionStatus('reconnected', attemptNumber)
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('🔥 Socket.IO reconnection error:', error)
      this.notifyConnectionStatus('reconnect_error', error.message)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('💀 Socket.IO failed to reconnect')
      this.notifyConnectionStatus('reconnect_failed')
    })

    return this.socket
  }

  // Notify connection status changes to listeners
  notifyConnectionStatus(status, details = null) {
    const statusData = {
      status,
      details,
      timestamp: new Date().toISOString(),
      socketId: this.socket?.id
    }

    // Emit to any connection status listeners
    if (this.connectionStatusCallback) {
      this.connectionStatusCallback(statusData)
    }
  }

  // Set a callback for connection status changes
  onConnectionStatusChange(callback) {
    this.connectionStatusCallback = callback
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
      console.log('🔌 Socket.IO disconnected')
    }
  }

  // Join a negotiation room
  joinNegotiation(negotiationId) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot join negotiation room')
      return
    }

    this.socket.emit('join-negotiation', negotiationId)
    console.log('🏠 Joined negotiation room:', negotiationId)
  }

  // Leave a negotiation room
  leaveNegotiation(negotiationId) {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('leave-negotiation', negotiationId)
    console.log('🚪 Left negotiation room:', negotiationId)
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('📨 Received new message:', data)
      callback(data)
    }

    this.socket.on('new-message', wrappedCallback)
    this.listeners.set('new-message', wrappedCallback)
  }

  // Listen for AI typing indicators
  onAITyping(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('⌨️ AI typing status:', data)
      callback(data)
    }

    this.socket.on('ai-typing', wrappedCallback)
    this.listeners.set('ai-typing', wrappedCallback)
  }

  // Voice streaming methods
  streamVoiceChunk(negotiationId, audioData, metadata = {}) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot stream voice chunk')
      return
    }

    this.socket.emit('voice-chunk', {
      negotiationId,
      audioData,
      timestamp: Date.now(),
      format: metadata.format || 'webm/opus',
      sampleRate: metadata.sampleRate || 16000,
      channels: metadata.channels || 1,
      ...metadata
    })

    console.log('🎤 Streamed voice chunk:', audioData.length, 'bytes')
  }

  // Listen for AI voice responses
  onAIVoiceResponse(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🔊 Received AI voice response:', {
        negotiationId: data.negotiationId,
        audioSize: data.audioData?.length || 0,
        format: data.format
      })
      callback(data)
    }

    this.socket.on('ai-voice-response', wrappedCallback)
    this.listeners.set('ai-voice-response', wrappedCallback)
  }

  // Listen for speech-to-text results
  onSpeechToText(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('📝 Speech-to-text result:', {
        negotiationId: data.negotiationId,
        transcript: data.transcript,
        isFinal: data.isFinal,
        confidence: data.confidence
      })
      callback(data)
    }

    this.socket.on('speech-to-text', wrappedCallback)
    this.listeners.set('speech-to-text', wrappedCallback)
  }

  // Listen for AI speaking status
  onAISpeaking(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🗣️ AI speaking status:', data)
      callback(data)
    }

    this.socket.on('ai-speaking', wrappedCallback)
    this.listeners.set('ai-speaking', wrappedCallback)
  }

  // Listen for voice session events
  onVoiceSessionEvent(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🎵 Voice session event:', data)
      callback(data)
    }

    this.socket.on('voice-session-event', wrappedCallback)
    this.listeners.set('voice-session-event', wrappedCallback)
  }

  // Request voice synthesis for a message
  requestVoiceSynthesis(negotiationId, messageId, voiceSettings = {}) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot request voice synthesis')
      return
    }

    this.socket.emit('request-voice-synthesis', {
      negotiationId,
      messageId,
      voiceSettings: {
        voiceId: voiceSettings.voiceId || 'default',
        speed: voiceSettings.speed || 1.0,
        pitch: voiceSettings.pitch || 1.0,
        volume: voiceSettings.volume || 0.8,
        ...voiceSettings
      },
      timestamp: Date.now()
    })

    console.log('🎧 Requested voice synthesis for message:', messageId)
  }

  // Start voice session
  startVoiceSession(negotiationId, sessionConfig = {}) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot start voice session')
      return
    }

    this.socket.emit('start-voice-session', {
      negotiationId,
      config: {
        audioFormat: sessionConfig.audioFormat || 'webm/opus',
        sampleRate: sessionConfig.sampleRate || 16000,
        channels: sessionConfig.channels || 1,
        enableVAD: sessionConfig.enableVAD !== false, // Voice Activity Detection
        enableSTT: sessionConfig.enableSTT !== false, // Speech-to-Text
        enableTTS: sessionConfig.enableTTS !== false, // Text-to-Speech
        language: sessionConfig.language || 'en-US',
        ...sessionConfig
      },
      timestamp: Date.now()
    })

    console.log('🎙️ Started voice session for negotiation:', negotiationId)
  }

  // End voice session
  endVoiceSession(negotiationId) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot end voice session')
      return
    }

    this.socket.emit('end-voice-session', {
      negotiationId,
      timestamp: Date.now()
    })

    console.log('🔇 Ended voice session for negotiation:', negotiationId)
  }

  // Send voice activity detection data
  sendVoiceActivity(negotiationId, activityData) {
    if (!this.socket?.connected) return

    this.socket.emit('voice-activity', {
      negotiationId,
      isActive: activityData.isActive,
      volume: activityData.volume,
      timestamp: Date.now()
    })
  }

  // Conversational AI specific methods
  
  // Initialize conversational AI session
  initializeConversationalSession(sessionData) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot initialize conversational session')
      return Promise.reject(new Error('Socket not connected'))
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Conversational session initialization timeout'))
      }, 30000) // 30 second timeout

      this.socket.emit('initialize-conversational-session', sessionData, (response) => {
        clearTimeout(timeout)
        if (response.success) {
          console.log('✅ Conversational session initialized:', response.data.sessionId)
          resolve(response.data)
        } else {
          console.error('❌ Failed to initialize conversational session:', response.error)
          reject(new Error(response.error))
        }
      })
    })
  }

  // End conversational AI session
  endConversationalSession(sessionId) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot end conversational session')
      return
    }

    this.socket.emit('end-conversational-session', {
      sessionId,
      timestamp: Date.now()
    })

    console.log('🛑 Ended conversational session:', sessionId)
  }

  // Stream user audio chunk to conversational AI
  streamUserAudioChunk(sessionId, audioData, metadata = {}) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot stream user audio chunk')
      return
    }

    this.socket.emit('user-audio-chunk', {
      sessionId,
      audioData,
      timestamp: Date.now(),
      format: metadata.format || 'webm/opus',
      sampleRate: metadata.sampleRate || 16000,
      channels: metadata.channels || 1,
      ...metadata
    })
  }

  // Send user transcript to conversational AI
  sendUserTranscript(sessionId, transcript, isFinal = false) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot send user transcript')
      return
    }

    this.socket.emit('user-transcript', {
      sessionId,
      transcript,
      isFinal,
      timestamp: Date.now()
    })

    console.log('📝 Sent user transcript:', transcript, isFinal ? '(final)' : '(interim)')
  }

  // Request conversational AI response
  requestConversationalResponse(sessionId, message, options = {}) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot request conversational response')
      return
    }

    this.socket.emit('request-conversational-response', {
      sessionId,
      message,
      options,
      timestamp: Date.now()
    })

    console.log('🤖 Requested conversational response for session:', sessionId)
  }

  // Send conversation context update
  updateConversationContext(sessionId, context) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot update conversation context')
      return
    }

    this.socket.emit('update-conversation-context', {
      sessionId,
      context,
      timestamp: Date.now()
    })

    console.log('📋 Updated conversation context for session:', sessionId)
  }

  // Conversational AI Event Listeners

  // Listen for conversational session ready
  onConversationalSessionReady(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('✅ Conversational session ready:', data)
      callback(data)
    }

    this.socket.on('conversational-session-ready', wrappedCallback)
    this.listeners.set('conversational-session-ready', wrappedCallback)
  }

  // Listen for conversational audio chunks from AI
  onConversationalAudioChunk(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🔊 Received conversational audio chunk:', {
        sessionId: data.sessionId,
        audioSize: data.audioData?.length || 0,
        format: data.format,
        chunkIndex: data.chunkIndex
      })
      callback(data)
    }

    this.socket.on('conversational-audio-chunk', wrappedCallback)
    this.listeners.set('conversational-audio-chunk', wrappedCallback)
  }

  // Listen for conversational transcript updates
  onConversationalTranscript(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('📝 Conversational transcript update:', {
        sessionId: data.sessionId,
        type: data.type,
        transcript: data.transcript,
        isFinal: data.isFinal
      })
      callback(data)
    }

    this.socket.on('conversational-transcript', wrappedCallback)
    this.listeners.set('conversational-transcript', wrappedCallback)
  }

  // Listen for conversational speaking status
  onConversationalSpeakingStatus(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🗣️ Conversational speaking status:', data)
      callback(data)
    }

    this.socket.on('conversational-speaking-status', wrappedCallback)
    this.listeners.set('conversational-speaking-status', wrappedCallback)
  }

  // Listen for conversational session ended
  onConversationalSessionEnded(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('🏁 Conversational session ended:', data)
      callback(data)
    }

    this.socket.on('conversational-session-ended', wrappedCallback)
    this.listeners.set('conversational-session-ended', wrappedCallback)
  }

  // Listen for conversational session errors
  onConversationalSessionError(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.error('❌ Conversational session error:', data)
      callback(data)
    }

    this.socket.on('conversational-session-error', wrappedCallback)
    this.listeners.set('conversational-session-error', wrappedCallback)
  }

  // Listen for voice activity detection responses
  onVoiceActivityDetection(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('👂 Voice activity detection:', data)
      callback(data)
    }

    this.socket.on('voice-activity-detection', wrappedCallback)
    this.listeners.set('voice-activity-detection', wrappedCallback)
  }

  // Listen for conversation context updates
  onConversationContextUpdate(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('📋 Conversation context update:', data)
      callback(data)
    }

    this.socket.on('conversation-context-update', wrappedCallback)
    this.listeners.set('conversation-context-update', wrappedCallback)
  }

  // Listen for conversation analytics
  onConversationAnalytics(callback) {
    if (!this.socket) return

    const wrappedCallback = (data) => {
      console.log('📊 Conversation analytics:', data)
      callback(data)
    }

    this.socket.on('conversation-analytics', wrappedCallback)
    this.listeners.set('conversation-analytics', wrappedCallback)
  }

  // Remove all listeners for cleanup
  removeAllListeners() {
    if (!this.socket) return

    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback)
    })
    this.listeners.clear()
    console.log('🧹 Removed all Socket.IO listeners')
  }

  // Remove specific voice listeners
  removeVoiceListeners() {
    if (!this.socket) return

    const voiceEvents = [
      'ai-voice-response',
      'speech-to-text', 
      'ai-speaking',
      'voice-session-event',
      // Conversational AI events
      'conversational-session-ready',
      'conversational-audio-chunk',
      'conversational-transcript',
      'conversational-speaking-status',
      'conversational-session-ended',
      'conversational-session-error',
      'voice-activity-detection',
      'conversation-context-update',
      'conversation-analytics'
    ]

    voiceEvents.forEach(event => {
      const callback = this.listeners.get(event)
      if (callback) {
        this.socket.off(event, callback)
        this.listeners.delete(event)
      }
    })

    console.log('🎵 Removed voice-specific Socket.IO listeners')
  }

  // Remove conversational AI listeners specifically
  removeConversationalListeners() {
    if (!this.socket) return

    const conversationalEvents = [
      'conversational-session-ready',
      'conversational-audio-chunk',
      'conversational-transcript',
      'conversational-speaking-status',
      'conversational-session-ended',
      'conversational-session-error',
      'voice-activity-detection',
      'conversation-context-update',
      'conversation-analytics'
    ]

    conversationalEvents.forEach(event => {
      const callback = this.listeners.get(event)
      if (callback) {
        this.socket.off(event, callback)
        this.listeners.delete(event)
      }
    })

    console.log('🤖 Removed conversational AI Socket.IO listeners')
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket
  }

  // Voice-specific helper methods
  isVoiceSessionActive(negotiationId) {
    // This would need to be tracked on the client side
    // or requested from the server
    return this.socket?.connected || false
  }

  getVoiceSessionStatus(negotiationId) {
    // Return cached voice session status
    return {
      isActive: this.isVoiceSessionActive(negotiationId),
      isRecording: false, // Would be managed by VoiceService
      isPlaying: false,   // Would be managed by VoiceService
      connectionQuality: this.socket?.connected ? 'good' : 'poor'
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()

export default socketService