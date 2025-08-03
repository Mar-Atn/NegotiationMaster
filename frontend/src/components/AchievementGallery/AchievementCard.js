import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Lock,
  Star,
  EmojiEvents,
  LocalFireDepartment,
  TrendingUp,
  Group,
  Psychology,
  VerifiedUser,
  Settings,
  WorkspacePremium
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const AchievementCard = ({ achievement, index = 0, onMarkSeen }) => {
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return '#FFD700' // Gold
      case 'epic':
        return '#9C27B0' // Purple
      case 'rare':
        return '#2196F3' // Blue
      case 'uncommon':
        return '#4CAF50' // Green
      case 'common':
      default:
        return '#757575' // Grey
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'skill_mastery':
        return <Psychology />
      case 'consistency':
        return <LocalFireDepartment />
      case 'improvement':
        return <TrendingUp />
      case 'collaboration':
        return <Group />
      case 'milestone':
        return <EmojiEvents />
      case 'special':
        return <WorkspacePremium />
      default:
        return <Star />
    }
  }

  const getBadgeIcon = (badgeIcon) => {
    // Map badge icon names to actual icons
    const iconMap = {
      'star': <Star />,
      'trophy': <EmojiEvents />,
      'fire': <LocalFireDepartment />,
      'trend': <TrendingUp />,
      'group': <Group />,
      'brain': <Psychology />,
      'verified': <VerifiedUser />,
      'premium': <WorkspacePremium />
    }
    return iconMap[badgeIcon] || <Star />
  }

  const handleCardClick = () => {
    if (achievement.is_new && achievement.unlocked && onMarkSeen) {
      onMarkSeen(achievement.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
    >
      <Badge
        color="error"
        variant="dot"
        invisible={!achievement.is_new}
        sx={{
          '& .MuiBadge-badge': {
            width: 12,
            height: 12,
            borderRadius: '50%'
          }
        }}
      >
        <Card
          sx={{
            height: '100%',
            position: 'relative',
            cursor: achievement.unlocked ? 'pointer' : 'default',
            opacity: achievement.unlocked ? 1 : 0.6,
            background: achievement.unlocked
              ? `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}20 0%, ${getRarityColor(achievement.rarity)}10 100%)`
              : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            border: achievement.unlocked
              ? `2px solid ${getRarityColor(achievement.rarity)}40`
              : '2px solid #e0e0e0',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: achievement.unlocked ? 6 : 2
            }
          }}
          onClick={handleCardClick}
        >
          {/* Rarity Corner Badge */}
          {achievement.rarity && achievement.rarity !== 'common' && achievement.unlocked && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: getRarityColor(achievement.rarity),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <Settings fontSize="small" sx={{ color: 'white' }} />
            </Box>
          )}

          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: achievement.unlocked 
                  ? getRarityColor(achievement.rarity) 
                  : '#bdbdbd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                position: 'relative',
                color: 'white',
                fontSize: '2rem'
              }}
            >
              {achievement.unlocked ? (
                getBadgeIcon(achievement.badge_icon)
              ) : (
                <Lock />
              )}
              
              {/* New achievement glow effect */}
              {achievement.is_new && achievement.unlocked && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: '50%',
                    border: `2px solid ${getRarityColor(achievement.rarity)}`,
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
            </Box>

            {/* Title */}
            <Typography variant="h6" component="h3" gutterBottom>
              {achievement.unlocked || !achievement.is_hidden 
                ? achievement.name 
                : '???'
              }
            </Typography>

            {/* Description */}
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                minHeight: 48,
                mb: 2,
                opacity: achievement.unlocked ? 1 : 0.7
              }}
            >
              {achievement.unlocked || !achievement.is_hidden 
                ? achievement.description 
                : 'Complete more negotiations to unlock this achievement'
              }
            </Typography>

            {/* Progress Bar (for non-unlocked achievements) */}
            {!achievement.unlocked && achievement.progress_percentage > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {achievement.progress_current}/{achievement.progress_target}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={achievement.progress_percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getRarityColor(achievement.rarity)
                    }
                  }}
                />
              </Box>
            )}

            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {achievement.unlocked && (
                <>
                  <Chip
                    size="small"
                    label={achievement.category?.replace('_', ' ') || 'Achievement'}
                    color="primary"
                    variant="outlined"
                    icon={getCategoryIcon(achievement.category)}
                  />
                  {achievement.rarity && achievement.rarity !== 'common' && (
                    <Chip
                      size="small"
                      label={achievement.rarity}
                      sx={{
                        backgroundColor: getRarityColor(achievement.rarity),
                        color: 'white'
                      }}
                    />
                  )}
                </>
              )}
            </Box>

            {/* Unlock Date */}
            {achievement.unlocked && achievement.unlocked_at && (
              <Typography 
                variant="caption" 
                color="textSecondary" 
                sx={{ mt: 2, display: 'block' }}
              >
                Unlocked {format(new Date(achievement.unlocked_at), 'MMM dd, yyyy')}
              </Typography>
            )}

            {/* Unlock Trigger Score */}
            {achievement.unlocked && achievement.trigger_score && (
              <Tooltip title={`Unlocked with a score of ${achievement.trigger_score}`}>
                <Chip
                  size="small"
                  label={`Score: ${achievement.trigger_score}`}
                  color="secondary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Tooltip>
            )}
          </CardContent>
        </Card>
      </Badge>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </motion.div>
  )
}

export default AchievementCard