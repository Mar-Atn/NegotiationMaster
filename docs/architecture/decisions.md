# Architecture Decision Record (ADR)

This document records the key architectural decisions made during the development of NegotiationMaster.

## ADR-001: Technology Stack Selection

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need to select appropriate technology stack for an AI-powered negotiation training platform with real-time features, complex data relationships, and educational content.

### Decision

**Frontend**: React 18 + Material-UI
- **Rationale**: Mature ecosystem, excellent component library, strong TypeScript support
- **Alternatives considered**: Vue.js, Angular, Svelte
- **Trade-offs**: Learning curve, bundle size vs. developer productivity

**Backend**: Node.js + Express.js
- **Rationale**: JavaScript everywhere, excellent real-time support, rich ecosystem
- **Alternatives considered**: Python/Django, Go, Rust
- **Trade-offs**: Performance vs. development speed, type safety

**Database**: PostgreSQL
- **Rationale**: ACID compliance, JSON support, excellent performance, mature ecosystem
- **Alternatives considered**: MongoDB, MySQL, SQLite
- **Trade-offs**: Complexity vs. data integrity and query capabilities

**Real-time**: Socket.io
- **Rationale**: Battle-tested, fallback mechanisms, room management
- **Alternatives considered**: Native WebSockets, Server-Sent Events
- **Trade-offs**: Bundle size vs. reliability and features

### Consequences

**Positive**:
- Unified language (JavaScript) across stack
- Rich ecosystem and community support
- Excellent development tooling
- Strong real-time capabilities

**Negative**:
- Single-threaded nature of Node.js for CPU-intensive tasks
- JavaScript type safety concerns (mitigated with validation)
- Potential bundle size issues (managed with code splitting)

---

## ADR-002: Authentication Strategy

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need secure, scalable authentication system supporting multiple devices and long-term sessions for educational platform.

### Decision

**JWT with Refresh Token Rotation**
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days) with rotation
- Device tracking and management
- Secure HttpOnly cookies for refresh tokens (future enhancement)

### Alternatives Considered

1. **Session-based authentication**
   - Pros: Simple, secure
   - Cons: Not stateless, scaling issues

2. **JWT without refresh tokens**
   - Pros: Stateless, simple
   - Cons: No revocation mechanism, security risks

3. **OAuth 2.0 / OpenID Connect**
   - Pros: Industry standard, external providers
   - Cons: Complexity, external dependencies

### Consequences

**Positive**:
- Stateless authentication
- Secure token management
- Multi-device support
- Scalable architecture

**Negative**:
- Implementation complexity
- Token management overhead
- Refresh token storage requirements

---

## ADR-003: Database Schema Design

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need flexible schema supporting complex negotiation scenarios, user progress tracking, and theory-based assessment.

### Decision

**Hybrid Relational-JSON Approach**
- Core entities in normalized tables
- Flexible scenario data in JSON columns
- Theory framework stored as JSON for extensibility
- Proper indexing on JSON fields for performance

**Key Design Principles**:
1. **Normalization** for structured data (users, negotiations, progress)
2. **JSON storage** for flexible content (scenarios, theory frameworks)
3. **UUID primary keys** for security and distribution
4. **Proper indexing** for performance
5. **Migration-based evolution** for schema changes

### Alternatives Considered

1. **Full normalization**
   - Pros: ACID compliance, query performance
   - Cons: Inflexible for varying scenario structures

2. **Document database (MongoDB)**
   - Pros: Flexible schema, JSON-native
   - Cons: Weaker consistency, complex relationships

3. **EAV (Entity-Attribute-Value) model**
   - Pros: Maximum flexibility
   - Cons: Poor performance, complex queries

### Consequences

**Positive**:
- Flexible scenario definitions
- Strong consistency for core data
- Extensible theory framework
- Good query performance

**Negative**:
- JSON query complexity
- Mixed paradigm complexity
- Migration challenges for JSON data

---

## ADR-004: Real-time Negotiation Architecture

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need real-time communication for live negotiations between users and AI characters, with message persistence and theory-based analysis.

### Decision

**Event-Driven Architecture with Socket.io**
- WebSocket connections for real-time messaging
- Room-based isolation for negotiations
- Message persistence to database
- Server-side AI character simulation
- Theory-based move analysis on message send

**Architecture Components**:
1. **Socket.io Server**: Connection management, room handling
2. **Message Handler**: Process, validate, persist messages
3. **AI Character Service**: Generate contextual responses
4. **Theory Analysis Service**: Evaluate negotiation moves
5. **Database Persistence**: Store complete negotiation history

### Alternatives Considered

1. **Polling-based updates**
   - Pros: Simple implementation, HTTP-based
   - Cons: High latency, poor user experience, resource intensive

2. **Server-Sent Events (SSE)**
   - Pros: Simple, uni-directional
   - Cons: Limited browser support, no bi-directional communication

3. **Native WebSockets**
   - Pros: Low overhead, native support
   - Cons: No fallback mechanisms, limited tooling

