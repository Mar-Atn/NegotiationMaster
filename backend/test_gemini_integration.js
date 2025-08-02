const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiIntegration() {
  console.log('🧪 Testing Google Gemini integration...');
  
  try {
    // Initialize Gemini client
    const gemini = new GoogleGenerativeAI('AIzaSyC1eczAbf38_I2QZDekkPEa21FpROjFKtc');
    console.log('✅ Gemini client initialized');
    
    // Test basic generation
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Model obtained');
    
    const prompt = `Analyze this negotiation conversation:
    
User: I need a better price on this car.
Dealer: What price range were you thinking?
User: Something around $20,000.
Dealer: I can work with you on financing options.

Please score this on three dimensions (0-100):
1. Claiming Value
2. Creating Value  
3. Relationship Management

Respond in JSON format with scores and brief explanations.`;

    console.log('🔄 Generating response...');
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    console.log('✅ Gemini Response:');
    console.log(text);
    
    return { success: true, response: text };
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testGeminiIntegration().then(result => {
  console.log('\n🏁 Test complete:', result.success ? 'SUCCESS' : 'FAILED');
  process.exit(result.success ? 0 : 1);
});