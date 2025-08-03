import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Button,
  Chip,
  Alert,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  History,
  EmojiEvents,
  PlayArrow,
  Refresh
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ProgressDashboard } from '../components/ProgressDashboard'
import { ConversationHistory } from '../components/ConversationHistory'
import { AchievementGallery } from '../components/AchievementGallery'
import { AchievementNotification, useAchievementNotifications } from '../components/AchievementNotification'
import { progressApi } from '../services/apiService'

const MyProgress = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [activeTab, setActiveTab] = useState(0)
  const [newAchievementsCount, setNewAchievementsCount] = useState(0)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [quickStats, setQuickStats] = useState(null)
  
  const {
    notifications: achievementNotifications,
    showAchievements,
    clearNotifications
  } = useAchievementNotifications()

  const tabs = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      component: ProgressDashboard
    },
    {
      label: 'History',
      icon: <History />,
      component: ConversationHistory
    },
    {
      label: 'Achievements',
      icon: <EmojiEvents />,
      component: AchievementGallery,
      badge: newAchievementsCount
    }
  ]

  useEffect(() => {
    if (user) {
      loadQuickStats()
      checkForNewAchievements()
      generateWelcomeMessage()
    }
  }, [user])

  const loadQuickStats = async () => {
    try {
      const response = await progressApi.getUserProgress(user.id, '7d')
      setQuickStats(response.data.currentProgress.stats)
    } catch (error) {
      console.error('Failed to load quick stats:', error)
    }
  }

  const checkForNewAchievements = async () => {
    try {
      const response = await progressApi.getAchievements()
      const newAchievements = response.data.achievements.filter(
        achievement => achievement.is_new && achievement.unlocked
      )
      
      setNewAchievementsCount(newAchievements.length)
      
      if (newAchievements.length > 0) {
        // Show achievement notifications after a short delay
        setTimeout(() => {
          showAchievements(newAchievements)
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to check for new achievements:', error)
    }
  }

  const generateWelcomeMessage = () => {
    const hour = new Date().getHours()
    let greeting = 'Good evening'
    
    if (hour < 12) {
      greeting = 'Good morning'
    } else if (hour < 18) {
      greeting = 'Good afternoon'
    }
    
    const messages = [
      `${greeting}, ${user.firstName}! Ready to enhance your negotiation skills?`,
      `Welcome back, ${user.firstName}! Let's see how you're progressing.`,
      `${greeting}! Time to master the art of negotiation, ${user.firstName}.`,
      `Hello ${user.firstName}! Your negotiation journey continues here.`
    ]
    
    setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)])
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleStartNegotiation = () => {
    navigate('/dashboard')
  }

  const handleRefreshData = () => {
    // Refresh current tab data
    window.location.reload()
  }

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )

  const ActiveComponent = tabs[activeTab].component

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            My Progress
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {welcomeMessage}
          </Typography>
          
          {/* Quick Stats */}
          {quickStats && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                icon={<History />}
                label={`${quickStats.sessions_this_week} sessions this week`}
                color="primary"
                variant="outlined"
              />
              {quickStats.current_streak > 0 && (
                <Chip
                  icon={<DashboardIcon />}
                  label={`${quickStats.current_streak} day streak`}
                  color="warning"
                  variant="outlined"
                />
              )}
              {quickStats.achievements_unlocked > 0 && (
                <Chip
                  icon={<EmojiEvents />}
                  label={`${quickStats.achievements_unlocked} achievements`}
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </motion.div>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                position: 'relative'
              }}
              {...(tab.badge > 0 && {
                'aria-label': `${tab.label} (${tab.badge} new)`
              })}
            />
          ))}
        </Tabs>
        
        {/* Badge indicators */}
        {tabs.map((tab, index) => (
          tab.badge > 0 && activeTab !== index && (
            <Box
              key={`badge-${index}`}
              sx={{
                position: 'absolute',
                top: 8,
                right: `${(tabs.length - index - 1) * 120 + 20}px`, // Approximate positioning
                zIndex: 1
              }}
            >
              <Chip
                size="small"
                label={tab.badge}
                color="error"
                sx={{ 
                  minWidth: 20,
                  height: 20,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Box>
          )
        ))}
      </Box>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <TabPanel value={activeTab} index={0}>
          <ProgressDashboard />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ConversationHistory />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <AchievementGallery />
        </TabPanel>
      </AnimatePresence>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        size="large"
        onClick={handleStartNegotiation}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        aria-label="Start new negotiation"
      >
        <PlayArrow />
      </Fab>

      {/* Achievement Notifications */}
      <AchievementNotification
        achievements={achievementNotifications}
        onClose={clearNotifications}
        showCelebration={true}
      />

      {/* Quick Action Bar for Mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 999
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshData}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleStartNegotiation}
            size="small"
          >
            New Session
          </Button>
        </Box>
      )}
    </Container>
  )
}

export default MyProgress