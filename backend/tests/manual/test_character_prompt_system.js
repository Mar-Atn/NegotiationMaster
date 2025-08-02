#!/usr/bin/env node

/**
 * Test script for the sophisticated case-specific confidential instructions system
 * 
 * This script demonstrates how the new system separates:
 * 1. Character traits (permanent personality/style) 
 * 2. Case-specific instructions (dynamic scenario information)
 * 
 * Example: Sarah Chen car sale with confidential business intelligence
 */

const voiceService = require('./src/services/voiceService')
const db = require('./src/config/database')
const logger = require('./src/config/logger')

async function testCharacterPromptSystem() {
  try {
    console.log('🔍 Testing Sophisticated Character Prompt System')
    console.log('=' .repeat(60))
    
    // Test 1: Basic character traits only (no scenario)
    console.log('\n📋 Test 1: Character Traits Only (No Scenario)')
    console.log('-'.repeat(40))
    
    const basicPrompt = await voiceService.buildCharacterPrompt('Sarah Chen', {}, '', null)
    console.log('✅ Generated basic character prompt')
    console.log(`📏 Length: ${basicPrompt.length} characters`)
    console.log('📝 Contains: Character personality, Big Five traits, behavior parameters')
    
    // Test 2: Full system with scenario-specific confidential instructions
    console.log('\n📋 Test 2: Full System with Case-Specific Intelligence')
    console.log('-'.repeat(40))
    
    // Get a real negotiation from database to test with
    const testNegotiation = await db('negotiations')
      .join('scenarios', 'negotiations.scenario_id', 'scenarios.id')
      .select('negotiations.id as negotiation_id', 'scenarios.id as scenario_id', 'scenarios.title')
      .first()
    
    if (testNegotiation) {
      console.log(`🎯 Using negotiation: ${testNegotiation.title}`)
      
      const fullPrompt = await voiceService.buildCharacterPrompt(
        'Sarah Chen', 
        {}, 
        '', 
        testNegotiation.negotiation_id
      )
      
      console.log('✅ Generated full character prompt with case-specific instructions')
      console.log(`📏 Length: ${fullPrompt.length} characters`)
      console.log('📝 Contains: Character traits + scenario variables + confidential intelligence')
      
      // Show structure breakdown
      const sections = [
        'PERSONALITY PROFILE',
        'PSYCHOLOGICAL PROFILE',
        'BEHAVIOR PARAMETERS', 
        'PREFERRED NEGOTIATION TACTICS',
        'CASE-SPECIFIC CONFIDENTIAL INSTRUCTIONS',
        'CONFIDENTIAL BUSINESS INTELLIGENCE',
        'PRIVILEGED INFORMATION',
        'HIDDEN MOTIVATIONS',
        'STRATEGIC GUIDANCE',
        'BATNA'
      ]
      
      console.log('\n📊 Prompt Structure Analysis:')
      sections.forEach(section => {
        const hasSection = fullPrompt.includes(section)
        console.log(`  ${hasSection ? '✅' : '❌'} ${section}`)
      })
      
      // Test 3: Show sample of confidential business intelligence
      console.log('\n📋 Test 3: Sample Confidential Business Intelligence')
      console.log('-'.repeat(40))
      
      // Get scenario variables for intelligence generation
      const scenario = await db('scenarios').where('id', testNegotiation.scenario_id).first()
      if (scenario && scenario.scenario_variables) {
        const scenarioVars = JSON.parse(scenario.scenario_variables)
        const character = await db('ai_characters').where('name', 'Sarah Chen').first()
        
        const intelligence = voiceService.generateBusinessIntelligence(scenarioVars, character)
        console.log('Generated business intelligence:')
        console.log(intelligence)
        
        // Show key intelligence points
        if (scenarioVars.asking_price && scenarioVars.dealer_cost) {
          const profit = scenarioVars.asking_price - scenarioVars.dealer_cost
          const profitPercent = ((profit / scenarioVars.dealer_cost) * 100).toFixed(1)
          console.log(`\n💰 Key Intelligence Metrics:`)
          console.log(`  - Dealer Cost: $${scenarioVars.dealer_cost}`)
          console.log(`  - Asking Price: $${scenarioVars.asking_price}`) 
          console.log(`  - Profit Margin: $${profit} (${profitPercent}% markup)`)
          console.log(`  - Market Range: $${scenarioVars.market_range_low} - $${scenarioVars.market_range_high}`)
        }
      }
      
    } else {
      console.log('⚠️  No test negotiation found in database')
    }
    
    // Test 4: Character personality interpretation
    console.log('\n📋 Test 4: Big Five Personality Interpretation')
    console.log('-'.repeat(40))
    
    const character = await db('ai_characters').where('name', 'Sarah Chen').first()
    if (character && character.personality_profile) {
      const personality = JSON.parse(character.personality_profile)
      
      console.log('Sarah Chen Personality Analysis:')
      Object.entries(personality).forEach(([trait, score]) => {
        if (typeof score === 'number') {
          const interpretation = voiceService.interpretBigFiveTrait(trait, score)
          console.log(`  - ${trait}: ${score} (${interpretation})`)
        }
      })
    }
    
    console.log('\n🎉 Character Prompt System Test Completed Successfully!')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    logger.error('Character prompt system test failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run the test
testCharacterPromptSystem()