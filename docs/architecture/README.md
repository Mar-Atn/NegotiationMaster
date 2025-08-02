# Architecture Decision Records (ADRs)

This directory contains architecture decision records for the NegotiationMaster project. ADRs document important architectural decisions made during development.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand the reasoning behind past decisions
- Avoid revisiting settled issues
- Share knowledge with new team members
- Maintain consistency across the project

## ADR Format

We use a lightweight ADR format based on Michael Nygard's template. Each ADR contains:

- **Status**: Current state of the decision
- **Context**: The issue that motivates this decision
- **Decision**: Our response to the issue
- **Consequences**: The resulting context after applying the decision

## Creating a New ADR

1. Copy the [ADR template](./adr-template.md)
2. Number it sequentially (ADR-001, ADR-002, etc.)
3. Give it a descriptive title
4. Fill in each section
5. Submit for review via pull request

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./adr-001-jwt-authentication.md) | JWT Authentication with Refresh Token Rotation | Accepted | 2024-01-29 |
| [ADR-002](./adr-002-socket-io-real-time.md) | Socket.io for Real-time Communication | Accepted | 2024-01-29 |
| [ADR-003](./adr-003-postgresql-database.md) | PostgreSQL as Primary Database | Accepted | 2024-01-29 |
| [ADR-004](./adr-004-react-material-ui.md) | React with Material-UI Frontend | Accepted | 2024-01-29 |
| [ADR-005](./adr-005-negotiation-theory-framework.md) | Negotiation Theory Assessment Framework | Accepted | 2024-01-29 |

## Decision Statuses

- **Proposed**: The decision is being considered
- **Accepted**: The decision has been approved and implemented
- **Rejected**: The decision has been considered but not approved
- **Deprecated**: The decision is no longer valid but kept for historical reference
- **Superseded**: The decision has been replaced by a newer ADR

## Guidelines

### When to Write an ADR

Write an ADR when making decisions about:
- Architecture patterns and frameworks
- Technology choices
- Database schema design
- Security approaches
- Performance strategies
- Third-party integrations

### What Not to Include

ADRs are not for:
- Implementation details (use code comments)
- Temporary decisions
- Personal preferences
- Requirements (use specifications)

### Review Process

1. Create ADR with "Proposed" status
2. Share with team for feedback
3. Discuss in architecture review meeting
4. Update status to "Accepted" or "Rejected"
5. Implement decision if accepted

## Benefits

- **Knowledge Sharing**: New team members can understand architectural decisions
- **Decision Tracking**: History of why decisions were made
- **Consistency**: Ensure architectural coherence across the project
- **Avoiding Rework**: Prevent revisiting settled issues
- **Learning**: Document lessons learned from decisions