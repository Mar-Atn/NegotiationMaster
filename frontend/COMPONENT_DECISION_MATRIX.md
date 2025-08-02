# COMPONENT DECISION MATRIX
## Keep vs Remove Criteria for Sprint 1 Scope Correction

**Decision Framework**: PRD Section 3.1.4 Post-Conversation Analysis Requirements

---

## DECISION CRITERIA

### ✅ KEEP IF:
1. **PRD Explicit**: Feature explicitly mentioned in PRD Section 3.1.4
2. **Core Functionality**: Essential for basic negotiation conversation
3. **Post-Conversation**: Runs AFTER conversation completes
4. **Simple Implementation**: <200 lines of code per component
5. **MVP Essential**: Cannot deliver MVP without this feature

### ❌ REMOVE IF:
1. **Real-Time**: Operates during active conversation
2. **Over-Engineered**: >300 lines for simple functionality
3. **Not in PRD**: Feature not mentioned in requirements
4. **Complex Analytics**: Advanced metrics beyond 3 core skills
5. **Nice-to-Have**: Can launch MVP without this feature

---

## COMPONENT ANALYSIS

### 🟢 KEEP - Core Voice System
| Component | File | Status | Justification |
|-----------|------|--------|---------------|
| Voice Conversation | `VoiceConversation.js` | ✅ KEEP | Core negotiation interface |
| Voice Controls | `VoiceControls.js` | ✅ KEEP | Essential user interaction |
| Voice Service | `voiceService.js` | ✅ KEEP | Backend integration required |
| Audio Visualizer | `AudioVisualizer.js` | ✅ KEEP | User feedback during speech |

**Reasoning**: Essential for MVP delivery, explicitly required for voice-based negotiation

### 🟢 KEEP - Character System  
| Component | File | Status | Justification |
|-----------|------|--------|---------------|
| AI Character | `AICharacter.js` | ✅ KEEP | Core negotiation counterpart |
| Chat Interface | `ChatInterface.js` | ✅ KEEP | Fallback communication method |
| Case Context | `CaseContext.js` | ✅ KEEP | Scenario information provider |

**Reasoning**: Characters are fundamental to negotiation scenarios as specified in PRD

### 🟢 KEEP - Basic Infrastructure
| Component | File | Status | Justification |
|-----------|------|--------|---------------|
| Negotiation Flow | `NegotiationFlow.js` | ✅ KEEP | Core user journey |
| Layout System | `Layout/` | ✅ KEEP | Basic UI structure |
| Auth System | `AuthContext.js` | ✅ KEEP | User management |

**Reasoning**: Infrastructure required for any functional application

---

## 🔴 REMOVE - Over-Implementation

### Real-Time Analytics (NOT IN PRD)
| Component | File | Lines | Issue | Action |
|-----------|------|-------|-------|--------|
| Live Feedback | `LiveFeedback.js` | 475 | Real-time analysis | 🗑️ DELETE |
| Real-Time Assessment | `RealTimeAssessment.js` | ~200 | During conversation | 🗑️ DELETE |
| Negotiation Analytics | `NegotiationAnalytics.js` | 561 | Complex metrics | 🗑️ DELETE |

**Issues**:
- PRD specifies "Post-Conversation" analysis
- Real-time feedback not mentioned in requirements
- Over-engineered for MVP scope

### Complex UI Components (OVER-ENGINEERED)
| Component | File | Lines | Issue | Action |
|-----------|------|-------|-------|--------|
| Performance Feedback | `PerformanceFeedback.js` | ~300 | Too complex | 🗑️ DELETE |
| Skill Analysis Card | `SkillAnalysisCard.js` | ~150 | Over-designed | 🗑️ DELETE |
| Recommendation Card | `RecommendationCard.js` | ~100 | Not essential | 🗑️ DELETE |

**Issues**:
- Complex accordion interfaces not in PRD
- Over-designed UI for simple feedback
- Can be replaced with simple components

---

## 🟡 SIMPLIFY - Core Requirements

### Post-Conversation Feedback (SIMPLIFY TO PRD)
| Component | Current | Target | Action |
|-----------|---------|--------|--------|
| Conversation Feedback | 660 lines | <150 lines | 🔄 REPLACE |

**PRD Requirements ONLY**:
1. **Immediate Feedback**: Simple AI assessment
2. **Skill Breakdown**: 3 dimensions only
   - Claiming Value
   - Creating Value  
   - Relationship Management
3. **Conversation Transcript**: Text display
4. **Improvement Suggestions**: 3-5 bullet points

**New Component Structure**:
```
SimpleFeedback.js (NEW)
├── Overall Score Display (0-100)
├── Three Skill Scores
├── Improvement Suggestions List
└── Conversation Transcript
Total: ~150 lines maximum
```

---

## CONFIDENTIAL SCENARIO REQUIREMENTS

### Discovery: 3-Part Scenario Structure
Based on PRD analysis, scenarios require:

1. **Role 1 Confidential Instructions** (Human)
   - Private goals and constraints
   - BATNA information
   - Negotiation parameters

2. **Role 2 Confidential Instructions** (AI Character)  
   - Character's private objectives
   - Personality-driven responses
   - Hidden information

3. **Teaching Notes** (Learning Outcomes)
   - Skill development targets
   - Complexity indicators
   - Educational objectives

**Implementation Impact**:
- Current character system ✅ supports this
- No additional development needed for Sprint 1
- Document for future sprint planning

---

## IMPLEMENTATION PRIORITY

### Phase 1: Immediate Removal (Today)
```bash
# Delete over-implemented components
rm src/components/LiveFeedback/
rm src/components/NegotiationAnalytics/
rm src/components/PerformanceFeedback/
rm src/components/ConversationFeedback/SkillAnalysisCard.js
rm src/components/ConversationFeedback/RecommendationCard.js
```

### Phase 2: Replace Complex Feedback (Tomorrow)
```bash
# Create simple replacement
touch src/components/SimpleFeedback/SimpleFeedback.js
# Implement PRD-compliant feedback only
```

### Phase 3: Clean References (Day 3)
- Remove imports from routing
- Update navigation components
- Clean up unused dependencies

---

## QUALITY ASSURANCE

### Testing Strategy
1. **Smoke Test**: Core conversation flow
2. **Integration Test**: Voice → Character → Feedback
3. **PRD Compliance**: Feature-by-feature verification

### Definition of Complete
- [ ] Real-time components removed
- [ ] Simple feedback implemented
- [ ] PRD requirements met
- [ ] No broken references
- [ ] Core flow functional

---

## TEAM HANDOFF

### Developer Actions
1. **Stop**: Work on analytics components
2. **Remove**: Listed over-implementations  
3. **Create**: Simple feedback component
4. **Test**: Core conversation flow

### QA Actions
1. **Update**: Test plans for simplified scope
2. **Verify**: PRD compliance
3. **Test**: Post-removal functionality

### PM Actions
1. **Communicate**: Scope change rationale
2. **Approve**: Component removal plan
3. **Monitor**: Sprint completion metrics

---

## SUCCESS METRICS

### Code Reduction Targets
- **Remove**: 1,400+ lines of over-implementation
- **Add**: <150 lines of simple feedback
- **Net**: 90% code reduction in feedback system

### Feature Compliance
- **PRD Match**: 100% compliance with Section 3.1.4
- **MVP Readiness**: Functional negotiation experience
- **Quality**: Simple, maintainable codebase

---

*This decision matrix provides clear, actionable criteria for immediate scope correction and future feature decisions.*