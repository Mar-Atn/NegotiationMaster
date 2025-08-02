import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  PlayArrow,
  Assignment,
  Assessment,
  Star,
  BusinessCenter,
  AttachMoney,
  Timeline,
  Group
} from '@mui/icons-material'
import VoiceConversation from '../components/VoiceConversation/VoiceConversation'
import NegotiationAnalytics from '../components/NegotiationAnalytics'
import LiveFeedback from '../components/LiveFeedback'

function AcademicPrototype() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showBriefing, setShowBriefing] = useState(true)
  const [conversationComplete, setConversationComplete] = useState(false)
  const [transcript, setTranscript] = useState([])

  // Academic prototype scenario - Executive Compensation
  const scenario = {
    id: 'academic_prototype_exec_comp',
    title: 'Executive Compensation Package - C-Level Negotiation',
    description: 'Negotiate a complete executive compensation package including salary, equity, benefits, and governance terms',
    difficulty_level: 5,
    estimated_duration_minutes: 15,
    learning_objectives: [
      'Master multi-dimensional compensation negotiation',
      'Navigate board approval and budget constraints',
      'Balance competitive positioning with relationship management',
      'Handle confidential information and strategic reveals'
    ]
  }

  // Dr. Amanda Foster character for executive negotiations
  const character = {
    id: 'dr_amanda_foster_exec',
    name: 'Dr. Amanda Foster',
    description: 'Chief Human Resources Officer with 20+ years in executive compensation',
    role: 'company_representative',
    voice_id: 'IKne3meq5aSn9XLyUdCD',
    expertise: ['Executive Compensation', 'Board Relations', 'Market Analysis', 'Strategic HR']
  }

  // Confidential participant instructions
  const participantBriefing = {
    role: 'Senior Software Engineering Executive',
    company: 'TechGlobal Industries',
    situation: 'Final round negotiation for VP of Engineering position',
    confidential_information: [
      'Current total compensation: $280K base + 45K equity/year',
      'Competing offer from startup: $350K + 120K equity potential',
      'Family relocation required - need $25K assistance',
      'Prefer 4-day work week or flexible remote arrangement',
      'Stock options timing critical due to tax implications'
    ],
    strategic_goals: [
      'Target base salary: $375K-$420K',
      'Equity target: 85,000 shares over 4 years',
      'Executive decision-making authority in role',
      'Board interaction and strategic input opportunities'
    ],
    constraints: [
      'Must finalize decision within 72 hours',
      'Relationship with current employer must remain professional',
      'Market reputation important for future opportunities'
    ]
  }

  const steps = [
    'Review Confidential Briefing',
    'Voice Negotiation (10-15 minutes)',
    'Performance Analysis & Feedback'
  ]

  const handleStartNegotiation = () => {
    setShowBriefing(false)
    setCurrentStep(1)
  }

  const handleConversationComplete = () => {
    setConversationComplete(true)
    setCurrentStep(2)
  }

  if (currentStep === 2) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            🎯 Performance Analysis Complete
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            Congratulations! You have completed the academic negotiation prototype. 
            In a full implementation, this would show detailed 3D performance analysis.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AttachMoney color="primary" sx={{ mr: 1 }} />
                    Claiming Value
                  </Typography>
                  <Typography variant="body2">
                    Analysis of competitive negotiation effectiveness and value extraction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Group color="primary" sx={{ mr: 1 }} />
                    Creating Value  
                  </Typography>
                  <Typography variant="body2">
                    Assessment of collaborative problem-solving and mutual benefit creation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Timeline color="primary" sx={{ mr: 1 }} />
                    Managing Relationships
                  </Typography>
                  <Typography variant="body2">
                    Evaluation of interpersonal dynamics and long-term relationship building
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              size="large"
            >
              Start New Negotiation
            </Button>
          </Box>
        </Paper>
      </Container>
    )
  }

  if (showBriefing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom color="primary">
                🎓 Academic Negotiation Prototype
              </Typography>
              
              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                {scenario.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  icon={<Star />} 
                  label={`Level ${scenario.difficulty_level}`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<Assignment />} 
                  label={`${scenario.estimated_duration_minutes} minutes`} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>

              <Typography variant="body1" paragraph>
                {scenario.description}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Learning Objectives:
              </Typography>
              <List dense>
                {scenario.learning_objectives.map((objective, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assessment color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={objective} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <BusinessCenter color="primary" sx={{ mr: 1 }} />
                  Your Role
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {participantBriefing.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participantBriefing.situation}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  🔒 Confidential Information
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This information is private to you - Dr. Foster doesn't know these details
                </Alert>
                
                <Typography variant="subtitle2" gutterBottom>
                  Current Situation:
                </Typography>
                <List dense>
                  {participantBriefing.confidential_information.map((info, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <Typography variant="body2">• {info}</Typography>
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Your Goals:
                </Typography>
                <List dense>
                  {participantBriefing.strategic_goals.map((goal, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <Typography variant="body2">• {goal}</Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartNegotiation}
            sx={{ px: 4, py: 1.5 }}
          >
            Begin Negotiation with Dr. Amanda Foster
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={3}>
        {/* Voice Conversation Panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom color="primary">
              🎤 Voice Negotiation
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              You are negotiating with Dr. Amanda Foster, CHRO at TechGlobal Industries. 
              Remember your confidential information and strategic goals.
            </Alert>

            <VoiceConversation 
              character={character}
              scenario={scenario}
              onConversationComplete={handleConversationComplete}
              onTranscriptUpdate={(newTranscript) => {
                setTranscript(newTranscript)
              }}
            />
          </Paper>
        </Grid>

        {/* Analytics Panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', minHeight: '600px' }}>
            <Typography variant="h5" gutterBottom color="primary">
              📊 Real-time Performance Analytics
            </Typography>
            
            <LiveFeedback 
              transcript={transcript}
              scenario={scenario}
              character={character}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AcademicPrototype