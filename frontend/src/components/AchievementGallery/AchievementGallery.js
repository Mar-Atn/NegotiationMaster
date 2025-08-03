import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Refresh,
  Star,
  LocalFireDepartment,
  TrendingUp,
  Group,
  Psychology,
  EmojiEvents,
  WorkspacePremium,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { progressApi } from '../../services/apiService'
import AchievementCard from './AchievementCard'
import toast from 'react-hot-toast'

const AchievementGallery = () => {
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const [congratsDialogOpen, setCOngratsDialogOpen] = useState(false)
  const [newAchievements, setNewAchievements] = useState([])

  const categories = [
    { value: 'all', label: 'All Achievements', icon: <Star /> },
    { value: 'skill_mastery', label: 'Skill Mastery', icon: <Psychology /> },
    { value: 'consistency', label: 'Consistency', icon: <LocalFireDepartment /> },
    { value: 'improvement', label: 'Improvement', icon: <TrendingUp /> },
    { value: 'collaboration', label: 'Collaboration', icon: <Group /> },
    { value: 'milestone', label: 'Milestones', icon: <EmojiEvents /> },
    { value: 'special', label: 'Special', icon: <WorkspacePremium /> }
  ]

  const fetchAchievements = async () => {
    try {
      setError(null)
      const response = await progressApi.getAchievements(selectedCategory, showHidden)
      
      // Check for new achievements since last load
      const newAchievementsList = response.data.achievements.filter(
        achievement => achievement.is_new && achievement.unlocked
      )
      
      if (newAchievementsList.length > 0 && achievements.length > 0) {
        setNewAchievements(newAchievementsList)
        setCOngratsDialogOpen(true)
      }
      
      setAchievements(response.data.achievements)
      setStats(response.data.stats)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch achievements:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [selectedCategory, showHidden])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAchievements()
  }

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue)
    setLoading(true)
  }

  const handleMarkAchievementSeen = async (achievementId) => {
    try {
      await progressApi.markAchievementSeen(achievementId)
      
      // Update the achievement in the local state
      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, is_new: false }
            : achievement
        )
      )
      
      toast.success('Achievement marked as seen')
    } catch (error) {
      toast.error(`Failed to mark achievement as seen: ${error.message}`)
    }
  }

  const getFilteredAchievements = () => {
    return achievements.filter(achievement => {
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false
      }
      return true
    })
  }

  const handleCelebrationClose = () => {
    setCOngratsDialogOpen(false)
    // Mark all new achievements as seen
    newAchievements.forEach(achievement => {
      handleMarkAchievementSeen(achievement.id)
    })
    setNewAchievements([])
  }

  if (loading && achievements.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Achievement Gallery
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title={showHidden ? "Hide locked achievements" : "Show locked achievements"}>
            <IconButton onClick={() => setShowHidden(!showHidden)}>
              {showHidden ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {stats.unlocked_count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Achievements Unlocked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.unlock_percentage}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completion Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.unlock_percentage}
                  color="success"
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.new_achievements}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  New Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {stats.total_achievements}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Category Progress */}
      {stats?.categories && stats.categories.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progress by Category
            </Typography>
            <Grid container spacing={2}>
              {stats.categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.category}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {category.category.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        {category.unlocked}/{category.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none'
            }
          }}
        >
          {categories.map((category) => (
            <Tab
              key={category.value}
              value={category.value}
              label={category.label}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && achievements.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Achievement Grid */}
      <AnimatePresence>
        {getFilteredAchievements().length === 0 && !loading ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No achievements found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedCategory === 'all' 
                  ? 'Complete your first negotiation to start earning achievements!'
                  : `No achievements in the ${selectedCategory.replace('_', ' ')} category yet.`
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {getFilteredAchievements().map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={achievement.id}>
                <AchievementCard
                  achievement={achievement}
                  index={index}
                  onMarkSeen={handleMarkAchievementSeen}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* New Achievement Celebration Dialog */}
      <Dialog
        open={congratsDialogOpen}
        onClose={handleCelebrationClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 48, mr: 2 }} />
            <Typography variant="h4" component="div">
              Congratulations!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            You've unlocked {newAchievements.length} new achievement{newAchievements.length > 1 ? 's' : ''}!
          </Typography>
          <Box sx={{ mt: 3 }}>
            {newAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmojiEvents sx={{ fontSize: 32, mr: 2, color: '#FFD700' }} />
                      <Box>
                        <Typography variant="h6" color="textPrimary">
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleCelebrationClose}
            sx={{
              backgroundColor: 'white',
              color: '#FF6B35',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Awesome!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AchievementGallery