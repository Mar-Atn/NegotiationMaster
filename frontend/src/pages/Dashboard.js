import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  const mockProgress = {
    claimingValue: 65,
    creatingValue: 72,
    managingRelationships: 68,
    overall: 68,
    scenariosCompleted: 3,
    totalScenarios: 7
  }

  const scenarios = [
    {
      id: 1,
      title: 'Salary Negotiation - Entry Level',
      difficulty: 1,
      completed: true,
      score: 78
    },
    {
      id: 2,
      title: 'Vendor Contract Renewal',
      difficulty: 2,
      completed: true,
      score: 65
    },
    {
      id: 3,
      title: 'Partnership Equity Split',
      difficulty: 3,
      completed: true,
      score: 72
    },
    {
      id: 4,
      title: 'International Joint Venture',
      difficulty: 4,
      completed: false,
      score: null
    },
    {
      id: 5,
      title: 'Crisis Acquisition Negotiation',
      difficulty: 5,
      completed: false,
      score: null
    },
    {
      id: 6,
      title: 'Labor Union Contract',
      difficulty: 6,
      completed: false,
      score: null
    },
    {
      id: 7,
      title: 'Multi-Party Government Contract',
      difficulty: 7,
      completed: false,
      score: null
    }
  ]

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'success'
    if (difficulty <= 4) return 'warning'
    return 'error'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 70) return 'warning'
    return 'error'
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Claiming Value
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockProgress.claimingValue}
                    color={getScoreColor(mockProgress.claimingValue)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {mockProgress.claimingValue}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Creating Value
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockProgress.creatingValue}
                    color={getScoreColor(mockProgress.creatingValue)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {mockProgress.creatingValue}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Managing Relationships
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockProgress.managingRelationships}
                    color={getScoreColor(mockProgress.managingRelationships)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {mockProgress.managingRelationships}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockProgress.overall}
                    color={getScoreColor(mockProgress.overall)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {mockProgress.overall}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {mockProgress.scenariosCompleted}/{mockProgress.totalScenarios} scenarios completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom>
        Negotiation Scenarios
      </Typography>
      
      <Grid container spacing={2}>
        {scenarios.map((scenario) => (
          <Grid item xs={12} md={6} lg={4} key={scenario.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={`Level ${scenario.difficulty}`}
                    size="small"
                    color={getDifficultyColor(scenario.difficulty)}
                  />
                  {scenario.completed && (
                    <Chip
                      label={`Score: ${scenario.score}`}
                      size="small"
                      color={getScoreColor(scenario.score)}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {scenario.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {scenario.completed ? 'Completed' : 'Available'}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  variant={scenario.completed ? 'outlined' : 'contained'}
                  disabled={!scenario.completed && scenario.difficulty > mockProgress.scenariosCompleted + 1}
                >
                  {scenario.completed ? 'Review' : 'Start'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard