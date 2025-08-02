# NegotiationMaster Database Schema Documentation

**Database Type:** SQLite (Development) / PostgreSQL (Production)  
**ORM:** Knex.js  
**Migration System:** Knex migrations  
**Last Updated:** August 2, 2025

---

## 📊 Database Tables Overview

### Core Tables
1. **users** - User accounts and authentication
2. **refresh_tokens** - JWT refresh token management
3. **scenarios** - Negotiation scenario definitions
4. **ai_characters** - AI negotiation partner profiles
5. **negotiations** - Active/completed negotiation sessions
6. **messages** - Conversation history
7. **feedback** - AI-generated performance feedback
8. **user_progress** - User skill tracking
9. **ai_responses** - AI response tracking
10. **negotiation_moves** - Tactical move analysis
11. **negotiation_performance** - Detailed performance metrics
12. **performance_milestones** - Key negotiation moments
13. **user_performance_progress** - Long-term skill progression

---

## 🗄️ Table Schemas

### 1. users
Primary table for user account management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| email | STRING | UNIQUE, NOT NULL | User email address |
| username | STRING | UNIQUE, NOT NULL | Display username |
| password_hash | STRING | NOT NULL | bcrypt hashed password |
| first_name | STRING | NOT NULL | User first name |
| last_name | STRING | NOT NULL | User last name |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| verification_token | STRING | NULLABLE | Email verification token |
| last_login | TIMESTAMP | NULLABLE | Last successful login |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification time |

**Indexes:** email, username

### 2. refresh_tokens
JWT refresh token storage and management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| user_id | STRING | FOREIGN KEY (users) | Token owner |
| token_hash | STRING | NOT NULL | SHA-256 hashed token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| device_info | STRING(500) | NULLABLE | User agent string |
| is_revoked | BOOLEAN | DEFAULT false | Manual revocation flag |
| created_at | TIMESTAMP | DEFAULT NOW | Token creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification time |

**Indexes:** user_id, token_hash, expires_at

### 3. scenarios
Negotiation scenario configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| title | STRING | NOT NULL | Scenario name |
| description | TEXT | NOT NULL | Scenario overview |
| difficulty_level | INTEGER | NOT NULL (1-7) | Difficulty rating |
| ai_character_id | STRING | FOREIGN KEY | Default AI character |
| ai_character_config | TEXT | NOT NULL | JSON character settings |
| scenario_context | TEXT | NOT NULL | JSON context data |
| scenario_variables | TEXT | NULLABLE | JSON dynamic variables |
| evaluation_criteria | TEXT | NOT NULL | JSON scoring rubric |
| system_prompt | TEXT | NULLABLE | AI system instructions |
| initial_message | TEXT | NULLABLE | Opening message |
| is_active | BOOLEAN | DEFAULT true | Availability status |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification |

**Indexes:** difficulty_level, is_active, ai_character_id

### 4. ai_characters
AI negotiation partner profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| name | STRING | NOT NULL | Character name |
| description | TEXT | NOT NULL | Character background |
| role | STRING | NOT NULL | buyer/seller/mediator |
| personality_profile | TEXT | NOT NULL | JSON Big 5 traits |
| behavior_parameters | TEXT | NOT NULL | JSON behavior config |
| interests_template | TEXT | NOT NULL | JSON core interests |
| batna_range_min | DECIMAL(10,2) | NULLABLE | Min acceptable outcome |
| batna_range_max | DECIMAL(10,2) | NULLABLE | Max acceptable outcome |
| communication_style | TEXT | NOT NULL | Language patterns |
| negotiation_tactics | TEXT | NOT NULL | JSON tactics list |
| confidential_instructions | TEXT | NULLABLE | Private AI guidance |
| is_active | BOOLEAN | DEFAULT true | Availability status |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification |

**Indexes:** role, is_active

### 5. negotiations
Active and completed negotiation sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| user_id | STRING | FOREIGN KEY (users) | Negotiator |
| scenario_id | STRING | FOREIGN KEY (scenarios) | Scenario used |
| status | STRING(20) | DEFAULT 'in_progress' | Session status |
| started_at | TIMESTAMP | DEFAULT NOW | Start time |
| completed_at | TIMESTAMP | NULLABLE | Completion time |
| deal_terms | TEXT | NULLABLE | JSON final agreement |
| deal_reached | BOOLEAN | DEFAULT false | Agreement status |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification |

**Indexes:** user_id, scenario_id, status, started_at

### 6. messages
Conversation history for negotiations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| negotiation_id | STRING | FOREIGN KEY (negotiations) | Parent negotiation |
| sender_type | STRING(20) | NOT NULL | 'user' or 'ai' |
| sender_id | STRING | NULLABLE | User ID if user sender |
| content | TEXT | NOT NULL | Message text |
| message_type | STRING(50) | NULLABLE | Type classification |
| metadata | TEXT | NULLABLE | JSON additional data |
| timestamp | TIMESTAMP | DEFAULT NOW | Message time |

**Indexes:** negotiation_id, timestamp, message_type

### 7. feedback
AI-generated performance feedback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| negotiation_id | STRING | FOREIGN KEY (negotiations) | Related negotiation |
| user_id | STRING | FOREIGN KEY (users) | Feedback recipient |
| feedback_type | STRING(50) | NULLABLE | Feedback category |
| theory_category | STRING(50) | NULLABLE | Theory dimension |
| score | DECIMAL(5,2) | NULLABLE | Performance score (0-100) |
| content | TEXT | NOT NULL | Feedback text |
| recommendations | TEXT | NULLABLE | JSON improvement tips |
| theory_references | TEXT | NULLABLE | JSON theory links |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |

**Indexes:** negotiation_id, user_id, feedback_type, theory_category

### 8. user_progress
Aggregate user skill tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | STRING | PRIMARY KEY | UUID identifier |
| user_id | STRING | FOREIGN KEY (users) | User tracked |
| total_negotiations | INTEGER | DEFAULT 0 | Total sessions |
| completed_negotiations | INTEGER | DEFAULT 0 | Finished sessions |
| successful_deals | INTEGER | DEFAULT 0 | Deals reached |
| avg_claiming_value_score | DECIMAL(5,2) | DEFAULT 0 | Competitive avg |
| avg_creating_value_score | DECIMAL(5,2) | DEFAULT 0 | Collaborative avg |
| avg_managing_relationships_score | DECIMAL(5,2) | DEFAULT 0 | Relationship avg |
| avg_overall_score | DECIMAL(5,2) | DEFAULT 0 | Overall average |
| highest_scenario_completed | INTEGER | DEFAULT 0 | Max difficulty |
| last_activity | TIMESTAMP | NULLABLE | Last session date |
| created_at | TIMESTAMP | DEFAULT NOW | First tracked |
| updated_at | TIMESTAMP | DEFAULT NOW | Last updated |

**Indexes:** user_id, avg_overall_score, highest_scenario_completed

