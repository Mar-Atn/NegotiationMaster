import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Tooltip,
  IconButton,
  Fade,
  Slide
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Lightbulb,
  Star,
  Psychology,
  Handshake,
  QuestionMark,
  MonetizationOn,
  Timer,
  EmojiEvents,
  InfoOutlined
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const LiveFeedback = ({ transcript, scenario, character }) => {
  // Focus on 3 key sub-skills based on Harvard Negotiation Project
  const [coreSkills, setCoreSkills] = useState({
    relationshipBuilding: { score: 0, feedback: [], lastUpdate: null },
    strategicThinking: { score: 0, feedback: [], lastUpdate: null },
    communicationSkills: { score: 0, feedback: [], lastUpdate: null }
  })

  const [recentFeedback, setRecentFeedback] = useState([])
  const [currentPhase, setCurrentPhase] = useState('opening')
  const [overallPerformance, setOverallPerformance] = useState(0)
  const [coachingTips, setCoachingTips] = useState([])

  // Analysis based on full transcript from ElevenLabs
  useEffect(() => {
    if (!transcript || transcript.length === 0) return
    
    analyzeFullTranscript()
  }, [transcript])

  const analyzeFullTranscript = () => {
    const newSkills = {
      relationshipBuilding: { score: 0, feedback: [], lastUpdate: Date.now() },
      strategicThinking: { score: 0, feedback: [], lastUpdate: Date.now() },
      communicationSkills: { score: 0, feedback: [], lastUpdate: Date.now() }
    }

    let newFeedback = []
    let newCoachingTips = []
    let phase = 'opening'

    // Analyze transcript entries
    const recentEntries = transcript.slice(-5)
    
    transcript.forEach((entry, index) => {
      const text = entry.text?.toLowerCase() || ''
      const isUser = entry.speaker === 'You'
      const isRecent = index >= transcript.length - 3

      // ═══════════════════════════════════════════════════════════
      // 1. RELATIONSHIP BUILDING ANALYSIS
      // ═══════════════════════════════════════════════════════════
      
      // Positive relationship building
      if (text.includes('thank') || text.includes('appreciate') || text.includes('understand your position')) {
        newSkills.relationshipBuilding.score += 15
        if (isUser && isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'relationshipBuilding',
            message: 'Great! You\'re building rapport by showing appreciation.',
            timestamp: entry.timestamp
          })
        }
      }

      // Acknowledging other party's concerns
      if (isUser && (text.includes('i see your point') || text.includes('that makes sense') || text.includes('good point'))) {
        newSkills.relationshipBuilding.score += 20
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'relationshipBuilding',
            message: 'Excellent! Acknowledging their perspective builds trust.',
            timestamp: entry.timestamp
          })
        }
      }

      // Collaborative language
      if (isUser && (text.includes('we both') || text.includes('together') || text.includes('mutual') || text.includes('win-win'))) {
        newSkills.relationshipBuilding.score += 25
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'relationshipBuilding',
            message: 'Outstanding! Using collaborative language creates partnership.',
            timestamp: entry.timestamp
          })
        }
      }

      // Negative relationship impact
      if (isUser && (text.includes('that\'s ridiculous') || text.includes('no way') || text.includes('impossible'))) {
        newSkills.relationshipBuilding.score -= 20
        if (isRecent) {
          newFeedback.push({
            type: 'warning',
            skill: 'relationshipBuilding',
            message: 'Warning: Harsh language can damage the relationship.',
            timestamp: entry.timestamp
          })
          newCoachingTips.push('Try: "That\'s challenging for me because..." instead of direct rejection.')
        }
      }

      // ═══════════════════════════════════════════════════════════
      // 2. STRATEGIC THINKING ANALYSIS
      // ═══════════════════════════════════════════════════════════

      // BATNA usage
      if (isUser && (text.includes('other option') || text.includes('alternative') || text.includes('elsewhere'))) {
        newSkills.strategicThinking.score += 30
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'strategicThinking',
            message: 'Smart! You\'re leveraging your BATNA effectively.',
            timestamp: entry.timestamp
          })
        }
      }

      // Value creation attempts
      if (isUser && (text.includes('what if we') || text.includes('another way') || text.includes('package') || text.includes('bundle'))) {
        newSkills.strategicThinking.score += 25
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'strategicThinking',
            message: 'Excellent! You\'re creating value beyond just price.',
            timestamp: entry.timestamp
          })
        }
      }

      // Interest-based questions
      if (isUser && (text.includes('why is that important') || text.includes('what matters most') || text.includes('help me understand'))) {
        newSkills.strategicThinking.score += 20
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'strategicThinking',
            message: 'Great! You\'re uncovering underlying interests.',
            timestamp: entry.timestamp
          })
        }
      }

      // Anchoring (first price mention)
      const priceMatch = text.match(/\$?(\d{1,3},?\d{3}|\d+)/g)
      if (priceMatch && isUser && index < 5) {
        priceMatch.forEach(price => {
          const numericPrice = parseInt(price.replace(/[$,]/g, ''))
          if (numericPrice > 1000) {
            newSkills.strategicThinking.score += 20
            if (isRecent) {
              newFeedback.push({
                type: 'info',
                skill: 'strategicThinking',
                message: 'Good anchoring! You set the price discussion.',
                timestamp: entry.timestamp
              })
            }
          }
        })
      }

      // ═══════════════════════════════════════════════════════════
      // 3. COMMUNICATION SKILLS ANALYSIS
      // ═══════════════════════════════════════════════════════════

      // Question asking (active listening)
      const questionCount = (text.match(/\?/g) || []).length
      if (questionCount > 0 && isUser) {
        newSkills.communicationSkills.score += questionCount * 10
        if (isRecent && questionCount > 0) {
          newFeedback.push({
            type: 'positive',
            skill: 'communicationSkills',
            message: `Great questioning! You asked ${questionCount} probing question${questionCount > 1 ? 's' : ''}.`,
            timestamp: entry.timestamp
          })
        }
      }

      // Clear, specific communication
      if (isUser && (text.includes('specifically') || text.includes('exactly') || text.includes('precisely'))) {
        newSkills.communicationSkills.score += 15
        if (isRecent) {
          newFeedback.push({
            type: 'positive',
            skill: 'communicationSkills',
            message: 'Good! Being specific improves clarity.',
            timestamp: entry.timestamp
          })
        }
      }

      // Emotional self-control
      const emotionalWords = ['frustrated', 'angry', 'annoyed', 'upset']
      if (isUser && emotionalWords.some(word => text.includes(word))) {
        newSkills.communicationSkills.score -= 15
        if (isRecent) {
          newFeedback.push({
            type: 'warning',
            skill: 'communicationSkills',
            message: 'Careful! Try to stay emotionally neutral.',
            timestamp: entry.timestamp
          })
          newCoachingTips.push('Take a breath. Focus on interests, not emotions.')
        }
      }

      // Professional language
      if (isUser && (text.includes('professional') || text.includes('business') || text.includes('partnership'))) {
        newSkills.communicationSkills.score += 10
      }

      // ═══════════════════════════════════════════════════════════
      // PHASE DETECTION
      // ═══════════════════════════════════════════════════════════
      
      if (index < 3) {
        phase = 'opening'
      } else if (priceMatch && priceMatch.length > 0) {
        phase = 'bargaining'
      } else if (text.includes('deal') || text.includes('agree') || text.includes('final')) {
        phase = 'closing'
      } else if (questionCount > 0) {
        phase = 'exploration'
      }
    })

    // Normalize scores (0-100)
    Object.keys(newSkills).forEach(skill => {
      newSkills[skill].score = Math.max(0, Math.min(100, newSkills[skill].score))
    })

    // Calculate overall performance
    const overall = Object.values(newSkills).reduce((sum, skill) => sum + skill.score, 0) / 3

    // Generate coaching tips based on current performance
    if (newSkills.relationshipBuilding.score < 30) {
      newCoachingTips.push('💡 Try acknowledging their perspective: "I understand your position..."')
    }
    if (newSkills.strategicThinking.score < 30) {
      newCoachingTips.push('💡 Ask about their underlying needs: "What\'s most important to you in this deal?"')
    }
    if (newSkills.communicationSkills.score < 30) {
      newCoachingTips.push('💡 Ask more open-ended questions to gather information.')
    }

    // Update state
    setCoreSkills(newSkills)
    setRecentFeedback(newFeedback.slice(-5)) // Keep last 5 feedback items
    setCurrentPhase(phase)
    setOverallPerformance(Math.round(overall))
    setCoachingTips(newCoachingTips.slice(-3)) // Keep last 3 tips
  }

  // Get performance level and color
  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: 'success', icon: <EmojiEvents /> }
    if (score >= 60) return { level: 'Good', color: 'primary', icon: <TrendingUp /> }
    if (score >= 40) return { level: 'Developing', color: 'warning', icon: <Star /> }
    return { level: 'Needs Focus', color: 'error', icon: <TrendingDown /> }
  }

  const overallLevel = getPerformanceLevel(overallPerformance)

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Overall Performance Header */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Live Performance</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {overallLevel.icon}
                <Typography variant="h4">{overallPerformance}%</Typography>
                <Chip 
                  label={overallLevel.level} 
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">Phase: {currentPhase}</Typography>
              <Chip 
                label={`${transcript.length} messages`}
                size="small"
                icon={<Timer />}
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', mt: 0.5 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Core Skills Tracking */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology /> Core Negotiation Skills
          </Typography>
          
          {/* Relationship Building */}
          <SkillTracker 
            label="Relationship Building"
            score={coreSkills.relationshipBuilding.score}
            icon={<Handshake />}
            description="Building trust and rapport"
          />
          
          {/* Strategic Thinking */}
          <SkillTracker 
            label="Strategic Thinking"
            score={coreSkills.strategicThinking.score}
            icon={<Psychology />}
            description="BATNA, value creation, interests"
          />
          
          {/* Communication Skills */}
          <SkillTracker 
            label="Communication Skills"
            score={coreSkills.communicationSkills.score}
            icon={<QuestionMark />}
            description="Questions, clarity, listening"
          />
        </CardContent>
      </Card>

      {/* Real-time Feedback */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💬 Live Feedback
          </Typography>
          
          <AnimatePresence>
            {recentFeedback.length > 0 ? (
              <List dense>
                {recentFeedback.slice(-3).map((feedback, index) => (
                  <motion.div
                    key={`${feedback.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem sx={{ pl: 0 }}>
                      <ListItemIcon>
                        {feedback.type === 'positive' && <CheckCircle color="success" />}
                        {feedback.type === 'warning' && <Warning color="warning" />}
                        {feedback.type === 'info' && <InfoOutlined color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={feedback.message}
                        secondary={`${feedback.skill.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: feedback.type === 'positive' ? 'success.main' : 
                                 feedback.type === 'warning' ? 'warning.main' : 'text.primary'
                        }}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                Start speaking to receive live feedback on your negotiation performance!
              </Alert>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Coaching Tips */}
      {coachingTips.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb /> Coaching Tips
            </Typography>
            
            <List dense>
              {coachingTips.map((tip, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={tip}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

// Skill Tracker Component
const SkillTracker = ({ label, score, icon, description }) => {
  const level = score >= 70 ? 'success' : score >= 40 ? 'primary' : 'warning'
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" color={`${level}.main`} fontWeight="bold">
          {score}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={score} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: score >= 70 ? 'linear-gradient(90deg, #4caf50, #81c784)' :
                       score >= 40 ? 'linear-gradient(90deg, #2196f3, #64b5f6)' :
                                    'linear-gradient(90deg, #ff9800, #ffb74d)'
          }
        }}
      />
    </Box>
  )
}

export default LiveFeedback