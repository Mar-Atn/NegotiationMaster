import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import { RestartAlt, Home } from '@mui/icons-material'

const SimpleFeedback = ({ 
  feedbackData, 
  conversationTranscript = [], 
  onRestartScenario, 
  onBackToDashboard 
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  // Default mock data for demonstration
  const defaultData = {
    overallScore: 78,
    skills: {
      claimingValue: 82,
      creatingValue: 71,
      relationshipManagement: 85
    },
    improvements: [
      'Practice exploring underlying interests more deeply',
      'Work on generating multiple options before deciding',
      'Study market data preparation techniques'
    ]
  }

  const data = feedbackData || defaultData
  const transcript = conversationTranscript || [
    { speaker: 'You', message: 'I\'d like to discuss the pricing structure for this contract.' },
    { speaker: 'AI', message: 'I understand your position. Let\'s explore alternatives that work for both of us.' },
    { speaker: 'You', message: 'What flexibility do you have on the timeline?' },
    { speaker: 'AI', message: 'We could consider a phased approach that meets your budget constraints.' }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getPerformanceLevel = (score) => {
    if (score >= 80) return 'Good Performance'
    if (score >= 60) return 'Average Performance'
    return 'Needs Improvement'
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Post-Conversation Feedback
      </Typography>

      {/* Overall Performance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Performance: {data.overallScore}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={data.overallScore}
            color={getScoreColor(data.overallScore)}
            sx={{ height: 12, borderRadius: 6, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {getPerformanceLevel(data.overallScore)}
          </Typography>
        </CardContent>
      </Card>

      {/* 3-Skill Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3-Skill Breakdown
          </Typography>
          
          {/* Claiming Value */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Claiming Value</Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.skills.claimingValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.skills.claimingValue}
              color={getScoreColor(data.skills.claimingValue)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Creating Value */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Creating Value</Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.skills.creatingValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.skills.creatingValue}
              color={getScoreColor(data.skills.creatingValue)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Relationship Management */}
          <Box sx={{ mb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Relationship Management</Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.skills.relationshipManagement}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.skills.relationshipManagement}
              color={getScoreColor(data.skills.relationshipManagement)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Conversation Transcript */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Conversation Transcript
          </Typography>
          <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
            <List dense>
              {transcript.slice(0, showFullTranscript ? transcript.length : 4).map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${item.speaker}: ${item.message}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
            {transcript.length > 4 && (
              <Button
                size="small"
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                sx={{ mt: 1 }}
              >
                {showFullTranscript ? 'Show Less' : 'Show More...'}
              </Button>
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Improvement Suggestions
          </Typography>
          <List>
            {data.improvements.map((suggestion, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemText
                  primary={`• ${suggestion}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<RestartAlt />}
          onClick={onRestartScenario}
          sx={{ minWidth: 180 }}
        >
          Restart Scenario
        </Button>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={onBackToDashboard}
          sx={{ minWidth: 180 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  )
}

export default SimpleFeedback