### 9. negotiation_performance
Detailed performance metrics per negotiation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | UUID identifier |
| negotiation_id | UUID | FOREIGN KEY (negotiations) | Parent negotiation |
| user_id | UUID | FOREIGN KEY (users) | Performer |
| scenario_id | UUID | FOREIGN KEY (scenarios) | Scenario used |
| claiming_value_score | FLOAT | NULLABLE | Competitive score (0-100) |
| claiming_value_analysis | TEXT | NULLABLE | Competitive analysis |
| claiming_value_rating | STRING | NULLABLE | Rating category |
| creating_value_score | FLOAT | NULLABLE | Collaborative score |
| creating_value_analysis | TEXT | NULLABLE | Collaborative analysis |
| creating_value_rating | STRING | NULLABLE | Rating category |
| managing_relationships_score | FLOAT | NULLABLE | Relationship score |
| managing_relationships_analysis | TEXT | NULLABLE | Relationship analysis |
| managing_relationships_rating | STRING | NULLABLE | Rating category |
| overall_score | FLOAT | NULLABLE | Weighted average |
| overall_rating | STRING | NULLABLE | Overall category |
| overall_feedback | TEXT | NULLABLE | Summary feedback |
| conversation_duration_seconds | INTEGER | NULLABLE | Session length |
| turn_count | INTEGER | NULLABLE | Total turns |
| interruption_count | INTEGER | NULLABLE | Interruptions made |
| speaking_time_percentage | FLOAT | NULLABLE | Speaking ratio |
| conversation_analysis | JSON | NULLABLE | Detailed analytics |
| negotiation_moves | JSON | NULLABLE | Tactics used |
| improvement_suggestions | JSON | NULLABLE | Recommendations |
| negotiation_style_identified | STRING | NULLABLE | Style classification |
| personality_insights | JSON | NULLABLE | Big 5 insights |
| learning_objectives_met | JSON | NULLABLE | Goal progress |
| created_at | TIMESTAMP | DEFAULT NOW | Analysis time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last updated |

**Indexes:** user_id + scenario_id, overall_score, created_at

---

## 🔗 Table Relationships

### Primary Relationships
```
users (1) ─────── (N) negotiations
users (1) ─────── (N) refresh_tokens  
users (1) ─────── (1) user_progress
users (1) ─────── (N) feedback
users (1) ─────── (N) negotiation_performance
users (1) ─────── (1) user_performance_progress

scenarios (1) ──── (N) negotiations
scenarios (1) ──── (N) negotiation_performance

ai_characters (1) ─ (N) scenarios (via ai_character_id)

negotiations (1) ── (N) messages
negotiations (1) ── (N) feedback
negotiations (1) ── (1) negotiation_performance

negotiation_performance (1) ── (N) performance_milestones
```

### Foreign Key Constraints
- All foreign keys use CASCADE on delete
- Orphaned records are automatically removed
- Referential integrity enforced at database level

---

## 📋 Sample Data Formats

### scenario_context JSON Structure
```json
{
  "situation": "You have been offered a position at TechStart Inc.",
  "your_role": "Recent graduate with internship experience",
  "stakes": "Your starting salary will impact your career trajectory",
  "constraints": ["Company budget limitations", "Entry-level position"],
  "background": "Market rate for similar positions ranges from $60,000-$75,000",
  "learning_objectives": [
    "Practice salary negotiation techniques",
    "Learn to articulate value proposition",
    "Understand BATNA in job negotiations"
  ]
}
```

### ai_character_config JSON Structure
```json
{
  "name": "Sarah Chen",
  "role": "Professional Car Dealer",
  "personality": "Professional, experienced negotiator with 15 years in auto sales",
  "initial_position": "2019 Honda Accord priced at $24,500",
  "negotiation_style": "Relationship-focused but firm on price",
  "flexibility": 0.15,
  "patience": 0.7,
  "voice_id": "pNInz6obpgDQGcFmaJgB"
}
```

### evaluation_criteria JSON Structure
```json
{
  "claiming_value": {
    "excellent": "Achieved price below $22,000",
    "good": "Achieved price between $22,000-$23,000",
    "average": "Achieved price between $23,000-$24,000",
    "poor": "No improvement from asking price"
  },
  "creating_value": {
    "excellent": "Identified creative financing or add-ons",
    "good": "Negotiated some additional benefits",
    "average": "Focused primarily on price alone",
    "poor": "Made demands without exploring options"
  },
  "managing_relationships": {
    "excellent": "Built rapport, maintained positive tone throughout",
    "good": "Professional interaction with some rapport",
    "average": "Neutral interaction, no relationship damage",
    "poor": "Created tension or adversarial dynamic"
  }
}
```

