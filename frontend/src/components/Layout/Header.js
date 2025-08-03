import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material'
import { AccountCircle, Logout, BugReport } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [testMenuAnchorEl, setTestMenuAnchorEl] = React.useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
    navigate('/login')
  }

  const handleProfile = () => {
    handleClose()
    navigate('/profile')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  const handleTestMenu = (event) => {
    setTestMenuAnchorEl(event.currentTarget)
  }

  const handleTestMenuClose = () => {
    setTestMenuAnchorEl(null)
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          NegotiationMaster
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" onClick={handleDashboard}>
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleTestMenu}
              startIcon={<BugReport />}
            >
              Test
            </Button>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              id="test-menu"
              anchorEl={testMenuAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(testMenuAnchorEl)}
              onClose={handleTestMenuClose}
            >
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/voice-test'); }}>
                Voice Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/transcript-test'); }}>
                Transcript Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/assessment-test'); }}>
                Assessment Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/academic-prototype'); }}>
                Academic Prototype
              </MenuItem>
            </Menu>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={handleTestMenu}
              startIcon={<BugReport />}
            >
              Test
            </Button>
            <Menu
              id="test-menu-guest"
              anchorEl={testMenuAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(testMenuAnchorEl)}
              onClose={handleTestMenuClose}
            >
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/voice-test'); }}>
                Voice Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/transcript-test'); }}>
                Transcript Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/assessment-test'); }}>
                Assessment Test
              </MenuItem>
              <MenuItem onClick={() => { handleTestMenuClose(); navigate('/academic-prototype'); }}>
                Academic Prototype
              </MenuItem>
            </Menu>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header