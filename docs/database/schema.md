# Database Schema

NegotiationMaster PostgreSQL database schema documentation.

## Overview

The database uses a hybrid relational-JSON approach:
- **Structured data** in normalized tables for performance and consistency
- **Flexible content** in JSON columns for extensibility
- **UUID primary keys** for security and distribution readiness
- **Proper indexing** for query performance

## Core Tables

### users

User account information and authentication.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**Key Fields:**
- `id`: UUID primary key
- `email`: Unique email address for authentication
- `username`: Unique display name
- `password_hash`: bcrypt hashed password (salt rounds: 12)
- `email_verified`: Email verification status
- `verification_token`: Token for email verification
- `last_login`: Last successful login timestamp

### refresh_tokens

JWT refresh token management with device tracking.

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info VARCHAR(500),
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

**Key Fields:**
- `token_hash`: SHA-256 hash of refresh token
- `expires_at`: Token expiration timestamp
- `device_info`: User agent string for device identification
- `is_revoked`: Manual revocation flag

### scenarios

Negotiation scenario definitions with AI character configurations.

```sql
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL, -- 1-7
    ai_character_config JSON NOT NULL,
    scenario_context JSON NOT NULL,
    evaluation_criteria JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_difficulty ON scenarios(difficulty_level);
CREATE INDEX idx_scenarios_active ON scenarios(is_active);
```

**JSON Field Structures:**

**ai_character_config:**
```json
{
  "name": "Sarah Chen",
  "role": "HR Manager",
  "personality": "Professional, somewhat rigid about budget constraints",
  "initial_position": "Company has a strict salary band for entry-level positions",
  "negotiation_style": "Conservative, focused on company policies"
}
```

**scenario_context:**
```json
{
  "situation": "You have been offered a position at TechStart Inc.",
  "your_role": "Recent graduate with internship experience",
  "stakes": "Your starting salary will impact your career trajectory",
  "constraints": ["Company budget limitations", "Entry-level position"],
  "background": "Market rate for similar positions ranges from $60,000-$75,000"
}
```

**evaluation_criteria:**
```json
{
  "claiming_value": {
    "excellent": "Achieved salary above $70,000",
    "good": "Achieved salary between $67,000-$70,000",
    "average": "Achieved salary between $65,000-$67,000",
    "poor": "No improvement or lost the offer"
  },
  "creating_value": {
    "excellent": "Identified creative compensation alternatives",
    "good": "Discussed some additional benefits beyond salary",
    "average": "Focused primarily on salary alone",
    "poor": "Made demands without considering company needs"
  },
  "managing_relationships": {
    "excellent": "Built rapport, showed understanding of company constraints",
    "good": "Maintained professional tone throughout",
    "average": "Some tension but resolved professionally",
    "poor": "Created conflict or damaged relationship"
  }
}
```

### negotiations

Active and completed negotiation sessions.

```sql
CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    deal_terms JSON,
    deal_reached BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_negotiations_user_id ON negotiations(user_id);
CREATE INDEX idx_negotiations_scenario_id ON negotiations(scenario_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiations_started ON negotiations(started_at);
```

**Key Fields:**
- `status`: Current negotiation state
- `deal_terms`: Final agreement terms (JSON)
- `deal_reached`: Whether agreement was reached
- `started_at`/`completed_at`: Session timing

### messages

