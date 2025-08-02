/**
 * Prompt Validation and Quality Assurance System
 * 
 * Ensures AI prompts generate high-quality, educational feedback that meets
 * business education standards and provides meaningful learning outcomes.
 */

class PromptValidation {

  /**
   * Validate prompt quality before sending to AI
   */
  validatePromptQuality(promptData, transcript, scenarioContext) {
    const validation = {
      isValid: true,
      score: 100,
      issues: [],
      recommendations: []
    }

    // 1. Check prompt structure completeness
    this.validatePromptStructure(promptData, validation)
    
    // 2. Check conversation content adequacy
    this.validateConversationContent(transcript, validation)
    
    // 3. Check scenario context richness
    this.validateScenarioContext(scenarioContext, validation)
    
    // 4. Check educational framework alignment
    this.validateEducationalFramework(promptData, validation)

    validation.isValid = validation.score >= 70
    return validation
  }

  /**
   * Validate prompt structure and completeness
   */
  validatePromptStructure(promptData, validation) {
    // Check for required components
    const requiredComponents = [
      'role',
      'prompt'
    ]

    requiredComponents.forEach(component => {
      if (!promptData[component]) {
        validation.issues.push(`Missing required component: ${component}`)
        validation.score -= 20
      }
    })

    // Check prompt length and detail
    if (promptData.prompt && promptData.prompt.length < 500) {
      validation.issues.push('Prompt may be too brief for comprehensive analysis')
      validation.score -= 10
    }

    // Check for educational language
    const educationalKeywords = [
      'analysis', 'assessment', 'technique', 'framework', 'evidence',
      'example', 'quote', 'improvement', 'development', 'learning'
    ]

    const hasEducationalFocus = educationalKeywords.some(keyword => 
      promptData.prompt.toLowerCase().includes(keyword)
    )

    if (!hasEducationalFocus) {
      validation.issues.push('Prompt lacks clear educational focus')
      validation.score -= 15
    }
  }

  /**
   * Validate conversation content adequacy
   */
  validateConversationContent(transcript, validation) {
    if (!transcript || transcript.length < 100) {
      validation.issues.push('Transcript too short for meaningful analysis')
      validation.score -= 25
      return
    }

    // Check for conversation complexity
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10)
    if (sentences.length < 10) {
      validation.issues.push('Conversation lacks sufficient depth for analysis')
      validation.score -= 15
    }

    // Check for question patterns (indication of engagement)
    const questionCount = (transcript.match(/\?/g) || []).length
    if (questionCount < 2) {
      validation.issues.push('Limited questioning patterns may reduce analysis quality')
      validation.score -= 10
    }

    // Check for negotiation-relevant content
    const negotiationKeywords = [
      'price', 'cost', 'value', 'deal', 'agreement', 'terms',
      'offer', 'proposal', 'negotiate', 'discuss', 'consider'
    ]

