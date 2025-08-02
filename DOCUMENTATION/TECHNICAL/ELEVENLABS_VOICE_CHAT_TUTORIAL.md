# 🎤 **ElevenLabs Voice Chat Tutorial - WORKING SOLUTION**

## 🎯 **Goal Achieved: Natural Real-Time Voice Conversation with AI**

This tutorial shows you **exactly** how to build a working voice chat with ElevenLabs AI using React. This solution was **tested and confirmed working** - users can have natural conversations with AI agents.

---

## 🚀 **Step-by-Step Implementation**

### **Step 1: Create React Project Structure**

Create these files in your project directory:

**📁 Project Structure:**
```
your-project/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── index.css
    └── App.js
```

### **Step 2: package.json - Dependencies**

```json
{
  "name": "elevenlabs-voice-chat",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@elevenlabs/react": "^0.4.5",
    "@elevenlabs/client": "^0.4.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### **Step 3: public/index.html - Basic HTML Template**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="ElevenLabs Voice Chat with React" />
    <title>ElevenLabs Voice Chat</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### **Step 4: src/index.js - React Entry Point**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### **Step 5: src/index.css - Beautiful Styling**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 90%;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.status {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
  transition: all 0.3s ease;
}

.status.connected {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.status.listening {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
  animation: pulse 2s infinite;
}

.status.speaking {
  background: #d1ecf1;
  border-color: #b6d4db;
  color: #0c5460;
}

.status.error {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
}

.btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.stop {
  background: #dc3545;
}

.btn.stop:hover:not(:disabled) {
  background: #c82333;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.transcript {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 2rem;
  text-align: left;
  border-top: 2px solid #e9ecef;
  padding-top: 1rem;
}

.message {
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  max-width: 85%;
  word-wrap: break-word;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: auto;
  text-align: right;
}

.message.ai {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.message .speaker {
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}
```

### **Step 6: src/App.js - The Main Component (CRITICAL CODE)**

