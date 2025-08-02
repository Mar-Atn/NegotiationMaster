# NegotiationMaster - Claude Development Guidelines

**Date Created:** August 2, 2025  
**Version:** 1.0  
**Project:** NegotiationMaster Voice-Powered Training Platform  
**Status:** Active Development Guidelines

---

## 🔥 CRITICAL RULES - NEVER BREAK THESE

### **SACRED WORKING COMPONENTS (DO NOT TOUCH)**
- ✅ **Authentication System** - JWT-based login is working perfectly
- ✅ **Voice Integration** - ElevenLabs WebSocket connection is stable
- ✅ **Sarah Chen Character** - Voice conversation functionality operational
- ✅ **Database Schema** - Core tables and relationships established
- ✅ **Real-time Communication** - WebSocket connections functional

### **MANDATORY PROTECTION PROTOCOL**
```
BEFORE ANY CHANGE:
1. git add . && git commit -m "Working state before [change description]"
2. Create backup of affected files
3. Test only the specific feature being modified
4. ROLLBACK IMMEDIATELY if anything breaks existing functionality
```

### **FORBIDDEN ACTIONS**
- ❌ NEVER modify authentication middleware without explicit approval
- ❌ NEVER change voice service configuration unless voice-specific task
- ❌ NEVER alter database schema without backup and migration plan
- ❌ NEVER touch working React components unless UI-specific improvement
- ❌ NEVER experiment with "quick fixes" - follow systematic approach

---

## 📊 PROJECT MANAGEMENT DISCIPLINE

### **🌅 SESSION START RITUAL (5 minutes)**
**Before opening any code:**
- [ ] **ONE clear goal** for this session: _________________________
- [ ] **Check working state:** What works right now?
- [ ] **Time limit:** How long will you work? (Max 3 hours)
- [ ] **Branch check:** Are you on the right git branch?

**Quick Status Check:**
```
Current working features: [List - Authentication, Voice with Sarah Chen, Database]
Known issues: [List current problems]
Today's focus: [One specific goal]
```

### **💾 BEFORE ANY EXPERIMENT**
**Mandatory steps - no shortcuts:**
- [ ] **Commit current state:** `git add . && git commit -m "Working state before [experiment name]"`
- [ ] **Create experiment branch:** `git checkout -b experiment-[descriptive-name]`
- [ ] **Document experiment goal:** What are you trying to achieve?
- [ ] **Set experiment time limit:** Maximum time before evaluation

**Experiment Log:**
```
Goal: [What you're trying to do]
Expected outcome: [What success looks like]
Time limit: [Maximum time to spend]
Rollback plan: [How to get back to working state]
```

### **⏰ EVERY 90 MINUTES - MANDATORY CHECKPOINT**
**Stop everything and assess:**
- [ ] **Current status:** Working/Partially working/Not working/Stuck
- [ ] **Progress made:** What's different from 90 minutes ago?
- [ ] **Decision point:** Continue/Pivot approach/Take break/Rollback

**Checkpoint Log:**
```
Time: [Current time]
Status: [Working/Issues/Stuck]
Progress: [What changed]
Decision: [Continue/Change/Break/Rollback]
Energy level: [High/Medium/Low]
```

### **🌙 SESSION END RITUAL (5 minutes)**
**Before closing anything:**
- [ ] **Commit all changes:** Even if not working - `git add . && git commit -m "Session end - [status]"`
- [ ] **Update project status:** What works now vs. when you started?
- [ ] **Plan next session:** ONE specific goal for next time
- [ ] **Clean workspace:** Close unnecessary tabs/files

---

## 🚀 PHASE/SPRINT STRATEGY

### **DEVELOPMENT APPROACH**
**Reference PROJECT_STATUS_ASSESSMENT.md for current completion status**
**Reference NM_PRD.md for complete feature requirements**

### **PHASE STRUCTURE OVERVIEW**
**Phase 1: Core Training Engine**
- Assessment and feedback systems
- Progress tracking implementation
- Scenario foundation architecture

