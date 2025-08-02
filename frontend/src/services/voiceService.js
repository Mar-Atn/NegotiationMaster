import RecordRTC from 'recordrtc'
import socketService from './socketService'
import voiceApiService from './voiceApiService'

class VoiceService {
  constructor() {
    this.mediaRecorder = null
    this.audioStream = null
    this.recordRTC = null
    this.audioContext = null
    this.analyser = null
    this.dataArray = null
    this.isRecording = false
    this.isPaused = false
    this.volume = 0.8
    this.isMuted = false
    this.listeners = new Map()
    
    // Voice activity detection
    this.silenceThreshold = 20
    this.silenceTimeout = null
    this.voiceActivityCallback = null
    
    // Audio queue for playback
    this.audioQueue = []
    this.isPlaying = false
    
    // Conversational AI session management
    this.conversationalSessions = new Map()
    this.activeSessionId = null
    this.sessionState = 'idle' // idle, listening, speaking, processing
    this.conversationHistory = []
    
    // Speech recognition
    this.speechRecognitionSessions = new Map()
    this.currentTranscript = ''
    this.isTranscribing = false
    
    // Real-time audio streaming
    this.streamingActive = false
    this.audioChunkQueue = []
    this.chunkProcessingInterval = null
    
    // Don't initialize AudioContext immediately - wait for user gesture
    this.audioContextInitialized = false
    
    // Check browser compatibility immediately (doesn't require AudioContext)
    this.checkBrowserSupport()
    console.log('🎵 VoiceService initialized successfully')
    
    this.setupSocketListeners()
  }

  async initializeAudioContext() {
    if (this.audioContextInitialized) {
      return this.audioContext
    }

    try {
      // Check if AudioContext is supported
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        throw new Error('Web Audio API is not supported in this browser')
      }

      // Initialize Web Audio API context - this now requires user gesture
      this.audioContext = new AudioContext()
      
      // Check if context is suspended due to autoplay policy
      if (this.audioContext.state === 'suspended') {
        console.log('🔄 AudioContext suspended, attempting to resume...')
        await this.audioContext.resume()
        
        // Verify it actually resumed
        if (this.audioContext.state === 'suspended') {
          throw new Error('AudioContext could not be resumed. Please try clicking the button again.')
        }
      }
      
      this.audioContextInitialized = true
      console.log('🎵 AudioContext initialized successfully, state:', this.audioContext.state)
      return this.audioContext
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Audio initialization failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Audio permission denied. Please allow audio access and try again.'
      } else if (error.message.includes('suspended')) {
        errorMessage = 'Audio context suspended. Please interact with the page first.'
      } else if (error.message.includes('not supported')) {
        errorMessage = 'Your browser does not support Web Audio API. Please use a modern browser.'
      } else {
        errorMessage = `Audio initialization failed: ${error.message}`
      }
      
