/**
 * AI Prompt Engine for Negotiation Analysis
 * 
 * Orchestrates AI-powered analysis using expert-designed prompts to generate
 * sophisticated negotiation feedback with educational value and specific examples.
 * Integrates with OpenAI API for high-quality natural language analysis.
 */

const feedbackPrompts = require('./feedbackPrompts')
const scoringRubric = require('./scoringRubric')

class AIPromptEngine {
  constructor() {
    this.openaiClient = null
    this.initializeOpenAI()
  }

  async initializeOpenAI() {
    try {
      const { OpenAI } = require('openai')
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      console.log('✅ OpenAI client initialized for AI prompt engine')
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error)
    }
  }

  /**
   * Generate comprehensive AI-powered negotiation analysis
   * Uses master analysis prompt for complete assessment
   */
  async generateComprehensiveAnalysis(transcript, scenarioContext, voiceMetrics = null, userSkillLevel = 'intermediate') {
    try {
      console.log('🤖 Generating comprehensive AI analysis...')
      
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized')
      }

      // Get master analysis prompt
      const promptData = feedbackPrompts.getMasterAnalysisPrompt(transcript, scenarioContext, voiceMetrics)
      
      // Add skill level modifier
      const skillModifier = feedbackPrompts.getProgressiveDifficultyModifier(userSkillLevel)
      
      // Add industry context if available
      const industryModifier = scenarioContext.industry ? 
        feedbackPrompts.getIndustryContextModifier(scenarioContext.industry) : ''
      
      // Add scoring guidelines
      const scoringGuidelines = scoringRubric.getScoringGuidelines()

      const fullPrompt = `${promptData.prompt}

${skillModifier}

${industryModifier}

${scoringGuidelines}

## QUALITY CONTROL
${feedbackPrompts.getQualityControlPrompt()}

Please provide a comprehensive analysis following the exact format specified above.`

      // Call OpenAI API
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are ${promptData.role}. Provide expert-level negotiation analysis with specific conversation examples and actionable feedback.`
          },
          {
            role: 'user', 
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      const analysisText = response.choices[0].message.content
      
      // Parse the AI response to extract structured data
      const structuredAnalysis = this.parseAIAnalysis(analysisText)
      
      console.log('✅ Comprehensive AI analysis generated')
      return {
        rawAnalysis: analysisText,
        structuredAnalysis,
        tokensUsed: response.usage.total_tokens,
        model: 'gpt-4-turbo-preview'
      }
      
    } catch (error) {
      console.error('❌ Failed to generate comprehensive AI analysis:', error)
      throw error
    }
  }

  /**
   * Generate dimension-specific analysis using focused prompts
   */
  async generateDimensionAnalysis(dimension, transcript, scenarioContext, voiceMetrics = null) {
    try {
      console.log(`🎯 Generating ${dimension} dimension analysis...`)
      
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized')
      }

      let promptData
      switch (dimension) {
        case 'claiming_value':
          promptData = feedbackPrompts.getClaimingValuePrompt(transcript, scenarioContext)
          break
        case 'creating_value':
          promptData = feedbackPrompts.getCreatingValuePrompt(transcript, scenarioContext)
          break
        case 'relationship_management':
          promptData = feedbackPrompts.getRelationshipManagementPrompt(transcript, scenarioContext, voiceMetrics)
          break
        default:
          throw new Error(`Unknown dimension: ${dimension}`)
      }

      // Add relevant scoring rubric
      const rubric = this.getDimensionRubric(dimension)
      const fullPrompt = `${promptData.prompt}

## SCORING RUBRIC
${JSON.stringify(rubric, null, 2)}

Please provide detailed analysis following the format specified above.`

      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are ${promptData.role}. Provide expert analysis for ${dimension} with specific conversation examples.`
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const analysisText = response.choices[0].message.content
      const structuredAnalysis = this.parseDimensionAnalysis(dimension, analysisText)
      
      console.log(`✅ ${dimension} analysis generated`)
      return {
        dimension,
        rawAnalysis: analysisText,
        structuredAnalysis,
        tokensUsed: response.usage.total_tokens
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate ${dimension} analysis:`, error)
      throw error
    }
  }

  /**
   * Generate scenario-specific analysis for specialized negotiation types
   */
  async generateScenarioSpecificAnalysis(scenarioType, transcript, scenarioContext) {
    try {
      console.log(`🎭 Generating ${scenarioType} scenario-specific analysis...`)
      
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized')
      }

      const promptData = feedbackPrompts.getScenarioSpecificPrompt(scenarioType, transcript, scenarioContext)
      
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are ${promptData.role}. Provide specialized analysis for ${scenarioType} negotiations.`
          },
          {
            role: 'user',
            content: promptData.prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })

      console.log(`✅ ${scenarioType} scenario analysis generated`)
      return {
        scenarioType,
        analysis: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate ${scenarioType} analysis:`, error)
      throw error
    }
  }

  /**
   * Parse AI analysis text into structured data
   */
  parseAIAnalysis(analysisText) {
    try {
      const structured = {
        scores: {},
        dimensionAnalysis: {},
        executiveSummary: '',
        harvardPrinciples: {},
        recommendations: [],
        conversationQuotes: []
      }

      // Extract scores using regex patterns
      const scorePatterns = {
        claimingValue: /CLAIMING VALUE SCORE.*?(\d+)/i,
        creatingValue: /CREATING VALUE SCORE.*?(\d+)/i,
        relationshipManagement: /RELATIONSHIP MANAGEMENT SCORE.*?(\d+)/i
      }

      Object.entries(scorePatterns).forEach(([dimension, pattern]) => {
        const match = analysisText.match(pattern)
        if (match) {
          structured.scores[dimension] = parseInt(match[1])
        }
      })

      // Extract executive summary
      const summaryMatch = analysisText.match(/EXECUTIVE SUMMARY\s*\n(.*?)(?=\n#|\n\*\*|$)/s)
      if (summaryMatch) {
        structured.executiveSummary = summaryMatch[1].trim()
      }

      // Extract conversation quotes
      const quotePattern = /Quote:\s*"([^"]+)"/g
      let quoteMatch
      while ((quoteMatch = quotePattern.exec(analysisText)) !== null) {
        structured.conversationQuotes.push(quoteMatch[1])
      }

      // Extract recommendations
      const recommendationPattern = /(?:Immediate Focus|Short-term Development|Strategic Enhancement)[:\s]*\n[^]*?(?=\n(?:Immediate Focus|Short-term Development|Strategic Enhancement)|$)/g
      let recMatch
      while ((recMatch = recommendationPattern.exec(analysisText)) !== null) {
        structured.recommendations.push(recMatch[0].trim())
      }

      return structured
      
    } catch (error) {
      console.error('Failed to parse AI analysis:', error)
      return { error: 'Failed to parse analysis', rawText: analysisText }
    }
  }

  /**
   * Parse dimension-specific analysis
   */
  parseDimensionAnalysis(dimension, analysisText) {
    try {
      const structured = {
        dimension,
        score: null,
        techniques: [],
        strengths: [],
        improvements: [],
        quotes: []
      }

      // Extract score
      const scoreMatch = analysisText.match(/Score.*?(\d+)/i)
      if (scoreMatch) {
        structured.score = parseInt(scoreMatch[1])
      }

      // Extract techniques
      const techniquePattern = /Techniques Observed[:\s]*\n([^#]*?)(?=\n#|\n\*\*|$)/s
      const techniqueMatch = analysisText.match(techniquePattern)
      if (techniqueMatch) {
        structured.techniques = techniqueMatch[1]
          .split('\n')
          .filter(line => line.trim() && line.includes('-'))
          .map(line => line.trim().replace(/^-\s*/, ''))
      }

      // Extract quotes
      const quotePattern = /Quote:\s*"([^"]+)"/g
      let quoteMatch
      while ((quoteMatch = quotePattern.exec(analysisText)) !== null) {
        structured.quotes.push(quoteMatch[1])
      }

      return structured
      
    } catch (error) {
      console.error(`Failed to parse ${dimension} analysis:`, error)
      return { error: 'Failed to parse analysis', rawText: analysisText }
    }
  }

  /**
   * Get dimension-specific rubric for scoring context
   */
  getDimensionRubric(dimension) {
    switch (dimension) {
      case 'claiming_value':
        return scoringRubric.getClaimingValueRubric()
      case 'creating_value':
        return scoringRubric.getCreatingValueRubric()
      case 'relationship_management':
        return scoringRubric.getRelationshipManagementRubric()
      default:
        return null
    }
  }

  /**
   * Validate AI analysis quality
   */
  validateAnalysisQuality(analysis) {
    const quality = {
      isValid: true,
      score: 100,
      issues: []
    }

    // Check for required scores
    if (!analysis.structuredAnalysis.scores.claimingValue) {
      quality.issues.push('Missing claiming value score')
      quality.score -= 20
    }

    if (!analysis.structuredAnalysis.scores.creatingValue) {
      quality.issues.push('Missing creating value score')
      quality.score -= 20
    }

    if (!analysis.structuredAnalysis.scores.relationshipManagement) {
      quality.issues.push('Missing relationship management score')
      quality.score -= 20
    }

    // Check for conversation quotes
    if (analysis.structuredAnalysis.conversationQuotes.length < 3) {
      quality.issues.push('Insufficient conversation quotes (minimum 3 required)')
      quality.score -= 15
    }

    // Check for executive summary
    if (!analysis.structuredAnalysis.executiveSummary || analysis.structuredAnalysis.executiveSummary.length < 100) {
      quality.issues.push('Missing or insufficient executive summary')
      quality.score -= 10
    }

    // Check for recommendations
    if (analysis.structuredAnalysis.recommendations.length < 2) {
      quality.issues.push('Insufficient recommendations (minimum 2 required)')
      quality.score -= 10
    }

    quality.isValid = quality.score >= 60
    return quality
  }

  /**
   * Generate fallback analysis if AI fails
   */
  generateFallbackAnalysis(transcript, scenarioContext) {
    console.log('⚠️ Generating fallback analysis due to AI failure')
    
    return {
      rawAnalysis: 'AI analysis temporarily unavailable. Using fallback assessment.',
      structuredAnalysis: {
        scores: {
          claimingValue: 65,
          creatingValue: 65,
          relationshipManagement: 65
        },
        dimensionAnalysis: {
          claimingValue: 'Assessment based on basic conversation analysis. Recommend reviewing anchoring and concession strategies.',
          creatingValue: 'Assessment based on basic conversation analysis. Recommend exploring interests and generating options.',
          relationshipManagement: 'Assessment based on basic conversation analysis. Recommend improving active listening and empathy.'
        },
        executiveSummary: 'Negotiation performance shows developing capabilities with opportunities for improvement across all dimensions. Recommend focused practice on specific techniques.',
        recommendations: [
          'Focus on asking more probing questions to understand interests',
          'Practice using specific numbers and market data in anchoring',
          'Develop active listening confirmation techniques'
        ],
        conversationQuotes: []
      },
      tokensUsed: 0,
      model: 'fallback',
      isFallback: true
    }
  }
}

module.exports = AIPromptEngine