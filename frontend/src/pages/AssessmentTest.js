import React, { useState } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Assessment,
  PlayArrow,
  CheckCircle,
  Error,
  Insights,
  TrendingUp,
  Group,
  Star
} from '@mui/icons-material'
import voiceApiService from '../services/voiceApiService'
import { assessmentApi } from '../services/apiService'
import { toast } from 'react-hot-toast'
import AssessmentTestGuide from '../components/AssessmentTest/AssessmentTestGuide'
import { mockAssessmentData, mockTranscriptData } from '../components/AssessmentTest/MockAssessmentData'

const AssessmentTest = () => {
  const [conversationId, setConversationId] = useState('conv_6401k1phxhyzfz2va165272pmakz')
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  const handleGenerateAssessment = async () => {
    if (!conversationId.trim()) {
      toast.error('Please enter a conversation ID')
      return
    }

    setLoading(true)
    setError(null)
    setAssessment(null)
    setTranscript(null)

    try {
      if (demoMode) {
        // Demo mode - use mock data
        toast.loading('Loading demo transcript...', { id: 'assessment-progress' })
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
        setTranscript(mockTranscriptData)
        
        toast.loading('Generating demo assessment...', { id: 'assessment-progress' })
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing
        setAssessment(mockAssessmentData)
        
        toast.success('Demo assessment generated successfully!', { id: 'assessment-progress' })
      } else {
        // Live mode - use real APIs
        // Step 1: Fetch transcript from ElevenLabs
        toast.loading('Fetching conversation transcript...', { id: 'assessment-progress' })
        
        const transcriptResponse = await voiceApiService.getConversationTranscript(conversationId)
        setTranscript(transcriptResponse.data)
        
        // Step 2: Generate assessment
        toast.loading('Generating professional assessment...', { id: 'assessment-progress' })
        
        // Use demo endpoint for testing (bypasses authentication)
        const response = await fetch('/api/assessment/demo/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId,
            scenarioData: null, // Optional for testing
            userHistory: null   // Optional for testing
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Assessment generation failed')
        }

        const assessmentResponse = await response.json()
        
        setAssessment(assessmentResponse.data)
        
        toast.success('Assessment generated successfully!', { id: 'assessment-progress' })
      }

    } catch (err) {
      console.error('Assessment generation failed:', err)
      setError(err.message)
      toast.error(`Failed to generate assessment: ${err.message}`, { id: 'assessment-progress' })
    } finally {
      setLoading(false)
    }
  }

  const ScoreCard = ({ title, score, maxScore = 10, color = 'primary', icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h3" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
            {score}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ ml: 0.5 }}>
            /{maxScore}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(score / maxScore) * 100}
          color={color}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </CardContent>
    </Card>
  )

  const AssessmentSection = ({ title, content, icon }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {content}
      </Typography>
    </Paper>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Assessment Engine Test
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Test the NegotiationMaster AI Assessment Engine with real conversation data
          </Typography>
        </Box>

        {/* Guide Section */}
        <AssessmentTestGuide />

        {/* Input Section */}
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Stack spacing={3}>
            <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Generate Professional Assessment
            </Typography>
            
            <Alert severity="info">
              Enter an ElevenLabs conversation ID to fetch the transcript and generate a comprehensive negotiation assessment.
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={demoMode} 
                    onChange={(e) => setDemoMode(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Demo Mode"
              />
              <Typography variant="body2" color="text.secondary">
                {demoMode ? 'Using mock data for testing' : 'Live API integration'}
              </Typography>
            </Box>

            <TextField
              label="Conversation ID"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              fullWidth
              placeholder="conv_..."
              helperText={demoMode ? "Demo mode - any ID will work" : "Example: conv_6401k1phxhyzfz2va165272pmakz"}
              disabled={loading || demoMode}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateAssessment}
              disabled={(!demoMode && !conversationId.trim()) || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {loading ? 'Generating Assessment...' : `Generate ${demoMode ? 'Demo ' : ''}Assessment`}
            </Button>
          </Stack>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto' }}>
            <strong>Assessment Failed:</strong> {error}
          </Alert>
        )}

        {/* Transcript Summary */}
        {transcript && (
          <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle color="success" />
              {demoMode ? 'Demo Transcript Loaded' : 'Transcript Loaded Successfully'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conversation ID: {conversationId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Messages: {transcript.transcript?.length || 0}
            </Typography>
            {demoMode && (
              <Chip label="Demo Data" color="warning" size="small" sx={{ mt: 1 }} />
            )}
          </Paper>
        )}

        {/* Assessment Results */}
        {assessment && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Overall Scores */}
            <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
              Assessment Results
            </Typography>

            {/* 3D Scoring Cards */}
            {assessment.scores && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <ScoreCard
                    title="Claiming Value"
                    score={assessment.scores.claimingValue || 0}
                    color="primary"
                    icon={<TrendingUp color="primary" />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ScoreCard
                    title="Creating Value"
                    score={assessment.scores.creatingValue || 0}
                    color="success"
                    icon={<Insights color="success" />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ScoreCard
                    title="Relationship Management"
                    score={assessment.scores.relationshipManagement || 0}
                    color="info"
                    icon={<Group color="info" />}
                  />
                </Grid>
              </Grid>
            )}

            {/* Overall Score */}
            {assessment.scores?.overall && (
              <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Star color="warning" />
                  <Typography variant="h2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {assessment.scores.overall}
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    /10
                  </Typography>
                </Box>
                <Chip 
                  label={assessment.performanceLevel || 'Professional'}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Paper>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Assessment Sections */}
            {assessment.executiveSummary && (
              <AssessmentSection
                title="Executive Summary"
                content={assessment.executiveSummary}
                icon={<Assessment color="primary" />}
              />
            )}

            {assessment.whatWasDoneWell && (
              <AssessmentSection
                title="What Was Done Well"
                content={assessment.whatWasDoneWell}
                icon={<CheckCircle color="success" />}
              />
            )}

            {assessment.areasForImprovement && (
              <AssessmentSection
                title="Areas for Improvement"
                content={assessment.areasForImprovement}
                icon={<TrendingUp color="warning" />}
              />
            )}

            {assessment.nextSteps && (
              <AssessmentSection
                title="Next Steps"
                content={assessment.nextSteps}
                icon={<PlayArrow color="info" />}
              />
            )}

            {/* Methodology Compliance */}
            {assessment.methodologyCompliant !== undefined && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {assessment.methodologyCompliant ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                  <Typography variant="h6">
                    Methodology Compliance: {assessment.methodologyCompliant ? 'Compliant' : 'Non-Compliant'}
                  </Typography>
                </Box>
                {assessment.assessmentId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Assessment ID: {assessment.assessmentId}
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
        )}
      </Stack>
    </Container>
  )
}

export default AssessmentTest