**Phase 2: Content Expansion**
- Additional AI characters implementation
- Complete scenario library development
- Content management systems

**Phase 3: Admin & Polish**
- Administrative functionality
- Production readiness preparation
- Performance optimization

**Phase 4: Deployment & Testing**
- Production deployment
- User acceptance testing
- System monitoring setup

---

## 🎯 TEAM COORDINATION GUIDELINES

### **SUB-AGENTS TEAM STRUCTURE**

**@project-execution-lead**
- Project leadership and execution discipline specialist
- Directs sprint planning, enforces quality standards, coordinates all team efforts
- **MUST BE CONSULTED** for any cross-component changes

**@fullstack-architect** 
- Full-stack architecture and integration expert
- Designs technical foundations, ensures scalable systems
- **REQUIRED APPROVAL** for any database or API changes

**@backend-voice-api-developer**
- Server-side development specialist focusing on APIs and voice integration
- **OWNS** all server-side implementation decisions

**@voice-ui-developer**
- React and voice UI expert creating professional interfaces
- **OWNS** all frontend component development

**@business-ux-specialist**
- Professional user experience and interface design specialist
- **REQUIRED** for any UI/UX changes affecting user experience

**@negotiation-scenario-designer**
- Business negotiation methodology specialist designing scenarios and characters
- **OWNS** all content strategy and educational framework decisions

**@learning-analytics-architect**
- Learning analytics expert developing skill assessment and feedback systems
- **OWNS** all scoring algorithms and progress tracking implementation

### **TEAM COORDINATION PROTOCOL**
- **@project-execution-lead** coordinates ALL cross-team work
- **Domain experts** have final say in their specialty areas
- **No changes to working systems** without approval from relevant agent
- **Daily coordination** through @project-execution-lead for complex tasks

---

## 🧪 TESTING & DEVELOPMENT PROTOCOLS

### **STANDARD TEST ACCOUNTS (Development Only)**
```
Regular User:
- Email: user@user.com
- Password: user
- Role: Standard user access

Admin User:
- Email: admin@admin.com  
- Password: admin
- Role: Admin access for content management

Note: These simplified credentials are for development/testing only
Production deployment will require proper authentication system
```

### **TESTING REQUIREMENTS**
**Before any feature is considered complete:**
- [ ] Works with both test accounts (user and admin roles)
- [ ] Existing functionality unchanged (authentication, voice, Sarah Chen)
- [ ] No console errors or warnings
- [ ] Responsive design maintained
- [ ] Voice integration unaffected

### **ROLLBACK TRIGGERS**
**Immediate rollback required if:**
- Authentication stops working for test accounts
- Voice conversation with Sarah Chen fails
- Database connection errors
- Existing React components break
- Console shows critical errors

---

## 🏗️ TECHNICAL ARCHITECTURE GUIDELINES

### **EXISTING FOUNDATION (DO NOT MODIFY)**
```
Backend Services:
✅ /backend/src/services/voiceService.js - ElevenLabs integration
✅ /backend/src/routes/auth.js - JWT authentication 
✅ /backend/src/server.js - Express server with CORS
✅ /backend/src/database/ - Database connection and schema

Frontend Components:
✅ /frontend/src/components/VoiceConversation/ - Voice UI components
✅ /frontend/src/pages/Login.js - Authentication interface
✅ /frontend/src/App.js - Main application routing
✅ /frontend/src/index.js - React application entry point
```

### **DEVELOPMENT PATTERNS**
**When adding new features:**
- Create new files instead of modifying working ones
- Use composition over modification for existing components
- Add new routes/endpoints instead of changing existing ones
- Implement feature flags for testing new functionality

### **DATABASE GUIDELINES**
- Never DROP existing tables
- Use ALTER TABLE ADD COLUMN for schema changes
- Create migration scripts for any schema modifications
- Test all database changes with both test accounts

---