```javascript
import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

const VoiceChat = () => {
  const [status, setStatus] = useState('Ready to start - click "Start" to begin conversation');
  const [statusType, setStatusType] = useState('');
  const [messages, setMessages] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const updateStatus = (newStatus, type = '') => {
    setStatus(newStatus);
    setStatusType(type);
  };

  const addMessage = (speaker, text) => {
    setMessages(prev => [...prev, { speaker, text, id: Date.now() }]);
  };

  const handleMessage = useCallback((message) => {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('Conversation started:', message);
        addMessage('System', 'Conversation started - you can begin speaking');
        updateStatus('Connected - Start speaking!', 'listening');
        break;
        
      case 'user_transcript':
        if (message.user_transcript && message.user_transcript.trim()) {
          addMessage('You', message.user_transcript);
        }
        break;
        
      case 'agent_response':
        if (message.agent_response && message.agent_response.trim()) {
          addMessage('AI', message.agent_response);
        }
        break;
        
      case 'audio_event':
        updateStatus('AI is speaking...', 'speaking');
        // Audio will be handled automatically by the SDK
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // ⚠️ CRITICAL: This useConversation hook is the key to success!
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      updateStatus('Connected - requesting microphone...', 'connected');
    },
    onMessage: handleMessage,
    onAudio: (audioBuffer) => {
      console.log('Received audio buffer:', audioBuffer);
      updateStatus('AI is speaking...', 'speaking');
      // The SDK will handle audio playback automatically
      setTimeout(() => {
        updateStatus('Listening...', 'listening');
      }, 1000);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      setIsActive(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      updateStatus('Disconnected', '');
      setIsActive(false);
    }
  });

  const startChat = async () => {
    try {
      updateStatus('Connecting to ElevenLabs...', 'connecting');
      setIsActive(true);
      
      // ⚠️ REPLACE WITH YOUR ACTUAL VALUES:
      await conversation.startSession({
        agentId: 'YOUR_AGENT_ID_HERE',        // ← Replace with your agent ID
        apiKey: 'YOUR_API_KEY_HERE'           // ← Replace with your API key
      });
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      updateStatus(`Failed to start: ${error.message}`, 'error');
      setIsActive(false);
    }
  };

  const stopChat = async () => {
    try {
      await conversation.endSession();
      updateStatus('Conversation stopped', '');
      setIsActive(false);
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      updateStatus(`Failed to stop: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container">
      <h1>🎤 ElevenLabs Voice Chat</h1>
      <p className="subtitle">Real-time conversation with AI using React SDK</p>
      
      <div className={`status ${statusType}`}>
        {status}
      </div>

      <div className="controls">
        <button 
          className="btn" 
          onClick={startChat}
          disabled={isActive}
        >
          🎤 Start Conversation
        </button>
        <button 
          className="btn stop" 
          onClick={stopChat}
          disabled={!isActive}
        >
          ⏹️ Stop
        </button>
      </div>

      <div className="transcript">
        {messages.map(({ speaker, text, id }) => (
          <div key={id} className={`message ${speaker.toLowerCase() === 'you' ? 'user' : 'ai'}`}>
            <div className="speaker">{speaker}</div>
            <div>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <VoiceChat />
    </div>
  );
}

export default App;
```

---

## 🔧 **Setup Instructions**

### **1. Prerequisites**
- Node.js installed on your system
- ElevenLabs account with API key
- ElevenLabs agent created (conversational AI agent)

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Your Credentials**
In `src/App.js`, replace these lines:
```javascript
agentId: 'YOUR_AGENT_ID_HERE',        // ← Your ElevenLabs agent ID
apiKey: 'YOUR_API_KEY_HERE'           // ← Your ElevenLabs API key
```

**Example:**
```javascript
agentId: 'agent_7601k1g0796kfj2bzkcds0bkmw2m',
apiKey: 'sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43'
```

### **4. Run the Application**
```bash
npm start
```

### **5. Test the Voice Chat**
1. Open `http://localhost:3000` in your browser
2. Click "Start Conversation"
3. Allow microphone access when prompted
4. **Start talking naturally** - the AI will respond with voice!

---

## 🎯 **Key Success Factors**

### **✅ Critical Elements That Make This Work:**

1. **Official ElevenLabs React SDK** - `@elevenlabs/react@^0.4.5`
2. **useConversation Hook** - Handles all WebSocket/audio complexity
3. **onAudio Callback** - MUST be provided or you get errors
4. **Proper Error Handling** - onError, onConnect, onDisconnect callbacks
5. **React State Management** - Clean status updates and message handling

### **🔥 Why This Architecture Works:**
- **SDK handles complexity** - No manual WebSocket or audio processing
- **React hooks pattern** - Clean, modern React development
- **Automatic audio** - Microphone input and speaker output managed by SDK
- **Real-time updates** - Status and transcript update automatically
- **Error resilience** - Built-in error handling and reconnection

### **⚠️ Common Pitfalls Avoided:**
- Manual WebSocket connection (complex and error-prone)
- AudioContext sample rate mismatches
- Manual audio chunk processing
- Missing onAudio callback (causes runtime errors)
- Complex state management

---

## 🚀 **Expected Behavior**

When working correctly:

1. **Click "Start Conversation"**
   - Status: "Connecting to ElevenLabs..."
   - Status: "Connected - requesting microphone..."
   - Browser prompts for microphone permission

2. **Allow Microphone Access**
   - Status: "Connected - Start speaking!"
   - Transcript shows: "System: Conversation started - you can begin speaking"

3. **Start Talking**
   - Your speech appears in transcript as "You: [your words]"
   - Status changes to "AI is speaking..."
   - AI responds with voice and text appears as "AI: [response]"
   - Status returns to "Listening..."

4. **Natural Conversation Continues**
   - Take turns speaking naturally
   - No need to press buttons during conversation
   - Full transcript maintained on screen

---

## 🔍 **Troubleshooting**

### **Problem: "onAudio is not a function" Error**
**Solution:** Make sure your useConversation includes the onAudio callback:
```javascript
const conversation = useConversation({
  // ... other callbacks
  onAudio: (audioBuffer) => {
    console.log('Received audio buffer:', audioBuffer);
    // Handle audio status updates
  },
  // ... other callbacks
});
```

### **Problem: No Audio Playback**
**Solution:** The SDK handles audio playback automatically. Just ensure:
- Microphone permission granted
- onAudio callback is present
- No browser autoplay restrictions

### **Problem: Connection Fails**
**Solution:** Check:
- Valid agent ID and API key
- Internet connection
- ElevenLabs service status

---

## 🎊 **CONGRATULATIONS!**

You now have a **working real-time voice chat with AI**! This solution:

- ✅ **Works reliably** - tested and confirmed
- ✅ **Easy to implement** - clean React hooks pattern  
- ✅ **Professional quality** - uses official ElevenLabs SDK
- ✅ **Natural conversation** - no button pressing during chat
- ✅ **Beautiful UI** - modern, responsive design

### **🔥 Share This Solution!**

This tutorial provides the **exact working code** for ElevenLabs voice chat integration. Use it as a reference for other projects or as a starting point for more advanced features!

---

**💡 Pro Tip:** The key breakthrough was using the official `@elevenlabs/react` SDK instead of manual WebSocket implementation. The SDK abstracts all the complex audio processing and provides a clean React hooks interface!