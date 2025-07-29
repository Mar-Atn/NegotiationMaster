import React from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material'
import { School, Psychology, TrendingUp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Progressive Learning',
      description: 'Master negotiation through 7 carefully designed scenarios of increasing complexity.'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Training',
      description: 'Practice with intelligent AI characters that adapt to your negotiation style.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Skill Analytics',
      description: 'Track your progress across three key dimensions: claiming value, creating value, and managing relationships.'
    }
  ]

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: 8
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          NegotiationMaster
        </Typography>
        
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 4, color: 'text.secondary', maxWidth: 600 }}
        >
          Master the art of negotiation with AI-powered training scenarios
          and detailed performance analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h4" component="h3" gutterBottom>
          Ready to become a negotiation expert?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Join thousands of professionals who have improved their negotiation skills
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Start Training Today
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default Home