Negotiation conversation history.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'ai'
    sender_id UUID, -- user_id if sender_type='user'
    content TEXT NOT NULL,
    message_type VARCHAR(50), -- 'message', 'offer', 'counteroffer', 'question'
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_negotiation ON messages(negotiation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_type ON messages(message_type);
```

**Key Fields:**
- `sender_type`: Distinguishes user vs AI messages
- `message_type`: Categorizes message for analysis
- `metadata`: Additional context (theory analysis, etc.)

### feedback

AI-generated performance feedback and theory analysis.

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50), -- 'move_analysis', 'final_assessment', 'progress_update'
    theory_category VARCHAR(50), -- 'claiming_value', 'creating_value', 'managing_relationships'
    score DECIMAL(5,2), -- 0-100
    content TEXT NOT NULL,
    recommendations JSON,
    theory_references JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_negotiation ON feedback(negotiation_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_category ON feedback(theory_category);
```

### user_progress

User learning progress and skill development tracking.

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_negotiations INTEGER DEFAULT 0,
    completed_negotiations INTEGER DEFAULT 0,
    successful_deals INTEGER DEFAULT 0,
    avg_claiming_value_score DECIMAL(5,2) DEFAULT 0,
    avg_creating_value_score DECIMAL(5,2) DEFAULT 0,
    avg_managing_relationships_score DECIMAL(5,2) DEFAULT 0,
    avg_overall_score DECIMAL(5,2) DEFAULT 0,
    highest_scenario_completed INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_overall ON user_progress(avg_overall_score);
CREATE INDEX idx_user_progress_scenario ON user_progress(highest_scenario_completed);
```

**Key Fields:**
- `avg_*_score`: Calculated averages for each skill dimension
- `highest_scenario_completed`: Progression tracking
- `last_activity`: For engagement analysis

## Theory Framework Tables

### scenario_theory_framework

Negotiation theory data for each scenario (BATNA, ZOPA, optimal strategies).

```sql
CREATE TABLE scenario_theory_framework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    batna_analysis JSON,
    zopa_parameters JSON,
    negotiation_type VARCHAR(20), -- 'distributive', 'integrative', 'mixed'
    key_interests JSON,
    optimal_strategies JSON,
    common_mistakes JSON,
    theory_applications JSON
);

CREATE INDEX idx_theory_framework_scenario ON scenario_theory_framework(scenario_id);
CREATE INDEX idx_theory_framework_type ON scenario_theory_framework(negotiation_type);
```

**JSON Field Examples:**

**batna_analysis:**
```json
{
  "user_batna": {
    "description": "Other job offers or staying unemployed while searching",
    "estimated_value": 60000,
    "strength": "medium",
    "improvement_tips": ["Research other companies hiring similar roles"]
  },
  "counterpart_batna": {
    "description": "Hiring another candidate or keeping position open",
    "estimated_value": 70000,
    "strength": "medium"
  }
}
```

**zopa_parameters:**
```json
{
  "likely_range": {"min": 62000, "max": 72000},
  "optimal_user_outcome": 70000,
  "optimal_counterpart_outcome": 65000,
  "value_creation_opportunities": [
    "Flexible work arrangements",
    "Professional development budget",
    "Additional vacation days"
  ]
}
```

### negotiation_moves

Detailed tracking of negotiation moves with theory-based analysis.

```sql
CREATE TABLE negotiation_moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    move_type VARCHAR(50), -- 'question_asked', 'concession_made', 'option_generated', etc.
    move_content TEXT NOT NULL,
    move_analysis JSON,
    theory_score DECIMAL(5,2),
    theory_category VARCHAR(50),
    feedback_points JSON
);

CREATE INDEX idx_negotiation_moves_negotiation ON negotiation_moves(negotiation_id, timestamp);
CREATE INDEX idx_negotiation_moves_type ON negotiation_moves(move_type);
CREATE INDEX idx_negotiation_moves_category ON negotiation_moves(theory_category);
```

### negotiation_analytics

Aggregated analytics for each negotiation session.

```sql
CREATE TABLE negotiation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    questions_asked_count INTEGER DEFAULT 0,
    concessions_made_count INTEGER DEFAULT 0,
    options_generated_count INTEGER DEFAULT 0,
    batna_references_count INTEGER DEFAULT 0,
    interest_explorations_count INTEGER DEFAULT 0,
    used_anchoring BOOLEAN DEFAULT false,
    explored_interests BOOLEAN DEFAULT false,
    generated_options BOOLEAN DEFAULT false,
    managed_emotions BOOLEAN DEFAULT false,
    distributive_score DECIMAL(5,2) DEFAULT 0,
    integrative_score DECIMAL(5,2) DEFAULT 0,
    relationship_score DECIMAL(5,2) DEFAULT 0,
    strategy_analysis JSON,
    theory_adherence JSON
);

