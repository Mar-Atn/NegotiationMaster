import React from 'react'
import { Box, Container } from '@mui/material'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

export default Layout