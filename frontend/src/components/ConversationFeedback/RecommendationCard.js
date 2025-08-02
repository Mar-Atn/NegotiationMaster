import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { Star } from '@mui/icons-material'

const RecommendationCard = ({ recommendation }) => {
  const priorityColor = recommendation.priority === 'high' ? 'error' : 
                       recommendation.priority === 'medium' ? 'warning' : 'info'
  
  return (
    <Card sx={{ height: '100%', border: 1, borderColor: `${priorityColor}.main` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {recommendation.title}
          </Typography>
          <Chip 
            label={recommendation.priority}
            color={priorityColor}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {recommendation.description}
        </Typography>
        
        {recommendation.specificActions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Specific Actions:
            </Typography>
            <List dense>
              {recommendation.specificActions.slice(0, 3).map((action, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Star sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={action}
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {recommendation.expectedImprovement && (
          <Typography variant="caption" color="success.main" fontWeight="medium">
            Expected: {recommendation.expectedImprovement}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default RecommendationCard