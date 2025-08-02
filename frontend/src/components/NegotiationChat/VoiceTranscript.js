import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Fade
} from '@mui/material'
import {
  Mic,
  Hearing
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const VoiceTranscript = ({ 
  text = '', 
  isInterim = false,
  isListening = false,
  confidence = 0 
}) => {
  if (!text && !isListening) return null

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isInterim ? 'info.light' : 'success.light',
              color: 'white',
              borderRadius: 2,
              border: 2,
              borderColor: isInterim ? 'info.main' : 'success.main',
              position: 'relative'
            }}
          >
            {/* Listening indicator */}
            {isListening && !text && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Hearing sx={{ fontSize: 20 }} />
                </motion.div>
                <Typography variant="body2">
                  Listening...
                </Typography>
              </Box>
            )}

            {/* Transcript text */}
            {text && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <motion.div
                    animate={isInterim ? { opacity: [1, 0.6, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Mic sx={{ fontSize: 18, mt: 0.2 }} />
                  </motion.div>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      flex: 1,
                      fontStyle: isInterim ? 'italic' : 'normal',
                      opacity: isInterim ? 0.9 : 1
                    }}
                  >
                    {text}
                  </Typography>
                </Box>

                {/* Status indicators */}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {isInterim ? 'Transcribing...' : 'Speech recognized'}
                  </Typography>
                  
                  {confidence > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {Math.round(confidence * 100)}% confidence
                    </Typography>
                  )}
                </Box>

                {/* Progress indicator for interim results */}
                {isInterim && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: 2,
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      borderRadius: '0 0 8px 8px'
                    }}
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </>
            )}
          </Paper>
          
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
              textAlign: 'right'
            }}
          >
            {isInterim ? 'Processing...' : 'Voice input'}
          </Typography>
        </Box>
      </Box>
    </Fade>
  )
}

export default VoiceTranscript