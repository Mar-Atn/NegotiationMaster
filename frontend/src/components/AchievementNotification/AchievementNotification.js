import React, { useState, useEffect } from 'react'
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Slide,
  Fade,
  Card,
  CardContent
} from '@mui/material'
import {
  Close,
  EmojiEvents,
  Star,
  LocalFireDepartment,
  TrendingUp,
  Psychology,
  Group,
  WorkspacePremium
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const AchievementNotification = ({ 
  achievements = [], 
  onClose,
  autoHideDuration = 6000,
  showCelebration = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setCurrentIndex(0)
      setOpen(true)
    }
  }, [achievements])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    
    if (currentIndex < achievements.length - 1) {
      // Show next achievement
      setCurrentIndex(prev => prev + 1)
    } else {
      // Close notification and call onClose
      setOpen(false)
      if (onClose) {
        onClose()
      }
    }
  }

  const getBadgeIcon = (badgeIcon, size = 'large') => {
    const iconMap = {
      'star': <Star fontSize={size} />,
      'trophy': <EmojiEvents fontSize={size} />,
      'fire': <LocalFireDepartment fontSize={size} />,
      'trend': <TrendingUp fontSize={size} />,
      'group': <Group fontSize={size} />,
      'brain': <Psychology fontSize={size} />,
      'premium': <WorkspacePremium fontSize={size} />
    }
    return iconMap[badgeIcon] || <EmojiEvents fontSize={size} />
  }

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return '#FFD700'
      case 'epic':
        return '#9C27B0'
      case 'rare':
        return '#2196F3'
      case 'uncommon':
        return '#4CAF50'
      case 'common':
      default:
        return '#757575'
    }
  }

  if (!achievements.length || !open) {
    return null
  }

  const currentAchievement = achievements[currentIndex]

  return (
    <>
      {/* Main Notification */}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left' }}
      >
        <Alert
          severity="success"
          onClose={handleClose}
          sx={{
            width: 400,
            background: `linear-gradient(135deg, ${getRarityColor(currentAchievement.rarity)}20 0%, ${getRarityColor(currentAchievement.rarity)}10 100%)`,
            border: `2px solid ${getRarityColor(currentAchievement.rarity)}40`,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          icon={false}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Achievement Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: getRarityColor(currentAchievement.rarity),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mr: 2,
                flexShrink: 0
              }}
            >
              {getBadgeIcon(currentAchievement.badge_icon, 'medium')}
            </Box>

            {/* Achievement Details */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                Achievement Unlocked!
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {currentAchievement.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentAchievement.description}
              </Typography>
              
              {/* Progress indicator if multiple achievements */}
              {achievements.length > 1 && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  {currentIndex + 1} of {achievements.length}
                </Typography>
              )}
            </Box>
          </Box>
        </Alert>
      </Snackbar>

      {/* Celebration Animation Overlay */}
      <AnimatePresence>
        {showCelebration && open && currentAchievement.rarity !== 'common' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {/* Confetti-like particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  backgroundColor: getRarityColor(currentAchievement.rarity),
                  borderRadius: '50%'
                }}
              />
            ))}

            {/* Center celebration burst */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${getRarityColor(currentAchievement.rarity)}40 0%, transparent 70%)`,
                border: `2px solid ${getRarityColor(currentAchievement.rarity)}`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for managing achievement notifications
export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const showAchievement = (achievement) => {
    setNotifications(prev => [...prev, achievement])
  }

  const showAchievements = (achievementList) => {
    if (achievementList.length > 0) {
      setNotifications(achievementList)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    showAchievement,
    showAchievements,
    clearNotifications
  }
}

export default AchievementNotification