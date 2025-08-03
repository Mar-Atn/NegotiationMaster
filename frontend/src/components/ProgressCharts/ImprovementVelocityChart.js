import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'

const ImprovementVelocityChart = ({ 
  trends = {},
  title = "Improvement Velocity by Skill",
  height = 250
}) => {
  const theme = useTheme()

  const skillLabels = {
    claiming_value: 'Claiming Value',
    creating_value: 'Creating Value',
    relationship: 'Relationship Mgmt',
    overall: 'Overall'
  }

  const data = Object.entries(trends).map(([skill, trend]) => ({
    skill: skillLabels[skill] || skill,
    improvement: trend.total_improvement || 0,
    sessions: trend.sessions_analyzed || 0,
    direction: trend.trend_direction || 'stable'
  }))

  const getBarColor = (direction, value) => {
    if (direction === 'improving' || value > 0) return theme.palette.success.main
    if (direction === 'declining' || value < 0) return theme.palette.error.main
    return theme.palette.grey[400]
  }

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp color="success" fontSize="small" />
      case 'declining':
        return <TrendingDown color="error" fontSize="small" />
      default:
        return <TrendingFlat color="disabled" fontSize="small" />
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {getTrendIcon(data.direction)}
            <Typography variant="subtitle2" sx={{ ml: 1 }}>
              {label}
            </Typography>
          </Box>
          <Typography variant="body2">
            Improvement: {data.improvement > 0 ? '+' : ''}{data.improvement.toFixed(1)} points
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Based on {data.sessions} sessions
          </Typography>
        </Card>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box 
            sx={{ 
              height, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography>No improvement data available</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="skill" 
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="improvement" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.direction, entry.improvement)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Trend indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
          {data.map((item) => (
            <Box key={item.skill} sx={{ display: 'flex', alignItems: 'center' }}>
              {getTrendIcon(item.direction)}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {item.skill}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ImprovementVelocityChart