### Consequences

**Positive**:
- Real-time user experience
- Scalable room management
- Complete negotiation history
- Theory-based feedback

**Negative**:
- Connection management complexity
- Scaling challenges with many concurrent connections
- Debugging complexity

---

## ADR-005: AI Integration Strategy

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need AI-powered negotiation characters that respond contextually and help users learn negotiation theory through practice.

### Decision

**OpenAI GPT Integration with Custom Prompting**
- OpenAI GPT-4 for character responses
- Scenario-specific character prompts
- Context-aware conversation management
- Theory-based response evaluation
- Future: ElevenLabs for voice synthesis

**Implementation Strategy**:
1. **Character Definitions**: Detailed personality and behavior prompts
2. **Context Management**: Maintain conversation history and scenario state
3. **Response Filtering**: Ensure appropriate and educational responses
4. **Theory Integration**: Incorporate negotiation principles in character behavior
5. **Performance**: Caching and response optimization

### Alternatives Considered

1. **Rule-based AI System**
   - Pros: Predictable, controllable, fast
   - Cons: Limited flexibility, extensive rule creation required

2. **Open-source LLMs (Llama, etc.)**
   - Pros: No API costs, full control
   - Cons: Infrastructure requirements, model management complexity

3. **Multiple AI Providers**
   - Pros: Redundancy, cost optimization
   - Cons: Integration complexity, inconsistent responses

### Consequences

**Positive**:
- High-quality, contextual responses
- Rapid development and iteration
- Natural language understanding
- Educational value through realistic interactions

**Negative**:
- API costs and rate limits
- Response time dependencies
- Potential inappropriate content (mitigated with filtering)
- Vendor lock-in concerns

---

## ADR-006: Frontend State Management

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need efficient client-side state management for complex UI with authentication, real-time updates, and educational progress tracking.

### Decision

**React Context + useReducer with Custom Hooks**
- Context for global state (auth, user preferences)
- useReducer for complex state logic
- Custom hooks for data fetching and business logic
- Local component state for UI-specific data

**State Architecture**:
1. **AuthContext**: User authentication and profile
2. **NegotiationContext**: Active negotiation state
3. **ProgressContext**: User learning progress
4. **Custom Hooks**: API integration, form handling, real-time updates

### Alternatives Considered

1. **Redux Toolkit**
   - Pros: Mature, excellent DevTools, predictable
   - Cons: Boilerplate, learning curve, over-engineering for current needs

2. **Zustand**
   - Pros: Simple, lightweight, TypeScript-friendly
   - Cons: Less mature ecosystem, potential scaling concerns

3. **Recoil**
   - Pros: Facebook-backed, atomic state management
   - Cons: Experimental status, learning curve

### Consequences

**Positive**:
- Simple mental model
- Leverages React's built-in capabilities
- Minimal bundle size impact
- Easy testing and debugging

**Negative**:
- Potential re-render issues (mitigated with memo)
- Limited DevTools compared to Redux
- Manual optimization required for complex scenarios

---

## ADR-007: Testing Strategy

**Date**: 2025-01-29
**Status**: Accepted
**Deciders**: Development Team

### Context

Need comprehensive testing strategy for educational platform with complex business logic, real-time features, and AI integration.

### Decision

**Multi-layer Testing Approach**

**Backend Testing**:
- **Unit Tests**: Jest for services, utilities, pure functions
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: Test database with proper setup/teardown
- **Mocking**: Mock AI services, external APIs

**Frontend Testing**:
- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: Full user flow testing
- **Accessibility Tests**: Automated a11y testing
- **Visual Tests**: Screenshot testing for UI consistency

**End-to-End Testing**:
- **Critical Paths**: User registration, negotiation flow, progress tracking
- **Real-time Features**: WebSocket connection and messaging
- **Cross-browser**: Chrome, Firefox, Safari testing

### Coverage Targets

- **Backend**: 80% code coverage minimum
- **Frontend**: 70% code coverage minimum
- **Critical Paths**: 100% coverage
- **API Endpoints**: 100% coverage

### Consequences

**Positive**:
- High confidence in deployments
- Reduced regression bugs
- Better code design through TDD
- Documentation through tests

**Negative**:
- Initial setup complexity
- Maintenance overhead
- Slower initial development
- CI/CD pipeline complexity

---

## Template for Future ADRs

```markdown
## ADR-XXX: [Title]

**Date**: YYYY-MM-DD
**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Deciders**: [List of people involved]

### Context

[Describe the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such.]

### Decision

[Describe our response to these forces. It is stated in full sentences, with active voice.]

### Alternatives Considered

[List the alternatives considered with pros/cons for each]

### Consequences

[Describe the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones.]
```

---

## Decision Status Legend

- **Proposed**: ADR is under discussion
- **Accepted**: ADR is approved and implemented
- **Deprecated**: ADR is no longer relevant but kept for historical context
- **Superseded**: ADR has been replaced by a newer decision