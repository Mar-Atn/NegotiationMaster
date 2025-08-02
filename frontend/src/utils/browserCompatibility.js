// Browser compatibility checks and polyfills for voice features

export const BrowserSupport = {
  // Check if browser supports required APIs
  checkSupport() {
    const support = {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      audioContext: !!(window.AudioContext || window.webkitAudioContext),
      webRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection),
      websockets: !!window.WebSocket,
      mediaRecorder: !!window.MediaRecorder,
      audioWorklet: !!(window.AudioContext && AudioContext.prototype.audioWorklet),
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speechSynthesis: !!window.speechSynthesis,
      recordRTC: typeof RecordRTC !== 'undefined'
    }

    // Browser-specific checks
    const browser = this.getBrowserInfo()
    support.browser = browser

    // Version-specific compatibility
    if (browser.name === 'Safari' && browser.version < 14) {
      support.modernAudioFeatures = false
    }
    if (browser.name === 'Chrome' && browser.version < 80) {
      support.audioWorklet = false
    }
    if (browser.name === 'Firefox' && browser.version < 76) {
      support.mediaRecorder = false
    }

    console.log('🔍 Browser support analysis:', support)
    return support
  },

  getBrowserInfo() {
    const ua = navigator.userAgent
    let browser = { name: 'Unknown', version: 0 }

    // Chrome
    if (ua.includes('Chrome') && !ua.includes('Chromium')) {
      const match = ua.match(/Chrome\/(\d+)/)
      browser = { name: 'Chrome', version: match ? parseInt(match[1]) : 0 }
    }
    // Safari
    else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      const match = ua.match(/Version\/(\d+)/)
      browser = { name: 'Safari', version: match ? parseInt(match[1]) : 0 }
    }
    // Firefox
    else if (ua.includes('Firefox')) {
      const match = ua.match(/Firefox\/(\d+)/)
      browser = { name: 'Firefox', version: match ? parseInt(match[1]) : 0 }
    }
    // Edge
    else if (ua.includes('Edg')) {
      const match = ua.match(/Edg\/(\d+)/)
      browser = { name: 'Edge', version: match ? parseInt(match[1]) : 0 }
    }

    return browser
  },

  // Get polyfills and fallbacks
  getPolyfills() {
    const polyfills = []

    // getUserMedia polyfill
    if (!navigator.mediaDevices && navigator.getUserMedia) {
      navigator.mediaDevices = {
        getUserMedia: (constraints) => {
          const getUserMedia = navigator.getUserMedia || 
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia
          
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia not supported'))
          }

          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      polyfills.push('getUserMedia')
    }

    // AudioContext polyfill
    if (!window.AudioContext && window.webkitAudioContext) {
      window.AudioContext = window.webkitAudioContext
      polyfills.push('AudioContext')
    }

    // RTCPeerConnection polyfill
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = window.webkitRTCPeerConnection || 
                                window.mozRTCPeerConnection ||
                                window.msRTCPeerConnection
      if (window.RTCPeerConnection) {
        polyfills.push('RTCPeerConnection')
      }
    }

    console.log('🔧 Applied polyfills:', polyfills)
    return polyfills
  }
}

export const AudioCompatibility = {
  // Create compatible audio context
  createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    
    if (!AudioContext) {
      throw new Error('AudioContext not supported in this browser')
    }

    const context = new AudioContext()

    // Handle iOS/Safari audio context state
    if (context.state === 'suspended') {
      const resumeContext = () => {
        context.resume().then(() => {
          console.log('🎵 Audio context resumed')
        })
        document.removeEventListener('click', resumeContext)
        document.removeEventListener('touchstart', resumeContext)
      }
      
      document.addEventListener('click', resumeContext, { once: true })
      document.addEventListener('touchstart', resumeContext, { once: true })
    }

    return context
  },

  // Get supported audio formats
  getSupportedFormats() {
    const audio = document.createElement('audio')
    const formats = {
      mp3: audio.canPlayType('audio/mpeg') !== '',
      ogg: audio.canPlayType('audio/ogg') !== '',
      wav: audio.canPlayType('audio/wav') !== '',
      webm: audio.canPlayType('audio/webm') !== '',
      m4a: audio.canPlayType('audio/mp4') !== ''
    }

    console.log('🎵 Supported audio formats:', formats)
    return formats
  },

  // Get optimal audio settings for browser
  getOptimalSettings() {
    const browser = BrowserSupport.getBrowserInfo()
    let settings = {
      sampleRate: 44100,
      channelCount: 2,
      bitRate: 128000,
      format: 'webm'
    }

    // Browser-specific optimizations
    switch (browser.name) {
      case 'Safari':
        settings.format = 'mp4'
        settings.sampleRate = 48000
        break
      case 'Firefox':
        settings.format = 'ogg'
        break
      case 'Chrome':
        settings.format = 'webm'
        settings.sampleRate = 48000
        break
      default:
        settings.format = 'mp3' // Most compatible fallback
        break
    }

    console.log('⚙️ Optimal audio settings for', browser.name + ':', settings)
    return settings
  }
}

