import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Badge,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress
} from '@mui/material'
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  VolumeMute,
  PlayArrow,
  Pause,
  Stop,
  RadioButtonChecked,
  Settings,
  GraphicEq
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import voiceService from '../../services/voiceService'

const VoiceControls = ({ 
  negotiationId, 
  disabled = false, 
  onModeChange,
  isVoiceMode = false 
}) => {
  const [recordingState, setRecordingState] = useState({ isRecording: false, isPaused: false })
  const [playbackState, setPlaybackState] = useState({ isPlaying: false, queueLength: 0 })
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [voiceActivity, setVoiceActivity] = useState({ isActive: false, volume: 0 })
  const [error, setError] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    // Set up voice service listeners
    voiceService.onRecordingStateChange(setRecordingState)
    voiceService.onPlaybackStateChange(setPlaybackState)
    voiceService.onVolumeChange(setVolume)
    voiceService.onMuteChange(setIsMuted)
    voiceService.onVoiceActivity(setVoiceActivity)
    voiceService.onError((errorMessage) => {
      setError(errorMessage)
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
    })

    // Initialize audio settings
    const settings = voiceService.getAudioSettings()
    setVolume(settings.volume)
    setIsMuted(settings.isMuted)

    return () => {
      // Cleanup would be handled by the service itself
    }
  }, [])

  const handleStartRecording = async () => {
    try {
      setError(null)
      await voiceService.startRecording(negotiationId)
    } catch (error) {
      setError('Failed to start recording: ' + error.message)
    }
  }

  const handleStopRecording = () => {
    voiceService.stopRecording()
  }

  const handlePauseRecording = () => {
    if (recordingState.isPaused) {
      voiceService.resumeRecording()
    } else {
      voiceService.pauseRecording()
    }
  }

  const handleVolumeChange = (event, newValue) => {
    voiceService.setVolume(newValue / 100)
  }

  const handleMuteToggle = () => {
    voiceService.toggleMute()
  }

  const handleModeToggle = (event) => {
    if (onModeChange) {
      onModeChange(event.target.checked)
    }
  }

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeOff />
    if (volume < 0.3) return <VolumeDown />
    return <VolumeUp />
  }

  const getRecordingColor = () => {
    if (recordingState.isRecording) {
      return recordingState.isPaused ? 'warning' : 'error'
    }
    return 'default'
  }

  const RecordingIndicator = () => (
    <AnimatePresence>
      {recordingState.isRecording && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Badge
            badgeContent={
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <RadioButtonChecked 
                  sx={{ 
                    fontSize: 12, 
                    color: recordingState.isPaused ? 'warning.main' : 'error.main' 
                  }} 
                />
              </motion.div>
            }
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box />
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const VoiceActivityIndicator = () => (
    <Box
      sx={{
        width: 4,
        height: 24,
        backgroundColor: 'grey.300',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: voiceActivity.isActive ? '#4caf50' : '#2196f3',
          borderRadius: 2
        }}
        animate={{
          height: `${Math.min(100, (voiceActivity.volume / 100) * 100)}%`
        }}
        transition={{ duration: 0.1 }}
      />
    </Box>
  )

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: isVoiceMode ? 2 : 1,
        borderColor: isVoiceMode ? 'primary.main' : 'divider'
      }}
    >
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Chip
              label={error}
              color="error"
              variant="outlined"
              size="small"
              sx={{ mb: 2, fontSize: '0.75rem' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Mode Toggle */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isVoiceMode}
              onChange={handleModeToggle}
              color="primary"
              disabled={disabled}
            />
          }
          label={
            <Typography variant="body2" color={isVoiceMode ? 'primary' : 'text.secondary'}>
              Voice Mode
            </Typography>
          }
        />
      </Box>

      {/* Main Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {/* Recording Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ position: 'relative' }}>
            <Tooltip 
              title={
                recordingState.isRecording 
                  ? (recordingState.isPaused ? 'Resume Recording' : 'Stop Recording')
                  : 'Start Recording'
              }
            >
              <span>
                <IconButton
                  onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
                  disabled={disabled || !isVoiceMode}
                  color={getRecordingColor()}
                  size="large"
                >
                  {recordingState.isRecording ? <Stop /> : <Mic />}
                </IconButton>
              </span>
            </Tooltip>
            <RecordingIndicator />
          </Box>

          {recordingState.isRecording && (
            <Tooltip title={recordingState.isPaused ? 'Resume' : 'Pause'}>
              <IconButton
                onClick={handlePauseRecording}
                disabled={disabled}
                color={recordingState.isPaused ? 'primary' : 'default'}
                size="small"
              >
                {recordingState.isPaused ? <PlayArrow /> : <Pause />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Voice Activity */}
        {isVoiceMode && <VoiceActivityIndicator />}

        {/* Volume Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 100 }}>
          <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              onClick={handleMuteToggle}
              disabled={disabled}
              size="small"
              color={isMuted ? 'error' : 'default'}
            >
              {isMuted ? <VolumeMute /> : getVolumeIcon()}
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, mx: 1 }}>
            <Slider
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              disabled={disabled || isMuted}
              size="small"
              min={0}
              max={100}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16
                }
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
            {isMuted ? 0 : Math.round(volume * 100)}%
          </Typography>
        </Box>
      </Box>

      {/* Status Indicators */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {/* Recording Status */}
        {recordingState.isRecording && (
          <Chip
            icon={<Mic />}
            label={recordingState.isPaused ? 'Paused' : 'Recording'}
            color={recordingState.isPaused ? 'warning' : 'error'}
            variant="outlined"
            size="small"
          />
        )}

        {/* Playback Status */}
        {playbackState.isPlaying && (
          <Chip
            icon={<PlayArrow />}
            label="Playing AI Response"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}

        {/* Queue Status */}
        {playbackState.queueLength > 0 && (
          <Chip
            label={`${playbackState.queueLength} queued`}
            color="info"
            variant="outlined"
            size="small"
          />
        )}

        {/* Voice Activity */}
        {isVoiceMode && voiceActivity.isActive && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <Chip
              icon={<GraphicEq />}
              label="Voice Active"
              color="success"
              variant="filled"
              size="small"
            />
          </motion.div>
        )}
      </Box>

      {/* Advanced Settings Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Tooltip title="Advanced Settings">
          <IconButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="small"
            color={showAdvanced ? 'primary' : 'default'}
          >
            <Settings />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Advanced Audio Settings
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" display="block">
                    Silence Threshold
                  </Typography>
                  <Slider
                    defaultValue={20}
                    min={0}
                    max={100}
                    size="small"
                    disabled={disabled}
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" display="block">
                    Audio Quality
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    16kHz Mono
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  )
}

export default VoiceControls