### scenario_variables JSON Structure
```json
{
  "asking_price": 24500,
  "dealer_cost": 19000,
  "min_acceptable": 21000,
  "target_margin": 0.15,
  "available_addons": ["extended_warranty", "maintenance_package", "accessories"],
  "financing_apr_range": [3.5, 7.5],
  "trade_in_available": true,
  "inventory_pressure": "medium",
  "monthly_quota_status": 0.75,
  "competitor_pricing": {
    "dealer_a": 23900,
    "dealer_b": 24200,
    "online_average": 23500
  }
}
```

---

## 🗃️ Migration History

### Applied Migrations (Chronological Order)
1. `20250129000001_create_users_table.js`
2. `20250129000002_create_scenarios_table.js`
3. `20250129000003_create_negotiations_table.js`
4. `20250129000004_create_messages_table.js`
5. `20250129000005_create_feedback_table.js`
6. `20250129000006_create_user_progress_table.js`
7. `20250129000007_create_refresh_tokens_table.js`
8. `20250129000008_create_ai_characters_table.js`
9. `20250129000009_create_ai_responses_table.js`
10. `20250129000010_create_negotiation_moves_table.js`
11. `20250129000011_add_ai_character_to_scenarios.js`
12. `20250801000012_add_confidential_instructions_to_characters.js`
13. `20250801000013_create_performance_tracking.js`

---

## 💾 Data Flow Between Components

### User Registration Flow
```
Frontend Form → API /auth/register → users table → Generate JWT → Return tokens
```

### Negotiation Session Flow
```
Select Scenario → Create negotiation record → Join WebSocket room → 
Exchange messages → Store in messages table → Complete negotiation →
Generate performance metrics → Store in negotiation_performance →
Update user_progress → Return feedback
```

### Voice Conversation Flow
```
Initialize voice session → Link to negotiation_id → Stream audio →
Transcribe to messages → AI processes → Response stored → 
Voice synthesized → Audio streamed back → Transcript saved
```

### Performance Analysis Flow
```
Negotiation completes → Analyze messages → Calculate scores →
Store in negotiation_performance → Identify milestones →
Update user_progress → Generate feedback → Return to user
```

---

## 🔍 Database Integrity

### Constraints
- UUIDs used for all primary keys (security & distribution)
- Foreign keys enforce referential integrity
- NOT NULL constraints on critical fields
- UNIQUE constraints prevent duplicates
- CHECK constraints validate enums (via application layer)

### Indexes for Performance
- Primary key indexes (automatic)
- Foreign key indexes for JOIN operations
- Composite indexes for common queries
- Timestamp indexes for time-based queries
- Status/active flag indexes for filtering

### Data Validation
- JSON columns validated at application layer
- Decimal precision for financial values
- Timestamp consistency across tables
- Enum values validated before insert

---

## 🛠️ Maintenance Procedures

### Regular Tasks
1. **Index Optimization**: Run ANALYZE monthly
2. **Vacuum Operations**: Clean deleted rows weekly
3. **Statistics Update**: Refresh query planner stats
4. **Backup Schedule**: Daily automated backups

### Migration Management
```bash
# Run pending migrations
npm run migrate:latest

# Rollback last batch
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name

# Seed development data
npm run seed:run
```

### Performance Monitoring
- Query execution time tracking
- Slow query identification
- Index usage statistics
- Table size monitoring

---

## 📈 Scalability Considerations

### Current Limitations (SQLite)
- Single writer at a time
- Limited concurrent connections
- File-based storage
- No built-in replication

### Production Migration (PostgreSQL)
- Connection pooling (2-10 connections)
- Read replicas for analytics
- Partitioning for large tables
- JSON indexing with GIN indexes

### Data Growth Projections
- Messages table: ~100 records per negotiation
- Performance data: ~50KB per session
- Audio transcripts: Stored as text
- Estimated 10GB for 10,000 active users