export const VoiceCompatibility = {
  // Check voice recognition support
  checkSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return {
      supported: !!SpeechRecognition,
      constructor: SpeechRecognition,
      continuous: true,
      interimResults: true
    }
  },

  // Check voice synthesis support
  checkSpeechSynthesis() {
    return {
      supported: !!window.speechSynthesis,
      voices: window.speechSynthesis ? window.speechSynthesis.getVoices() : [],
      instance: window.speechSynthesis
    }
  },

  // Create compatible speech recognition
  createSpeechRecognition() {
    const recognition = this.checkSpeechRecognition()
    
    if (!recognition.supported) {
      throw new Error('Speech recognition not supported in this browser')
    }

    const instance = new recognition.constructor()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'en-US'

    return instance
  },

  // Get voice synthesis with fallback
  getSpeechSynthesis() {
    const synthesis = this.checkSpeechSynthesis()
    
    if (!synthesis.supported) {
      console.warn('Speech synthesis not supported, using text-only mode')
      return null
    }

    return synthesis.instance
  }
}

export const ConnectionCompatibility = {
  // Check WebSocket support
  checkWebSocketSupport() {
    return {
      supported: !!window.WebSocket,
      constructor: window.WebSocket
    }
  },

  // Create WebSocket with fallbacks
  createWebSocket(url, protocols) {
    const support = this.checkWebSocketSupport()
    
    if (!support.supported) {
      throw new Error('WebSocket not supported in this browser')
    }

    const ws = new support.constructor(url, protocols)
    
    // Add connection monitoring
    ws.addEventListener('open', () => {
      console.log('🔗 WebSocket connected')
    })
    
    ws.addEventListener('error', (error) => {
      console.error('🔗 WebSocket error:', error)
    })
    
    ws.addEventListener('close', (event) => {
      console.log('🔗 WebSocket closed:', event.code, event.reason)
    })

    return ws
  }
}

// Main compatibility checker
export const checkBrowserCompatibility = () => {
  const support = BrowserSupport.checkSupport()
  const polyfills = BrowserSupport.getPolyfills()
  const audioFormats = AudioCompatibility.getSupportedFormats()
  const speechRecognition = VoiceCompatibility.checkSpeechRecognition()
  const speechSynthesis = VoiceCompatibility.checkSpeechSynthesis()
  const webSocket = ConnectionCompatibility.checkWebSocketSupport()

  const compatibilityReport = {
    overall: true,
    support,
    polyfills,
    audioFormats,
    speechRecognition,
    speechSynthesis,
    webSocket,
    recommendations: []
  }

  // Determine overall compatibility
  const criticalFeatures = [
    'mediaDevices',
    'getUserMedia', 
    'audioContext',
    'websockets'
  ]

  const missingCritical = criticalFeatures.filter(feature => !support[feature])
  if (missingCritical.length > 0) {
    compatibilityReport.overall = false
    compatibilityReport.recommendations.push({
      type: 'error',
      message: `Critical features missing: ${missingCritical.join(', ')}`
    })
  }

  // Add browser-specific recommendations
  const browser = support.browser
  if (browser.name === 'Safari' && browser.version < 14) {
    compatibilityReport.recommendations.push({
      type: 'warning',
      message: 'Safari version may have limited audio features. Consider updating to version 14+'
    })
  }

  if (!speechRecognition.supported) {
    compatibilityReport.recommendations.push({
      type: 'info',
      message: 'Speech recognition not available. Voice input will be disabled.'
    })
  }

  console.log('🔍 Browser compatibility report:', compatibilityReport)
  return compatibilityReport
}

// Initialize compatibility on module load
export const initializeCompatibility = () => {
  const report = checkBrowserCompatibility()
  
  if (!report.overall) {
    console.error('❌ Browser not fully compatible with voice features')
    return false
  }

  console.log('✅ Browser compatibility verified')
  return true
}