CREATE INDEX idx_negotiation_analytics_negotiation ON negotiation_analytics(negotiation_id);
```

## Relationships

```
users 1:N refresh_tokens
users 1:N negotiations
users 1:1 user_progress
users 1:N feedback
users 1:N negotiation_moves

scenarios 1:N negotiations
scenarios 1:1 scenario_theory_framework

negotiations 1:N messages
negotiations 1:N feedback
negotiations 1:N negotiation_moves
negotiations 1:1 negotiation_analytics
```

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Authentication
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Negotiation queries
CREATE INDEX idx_negotiations_user_id ON negotiations(user_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiations_started ON negotiations(started_at);

-- Message history
CREATE INDEX idx_messages_negotiation ON messages(negotiation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Progress tracking
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_overall ON user_progress(avg_overall_score);

-- Theory analysis
CREATE INDEX idx_negotiation_moves_negotiation ON negotiation_moves(negotiation_id, timestamp);
CREATE INDEX idx_negotiation_moves_type ON negotiation_moves(move_type);
```

### JSON Indexes

```sql
-- Scenario content search
CREATE INDEX idx_scenarios_difficulty_gin ON scenarios USING gin ((ai_character_config->>'difficulty'));
CREATE INDEX idx_theory_framework_type_gin ON scenario_theory_framework USING gin ((key_interests->>'negotiation_type'));

-- Message metadata search
CREATE INDEX idx_messages_metadata_gin ON messages USING gin (metadata);

-- Feedback analysis
CREATE INDEX idx_feedback_recommendations_gin ON feedback USING gin (recommendations);
```

## Data Types and Constraints

### UUID Generation
```sql
-- All primary keys use UUID v4
DEFAULT gen_random_uuid()
```

### Timestamps
```sql
-- Consistent timestamp handling
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### JSON Validation
```sql
-- Ensure valid JSON in JSON columns
CONSTRAINT valid_json_config CHECK (ai_character_config IS NULL OR json_valid(ai_character_config))
```

### Enum Constraints
```sql
-- Status constraints
CONSTRAINT valid_negotiation_status CHECK (status IN ('in_progress', 'completed', 'abandoned'))
CONSTRAINT valid_sender_type CHECK (sender_type IN ('user', 'ai'))
CONSTRAINT valid_negotiation_type CHECK (negotiation_type IN ('distributive', 'integrative', 'mixed'))
```

## Migration Strategy

### Version Control
- All schema changes via Knex migrations
- Sequential numbering: `YYYYMMDDHHMMSS_description.js`
- Rollback support for all migrations
- Seed data for development and testing

### Migration Examples

```javascript
// Create table migration
exports.up = function(knex) {
  return knex.schema.createTable('table_name', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name').notNullable()
    table.timestamps(true, true)
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('table_name')
}
```

### Data Migration

```javascript
// Data transformation migration
exports.up = async function(knex) {
  const rows = await knex('old_table').select('*')
  
  for (const row of rows) {
    await knex('new_table').insert({
      id: row.id,
      transformed_data: transformData(row.old_data)
    })
  }
}
```

## Performance Considerations

### Query Optimization
- Proper indexes on foreign keys
- Composite indexes for common query patterns
- JSON indexes for frequent JSON queries
- Connection pooling (min: 2, max: 10)

### Scaling Strategies
- Read replicas for analytics queries
- Partitioning for large tables (messages, moves)
- Archiving old negotiation data
- Caching frequently accessed scenarios

## Security

### Access Control
- Row-level security for user data isolation
- Prepared statements prevent SQL injection
- No sensitive data in logs
- Regular security updates

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Token hashing with SHA-256
- No plaintext secrets in database
- Audit logging for sensitive operations

---

*Schema version: 1.0 | Last updated: January 2025*