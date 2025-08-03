import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import { format } from 'date-fns'

const SkillProgressionChart = ({ 
  data = [], 
  title = "Skill Progression Over Time", 
  skills = ['claiming_value', 'creating_value', 'relationship'],
  height = 300,
  showLegend = true 
}) => {
  const theme = useTheme()

  const skillConfig = {
    claiming_value: {
      name: 'Claiming Value',
      color: theme.palette.primary.main,
      strokeWidth: 2
    },
    creating_value: {
      name: 'Creating Value',
      color: theme.palette.success.main,
      strokeWidth: 2
    },
    relationship: {
      name: 'Relationship Management',
      color: theme.palette.info.main,
      strokeWidth: 2
    },
    overall: {
      name: 'Overall Score',
      color: theme.palette.secondary.main,
      strokeWidth: 3
    }
  }

  const formatTooltipValue = (value, name) => {
    return [`${Math.round(value)}%`, skillConfig[name]?.name || name]
  }

  const formatXAxisLabel = (tickItem) => {
    try {
      return format(new Date(tickItem), 'MMM dd')
    } catch {
      return tickItem
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="textSecondary">
            {format(new Date(label), 'MMM dd, yyyy')}
          </Typography>
          {payload.map((entry) => (
            <Box key={entry.dataKey} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  mr: 1
                }}
              />
              <Typography variant="body2">
                {skillConfig[entry.dataKey]?.name || entry.dataKey}: {Math.round(entry.value)}%
              </Typography>
            </Box>
          ))}
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
            <Typography>No progression data available</Typography>
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="created_at" 
              tickFormatter={formatXAxisLabel}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              domain={[0, 100]}
              stroke={theme.palette.text.secondary}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            
            {skills.map((skill) => (
              <Line
                key={skill}
                type="monotone"
                dataKey={skill}
                stroke={skillConfig[skill]?.color || theme.palette.primary.main}
                strokeWidth={skillConfig[skill]?.strokeWidth || 2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={skillConfig[skill]?.name || skill}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default SkillProgressionChart