## 📋 FILE ORGANIZATION STANDARDS

### **PROJECT STRUCTURE**
```
NegotiationMaster/
├── PROJECT_MANAGEMENT/
│   ├── CURRENT/
│   │   ├── NM_PRD.md                    # Product requirements
│   │   ├── PROJECT_STATUS_ASSESSMENT.md # Current status
│   │   └── claude.md                    # This file
│   └── ARCHIVE/                         # Historical documents
├── DOCUMENTATION/
│   ├── SETUP_INSTRUCTIONS.md
│   ├── ELEVENLABS_INTEGRATION.md
│   └── TECHNICAL_ARCHITECTURE.md
├── backend/                             # Server-side code
├── frontend/                            # React application
└── scripts/                             # Utility scripts
```

### **DOCUMENTATION REQUIREMENTS**
**Every significant change must include:**
- Updated comments in code
- Status update in PROJECT_STATUS_ASSESSMENT.md
- Git commit with descriptive message
- Test results documentation

---

## ⚠️ EMERGENCY PROTOCOLS

### **🚨 AUTOMATIC TRIGGERS - FOLLOW IMMEDIATELY**

**If stuck for 2+ hours:**
- [ ] **STOP** - Do not continue coding
- [ ] **Rollback** to last working state: `git checkout main`
- [ ] **Take break** - Minimum 30 minutes away from screen
- [ ] **Reassess problem** - Is this the right approach?

**If breaking working features:**
- [ ] **IMMEDIATELY** create rollback plan
- [ ] **Document** what was working before
- [ ] **Time limit** - Maximum 1 hour to fix or rollback

**If scope expanding:**
- [ ] **STOP** - Write down the new ideas for later
- [ ] **Refocus** on original session goal
- [ ] **Schedule** new ideas for separate session

---

## 🎯 SUCCESS CRITERIA

### **SPRINT COMPLETION REQUIREMENTS**
**A sprint is only complete when:**
- [ ] All planned features implemented and tested
- [ ] Existing functionality unchanged and verified
- [ ] Both test accounts (user/admin) work correctly
- [ ] Documentation updated
- [ ] Code committed with descriptive messages
- [ ] Next sprint clearly planned

### **QUALITY STANDARDS**
- **Performance:** Voice response times <500ms maintained
- **Reliability:** No console errors or warnings
- **Usability:** Professional interface standards maintained
- **Compatibility:** Chrome/Edge browser support verified
- **Security:** Authentication and data protection preserved

---

## 💡 CORE PRINCIPLES

### **The One-Sentence Rule**
> "If I can't explain what I'm doing in one sentence, I'm doing too much at once."

### **The Working Version Rule**
> "Always maintain a version that works, even if it's simple."

### **The Time Limit Rule**
> "Every experiment has a maximum time limit and a rollback plan."

### **The Focus Rule**
> "One goal per session. Write it down. Stick to it."

### **The Protection Rule**
> "Working authentication and voice integration are sacred - never touch without explicit approval."

---

## 📝 SESSION PLANNING TEMPLATE

```markdown
## Session Plan: [Date]

**Goal:** [One specific objective]
**Time Limit:** [Maximum duration]
**Current Working State:** [What works now]

**Target:**
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Specific deliverable 3]

**Success Criteria:**
- [ ] [How to measure success]
- [ ] [Existing functionality unchanged]
- [ ] [Test accounts still work]

**Rollback Plan:**
- Git commit hash: [Record current state]
- Files to backup: [List critical files]
- Restoration procedure: [Steps to rollback]
```

---

**Remember: Our goal is systematic progress without destroying what works. Every change should move us closer to the NM_PRD vision while preserving the solid foundation we've built.**

**For current project status, priorities, and specific sprint goals, reference:**
- **PROJECT_STATUS_ASSESSMENT.md** - Current completion status and gaps
- **Sprint planning documents** - Specific phase and milestone details
- **NM_PRD.md** - Complete product requirements and success criteria
