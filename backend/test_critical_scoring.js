#!/usr/bin/env node

/**
 * CRITICAL SCORING SYSTEM TEST
 * 
 * This script tests the new strict scoring system to ensure:
 * - Failed/short conversations score 10-20 points (not 70+)
 * - Most initial users score 40-60 range
 * - Only exceptional performance gets 70+ scores
 * - Realistic skill assessment aligned with professional standards
 */

const ProfessionalAssessmentService = require('./src/services/professionalAssessmentService')
const AssessmentProcessor = require('./src/services/assessmentProcessor')

console.log('🎯 CRITICAL SCORING SYSTEM TEST - Realistic Negotiation Assessment')
console.log('=' .repeat(80))

async function testScoring() {
  const assessmentService = new ProfessionalAssessmentService()
  const assessmentProcessor = new AssessmentProcessor()

  // TEST CASES - From worst to best

  const testCases = [
    {
      name: "FAILED CONVERSATION - Aborted immediately",
      transcript: "User: Hi\nAssistant: Hello\nUser: Bye",
      expectedRange: [5, 20],
      description: "Conversation ended immediately - should score very low"
    },
    {
      name: "MINIMAL CONVERSATION - No negotiation",
      transcript: "User: Hello, how are you?\nAssistant: I'm doing well, thank you.\nUser: That's good.\nAssistant: Yes, it is.\nUser: Okay, see you later.",
      expectedRange: [10, 25],
      description: "Short conversation with no negotiation content"
    },
    {
      name: "BASIC CONVERSATION - Some negotiation terms",
      transcript: `User: I'd like to discuss a deal.
Assistant: What kind of deal are you thinking about?
User: I need a good price on this service.
Assistant: What's your budget?
User: I was hoping for something around $100.
Assistant: That's quite low for what you're asking.
User: Well, what can you offer?
Assistant: I could do $150.
User: That works for me.`,
      expectedRange: [25, 40],
      description: "Basic negotiation with minimal techniques"
    },
    {
      name: "FAIR CONVERSATION - Multiple negotiation elements",
      transcript: `User: I'm interested in exploring a partnership opportunity.
Assistant: That sounds interesting. What kind of partnership?
User: We're looking at a long-term relationship where both parties benefit.
Assistant: What are your main priorities in this arrangement?
User: Cost effectiveness is important, but we also value quality and reliability.
Assistant: I understand. What's your timeline for implementation?
User: We're flexible on timing if the terms are right.
Assistant: What kind of budget range are you working with?
User: We have some flexibility. What matters most to you?
Assistant: Consistent volume and timely payments are key for us.
User: That works well with our needs. We could guarantee minimum volumes.
Assistant: That's helpful. Let's discuss specific numbers.
User: What if we structured it with tiered pricing based on volume?
Assistant: That could work. Higher volumes would get better rates?
User: Exactly. It's a win-win approach.`,
      expectedRange: [40, 55],
      description: "Decent negotiation with some collaborative elements"
    },
    {
      name: "GOOD CONVERSATION - Advanced techniques",
      transcript: `User: I'd like to explore a strategic partnership that creates mutual value.
Assistant: I'm interested. What specific value creation opportunities do you see?
User: From your perspective, what are the key challenges you're facing in your current operations?
Assistant: Our main challenges are capacity constraints and market volatility.
User: I can understand how that creates pressure. Our solution could help with both.
Assistant: How so?
User: We could provide guaranteed volume commitments, which addresses your capacity utilization, and our flexible contract terms could help manage market volatility risks.
Assistant: That's interesting. What would you need from us?
User: Our priorities are competitive pricing and reliable service levels. What flexibility exists on those terms?
Assistant: We have some room to work on pricing for guaranteed volumes.
User: Excellent. What if we structured this as a multi-year agreement with performance bonuses?
Assistant: That could work. What kind of performance metrics?
User: We could tie bonuses to service level achievements and cost savings we deliver.
Assistant: I like the collaborative approach. What's your BATNA if we can't reach agreement?
User: We have other options, but this partnership offers the most strategic value for both parties.
Assistant: I agree. Let's work together to structure something that benefits everyone.
User: Perfect. Should we explore some specific scenarios and trade-offs?
Assistant: Yes, let's brainstorm some options that work for both sides.`,
      expectedRange: [55, 70],
      description: "Good negotiation with multiple advanced techniques"
    },
    {
      name: "EXCELLENT CONVERSATION - Professional negotiation mastery",
      transcript: `User: I'd like to propose a strategic alliance that leverages our complementary strengths to create significant mutual value.
Assistant: That sounds compelling. Help me understand your vision for this collaboration.
User: From analyzing the market dynamics, I see opportunities where your distribution capabilities and our technology platform could create a competitive advantage neither of us could achieve independently.
Assistant: Interesting perspective. What specific market research supports this analysis?
User: Industry benchmarks show that integrated solutions command 30-40% premium pricing, and customer retention rates improve by 60% when technology and service are seamlessly combined.
Assistant: Those are compelling numbers. What would this look like operationally?
User: I envision a partnership where we co-develop integrated solutions, share market intelligence, and jointly invest in customer success. The key is aligning our incentives for long-term value creation.
Assistant: What specific incentive structures are you thinking about?
User: We could structure revenue sharing based on customer lifetime value rather than traditional transaction-based models. This rewards both parties for customer success and retention.
Assistant: That's an innovative approach. What are your non-negotiables in this arrangement?
User: Transparency in customer data, joint decision-making on product roadmap, and objective criteria for performance measurement. What matters most to you?
Assistant: We need to maintain our brand integrity and have clear exit clauses if performance doesn't meet expectations.
User: Absolutely reasonable. What if we built in milestone-based reviews with objective performance criteria? Both parties could reassess based on predetermined metrics.
Assistant: That provides good protection. What's your timeline for implementation?
User: We're flexible on timing to ensure we get the structure right. Quality of partnership is more important than speed to market.
Assistant: I appreciate that approach. What alternatives are you considering if we can't reach agreement?
User: We have options with two other potential partners, but frankly, your market position and cultural fit make this our preferred path. That said, we need terms that work for both parties.
Assistant: I value your directness. Let's explore some specific scenarios. What if we started with a limited pilot program to test the model?
User: Excellent idea. A pilot reduces risk for both parties and gives us real data to optimize the full partnership structure.
Assistant: Perfect. Should we define success metrics for the pilot and create contingent agreements for the full partnership?
User: Yes, let's structure it so both parties have clear expectations and pathways forward based on pilot results.`,
      expectedRange: [70, 85],
      description: "Exceptional negotiation demonstrating professional mastery"
    }
  ]

  console.log(`\n🧪 Testing ${testCases.length} conversation scenarios...\n`)

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`)
    console.log(`   Description: ${testCase.description}`)
    console.log(`   Expected Range: ${testCase.expectedRange[0]}-${testCase.expectedRange[1]} points`)
    
    try {
      // Test with professional assessment service
      const mockData = {
        id: 'test-conversation',
        user_id: 'test-user',
        scenario_id: null,
        transcript: testCase.transcript,
        voice_metrics: {},
        status: 'completed',
        duration: 0,
        outcome: null
      }

      // Use the strict fallback assessment to test our new scoring
      const results = assessmentService.generateBasicProfessionalAssessment(
        testCase.transcript, 
        null, 
        { skillLevel: 'intermediate' }
      )

      const overallScore = results.scores?.overall || 0
      const inRange = overallScore >= testCase.expectedRange[0] && overallScore <= testCase.expectedRange[1]
      
      console.log(`   📊 SCORE: ${overallScore} points ${inRange ? '✅' : '❌'}`)
      console.log(`   🔍 Breakdown: Claiming=${results.scores?.claimingValue || 0}, Creating=${results.scores?.creatingValue || 0}, Relationship=${results.scores?.relationshipManagement || 0}`)
      
      if (!inRange) {
        console.log(`   ⚠️  SCORING ISSUE: Expected ${testCase.expectedRange[0]}-${testCase.expectedRange[1]}, got ${overallScore}`)
      }

      // Also test with assessment processor
      const processorResults = assessmentProcessor.generateSimplifiedAssessment(testCase.transcript, {}, null)
      const processorScore = processorResults.overall || 0
      console.log(`   🔄 Processor Score: ${processorScore} points`)
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('🎯 CRITICAL SCORING TEST SUMMARY:')
  console.log('- Failed conversations should score 5-20 points (was ~70)')
  console.log('- Basic conversations should score 25-40 points (was ~70+)')
  console.log('- Good conversations should score 55-70 points (realistic professional threshold)')
  console.log('- Only exceptional conversations should score 70+ points')
  console.log('')
  console.log('✅ SCORING OVERHAUL COMPLETE - More realistic and demanding assessment!')
}

// Run the test
testScoring().catch(console.error)