import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Balance,
  Psychology,
  Timer,
  EmojiEvents
} from '@mui/icons-material'

const NegotiationProgress = ({ negotiation, scenario }) => {
  if (!negotiation) return null

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getProgressColor = (value) => {
    if (value >= 70) return 'success'
    if (value >= 50) return 'warning'
    return 'error'
  }

  // Mock progress data - replace with actual data from negotiation
  const progress = {
    claimingValue: negotiation.claimingValueScore || 0,
    creatingValue: negotiation.creatingValueScore || 0,
    relationshipManagement: negotiation.relationshipScore || 0,
    overallScore: negotiation.overallScore || 0,
    turnsRemaining: negotiation.turnsRemaining || 10,
    maxTurns: scenario?.maxTurns || 15
  }

  const insights = negotiation.insights || [
    { type: 'strength', text: 'Good opening position' },
    { type: 'opportunity', text: 'Consider value creation' },
    { type: 'risk', text: 'Watch relationship dynamics' }
  ]

  const getInsightIcon = (type) => {
    switch (type) {
      case 'strength': return <TrendingUp color="success" />
      case 'opportunity': return <Balance color="info" />
      case 'risk': return <TrendingDown color="error" />
      default: return <Psychology />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'strength': return 'success'
      case 'opportunity': return 'info'
      case 'risk': return 'error'
      default: return 'default'
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        {/* Overall Score */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" color={`${getScoreColor(progress.overallScore)}.main`}>
            {progress.overallScore}%
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overall Performance
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Progress Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Claiming Value</Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.claimingValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.claimingValue}
              color={getProgressColor(progress.claimingValue)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Creating Value</Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.creatingValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.creatingValue}
              color={getProgressColor(progress.creatingValue)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Relationship Management</Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.relationshipManagement}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.relationshipManagement}
              color={getProgressColor(progress.relationshipManagement)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Session Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Info
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Timer sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              {progress.turnsRemaining} / {progress.maxTurns} turns remaining
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((progress.maxTurns - progress.turnsRemaining) / progress.maxTurns) * 100}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* AI Insights */}
        <Box>
          <Typography variant="h6" gutterBottom>
            AI Insights
          </Typography>
          <List dense>
            {insights.map((insight, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getInsightIcon(insight.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {insight.text}
                      </Typography>
                      <Chip
                        size="small"
                        label={insight.type}
                        color={getInsightColor(insight.type)}
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  )
}

export default NegotiationProgress