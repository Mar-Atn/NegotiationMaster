import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material'
import { motion } from 'framer-motion'

const SkillAnalysisCard = ({ title, score, icon, description, analysis, color = 'primary' }) => {
  const getScoreLevel = (score) => {
    if (score >= 85) return { level: 'Excellent', color: 'success', gradient: 'linear-gradient(135deg, #4caf50, #81c784)' }
    if (score >= 75) return { level: 'Advanced', color: 'primary', gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)' }
    if (score >= 65) return { level: 'Proficient', color: 'info', gradient: 'linear-gradient(135deg, #00acc1, #4dd0e1)' }
    if (score >= 50) return { level: 'Developing', color: 'warning', gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)' }
    return { level: 'Learning', color: 'error', gradient: 'linear-gradient(135deg, #f44336, #ef5350)' }
  }

  const level = getScoreLevel(score)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card sx={{ height: '100%', border: 2, borderColor: `${color}.main` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: `${color}.main` }}>
                {icon}
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
            </Box>
            <Chip 
              label={`${score}%`}
              color={level.color}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={score} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              mb: 2,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: level.gradient
              }
            }}
          />
          
          <Typography variant="body2" color={`${level.color}.main`} fontWeight="medium">
            {level.level} - {analysis?.assessment || 'Performance analysis will be shown here'}
          </Typography>
          
          {analysis?.developmentFocus && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Focus: {analysis.developmentFocus}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SkillAnalysisCard