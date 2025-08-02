import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { motion } from 'framer-motion'

const AudioVisualizer = ({ 
  voiceActivity = { isActive: false, volume: 0, frequencyData: [] },
  isRecording = false,
  isPlaying = false,
  height = 80,
  barCount = 32,
  color = '#2196f3',
  showLabels = true
}) => {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        setDimensions({ width: rect.width, height })
        canvas.width = rect.width
        canvas.height = height
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height: canvasHeight } = dimensions

    if (width === 0 || canvasHeight === 0) return

    const drawVisualization = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, canvasHeight)

      const barWidth = width / barCount
      const centerY = canvasHeight / 2

      if (voiceActivity.frequencyData && voiceActivity.frequencyData.length > 0) {
        // Draw frequency bars
        const frequencyData = voiceActivity.frequencyData
        const dataStep = Math.floor(frequencyData.length / barCount)

        for (let i = 0; i < barCount; i++) {
          const dataIndex = i * dataStep
          const value = frequencyData[dataIndex] || 0
          const normalizedValue = value / 255
          const barHeight = normalizedValue * (canvasHeight - 20)

          const x = i * barWidth
          const y = centerY - barHeight / 2

          // Create gradient
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          
          if (isRecording && voiceActivity.isActive) {
            gradient.addColorStop(0, '#ff5722') // Orange-red for active recording
            gradient.addColorStop(1, '#ff9800') // Orange
          } else if (isPlaying) {
            gradient.addColorStop(0, '#4caf50') // Green for playback
            gradient.addColorStop(1, '#8bc34a') // Light green
          } else {
            gradient.addColorStop(0, color)
            gradient.addColorStop(1, color + '80') // Add transparency
          }

          ctx.fillStyle = gradient
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight)

          // Add glow effect for active states
          if ((isRecording && voiceActivity.isActive) || isPlaying) {
            ctx.shadowColor = isRecording ? '#ff5722' : '#4caf50'
            ctx.shadowBlur = 10
            ctx.fillRect(x + 1, y, barWidth - 2, barHeight)
            ctx.shadowBlur = 0
          }
        }
      } else {
        // Draw idle visualization
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth
          const idleHeight = 4 + Math.sin((Date.now() * 0.001) + i * 0.5) * 2
          const y = centerY - idleHeight / 2

          ctx.fillStyle = color + '40' // Semi-transparent
          ctx.fillRect(x + 1, y, barWidth - 2, idleHeight)
        }
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawVisualization)
    }

    drawVisualization()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions, voiceActivity, isRecording, isPlaying, barCount, color])

  const getStatusText = () => {
    if (isRecording && voiceActivity.isActive) return 'Recording - Voice Active'
    if (isRecording) return 'Recording - Listening'
    if (isPlaying) return 'Playing AI Response'
    return 'Audio Idle'
  }

  const getStatusColor = () => {
    if (isRecording && voiceActivity.isActive) return 'error.main'
    if (isRecording) return 'warning.main'
    if (isPlaying) return 'success.main'
    return 'text.secondary'
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider'
      }}
    >
      {showLabels && (
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Audio Visualizer
          </Typography>
          <motion.div
            animate={{ 
              scale: (isRecording && voiceActivity.isActive) || isPlaying ? [1, 1.05, 1] : 1 
            }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: getStatusColor(),
                fontWeight: (isRecording && voiceActivity.isActive) || isPlaying ? 'bold' : 'normal'
              }}
            >
              {getStatusText()}
            </Typography>
          </motion.div>
        </Box>
      )}

      <Box 
        sx={{ 
          width: '100%', 
          height: height,
          borderRadius: 1,
          backgroundColor: 'grey.50',
          border: 1,
          borderColor: 'grey.200',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />

        {/* Volume Level Overlay */}
        {voiceActivity.volume > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1,
              borderRadius: 1,
              fontSize: '0.75rem'
            }}
          >
            {Math.round(voiceActivity.volume)}%
          </Box>
        )}

        {/* Activity Indicator */}
        {(isRecording || isPlaying) && (
          <motion.div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRecording ? '#ff5722' : '#4caf50'
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </Box>

      {/* Technical Info */}
      {showLabels && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {barCount} bars • {voiceActivity.frequencyData?.length || 0} samples
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isRecording ? 'Input' : isPlaying ? 'Output' : 'Idle'}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

// Mini version for compact display
export const MiniAudioVisualizer = ({ 
  voiceActivity, 
  isRecording, 
  isPlaying,
  size = 24 
}) => {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = size / 2 - 2

    const drawMiniVisualization = () => {
      ctx.clearRect(0, 0, size, size)

      if (voiceActivity.isActive || isPlaying) {
        // Active visualization - pulsing circle
        const activity = voiceActivity.volume / 100
        const radius = maxRadius * (0.3 + activity * 0.7)
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        
        if (isRecording && voiceActivity.isActive) {
          gradient.addColorStop(0, '#ff5722')
          gradient.addColorStop(1, '#ff572240')
        } else if (isPlaying) {
          gradient.addColorStop(0, '#4caf50')
          gradient.addColorStop(1, '#4caf5040')
        } else {
          gradient.addColorStop(0, '#2196f3')
          gradient.addColorStop(1, '#2196f340')
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Idle visualization - small static circle
        ctx.fillStyle = '#ccc'
        ctx.beginPath()
        ctx.arc(centerX, centerY, maxRadius * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(drawMiniVisualization)
    }

    drawMiniVisualization()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [voiceActivity, isRecording, isPlaying, size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%'
      }}
    />
  )
}

export default AudioVisualizer