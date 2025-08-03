import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Alert,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material'
import {
  Search,
  FilterList,
  Sort,
  Refresh,
  Close,
  DateRange,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationApi } from '../../services/apiService'
import ConversationCard from './ConversationCard'
import ConversationDetailModal from './ConversationDetailModal'

const ConversationHistory = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    scenario: 'all',
    dateFrom: null,
    dateTo: null,
    dealReached: 'all',
    sortBy: 'conversation_date',
    sortOrder: 'desc'
  })
  
  // UI State
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [stats, setStats] = useState(null)

  const fetchConversations = async (newFilters = filters, page = pagination.page) => {
    try {
      setError(null)
      const response = await conversationApi.getConversationHistory({
        ...newFilters,
        page,
        limit: pagination.limit
      })
      
      setConversations(response.data.conversations)
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }))
      setStats(response.data.stats)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch conversation history:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)
    setLoading(true)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchConversations(newFilters, 1)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    setLoading(true)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchConversations(filters, 1)
    setFilterDialogOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      scenario: 'all',
      dateFrom: null,
      dateTo: null,
      dealReached: 'all',
      sortBy: 'conversation_date',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    setLoading(true)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchConversations(clearedFilters, 1)
    setFilterDialogOpen(false)
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    setLoading(true)
    fetchConversations(filters, newPage)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchConversations()
  }

  const handleViewConversation = async (conversation) => {
    setSelectedConversation(conversation)
    setDetailModalOpen(true)
  }

  const handleBookmarkToggle = (conversation) => {
    // Update the conversation in the list
    setConversations(prev => 
      prev.map(conv => 
        conv.conversation_id === conversation.conversation_id
          ? { ...conv, is_bookmarked: !conv.is_bookmarked }
          : conv
      )
    )
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.scenario !== 'all') count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.dealReached !== 'all') count++
    return count
  }

  if (loading && conversations.length === 0) {
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
            Conversation History
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {stats.total_conversations}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.success_rate}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Deal Success Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {stats.average_score}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main">
                    {stats.average_duration}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Duration (min)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterDialogOpen(true)}
                  sx={{ position: 'relative' }}
                >
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Chip
                      size="small"
                      label={getActiveFiltersCount()}
                      color="primary"
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        minWidth: 20,
                        height: 20
                      }}
                    />
                  )}
                </Button>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort</InputLabel>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-')
                      const newFilters = { ...filters, sortBy, sortOrder }
                      setFilters(newFilters)
                      setLoading(true)
                      fetchConversations(newFilters)
                    }}
                    label="Sort"
                  >
                    <MenuItem value="conversation_date-desc">Newest First</MenuItem>
                    <MenuItem value="conversation_date-asc">Oldest First</MenuItem>
                    <MenuItem value="overall_score-desc">Highest Score</MenuItem>
                    <MenuItem value="overall_score-asc">Lowest Score</MenuItem>
                    <MenuItem value="duration-desc">Longest First</MenuItem>
                    <MenuItem value="duration-asc">Shortest First</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                Active filters:
              </Typography>
              {filters.search && (
                <Chip
                  size="small"
                  label={`Search: "${filters.search}"`}
                  onDelete={() => handleSearch('')}
                />
              )}
              {filters.scenario !== 'all' && (
                <Chip
                  size="small"
                  label={`Scenario: ${filters.scenario}`}
                  onDelete={() => {
                    const newFilters = { ...filters, scenario: 'all' }
                    setFilters(newFilters)
                    fetchConversations(newFilters)
                  }}
                />
              )}
              {filters.dealReached !== 'all' && (
                <Chip
                  size="small"
                  label={`Deal: ${filters.dealReached === 'true' ? 'Reached' : 'Not Reached'}`}
                  onDelete={() => {
                    const newFilters = { ...filters, dealReached: 'all' }
                    setFilters(newFilters)
                    fetchConversations(newFilters)
                  }}
                />
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Chip
                  size="small"
                  label="Date Range"
                  onDelete={() => {
                    const newFilters = { ...filters, dateFrom: null, dateTo: null }
                    setFilters(newFilters)
                    fetchConversations(newFilters)
                  }}
                />
              )}
              <Button
                size="small"
                variant="text"
                onClick={clearFilters}
                sx={{ ml: 1 }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Conversation List */}
        <AnimatePresence>
          {loading && conversations.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={30} />
            </Box>
          )}
          
          {conversations.length === 0 && !loading ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No conversations found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getActiveFiltersCount() > 0 
                    ? 'Try adjusting your filters or search terms'
                    : 'Start your first negotiation to see it here!'
                  }
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              <Grid container spacing={3}>
                {conversations.map((conversation, index) => (
                  <Grid item xs={12} md={6} lg={4} key={conversation.conversation_id}>
                    <ConversationCard
                      conversation={conversation}
                      onView={handleViewConversation}
                      onBookmarkToggle={handleBookmarkToggle}
                      index={index}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Filter Dialog */}
        <Dialog 
          open={filterDialogOpen} 
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Filter Conversations
              <IconButton onClick={() => setFilterDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Deal Status</InputLabel>
                  <Select
                    value={filters.dealReached}
                    onChange={(e) => handleFilterChange('dealReached', e.target.value)}
                    label="Deal Status"
                  >
                    <MenuItem value="all">All Conversations</MenuItem>
                    <MenuItem value="true">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                        Deal Reached
                      </Box>
                    </MenuItem>
                    <MenuItem value="false">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Cancel color="error" sx={{ mr: 1 }} />
                        No Deal
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Conversation Detail Modal */}
        <ConversationDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          conversation={selectedConversation}
        />
      </Box>
  )
}

export default ConversationHistory