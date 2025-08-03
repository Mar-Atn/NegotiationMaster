const axios = require('axios')

const ELEVENLABS_API_KEY = "sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43"
const CONVERSATION_ID = "conv_6401k1phxhyzfz2va165272pmakz"

async function testTranscriptFetch() {
  try {
    console.log('🎵 Testing ElevenLabs transcript fetch...')
    console.log(`Conversation ID: ${CONVERSATION_ID}`)
    console.log('-'.repeat(50))

    const url = `https://api.elevenlabs.io/v1/convai/conversations/${CONVERSATION_ID}`
    const headers = {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    }

    const response = await axios.get(url, { headers })
    const conversationData = response.data

    console.log('✅ Successfully fetched conversation data')
    console.log(`Status: ${conversationData.status}`)
    console.log(`Transcript messages: ${conversationData.transcript?.length || 0}`)
    
    // Debug: Show the full response structure
    console.log('\n🔍 Full response structure:')
    console.log(JSON.stringify(conversationData, null, 2))
    
    if (conversationData.transcript && conversationData.transcript.length > 0) {
      console.log('\n📝 Transcript:')
      console.log('='.repeat(60))
      
      conversationData.transcript.forEach((message, index) => {
        console.log(`\n${index + 1}. Message structure:`)
        console.log(JSON.stringify(message, null, 2))
      })
    }

  } catch (error) {
    console.error('❌ Error fetching conversation transcript:', error.message)
    if (error.response) {
      console.error(`Status: ${error.response.status}`)
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`)
    }
  }
}

testTranscriptFetch()