    const hasNegotiationContent = negotiationKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword)
    )

    if (!hasNegotiationContent) {
      validation.issues.push('Content may not be negotiation-relevant')
      validation.score -= 20
    }
  }

  /**
   * Validate scenario context richness
   */
  validateScenarioContext(scenarioContext, validation) {
    if (!scenarioContext) {
      validation.issues.push('Missing scenario context')
      validation.score -= 30
      return
    }

    const importantFields = [
      'title', 'type', 'industry', 'keyIssues'
    ]

    const missingFields = importantFields.filter(field => !scenarioContext[field])
    if (missingFields.length > 0) {
      validation.issues.push(`Missing scenario context: ${missingFields.join(', ')}`)
      validation.score -= (missingFields.length * 5)
    }

    // Check for scenario complexity
    if (scenarioContext.keyIssues && scenarioContext.keyIssues.length < 2) {
      validation.issues.push('Scenario may lack sufficient complexity for rich analysis')
      validation.score -= 10
    }
  }

  /**
   * Validate educational framework alignment
   */
  validateEducationalFramework(promptData, validation) {
    // Check for Harvard Negotiation Method references
    const harvardKeywords = [
      'interests', 'positions', 'batna', 'options', 'criteria',
      'harvard', 'principled negotiation', 'mutual gain'
    ]

    const hasHarvardAlignment = harvardKeywords.some(keyword => 
      promptData.prompt.toLowerCase().includes(keyword)
    )

    if (!hasHarvardAlignment) {
      validation.issues.push('Prompt should reference Harvard Negotiation Method principles')
      validation.recommendations.push('Add references to interests vs positions, BATNA, option generation')
      validation.score -= 10
    }

    // Check for specific feedback requirements
    const feedbackKeywords = [
      'quote', 'example', 'specific', 'evidence', 'actionable',
      'improvement', 'recommendation', 'technique'
    ]

    const hasFeedbackStructure = feedbackKeywords.some(keyword => 
      promptData.prompt.toLowerCase().includes(keyword)
    )

    if (!hasFeedbackStructure) {
      validation.issues.push('Prompt should specify requirements for specific, actionable feedback')
      validation.recommendations.push('Add requirements for conversation quotes and specific examples')
      validation.score -= 15
    }
  }

  /**
   * Validate AI response quality
   */
  validateAIResponse(aiResponse, originalPrompt) {
    const validation = {
      isValid: true,
      score: 100,
      issues: [],
      suggestions: []
    }

    // 1. Check response completeness
    this.validateResponseCompleteness(aiResponse, validation)
    
    // 2. Check for conversation quotes
    this.validateConversationQuotes(aiResponse, validation)
    
    // 3. Check for scoring consistency
    this.validateScoringConsistency(aiResponse, validation)
    
    // 4. Check educational value
    this.validateEducationalValue(aiResponse, validation)

    validation.isValid = validation.score >= 60
    return validation
  }

  /**
   * Validate AI response completeness
   */
  validateResponseCompleteness(aiResponse, validation) {
    if (!aiResponse || aiResponse.length < 500) {
      validation.issues.push('Response too brief for comprehensive analysis')
      validation.score -= 30
    }

    // Check for required sections
    const requiredSections = [
      'score', 'analysis', 'recommendation', 'example'
    ]

    requiredSections.forEach(section => {
      if (!aiResponse.toLowerCase().includes(section)) {
        validation.issues.push(`Missing required section: ${section}`)
        validation.score -= 15
      }
    })
  }

  /**
   * Validate presence of conversation quotes
   */
  validateConversationQuotes(aiResponse, validation) {
    // Look for quoted text patterns
    const quotePatterns = [
      /"[^"]{10,}"/g,           // Standard quotes with substantial content
      /Quote:\s*"[^"]+"/g,      // Structured quote format
      /Example:\s*"[^"]+"/g     // Example quote format
    ]

    let quoteCount = 0
    quotePatterns.forEach(pattern => {
      const matches = aiResponse.match(pattern)
      if (matches) {
        quoteCount += matches.length
      }
    })

    if (quoteCount < 3) {
      validation.issues.push(`Insufficient conversation quotes (found ${quoteCount}, need 3+)`)
      validation.score -= 20
    }

    if (quoteCount === 0) {
      validation.issues.push('No conversation quotes found - analysis lacks specific evidence')
      validation.score -= 30
    }
  }

  /**
   * Validate scoring consistency and reasonableness
   */
  validateScoringConsistency(aiResponse, validation) {
    // Extract scores from response
    const scorePattern = /(\d+)(?:\/100|%|\s*out of\s*100)/g
    const scores = []
    let match

    while ((match = scorePattern.exec(aiResponse)) !== null) {
      const score = parseInt(match[1])
      if (score >= 0 && score <= 100) {
        scores.push(score)
      }
    }

    if (scores.length === 0) {
      validation.issues.push('No valid scores found in response')
      validation.score -= 40
      return
    }

    // Check score reasonableness
    scores.forEach(score => {
      if (score > 95) {
        validation.suggestions.push('Very high scores should be reserved for exceptional performance')
      }
      if (score < 10) {
        validation.suggestions.push('Very low scores should include specific guidance for improvement')
      }
    })

    // Check score consistency
    if (scores.length >= 3) {
      const range = Math.max(...scores) - Math.min(...scores)
      if (range > 40) {
        validation.suggestions.push('Large score variations should be clearly justified')
      }
    }
  }

  /**
   * Validate educational value of response
   */
  validateEducationalValue(aiResponse, validation) {
    // Check for actionable recommendations
    const actionableKeywords = [
      'practice', 'improve', 'develop', 'focus on', 'work on',
      'try', 'consider', 'implement', 'apply', 'use'
    ]

    const hasActionableContent = actionableKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword)
    )

    if (!hasActionableContent) {
      validation.issues.push('Response lacks actionable improvement suggestions')
      validation.score -= 15
    }

    // Check for theoretical grounding
    const theoryKeywords = [
      'harvard', 'principled', 'batna', 'interests', 'positions',
      'negotiation theory', 'research', 'studies', 'framework'
    ]

    const hasTheoryConnection = theoryKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword)
    )

    if (!hasTheoryConnection) {
      validation.issues.push('Response should connect to negotiation theory and frameworks')
      validation.score -= 10
    }

    // Check for skill development focus
    const developmentKeywords = [
      'skill', 'competency', 'ability', 'technique', 'method',
      'strategy', 'approach', 'capability', 'proficiency'
    ]

    const hasSkillFocus = developmentKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword)
    )

    if (!hasSkillFocus) {
      validation.issues.push('Response should focus on specific skill development')
      validation.score -= 10
    }
  }

  /**
   * Generate quality improvement suggestions
   */
  generateQualityImprovements(validation) {
    const improvements = []

    validation.issues.forEach(issue => {
      switch (true) {
        case issue.includes('conversation quotes'):
          improvements.push({
            category: 'evidence',
            suggestion: 'Include minimum 3 direct conversation quotes with "Quote:" labels',
            priority: 'high'
          })
          break

        case issue.includes('actionable'):
          improvements.push({
            category: 'recommendations',
            suggestion: 'Provide specific, implementable improvement techniques',
            priority: 'high'
          })
          break

        case issue.includes('score'):
          improvements.push({
            category: 'assessment',
            suggestion: 'Include numerical scores (0-100) with clear rationale',
            priority: 'medium'
          })
          break

        case issue.includes('theory'):
          improvements.push({
            category: 'education',
            suggestion: 'Connect observations to Harvard Negotiation Method principles',
            priority: 'medium'
          })
          break

        default:
          improvements.push({
            category: 'general',
            suggestion: `Address: ${issue}`,
            priority: 'low'
          })
      }
    })

    return improvements
  }

  /**
   * Validate prompt against scenario type requirements
   */
  validateScenarioSpecificRequirements(promptData, scenarioType) {
    const requirements = this.getScenarioRequirements(scenarioType)
    const validation = {
      isValid: true,
      score: 100,
      issues: []
    }

    requirements.forEach(requirement => {
      if (!promptData.prompt.toLowerCase().includes(requirement.keyword.toLowerCase())) {
        validation.issues.push(`Missing ${scenarioType} requirement: ${requirement.description}`)
        validation.score -= requirement.weight
      }
    })

    validation.isValid = validation.score >= 75
    return validation
  }

  /**
   * Get scenario-specific requirements
   */
  getScenarioRequirements(scenarioType) {
    const requirements = {
      'vendor_negotiation': [
        { keyword: 'commercial terms', description: 'Commercial terms analysis', weight: 15 },
        { keyword: 'service level', description: 'Service level evaluation', weight: 15 },
        { keyword: 'risk allocation', description: 'Risk allocation assessment', weight: 10 },
        { keyword: 'supplier relationship', description: 'Supplier relationship focus', weight: 10 }
      ],
      'partnership_deal': [
        { keyword: 'partnership', description: 'Partnership dynamics', weight: 15 },
        { keyword: 'shared value', description: 'Shared value creation', weight: 15 },
        { keyword: 'governance', description: 'Governance structure', weight: 10 },
        { keyword: 'long-term', description: 'Long-term relationship focus', weight: 10 }
      ],
      'salary_negotiation': [
        { keyword: 'compensation', description: 'Compensation strategy', weight: 15 },
        { keyword: 'performance', description: 'Performance linkage', weight: 15 },
        { keyword: 'career development', description: 'Career development focus', weight: 10 },
        { keyword: 'market rate', description: 'Market rate benchmarking', weight: 10 }
      ],
      'conflict_resolution': [
        { keyword: 'conflict', description: 'Conflict management', weight: 20 },
        { keyword: 'de-escalation', description: 'De-escalation techniques', weight: 15 },
        { keyword: 'relationship repair', description: 'Relationship repair focus', weight: 10 },
        { keyword: 'underlying issues', description: 'Root cause analysis', weight: 10 }
      ]
    }

    return requirements[scenarioType] || []
  }

  /**
   * Generate prompt enhancement suggestions
   */
  generatePromptEnhancements(promptData, scenarioContext) {
    const enhancements = []

    // Industry-specific enhancements
    if (scenarioContext.industry) {
      enhancements.push({
        type: 'industry_context',
        suggestion: `Add industry-specific negotiation considerations for ${scenarioContext.industry}`,
        example: `Include analysis of ${scenarioContext.industry} market dynamics and industry norms`
      })
    }

    // Complexity-based enhancements
    if (scenarioContext.complexity === 'high') {
      enhancements.push({
        type: 'complexity_focus',
        suggestion: 'Emphasize sophisticated strategic thinking evaluation',
        example: 'Look for multi-dimensional thinking and advanced technique integration'
      })
    }

    // Stakeholder-based enhancements
    if (scenarioContext.stakeholders && scenarioContext.stakeholders.length > 2) {
      enhancements.push({
        type: 'multi_party',
        suggestion: 'Include multi-party dynamics assessment',
        example: 'Evaluate coalition management and stakeholder alignment techniques'
      })
    }

    return enhancements
  }
}

module.exports = new PromptValidation()