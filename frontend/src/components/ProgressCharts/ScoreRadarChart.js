import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'

const ScoreRadarChart = ({ 
  currentScores = {}, 
  bestScores = {},
  title = "Current vs Best Performance",
  height = 300
}) => {
  const theme = useTheme()

  const data = [
    {
      skill: 'Claiming Value',
      current: currentScores.claiming_value || 0,
      best: bestScores.claiming_value || 0,
      fullMark: 100
    },
    {
      skill: 'Creating Value',
      current: currentScores.creating_value || 0,
      best: bestScores.creating_value || 0,
      fullMark: 100
    },
    {
      skill: 'Relationship Mgmt',
      current: currentScores.relationship || 0,
      best: bestScores.relationship || 0,
      fullMark: 100
    }
  ]

  const hasData = data.some(item => item.current > 0 || item.best > 0)

  if (!hasData) {
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
            <Typography>No skill data available</Typography>
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
          <RadarChart data={data}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fontSize: 12, 
                fill: theme.palette.text.primary 
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ 
                fontSize: 10, 
                fill: theme.palette.text.secondary 
              }}
              tickCount={6}
            />
            <Radar
              name="Current Score"
              dataKey="current"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="Best Score"
              dataKey="best"
              stroke={theme.palette.success.main}
              fill={theme.palette.success.main}
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="line"
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ScoreRadarChart