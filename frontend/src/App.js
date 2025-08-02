import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ubuntuTheme from './theme/ubuntuTheme'
import './styles/ubuntu.css' // Ubuntu-inspired global styles
import './utils/authDebug' // Enable auth debugging in browser console

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NegotiationChat from './pages/NegotiationChat'
import NegotiationFlow from './pages/NegotiationFlow'
import VoiceTest from './pages/VoiceTest'
import AcademicPrototype from './pages/AcademicPrototype'

function App() {
  return (
    <ThemeProvider theme={ubuntuTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/voice-test" element={<VoiceTest />} />
              <Route path="/academic-prototype" element={<AcademicPrototype />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/negotiation/:scenarioId" 
                element={
                  <ProtectedRoute>
                    <NegotiationChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scenario/:scenarioId" 
                element={
                  <ProtectedRoute>
                    <NegotiationFlow />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333333',
            color: '#FFFFFF',
            border: '1px solid rgba(233, 84, 32, 0.2)',
            borderRadius: '8px',
          },
        }}
      />
    </ThemeProvider>
  )
}

export default App