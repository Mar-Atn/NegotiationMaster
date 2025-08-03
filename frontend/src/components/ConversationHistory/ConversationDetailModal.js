import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material'
import {
  Close,
  ExpandMore,
  Person,
  Computer,
  CheckCircle,
  Cancel,
  Download,
  Schedule,
  TrendingUp,
  Star,
  Warning
} from '@mui/icons-material'
import { format } from 'date-fns'
import { conversationApi } from '../../services/apiService'
import toast from 'react-hot-toast'

const ConversationDetailModal = ({ open, onClose, conversation }) => {
  const [conversationDetails, setConversationDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState('transcript')

  useEffect(() => {
    if (open && conversation) {
      fetchConversationDetails()
    }
  }, [open, conversation])

  const fetchConversationDetails = async () => {
    if (!conversation) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await conversationApi.getConversationDetails(conversation.conversation_id)
      setConversationDetails(response.data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch conversation details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleExport = async (format) => {
    try {
      await conversationApi.exportConversation(conversation.conversation_id, {
        format,
        include_assessment: true,
        include_timestamps: true
      })
      toast.success(`Conversation exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(`Export failed: ${error.message}`)
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  if (!conversation) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {conversation.scenario_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {format(new Date(conversation.conversation_date), 'MMM dd, yyyy • HH:mm')}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : conversationDetails ? (
          <Box>
            {/* Overview Section */}
            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Conversation Overview
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          <Typography variant="body2">
                            <strong>Character:</strong> {conversation.character_name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" />
                          <Typography variant="body2">
                            <strong>Duration:</strong> {formatDuration(conversation.duration)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {conversation.deal_reached ? <CheckCircle color="success" /> : <Cancel color="error" />}
                          <Chip
                            label={conversation.deal_reached ? 'Deal Reached' : 'No Deal'}
                            color={conversation.deal_reached ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2">
                            <strong>Messages:</strong> {conversationDetails.transcript.total_messages} total 
                            ({conversationDetails.transcript.user_messages} from you, {conversationDetails.transcript.ai_messages} from AI)
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Assessment Scores */}
                {conversationDetails.assessment && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Performance Scores
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {Object.entries(conversationDetails.assessment.scores).map(([skill, score]) => {
                            const skillLabels = {
                              claiming_value: 'Claiming Value',
                              creating_value: 'Creating Value',
                              relationship_management: 'Relationship Mgmt',
                              overall: 'Overall Score'
                            }
                            
                            return (
                              <Box key={skill}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">
                                    {skillLabels[skill] || skill}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {Math.round(score)}/100
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={score}
                                  color={getScoreColor(score)}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            )
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Accordion Sections */}
            <Box sx={{ px: 3 }}>
              {/* Transcript */}
              <Accordion 
                expanded={expanded === 'transcript'} 
                onChange={handleAccordionChange('transcript')}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Conversation Transcript</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {conversationDetails.transcript.messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                          mb: 2
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                            color: message.sender === 'user' ? 'white' : 'text.primary',
                            ml: message.sender === 'user' ? 2 : 0,
                            mr: message.sender === 'ai' ? 2 : 0
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {message.sender === 'user' ? <Person fontSize="small" /> : <Computer fontSize="small" />}
                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                              {message.sender === 'user' ? 'You' : conversation.character_name}
                              {message.timestamp && (
                                <span> • {format(new Date(message.timestamp), 'HH:mm:ss')}</span>
                              )}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Assessment Details */}
              {conversationDetails.assessment && (
                <Accordion 
                  expanded={expanded === 'assessment'} 
                  onChange={handleAccordionChange('assessment')}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Detailed Assessment</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Personalized Feedback */}
                      {conversationDetails.assessment.feedback && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Personalized Feedback
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {conversationDetails.assessment.feedback}
                          </Typography>
                        </Box>
                      )}

                      {/* Strengths */}
                      {conversationDetails.assessment.strengths && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star color="success" sx={{ mr: 1 }} />
                            Strengths Identified
                          </Typography>
                          <List dense>
                            {conversationDetails.assessment.strengths.map((strength, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircle color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={strength} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Development Areas */}
                      {conversationDetails.assessment.development_areas && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp color="warning" sx={{ mr: 1 }} />
                            Areas for Development
                          </Typography>
                          <List dense>
                            {conversationDetails.assessment.development_areas.map((area, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Warning color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={area} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Recommendations */}
                      {conversationDetails.assessment.recommendations && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Improvement Recommendations
                          </Typography>
                          <List dense>
                            {conversationDetails.assessment.recommendations.map((rec, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <TrendingUp color="info" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={rec} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Skill Level & Milestone */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {conversationDetails.assessment.skill_level && (
                          <Chip
                            label={`Skill Level: ${conversationDetails.assessment.skill_level}`}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {conversationDetails.assessment.milestone_reached && (
                          <Chip
                            label={`Milestone: ${conversationDetails.assessment.milestone_reached}`}
                            color="success"
                            variant="filled"
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button
          startIcon={<Download />}
          onClick={() => handleExport('json')}
        >
          Export JSON
        </Button>
        <Button
          startIcon={<Download />}
          onClick={() => handleExport('txt')}
        >
          Export Text
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConversationDetailModal