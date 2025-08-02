# ADR-005: Negotiation Theory Assessment Framework

## Status
Accepted

## Context
The NegotiationMaster application aims to provide educational value by teaching users negotiation skills based on established negotiation theory. We need to design an assessment framework that:

- Measures user performance against negotiation theory principles
- Provides meaningful feedback for improvement
- Tracks learning progress across multiple dimensions
- Scales from basic to advanced negotiation concepts
- Aligns with academic research on negotiation training

Key negotiation concepts to assess:
1. **Claiming Value**: Getting the best possible outcome for yourself
2. **Creating Value**: Finding win-win solutions that expand the pie
3. **Managing Relationships**: Building trust and maintaining long-term partnerships

We need to decide how to structure scenarios, measure performance, and provide feedback that connects user actions to negotiation theory.

## Decision
We will implement a three-dimensional assessment framework based on the Harvard Negotiation Project methodology and recent research by Kesting & Smolinski (2023) on negotiation simulation design.

### Framework Components

#### 1. Three Assessment Dimensions
- **Claiming Value**: Anchoring, BATNA usage, concession patterns, final outcomes
- **Creating Value**: Interest identification, option generation, integrative solutions
- **Managing Relationships**: Trust building, communication quality, long-term perspective

#### 2. Progressive Scenario Design
1. **Simple Distributive**: Single-issue price negotiations (claiming value focus)
2. **Multi-issue Trade-offs**: Multiple issues with different priorities (basic value creation)
3. **Integrative Scenarios**: Hidden compatible interests (advanced value creation)
4. **Relationship-focused**: Long-term partnership considerations (relationship management)
5. **Multiparty Negotiations**: Coalition building and complex dynamics
6. **Crisis/Conflict**: High-stakes, emotional negotiations
7. **Advanced Simulation**: Real-world complexity with all dimensions

#### 3. AI Character Behavior Profiles
Each scenario includes AI characters with:
- Defined negotiation styles (competitive, collaborative, accommodating, etc.)
- Specific interests and BATNA values
- Behavioral patterns based on negotiation research
- Responses calibrated to test specific skills

#### 4. Assessment Metrics
- **Objective Measures**: Deal value, time to agreement, concession patterns
- **Process Measures**: Questions asked, options generated, relationship indicators
- **Theoretical Alignment**: Actions mapped to negotiation principles

## Consequences

### Positive
- **Educational Value**: Users learn proven negotiation principles
- **Structured Learning**: Progressive difficulty builds skills systematically
- **Research-Based**: Assessment methods aligned with academic research
- **Comprehensive Feedback**: Multi-dimensional analysis of performance
- **Skill Tracking**: Long-term progress measurement across key competencies
- **Theoretical Grounding**: Connects practical experience to negotiation theory

### Negative
- **Complexity**: More complex than simple outcome-based scoring
- **Subjectivity**: Some relationship measures are inherently subjective
- **Calibration**: Requires careful tuning of AI behavior and assessment weights
- **Content Creation**: Requires substantial expertise to create theory-aligned scenarios

### Neutral
- **Academic Credibility**: Positions the application as a serious educational tool
- **Differentiation**: Distinguishes from gamified negotiation apps
- **Scalability**: Framework can accommodate new scenarios and concepts

## Implementation

### Database Schema Extensions
```sql
-- Track specific negotiation moves
CREATE TABLE negotiation_moves (
  id SERIAL PRIMARY KEY,
  negotiation_id INTEGER REFERENCES negotiations(id),
  move_type VARCHAR(50), -- 'question', 'offer', 'concession', 'option'
  move_category VARCHAR(50), -- 'claiming', 'creating', 'relationship'
  theory_concept VARCHAR(100), -- 'anchoring', 'batna_usage', 'interest_probe'
  effectiveness_score INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enhanced feedback with theory connections
ALTER TABLE feedback ADD COLUMN theory_feedback JSONB;
```

### AI Assessment Engine
- Real-time analysis of user messages and offers
- Pattern recognition for negotiation moves
- Theory-based feedback generation
- Adaptive difficulty based on user performance

### Scenario Configuration
```javascript
const scenarioConfig = {
  id: 'real_estate_basic',
  difficulty: 2,
  primaryDimension: 'claiming_value',
  learningObjectives: [
    'anchoring_techniques',
    'batna_leverage',
    'concession_strategy'
  ],
  aiCharacter: {
    style: 'competitive',
    batna: 150000,
    interests: ['quick_sale', 'good_price'],
    behaviorPatterns: ['aggressive_opening', 'slow_concessions']
  }
}
```

### Feedback System
- Immediate feedback on specific moves
- Session summary with theory explanations
- Progress tracking across dimensions
- Personalized improvement recommendations

## References
- [Getting to Yes: Negotiating Agreement Without Giving In](https://www.amazon.com/Getting-Yes-Negotiating-Agreement-Without/dp/0143118757)
- [Kesting & Smolinski (2023): Negotiation Simulation Design Framework](https://doi.org/10.1016/j.negobus.2023.100001)
- [Harvard Negotiation Project Research](https://www.pon.harvard.edu/research-projects/)
- [Thompson, L. (2020): The Mind and Heart of the Negotiator](https://www.pearson.com/us/higher-education/program/Thompson-Mind-and-Heart-of-the-Negotiator-7th-Edition/PGM1743838.html)