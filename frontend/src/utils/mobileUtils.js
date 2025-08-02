// Mobile utility functions for voice chat interface

export const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
}

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

export const getScreenOrientation = () => {
  if (screen.orientation) {
    return screen.orientation.type
  }
  // Fallback for older browsers
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

export const isLandscape = () => {
  return getScreenOrientation().includes('landscape')
}

export const isPortrait = () => {
  return getScreenOrientation().includes('portrait')
}

export const getViewportHeight = () => {
  // Use visualViewport if available for mobile keyboards
  if (window.visualViewport) {
    return window.visualViewport.height
  }
  return window.innerHeight
}

export const getTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1
}

// Voice-specific mobile utilities
export const getMobileVoiceConstraints = () => {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 16000
    }
  }

  if (isIOS()) {
    // iOS-specific optimizations
    constraints.audio.sampleSize = 16
    constraints.audio.latency = 0.01 // Low latency for iOS
  } else if (isAndroid()) {
    // Android-specific optimizations
    constraints.audio.sampleRate = 44100 // Android prefers 44.1kHz
    constraints.audio.latency = 0.02
  }

  return constraints
}

export const getMobileAudioContext = () => {
  // Handle iOS audio context unlock
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = new AudioContext()

  // Unlock audio context on user interaction (required for iOS)
  const unlockAudio = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('📱 Audio context unlocked for mobile')
      })
    }
    // Remove event listeners after unlock
    document.removeEventListener('touchstart', unlockAudio)
    document.removeEventListener('touchend', unlockAudio)
    document.removeEventListener('click', unlockAudio)
  }

  if (isMobileDevice()) {
    document.addEventListener('touchstart', unlockAudio, false)
    document.addEventListener('touchend', unlockAudio, false)
    document.addEventListener('click', unlockAudio, false)
  }

  return audioContext
}

export const optimizeForMobile = (component) => {
  if (!isMobileDevice()) return component

  // Mobile-specific CSS classes or styles
  const mobileStyles = {
    // Larger touch targets
    minTouchTarget: '44px',
    // Prevent zoom on input focus
    fontSize: '16px',
    // Optimize for mobile viewport
    maxHeight: '100vh',
    // Use hardware acceleration
    transform: 'translateZ(0)',
    willChange: 'transform'
  }

  return {
    ...component,
    style: {
      ...component.style,
      ...mobileStyles
    }
  }
}

// Haptic feedback for mobile devices
export const vibrate = (pattern = [100]) => {
  if ('vibrate' in navigator && isMobileDevice()) {
    navigator.vibrate(pattern)
  }
}

// Mobile-specific voice feedback
export const provideMobileVoiceFeedback = (action) => {
  switch (action) {
    case 'recording_start':
      vibrate([50])
      break
    case 'recording_stop':
      vibrate([100, 50, 100])
      break
    case 'message_sent':
      vibrate([25])
      break
    case 'message_received':
      vibrate([50, 25, 50])
      break
    case 'error':
      vibrate([200, 100, 200])
      break
    default:
      break
  }
}

// Wake lock for voice sessions (prevent device sleep)
export const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      console.log('📱 Wake lock active for voice session')
      return wakeLock
    } catch (err) {
      console.warn('📱 Wake lock failed:', err)
    }
  }
  return null
}

// Mobile performance monitoring
export const getMobilePerformanceInfo = () => {
  return {
    deviceMemory: navigator.deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'unknown',
    devicePixelRatio: getDevicePixelRatio(),
    viewportSize: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}