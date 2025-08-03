import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  MoreVert,
  Visibility,
  GetApp,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  Cancel,
  Schedule,
  Person
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { conversationApi } from '../../services/apiService'
import toast from 'react-hot-toast'

const ConversationCard = ({ 
  conversation, 
  onView, 
  onExport, 
  onBookmarkToggle,
  index = 0 
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
    handleMenuClose()
    onView(conversation)
  }

  const handleExportDialog = () => {
    handleMenuClose()
    setExportDialogOpen(true)
  }

  const handleExport = async (format) => {
    setExporting(true)
    try {
      await conversationApi.exportConversation(conversation.conversation_id, {
        format,
        include_assessment: true,
        include_timestamps: true
      })
      toast.success(`Conversation exported as ${format.toUpperCase()}`)
      setExportDialogOpen(false)
      if (onExport) onExport(conversation, format)
    } catch (error) {
      toast.error(`Export failed: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  const handleBookmarkToggle = async () => {
    if (bookmarking) return
    
    setBookmarking(true)
    try {
      await conversationApi.toggleBookmark(conversation.conversation_id)
      toast.success(
        conversation.is_bookmarked ? 'Bookmark removed' : 'Conversation bookmarked'
      )
      if (onBookmarkToggle) onBookmarkToggle(conversation)
    } catch (error) {
      toast.error(`Failed to toggle bookmark: ${error.message}`)
    } finally {
      setBookmarking(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card 
          sx={{ 
            mb: 2, 
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}
          onClick={handleView}
        >
          <CardContent>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {conversation.scenario_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {conversation.character_name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(conversation.conversation_date), 'MMM dd, yyyy • HH:mm')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • {formatDuration(conversation.duration)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {conversation.is_bookmarked && (
                  <Bookmark color="primary" fontSize="small" />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuOpen(e)
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>

            {/* Deal Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={conversation.deal_reached ? <CheckCircle /> : <Cancel />}
                label={conversation.deal_reached ? 'Deal Reached' : 'No Deal'}
                color={conversation.deal_reached ? 'success' : 'error'}
                size="small"
              />
              {conversation.skill_level_achieved && (
                <Chip
                  label={conversation.skill_level_achieved}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            {/* Scores */}
            {conversation.overall_score && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Overall Score
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={`${getScoreColor(conversation.overall_score)}.main`}
                  >
                    {Math.round(conversation.overall_score)}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={conversation.overall_score}
                  color={getScoreColor(conversation.overall_score)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                
                {/* Skill Breakdown */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {conversation.claiming_value_score && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Claiming Value
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={conversation.claiming_value_score}
                        size="small"
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  )}
                  {conversation.creating_value_score && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Creating Value
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={conversation.creating_value_score}
                        color="success"
                        size="small"
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  )}
                  {conversation.relationship_management_score && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Relationship
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={conversation.relationship_management_score}
                        color="info"
                        size="small"
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Transcript Preview */}
            {conversation.transcript_preview && (
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ 
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                "{conversation.transcript_preview}"
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={(e) => {
                e.stopPropagation()
                handleView()
              }}
            >
              View Details
            </Button>
            
            <Box>
              <Tooltip title={conversation.is_bookmarked ? "Remove bookmark" : "Bookmark"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmarkToggle()
                  }}
                  disabled={bookmarking}
                >
                  {conversation.is_bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      </motion.div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleExportDialog}>
          <GetApp sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <MenuItem onClick={handleBookmarkToggle} disabled={bookmarking}>
          {conversation.is_bookmarked ? <Bookmark sx={{ mr: 1 }} /> : <BookmarkBorder sx={{ mr: 1 }} />}
          {conversation.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </MenuItem>
      </Menu>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Conversation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for exporting your conversation:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              onClick={() => handleExport('json')}
              disabled={exporting}
            >
              JSON (Complete Data)
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              onClick={() => handleExport('txt')}
              disabled={exporting}
            >
              Text (Readable Transcript)
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleExport('summary')}
              disabled={exporting}
            >
              Summary (Key Metrics)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={exporting}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConversationCard