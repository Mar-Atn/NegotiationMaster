# AI Prompt System for Negotiation Analysis

## Overview

This comprehensive AI prompt system generates expert-level negotiation feedback using sophisticated prompts designed by negotiation education specialists. The system produces meaningful, actionable feedback that drives skill development for business professionals.

## Architecture

The system consists of five core components:

1. **FeedbackPrompts** - Expert-designed prompt templates
2. **ScoringRubric** - Detailed assessment criteria  
3. **AIPromptEngine** - AI integration and response processing
4. **PromptValidation** - Quality assurance and validation
5. **PromptTesting** - Comprehensive testing framework

## Key Features

### 🎯 Expert-Level Analysis
- Prompts designed by Harvard Negotiation Method specialists
- Three-dimensional scoring: Claiming Value, Creating Value, Relationship Management
- Specific conversation examples with actionable feedback
- Professional tone appropriate for executive education

### 🧠 Educational Framework
- References to Harvard Negotiation Project principles
- BATNA, ZOPA, and interest-based negotiation concepts
- Progressive difficulty based on user skill level
- Industry-specific context adaptation

### 📊 Quality Assurance
- Automated prompt validation
- AI response quality checking
- Educational value assessment
- Performance consistency monitoring

### 🔧 Flexible Integration
- Rule-based and AI-enhanced analysis modes
- Fallback mechanisms for reliability
- Multiple scenario type support
- Customizable for different industries

## Getting Started

### Prerequisites

```bash
# Install dependencies
npm install openai natural

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export USE_AI_ANALYSIS="true"
export ENABLE_HYBRID_ANALYSIS="true"
```

### Basic Usage

```javascript
const AssessmentEngine = require('./assessmentEngine')

const assessmentEngine = new AssessmentEngine()

// Generate comprehensive analysis
const results = await assessmentEngine.generateComprehensiveAssessment(
  transcript,
  voiceMetrics,
  scenarioContext,
  userProfile
)

console.log('Analysis Mode:', results.analysisMode)
console.log('Overall Score:', results.overall)
console.log('Executive Summary:', results.executiveSummary)
```

### Scenario Context Structure

```javascript
const scenarioContext = {
  title: "Enterprise Software License Negotiation",
  type: "vendor_negotiation",
  industry: "technology",
  keyIssues: ["pricing structure", "service levels", "contract terms"],
  counterpartProfile: "Senior sales director with pricing authority",
  businessContext: "Annual renewal with expansion potential"
}
```

## Prompt Templates

### Master Analysis Prompt

The master prompt generates comprehensive assessment across all three dimensions:

```javascript
const feedbackPrompts = require('./feedbackPrompts')

const masterPrompt = feedbackPrompts.getMasterAnalysisPrompt(
  transcript,
  scenarioContext,
  voiceMetrics
)
```

### Dimension-Specific Prompts

For focused analysis on individual competencies:

```javascript
// Claiming Value (Competitive Skills)
const claimingPrompt = feedbackPrompts.getClaimingValuePrompt(transcript, scenarioContext)

// Creating Value (Collaborative Skills)  
const creatingPrompt = feedbackPrompts.getCreatingValuePrompt(transcript, scenarioContext)

// Relationship Management (Interpersonal Skills)
const relationshipPrompt = feedbackPrompts.getRelationshipManagementPrompt(
  transcript, 
  scenarioContext, 
  voiceMetrics
)
```

### Scenario-Specific Prompts

For specialized negotiation contexts:

```javascript
const scenarioPrompt = feedbackPrompts.getScenarioSpecificPrompt(
  'vendor_negotiation',
  transcript,
  scenarioContext
)
```

## Scoring Rubric

### Claiming Value (0-100 points)

| Component | Weight | Description |
|-----------|---------|-------------|
| Anchoring | 20% | Strategic positioning through opening offers |
| BATNA Usage | 15% | Effective use of alternatives |
| Concession Strategy | 20% | Strategic concession patterns |
| Information Seeking | 15% | Strategic information gathering |
| Pressure Application | 15% | Effective use of time pressure |
| Deal Protection | 15% | Risk mitigation mechanisms |

### Creating Value (0-100 points)

| Component | Weight | Description |
|-----------|---------|-------------|
| Interest Exploration | 25% | Deep exploration of underlying interests |
| Option Generation | 20% | Creative development of alternatives |
| Trade-off Identification | 20% | Recognition of mutual benefit opportunities |
| Future Focus | 15% | Long-term relationship orientation |
| Creative Problem Solving | 20% | Innovative constraint solutions |

### Relationship Management (0-100 points)

| Component | Weight | Description |
|-----------|---------|-------------|
| Active Listening | 20% | Engaged listening and understanding |
| Empathy & Understanding | 20% | Perspective-taking and validation |
| Communication Style | 20% | Professional and collaborative communication |
| Conflict Management | 20% | Effective tension and disagreement handling |
| Trust Building | 20% | Credibility and relationship foundation |

## Quality Validation

### Prompt Quality Validation

```javascript
const promptValidation = require('./promptValidation')

const validation = promptValidation.validatePromptQuality(
  promptData,
  transcript,
  scenarioContext
)

if (!validation.isValid) {
  console.log('Issues:', validation.issues)
  console.log('Recommendations:', validation.recommendations)
}
```

### AI Response Validation

```javascript
const responseValidation = promptValidation.validateAIResponse(
  aiResponse,
  originalPrompt
)

console.log('Quality Score:', responseValidation.score)
console.log('Educational Value:', responseValidation.isValid)
```

## Testing Framework

### Running Test Suite

```javascript
const PromptTesting = require('./promptTesting')

const tester = new PromptTesting()
const report = await tester.runFullTestSuite()

console.log('Test Results:', report.overview)
console.log('Recommendations:', report.recommendations)
```

### Individual Test Categories

```javascript
// Test prompt structures
await tester.testPromptStructures()

// Test AI response quality
await tester.testAIResponseQuality()

// Test educational value
await tester.testEducationalValue()

// Test performance consistency
await tester.testPerformanceConsistency()
```

## Example Scenarios

The system includes comprehensive examples for testing and validation:

### Vendor Contract Negotiation
- Enterprise software licensing
- Service level agreements
- Risk allocation and pricing

### Partnership Formation
- Joint venture structuring
- Revenue sharing models
- Governance frameworks

### Salary Negotiation
- Market-based compensation
- Performance incentives
- Career development planning

### Conflict Resolution
- Resource allocation disputes
- Interdepartmental negotiations
- Relationship repair

## Advanced Configuration

### Skill Level Adaptation

```javascript
const skillModifier = feedbackPrompts.getProgressiveDifficultyModifier('advanced')
```

Available levels: `beginner`, `intermediate`, `advanced`, `expert`

### Industry Customization

```javascript
const industryModifier = feedbackPrompts.getIndustryContextModifier('technology')
```

Supported industries: `technology`, `healthcare`, `financial_services`, `manufacturing`

### Quality Control

```javascript
const qualityControl = feedbackPrompts.getQualityControlPrompt()
```

Ensures responses meet educational standards with:
- Minimum 3 conversation quotes per dimension
- Specific actionable recommendations
- Harvard Negotiation Method references
- Professional executive education tone

## Performance Optimization

### Hybrid Analysis Mode

Combines rule-based scoring with AI-enhanced feedback:

```javascript
// Rule-based scores provide validation
// AI analysis provides rich feedback
// System uses best of both approaches
```

### Fallback Mechanisms

```javascript
// If AI analysis fails, system falls back to rule-based assessment
// Ensures reliable operation even with API issues
// Maintains consistent user experience
```

### Token Usage Optimization

- Efficient prompt design minimizes token usage
- Structured response formats reduce parsing overhead
- Quality validation prevents unnecessary re-processing

## Error Handling

### Graceful Degradation

```javascript
try {
  const aiResults = await aiEngine.generateComprehensiveAnalysis(...)
  // Use AI-enhanced results
} catch (error) {
  console.log('Falling back to rule-based analysis')
  const ruleBasedResults = assessmentEngine.generateRuleBasedAssessment(...)
  // Maintain service availability
}
```

### Quality Validation

```javascript
const qualityCheck = aiEngine.validateAnalysisQuality(aiResults)

if (!qualityCheck.isValid) {
  console.log('AI quality insufficient, using rule-based results')
  // Automatic quality control
}
```

## Deployment Guidelines

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
OPENAI_API_KEY=your-production-api-key
USE_AI_ANALYSIS=true
ENABLE_HYBRID_ANALYSIS=true

# Optional performance tuning
AI_ANALYSIS_TIMEOUT=30000
MAX_TOKENS=4000
TEMPERATURE=0.7
```

### Monitoring

Monitor these key metrics:
- AI response time and reliability
- Quality validation scores
- Educational value assessments
- Token usage and costs

### Scaling Considerations

- Implement request queuing for high volume
- Cache frequent scenario types
- Use load balancing for multiple AI endpoints
- Monitor API rate limits and costs

## Best Practices

### Prompt Design
1. Include specific conversation examples
2. Reference established negotiation theory
3. Provide clear assessment criteria
4. Maintain professional education tone
5. Ensure actionable recommendations

### Quality Assurance
1. Validate all prompts before deployment
2. Test with diverse conversation examples
3. Monitor AI response consistency
4. Regular quality audits and improvements
5. User feedback integration

### Educational Value
1. Connect to learning objectives
2. Provide skill-level appropriate content
3. Include specific practice recommendations
4. Reference authoritative sources
5. Focus on behavioral change

## Troubleshooting

### Common Issues

**AI Analysis Fails**
- Check OpenAI API key and connectivity
- Verify prompt structure and length
- Review conversation content adequacy

**Low Quality Scores**
- Ensure conversation has sufficient content
- Check scenario context completeness
- Validate prompt educational framework

**Inconsistent Results**
- Review conversation complexity
- Check for scenario-specific requirements
- Verify user skill level appropriate

### Support Resources

- Review prompt examples for proper structure
- Use testing framework for validation
- Check quality control guidelines
- Monitor system performance metrics

## License

This AI prompt system is proprietary to the Negotiation Master platform and designed for executive business education applications.

## Contributing

For improvements or extensions:
1. Follow existing prompt structure patterns
2. Include comprehensive testing
3. Maintain educational quality standards
4. Document new features thoroughly
5. Validate against scoring rubrics

---

*For technical support or questions about implementation, please refer to the comprehensive testing framework and example scenarios included with this system.*