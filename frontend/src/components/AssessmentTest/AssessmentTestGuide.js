import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  CheckCircle,
  Info,
  Assessment,
  Schedule,
  DataObject,
  TrendingUp
} from '@mui/icons-material'

const AssessmentTestGuide = () => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" />
          Assessment Test Guide
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This test interface allows you to generate professional assessments for existing ElevenLabs conversations using the NegotiationMaster AI Assessment Engine.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            How It Works:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Enter an existing ElevenLabs conversation ID" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="System fetches the transcript from ElevenLabs API" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="AI analyzes the conversation using professional methodology" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Comprehensive assessment is generated and displayed" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assessment Components:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Assessment />} label="Executive Summary" color="primary" />
            <Chip icon={<TrendingUp />} label="3D Scoring" color="success" />
            <Chip icon={<DataObject />} label="Performance Analysis" color="info" />
            <Chip icon={<Schedule />} label="Next Steps" color="warning" />
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Test Conversation IDs:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            conv_6401k1phxhyzfz2va165272pmakz (Default)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Use any valid ElevenLabs conversation ID from your account
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Note:</strong> Assessment generation requires valid ElevenLabs API access and may take 30-60 seconds to complete.
        </Alert>
      </CardContent>
    </Card>
  )
}

export default AssessmentTestGuide