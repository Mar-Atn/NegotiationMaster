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
import { AccountCircle, Logout, BugReport, TrendingUp } from '@mui/icons-material'
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

  const handleMyProgress = () => {
    navigate('/my-progress')
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
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            fontWeight: 500
          }}
          onClick={() => navigate('/')}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            NegotiationMaster
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            NM
          </Box>
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Button 
              color="inherit" 
              onClick={handleDashboard}
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleMyProgress}
              startIcon={<TrendingUp />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                My Progress
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                Progress
              </Box>
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleTestMenu}
              startIcon={<BugReport />}
              sx={{ 
                display: { xs: 'none', lg: 'flex' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Test
            </Button>
            
            {/* Mobile Dashboard Button */}
            <IconButton
              color="inherit"
              onClick={handleDashboard}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                mr: 1
              }}
              aria-label="Dashboard"
            >
              <TrendingUp />
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ 
                width: { xs: 28, md: 32 }, 
                height: { xs: 28, md: 32 },
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
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