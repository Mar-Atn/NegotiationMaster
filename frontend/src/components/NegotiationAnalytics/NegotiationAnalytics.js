import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Rating,
  Tooltip,
  IconButton
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Psychology,
  EmojiEvents,
  Timeline,
  Assessment,
  Lightbulb,
  MonetizationOn,
  Handshake,
  Speed
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const NegotiationAnalytics = ({ conversationHistory, scenario, character }) => {
  // Core negotiation metrics
  const [metrics, setMetrics] = useState({
    // Harvard Negotiation Project Criteria
    relationshipBuilding: 0,
    informationGathering: 0,
    valueCreation: 0,
    claimingValue: 0,
    
    // Tactical Performance
    anchoringEffectiveness: 0,
    concessionsManagement: 0,
    emotionalControl: 0,
    timeManagement: 0,
    
    // Strategic Elements
    batnaUtilization: 0,
    zopaIdentification: 0,
    interestDiscovery: 0,
    optionGeneration: 0,
    
    // Communication Skills
    activeListening: 0,
    clarityOfExpression: 0,
    persuasiveness: 0,
    questioningTechnique: 0
  })

  // Key negotiation events tracking
  const [keyEvents, setKeyEvents] = useState([])
  const [currentPhase, setCurrentPhase] = useState('opening')
  const [priceHistory, setPriceHistory] = useState([])
  const [tacticsUsed, setTacticsUsed] = useState([])
  const [missedOpportunities, setMissedOpportunities] = useState([])

  // Analyze conversation in real-time
  useEffect(() => {
    if (!conversationHistory || conversationHistory.length === 0) return

    analyzeConversation()
  }, [conversationHistory])

  const analyzeConversation = () => {
    const analysis = {
      relationshipBuilding: 0,
      informationGathering: 0,
      valueCreation: 0,
      claimingValue: 0,
      anchoringEffectiveness: 0,
      concessionsManagement: 0,
      emotionalControl: 0,
      timeManagement: 0,
      batnaUtilization: 0,
      zopaIdentification: 0,
      interestDiscovery: 0,
      optionGeneration: 0,
      activeListening: 0,
      clarityOfExpression: 0,
      persuasiveness: 0,
      questioningTechnique: 0
    }

    let events = []
    let prices = []
    let tactics = []
    let opportunities = []

    conversationHistory.forEach((message, index) => {
      const text = message.text.toLowerCase()
      const isUser = message.speaker === 'You'

      // Relationship Building Analysis
      if (text.includes('thank') || text.includes('appreciate') || text.includes('understand')) {
        analysis.relationshipBuilding += 10
        if (isUser) events.push({ type: 'positive', text: 'Building rapport', timestamp: message.timestamp })
      }

      // Information Gathering
      const questions = (text.match(/\?/g) || []).length
      if (questions > 0 && isUser) {
        analysis.informationGathering += questions * 15
        analysis.questioningTechnique += questions * 10
        events.push({ type: 'info', text: 'Asked probing question', timestamp: message.timestamp })
      }

      // Price Mentions and Anchoring
      const priceMatch = text.match(/\$?(\d{1,3},?\d{3}|\d+)/g)
      if (priceMatch) {
        priceMatch.forEach(price => {
          const numericPrice = parseInt(price.replace(/[$,]/g, ''))
          if (numericPrice > 1000) {
            prices.push({ 
              price: numericPrice, 
              speaker: message.speaker, 
              timestamp: message.timestamp,
              index: index
            })
            
            if (prices.length === 1 && isUser) {
              analysis.anchoringEffectiveness += 25
              events.push({ type: 'tactical', text: 'Set price anchor', timestamp: message.timestamp })
            }
          }
        })
      }

      // Value Creation Detection
      if (text.includes('warranty') || text.includes('service') || text.includes('financing') || 
          text.includes('package') || text.includes('include')) {
        analysis.valueCreation += 15
        if (isUser) {
          events.push({ type: 'positive', text: 'Explored value-add options', timestamp: message.timestamp })
          tactics.push('Value Creation')
        }
      }

      // BATNA References
      if (text.includes('other dealer') || text.includes('elsewhere') || text.includes('alternative') ||
          text.includes('walk away') || text.includes('think about it')) {
        analysis.batnaUtilization += 20
        if (isUser) {
          events.push({ type: 'tactical', text: 'Referenced BATNA', timestamp: message.timestamp })
          tactics.push('BATNA Leverage')
        }
      }

      // Interest Discovery
      if ((text.includes('why') || text.includes('what matters') || text.includes('important to')) && isUser) {
        analysis.interestDiscovery += 20
        events.push({ type: 'positive', text: 'Explored underlying interests', timestamp: message.timestamp })
      }

      // Emotional Control
      const negativeWords = ['angry', 'frustrated', 'upset', 'annoyed', 'ridiculous', 'insane', 'crazy']
      const hasNegativeEmotion = negativeWords.some(word => text.includes(word))
      if (hasNegativeEmotion && isUser) {
        analysis.emotionalControl -= 15
        events.push({ type: 'warning', text: 'Showed frustration', timestamp: message.timestamp })
      } else if (index > 5) {
        analysis.emotionalControl += 2 // Gradual increase for maintaining composure
      }

      // Concession Patterns
      if (prices.length >= 2) {
        const lastTwoPrices = prices.slice(-2)
        if (lastTwoPrices[0].speaker === 'You' && lastTwoPrices[1].speaker === 'You') {
          if (lastTwoPrices[1].price !== lastTwoPrices[0].price) {
            const concessionSize = Math.abs(lastTwoPrices[1].price - lastTwoPrices[0].price)
            if (concessionSize > 500) {
              analysis.concessionsManagement -= 10
              opportunities.push('Large concession made without reciprocity')
            } else {
              analysis.concessionsManagement += 10
            }
          }
        }
      }

      // Phase Detection
      if (index < 3) {
        setCurrentPhase('opening')
      } else if (prices.length > 2) {
        setCurrentPhase('bargaining')
      } else if (text.includes('deal') || text.includes('agree') || text.includes('sold')) {
        setCurrentPhase('closing')
      } else {
        setCurrentPhase('exploration')
      }

      // Missed Opportunities Detection
      if (!isUser && text.includes('?') && index < conversationHistory.length - 1) {
        const nextMessage = conversationHistory[index + 1]
        if (nextMessage && nextMessage.speaker === 'You' && !nextMessage.text.toLowerCase().includes('?')) {
          opportunities.push('Missed chance to ask follow-up question')
        }
      }
    })

    // Normalize scores to 0-100
    Object.keys(analysis).forEach(key => {
      analysis[key] = Math.max(0, Math.min(100, analysis[key]))
    })

    // Update state
    setMetrics(analysis)
    setKeyEvents(events.slice(-5)) // Keep last 5 events
    setPriceHistory(prices)
    setTacticsUsed([...new Set(tactics)])
    setMissedOpportunities(opportunities.slice(-3))
  }

  // Calculate overall performance score
  const overallScore = useMemo(() => {
    const scores = Object.values(metrics)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [metrics])

  // Get performance level
  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: 'success' }
    if (score >= 60) return { level: 'Good', color: 'primary' }
    if (score >= 40) return { level: 'Developing', color: 'warning' }
    return { level: 'Needs Work', color: 'error' }
  }

  const performanceLevel = getPerformanceLevel(overallScore)

  // Price progression chart
  const priceProgression = useMemo(() => {
    if (priceHistory.length === 0) return null

    const userPrices = priceHistory.filter(p => p.speaker === 'You').map(p => p.price)
    const aiPrices = priceHistory.filter(p => p.speaker !== 'You').map(p => p.price)

    return {
      userRange: userPrices.length > 0 ? {
        min: Math.min(...userPrices),
        max: Math.max(...userPrices),
        current: userPrices[userPrices.length - 1]
      } : null,
      aiRange: aiPrices.length > 0 ? {
        min: Math.min(...aiPrices),
        max: Math.max(...aiPrices),
        current: aiPrices[aiPrices.length - 1]
      } : null
    }
  }, [priceHistory])

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      {/* Overall Performance Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h5" color="white" gutterBottom>
              Negotiation Performance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgressWithLabel value={overallScore} size={80} />
              </Box>
              <Box>
                <Chip 
                  label={performanceLevel.level}
                  color={performanceLevel.color}
                  icon={<EmojiEvents />}
                />
                <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                  Overall Score: {overallScore}/100
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Current Phase
            </Typography>
            <Chip 
              label={currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
              color="secondary"
              icon={<Timeline />}
              sx={{ mb: 1 }}
            />
            {priceProgression && (
              <Typography variant="body2" color="white">
                Price Gap: ${Math.abs((priceProgression.userRange?.current || 0) - (priceProgression.aiRange?.current || 0))}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Tactics Used
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tacticsUsed.length > 0 ? tacticsUsed.map(tactic => (
                <Chip 
                  key={tactic}
                  label={tactic}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )) : (
                <Typography variant="body2" color="white">No tactics identified yet</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Harvard Criteria */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology /> Harvard Negotiation Criteria
              </Typography>
              <MetricBar label="Relationship Building" value={metrics.relationshipBuilding} icon={<Handshake />} />
              <MetricBar label="Information Gathering" value={metrics.informationGathering} icon={<Info />} />
              <MetricBar label="Value Creation" value={metrics.valueCreation} icon={<Lightbulb />} />
              <MetricBar label="Claiming Value" value={metrics.claimingValue} icon={<MonetizationOn />} />
            </CardContent>
          </Card>
        </Grid>

        {/* Tactical Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment /> Tactical Performance
              </Typography>
              <MetricBar label="Anchoring Effectiveness" value={metrics.anchoringEffectiveness} />
              <MetricBar label="Concessions Management" value={metrics.concessionsManagement} />
              <MetricBar label="Emotional Control" value={metrics.emotionalControl} />
              <MetricBar label="Time Management" value={metrics.timeManagement} icon={<Speed />} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Strategic Elements and Communication */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Strategic Elements</Typography>
              <MetricBar label="BATNA Utilization" value={metrics.batnaUtilization} />
              <MetricBar label="ZOPA Identification" value={metrics.zopaIdentification} />
              <MetricBar label="Interest Discovery" value={metrics.interestDiscovery} />
              <MetricBar label="Option Generation" value={metrics.optionGeneration} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Communication Skills</Typography>
              <MetricBar label="Active Listening" value={metrics.activeListening} />
              <MetricBar label="Clarity of Expression" value={metrics.clarityOfExpression} />
              <MetricBar label="Persuasiveness" value={metrics.persuasiveness} />
              <MetricBar label="Questioning Technique" value={metrics.questioningTechnique} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time Events and Feedback */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Key Events</Typography>
              <List dense>
                <AnimatePresence>
                  {keyEvents.map((event, index) => (
                    <motion.div
                      key={`${event.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <ListItem>
                        <ListItemText
                          primary={event.text}
                          secondary={new Date(event.timestamp).toLocaleTimeString()}
                          primaryTypographyProps={{
                            color: event.type === 'positive' ? 'success.main' : 
                                   event.type === 'warning' ? 'warning.main' : 
                                   event.type === 'tactical' ? 'primary.main' : 'text.primary'
                          }}
                        />
                        {event.type === 'positive' && <CheckCircle color="success" />}
                        {event.type === 'warning' && <Warning color="warning" />}
                        {event.type === 'tactical' && <Psychology color="primary" />}
                        {event.type === 'info' && <Info color="info" />}
                      </ListItem>
                      {index < keyEvents.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Improvement Opportunities</Typography>
              {missedOpportunities.length > 0 ? (
                <List dense>
                  {missedOpportunities.map((opportunity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={opportunity}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                      <Lightbulb color="warning" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" variant="outlined">
                  Great job! No major missed opportunities detected.
                </Alert>
              )}
              
              {/* Price Progression */}
              {priceProgression && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Price Progression</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Your range: ${priceProgression.userRange?.min} - ${priceProgression.userRange?.max}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Current: ${priceProgression.userRange?.current}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      {character?.name} range: ${priceProgression.aiRange?.min} - ${priceProgression.aiRange?.max}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Current: ${priceProgression.aiRange?.current}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

// Metric Bar Component
const MetricBar = ({ label, value, icon }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon}
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {value}%
      </Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={value} 
      sx={{ 
        height: 8, 
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        '& .MuiLinearProgress-bar': {
          borderRadius: 4,
          background: value >= 70 ? 'linear-gradient(90deg, #4caf50, #81c784)' :
                     value >= 40 ? 'linear-gradient(90deg, #2196f3, #64b5f6)' :
                                  'linear-gradient(90deg, #ff9800, #ffb74d)'
        }
      }}
    />
  </Box>
)

// Circular Progress Component
const CircularProgressWithLabel = ({ value, size = 60 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)'
      }}
    />
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size/2}
        cy={size/2}
        r={(size-10)/2}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="8"
      />
      <circle
        cx={size/2}
        cy={size/2}
        r={(size-10)/2}
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeDasharray={`${2 * Math.PI * (size-10)/2}`}
        strokeDashoffset={`${2 * Math.PI * (size-10)/2 * (1 - value/100)}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white'
      }}
    >
      <Typography variant="h6" component="div" color="inherit">
        {value}
      </Typography>
    </Box>
  </Box>
)

export default NegotiationAnalytics