      this.notifyError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  checkBrowserSupport() {
    const features = {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      audioContext: !!(window.AudioContext || window.webkitAudioContext),
      webAudio: !!window.AudioContext,
    }

    console.log('🔍 Browser audio support:', features)
    
    if (!features.getUserMedia) {
      throw new Error('Browser does not support audio recording')
    }
    
    return features
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      })
      
      console.log('🎤 Microphone permission granted')
      return stream
    } catch (error) {
      console.error('❌ Microphone permission error:', error)
      
      // Provide specific error messages based on error type
      let errorMessage = 'Microphone access failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please check that you have a microphone connected.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application. Please close other apps using the microphone and try again.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Microphone does not meet the required specifications. Please try with a different microphone.'
      } else {
        errorMessage = `Microphone access failed: ${error.message}`
      }
      
      throw new Error(errorMessage)
    }
  }

  async startRecording(negotiationId) {
    try {
      if (this.isRecording) {
        console.warn('⚠️ Already recording')
        return
      }

      // Initialize AudioContext on first user interaction
      await this.initializeAudioContext()

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Get audio stream
      this.audioStream = await this.requestMicrophonePermission()
      
      // Initialize RecordRTC
      this.recordRTC = new RecordRTC(this.audioStream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=opus',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000, // Send chunks every 1 second
        ondataavailable: (blob) => {
          if (negotiationId && socketService.isConnected()) {
            this.streamAudioChunk(blob, negotiationId)
          }
        }
      })

      // Set up audio analysis for voice activity detection
      this.setupAudioAnalysis()
      
      // Start recording
      this.recordRTC.startRecording()
      this.isRecording = true
      this.isPaused = false
      
      console.log('🎙️ Voice recording started')
      this.notifyRecordingState('started')
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      this.notifyError('Failed to start voice recording')
      throw error
    }
  }

  stopRecording() {
    try {
      if (!this.isRecording) {
        console.warn('⚠️ Not currently recording')
        return
      }

      // Stop recording
      if (this.recordRTC) {
        this.recordRTC.stopRecording(() => {
          console.log('⏹️ Recording stopped')
        })
      }

      // Clean up streams
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop())
        this.audioStream = null
      }

      this.isRecording = false
      this.isPaused = false
      
      // Clear voice activity detection
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout)
        this.silenceTimeout = null
      }
      
      console.log('🔇 Voice recording stopped')
      this.notifyRecordingState('stopped')
      
    } catch (error) {
      console.error('❌ Failed to stop recording:', error)
      this.notifyError('Failed to stop voice recording')
    }
  }

  pauseRecording() {
    if (!this.isRecording || this.isPaused) return
    
    if (this.recordRTC) {
      this.recordRTC.pauseRecording()
      this.isPaused = true
      console.log('⏸️ Recording paused')
      this.notifyRecordingState('paused')
    }
  }

  resumeRecording() {
    if (!this.isRecording || !this.isPaused) return
    
    if (this.recordRTC) {
      this.recordRTC.resumeRecording()
      this.isPaused = false
      console.log('▶️ Recording resumed')
      this.notifyRecordingState('resumed')
    }
  }

  setupAudioAnalysis() {
    try {
      if (!this.audioContext) {
        console.warn('⚠️ AudioContext not initialized, skipping audio analysis')
        return
      }

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.8
      
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      
      // Connect audio stream to analyser
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      source.connect(this.analyser)
      
      // Start voice activity detection
      this.detectVoiceActivity()
      
    } catch (error) {
      console.error('❌ Failed to setup audio analysis:', error)
    }
  }

  detectVoiceActivity() {
    if (!this.analyser || !this.dataArray) return
    
    const checkActivity = () => {
      if (!this.isRecording) return
      
      this.analyser.getByteFrequencyData(this.dataArray)
      
      // Calculate average volume
      const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length
      const isVoiceActive = average > this.silenceThreshold
      
      // Notify voice activity
      if (this.voiceActivityCallback) {
        this.voiceActivityCallback({
          isActive: isVoiceActive,
          volume: average,
          frequencyData: Array.from(this.dataArray)
        })
      }
      
      // Handle silence detection
      if (isVoiceActive) {
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout)
          this.silenceTimeout = null
        }
      } else if (!this.silenceTimeout) {
        // Start silence timer
        this.silenceTimeout = setTimeout(() => {
          console.log('🤫 Voice silence detected')
          this.notifyVoiceEvent('silence_detected')
        }, 2000) // 2 seconds of silence
      }
      
      // Continue monitoring
      requestAnimationFrame(checkActivity)
    }
    
    checkActivity()
  }

  async streamAudioChunk(audioBlob, negotiationId) {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Send audio chunk via socket
      if (socketService.isConnected()) {
        socketService.getSocket().emit('voice-chunk', {
          negotiationId,
          audioData: Array.from(uint8Array),
          timestamp: Date.now(),
          format: 'webm/opus'
        })
      }
      
    } catch (error) {
      console.error('❌ Failed to stream audio chunk:', error)
    }
  }

  async playAudioResponse(audioData, format = 'mp3') {
    try {
      // Add to queue if currently playing
      if (this.isPlaying) {
        this.audioQueue.push({ audioData, format })
        return
      }
      
      this.isPlaying = true
      this.notifyPlaybackState('started')
      
      // Create audio blob
      const audioBlob = new Blob([audioData], { type: `audio/${format}` })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Create audio element
      const audio = new Audio(audioUrl)
      audio.volume = this.isMuted ? 0 : this.volume
      
      // Handle playback events
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl)
        this.isPlaying = false
        this.notifyPlaybackState('ended')
        
        // Play next in queue
        if (this.audioQueue.length > 0) {
          const next = this.audioQueue.shift()
          this.playAudioResponse(next.audioData, next.format)
        }
      })
      
      audio.addEventListener('error', (error) => {
        console.error('❌ Audio playback error:', error)
        URL.revokeObjectURL(audioUrl)
        this.isPlaying = false
        this.notifyError('Audio playback failed')
      })
      
      // Start playback
      await audio.play()
      console.log('🔊 Playing AI voice response')
      
    } catch (error) {
      console.error('❌ Failed to play audio response:', error)
      this.isPlaying = false
      this.notifyError('Failed to play voice response')
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    console.log('🔊 Volume set to:', this.volume)
    this.notifyVolumeChange(this.volume)
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    console.log('🔇 Mute toggled:', this.isMuted)
    this.notifyMuteChange(this.isMuted)
  }

  // Event listeners
  onRecordingStateChange(callback) {
    this.listeners.set('recordingState', callback)
  }

  onPlaybackStateChange(callback) {
    this.listeners.set('playbackState', callback)
  }

  onVoiceActivity(callback) {
    this.voiceActivityCallback = callback
  }

  onVolumeChange(callback) {
    this.listeners.set('volumeChange', callback)
  }

  onMuteChange(callback) {
    this.listeners.set('muteChange', callback)
  }

  onError(callback) {
    this.listeners.set('error', callback)
  }

  // Notification methods
  notifyRecordingState(state) {
    const callback = this.listeners.get('recordingState')
    if (callback) {
      callback({
        state,
        isRecording: this.isRecording,
        isPaused: this.isPaused,
        timestamp: Date.now()
      })
    }
  }

  notifyPlaybackState(state) {
    const callback = this.listeners.get('playbackState')
    if (callback) {
      callback({
        state,
        isPlaying: this.isPlaying,
        queueLength: this.audioQueue.length,
        timestamp: Date.now()
      })
    }
  }

  notifyVolumeChange(volume) {
    const callback = this.listeners.get('volumeChange')
    if (callback) callback(volume)
  }

  notifyMuteChange(muted) {
    const callback = this.listeners.get('muteChange')
    if (callback) callback(muted)
  }

  notifyVoiceEvent(event) {
    const callback = this.listeners.get('voiceEvent')
    if (callback) callback(event)
  }

  notifyError(message) {
    const callback = this.listeners.get('error')
    if (callback) callback(message)
  }

  /**
   * Setup Socket.IO listeners for conversational AI
   */
  setupSocketListeners() {
    socketService.onConnectionStatusChange((status) => {
      if (status.status === 'connected') {
        console.log('🔌 Socket connected, voice service ready')
      } else if (status.status === 'disconnected') {
        console.log('🔌 Socket disconnected, pausing voice sessions')
        this.pauseAllSessions()
      }
    })

    // Listen for conversational AI events
    if (socketService.getSocket()) {
      const socket = socketService.getSocket()
      
      socket.on('conversational-session-ready', (data) => {
        this.handleSessionReady(data)
      })
      
      socket.on('conversational-audio-chunk', (data) => {
        this.handleAudioChunk(data)
      })
      
      socket.on('conversational-transcript', (data) => {
        this.handleTranscript(data)
      })
      
      socket.on('conversational-speaking-status', (data) => {
        this.handleSpeakingStatus(data)
      })
      
      socket.on('conversational-session-ended', (data) => {
        this.handleSessionEnded(data)
      })
      
      socket.on('conversational-session-error', (data) => {
        this.handleSessionError(data)
      })
    }
  }

  /**
   * Initialize conversational AI session
   */
  async initializeConversationalSession(negotiationId, characterId, options = {}) {
    try {
      console.log('🤖 Initializing conversational AI session')
      
      // First initialize via WebSocket for real-time session management
      const sessionInitData = {
        negotiationId,
        characterId,
        options: {
          ...options,
          enableRealTimeTranscription: true,
          enableVoiceActivityDetection: true,
          language: 'en-US',
          audioFormat: 'webm/opus'
        }
      }

      // Use socketService for real-time session initialization
      const response = await socketService.initializeConversationalSession(sessionInitData)
      
      const sessionData = {
        sessionId: response.sessionId,
        conversationId: response.conversationId,
        characterName: response.characterName,
        negotiationId,
        characterId,
        state: 'initializing',
        startTime: Date.now(),
        history: [],
        isActive: true,
        options: sessionInitData.options
      }
      
      this.conversationalSessions.set(response.sessionId, sessionData)
      this.activeSessionId = response.sessionId
      this.sessionState = 'initializing'
      
      console.log('✅ Conversational session initialized:', response.sessionId)
      this.notifySessionStateChange('initialized', sessionData)
      
      return response
    } catch (error) {
      console.error('❌ Failed to initialize conversational session:', error)
      this.notifyError(`Conversational AI initialization failed: ${error.message}`)
      throw error
    }
  }

  /**
   * End conversational AI session
   */
  async endConversationalSession(sessionId) {
    try {
      if (!sessionId) sessionId = this.activeSessionId
      if (!sessionId) return
      
      console.log('🛑 Ending conversational AI session:', sessionId)
      
      // Call backend API to end session
      await voiceApiService.endConversationalSession(sessionId)
      
      // Clean up local session data
      const sessionData = this.conversationalSessions.get(sessionId)
      if (sessionData) {
        sessionData.isActive = false
        sessionData.endTime = Date.now()
      }
      
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = null
        this.sessionState = 'idle'
      }
      
      console.log('✅ Conversational session ended:', sessionId)
      this.notifySessionStateChange('ended', sessionData)
      
    } catch (error) {
      console.error('❌ Failed to end conversational session:', error)
      this.notifyError(`Failed to end conversational session: ${error.message}`)
    }
  }

  /**
   * Start conversational AI recording with real-time streaming
   */
  async startConversationalRecording(sessionId) {
    try {
      if (!sessionId) sessionId = this.activeSessionId
      if (!sessionId) {
        throw new Error('No active conversational session')
      }
      
      console.log('🎙️ Starting conversational recording for session:', sessionId)
      
      // Start regular recording
      await this.startRecording(null) // No negotiationId for conversational mode
      
      // Enable real-time streaming
      this.streamingActive = true
      this.sessionState = 'listening'
      
      // Start processing audio chunks for conversational AI
      this.startAudioChunkProcessing(sessionId)
      
      this.notifySessionStateChange('listening', { sessionId })
      
    } catch (error) {
      console.error('❌ Failed to start conversational recording:', error)
      this.notifyError(`Failed to start conversational recording: ${error.message}`)
      throw error
    }
  }

  /**
   * Stop conversational AI recording
   */
  stopConversationalRecording() {
    try {
      console.log('⏹️ Stopping conversational recording')
      
      this.stopRecording()
      this.streamingActive = false
      this.sessionState = 'idle'
      
      if (this.chunkProcessingInterval) {
        clearInterval(this.chunkProcessingInterval)
        this.chunkProcessingInterval = null
      }
      
      this.audioChunkQueue = []
      
      this.notifySessionStateChange('stopped', { sessionId: this.activeSessionId })
      
    } catch (error) {
      console.error('❌ Failed to stop conversational recording:', error)
      this.notifyError(`Failed to stop conversational recording: ${error.message}`)
    }
  }

  /**
   * Start processing audio chunks for conversational AI
   */
  startAudioChunkProcessing(sessionId) {
    if (this.chunkProcessingInterval) return
    
    this.chunkProcessingInterval = setInterval(async () => {
      if (this.audioChunkQueue.length > 0 && this.streamingActive) {
        const chunks = this.audioChunkQueue.splice(0, 3) // Process up to 3 chunks at once
        
        for (const chunk of chunks) {
          try {
            // Send audio chunk to conversational AI via socket
            if (socketService.isConnected()) {
              socketService.getSocket().emit('user-audio-chunk', {
                sessionId,
                audioData: Array.from(chunk.data),
                format: chunk.format || 'webm/opus',
                timestamp: chunk.timestamp
              })
            }
          } catch (error) {
            console.error('❌ Failed to send audio chunk:', error)
          }
        }
      }
    }, 100) // Process every 100ms for low latency
  }

  /**
   * Handle conversational session ready event
   */
  handleSessionReady(data) {
    console.log('✅ Conversational session ready:', data)
    
    const sessionData = this.conversationalSessions.get(data.sessionId)
    if (sessionData) {
      sessionData.state = 'ready'
      this.sessionState = 'ready'
    }
    
    this.notifySessionStateChange('ready', data)
  }

  /**
   * Handle incoming audio chunk from conversational AI
   */
  async handleAudioChunk(data) {
    try {
      if (data.sessionId === this.activeSessionId) {
        console.log('🔊 Received AI audio chunk:', data.chunkIndex || 'stream')
        
        this.sessionState = 'speaking'
        
        // Convert array back to Uint8Array and play
        const audioData = new Uint8Array(data.audioData)
        await this.playAudioResponse(audioData, data.format || 'mp3')
      }
    } catch (error) {
      console.error('❌ Failed to handle audio chunk:', error)
    }
  }

  /**
   * Handle transcript from conversational AI
   */
  handleTranscript(data) {
    console.log('📝 Received transcript:', data)
    
    if (data.sessionId === this.activeSessionId) {
      const transcript = {
        type: data.type, // 'user' or 'agent'
        content: data.transcript,
        timestamp: data.timestamp,
        isFinal: data.isFinal
      }
      
      // Update conversation history
      const sessionData = this.conversationalSessions.get(data.sessionId)
      if (sessionData) {
        if (data.isFinal) {
          sessionData.history.push(transcript)
        }
      }
      
      // Update current transcript if it's user speech
      if (data.type === 'user') {
        this.currentTranscript = data.transcript
        this.isTranscribing = !data.isFinal
      }
      
      this.notifyTranscript(transcript)
    }
  }

  /**
   * Handle speaking status from conversational AI
   */
  handleSpeakingStatus(data) {
    console.log('🗣️ Speaking status:', data)
    
    if (data.sessionId === this.activeSessionId) {
      if (data.isActive) {
        this.sessionState = 'speaking'
      } else {
        this.sessionState = 'listening'
      }
      
      this.notifySessionStateChange('speaking_status', {
        sessionId: data.sessionId,
        characterName: data.characterName,
        isActive: data.isActive
      })
    }
  }

  /**
   * Handle session ended event
   */
  handleSessionEnded(data) {
    console.log('🏁 Session ended:', data)
    
    const sessionData = this.conversationalSessions.get(data.sessionId)
    if (sessionData) {
      sessionData.isActive = false
      sessionData.endTime = Date.now()
      sessionData.metrics = data.metrics
    }
    
    if (this.activeSessionId === data.sessionId) {
      this.activeSessionId = null
      this.sessionState = 'idle'
    }
    
    this.notifySessionStateChange('ended', data)
  }

  /**
   * Handle session error event
   */
  handleSessionError(data) {
    console.error('❌ Session error:', data)
    
    const sessionData = this.conversationalSessions.get(data.sessionId)
    if (sessionData) {
      sessionData.state = 'error'
      sessionData.error = data.error
    }
    
    this.notifyError(`Conversational AI error: ${data.error}`)
    this.notifySessionStateChange('error', data)
  }

  /**
   * Pause all active sessions
   */
  pauseAllSessions() {
    for (const [sessionId, sessionData] of this.conversationalSessions.entries()) {
      if (sessionData.isActive) {
        console.log('⏸️ Pausing session due to connection loss:', sessionId)
        sessionData.state = 'paused'
      }
    }
    
    this.streamingActive = false
    this.sessionState = 'paused'
  }

  /**
   * Get active conversational session
   */
  getActiveSession() {
    if (!this.activeSessionId) return null
    return this.conversationalSessions.get(this.activeSessionId)
  }

  /**
   * Get conversation history for active session
   */
  getConversationHistory() {
    const activeSession = this.getActiveSession()
    return activeSession ? activeSession.history : []
  }

  /**
   * Get current session state
   */
  getSessionState() {
    return {
      state: this.sessionState,
      activeSessionId: this.activeSessionId,
      activeSessions: Array.from(this.conversationalSessions.keys()),
      currentTranscript: this.currentTranscript,
      isTranscribing: this.isTranscribing
    }
  }

  // Enhanced event listeners
  onSessionStateChange(callback) {
    this.listeners.set('sessionState', callback)
  }

  onTranscript(callback) {
    this.listeners.set('transcript', callback)
  }

  onConversationUpdate(callback) {
    this.listeners.set('conversationUpdate', callback)
  }

  // Enhanced notification methods
  notifySessionStateChange(state, data) {
    const callback = this.listeners.get('sessionState')
    if (callback) {
      callback({
        state,
        data,
        sessionState: this.sessionState,
        activeSessionId: this.activeSessionId,
        timestamp: Date.now()
      })
    }
  }

  notifyTranscript(transcript) {
    const callback = this.listeners.get('transcript')
    if (callback) callback(transcript)
  }

  notifyConversationUpdate(update) {
    const callback = this.listeners.get('conversationUpdate')
    if (callback) callback(update)
  }

  /**
   * Override streamAudioChunk to support conversational AI
   */
  async streamAudioChunk(audioBlob, negotiationId) {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      if (this.streamingActive && this.activeSessionId) {
        // Queue for conversational AI processing
        this.audioChunkQueue.push({
          data: uint8Array,
          format: 'webm/opus',
          timestamp: Date.now()
        })
      } else if (negotiationId) {
        // Send audio chunk via socket for traditional mode
        if (socketService.isConnected()) {
          socketService.getSocket().emit('voice-chunk', {
            negotiationId,
            audioData: Array.from(uint8Array),
            timestamp: Date.now(),
            format: 'webm/opus'
          })
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to stream audio chunk:', error)
    }
  }

  // Cleanup
  cleanup() {
    // End all active conversational sessions
    for (const sessionId of this.conversationalSessions.keys()) {
      this.endConversationalSession(sessionId)
    }
    
    this.stopRecording()
    
    if (this.chunkProcessingInterval) {
      clearInterval(this.chunkProcessingInterval)
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    
    this.audioQueue = []
    this.audioChunkQueue = []
    this.conversationalSessions.clear()
    this.speechRecognitionSessions.clear()
    this.listeners.clear()
    this.voiceActivityCallback = null
    
    console.log('🧹 VoiceService cleaned up')
  }

  // Getters
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused
    }
  }

  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.audioQueue.length
    }
  }

  getAudioSettings() {
    return {
      volume: this.volume,
      isMuted: this.isMuted,
      silenceThreshold: this.silenceThreshold
    }
  }
}

// Create singleton instance
const voiceService = new VoiceService()

export default voiceService