/**
 * Seed file for 4 comprehensive negotiation training scenarios
 * Based on methodology from First Four Cases.md
 * Designed with progressive difficulty and different skill focuses
 */

exports.seed = async function (knex) {
  // Clear existing scenarios if this is being re-run
  await knex('scenarios').where('title', 'like', '%Methodology%').del()
  
  await knex('scenarios').insert([
    {
      id: require('crypto').randomUUID(),
      title: 'Car Purchase Negotiation - Methodology Training',
      description: 'A recent college graduate negotiates with a private seller for a reliable used car needed for a new job commute.',
      difficulty_level: 2,
      
      // Part 1: Human learner confidential instructions
      role1_instructions: `**Your Role: Recent College Graduate**

**Context:** You are a recent college grad starting your first job in three weeks. A reliable car is essential for your new commute. This Honda Civic seems to be in excellent condition and fits your needs perfectly. You have been saving up and are mindful of your student loan debt.

**Your Interests:**
- Get a reliable, safe car for your new job
- Keep the total cost of ownership low (purchase price + future repairs)  
- A quick, easy purchase is also a priority

**Your Goals:**
- Buy the car
- Price not to exceed $12,500
- Get a full service history

**Your BATNA:** Buy a similar car from a dealership for $13,500. It's a bit over budget, but comes with a three-month warranty and is a guaranteed reliable option.

**Negotiation Preparation:**
- The ZOPA (Zone of Possible Agreement) exists between your maximum ($12,500) and their minimum
- Use your BATNA to justify your position but don't reveal it immediately
- Focus on claiming value while maintaining a respectful relationship`,

      // Part 2: AI character confidential instructions  
      role2_instructions: `**Your Role: Private Car Seller**

**Context:** You have owned this 2018 Honda Civic for four years and have maintained it well, with a complete service history. You've inherited a new company car and no longer need the Civic. You've listed it for $13,500, but a quick sale is your top priority. You have another person coming to look at the car in two hours.

**Your Interests:**
- Sell the car quickly and with minimal hassle
- Get the best price you can to pay off some credit card debt

**Your Goals:**
- Sell the car today
- Get a price as close to $13,500 as possible
- The buyer must handle all the necessary paperwork

**Your BATNA:** Sell the car to a dealership for a guaranteed trade-in value of $11,500. This is a secure option that requires no negotiation.

**AI Character Behavior:**
- Start confident about your asking price but show willingness to negotiate
- Emphasize the car's excellent condition and complete service history
- Use time pressure (another buyer coming) strategically but don't overplay it
- Be prepared to accept offers above $11,500 but push for higher
- Show some urgency to close the deal today`,

      // Part 3: Teaching notes
      teaching_notes: `**Learning Objectives:**
- Practice claiming value in distributive negotiations
- Understand and apply BATNA concepts effectively
- Identify and work within the ZOPA
- Experience anchoring and concession strategies

**Key Concepts:**
- **Primary Focus:** Distributive Negotiation (70%)
- **BATNA:** Understanding your alternatives and using them for leverage
- **ZOPA:** Working within the zone of possible agreement ($11,500-$12,500)
- **Anchoring:** How initial offers influence the negotiation range

**Difficulty Level:** 2/10 - Beginner level, straightforward two-party negotiation

**Skill Weighting:**
- Claiming Value: 70%
- Creating Value: 10% 
- Relationship Management: 20%

**Expected Duration:** 10-15 minutes

**Debriefing Focus:**
- How effectively did the learner use their BATNA?
- What anchoring strategies were employed by both parties?
- How well did they navigate the ZOPA?
- What concession patterns emerged?
- How did they justify their offers and counteroffers?

**Assessment Criteria:**
- **Excellent:** Secured car for $11,500-$12,000 while maintaining good rapport
- **Good:** Purchased for $12,000-$12,500 with professional interaction
- **Average:** Paid close to asking price but completed the purchase
- **Poor:** Failed to purchase or damaged relationship with seller`,

      ai_character_config: {
        name: 'Mark Johnson',
        role: 'Private Car Seller', 
        personality: 'Practical, straightforward, wants a quick sale',
        initial_position: 'Asking $13,500 but open to reasonable offers',
        negotiation_style: 'Direct but fair, time-conscious'
      },

      scenario_context: {
        situation: 'Meeting at a local park on Saturday afternoon to potentially purchase a used 2018 Honda Civic',
        your_role: 'Recent college graduate needing reliable transportation',
        stakes: 'Getting a good car at fair price vs. risking budget constraints',
        constraints: ['Limited budget', 'Time pressure for new job', 'Student loan debt'],
        background: 'Car is well-maintained with service history, seller motivated to sell quickly'
      },

      evaluation_criteria: {
        claiming_value: {
          excellent: 'Negotiated price below $12,000',
          good: 'Achieved price between $12,000-$12,300',
          average: 'Final price between $12,300-$12,500',
          poor: 'Paid more than $12,500 or failed to purchase'
        },
        creating_value: {
          excellent: 'Identified additional value like maintenance records, spare keys',
          good: 'Discussed some additional items beyond price',
          average: 'Limited focus beyond the main transaction',
          poor: 'Purely transactional approach'
        },
        managing_relationships: {
          excellent: 'Built rapport and trust with seller',
          good: 'Maintained professional and respectful tone',
          average: 'Some tension but remained civil',
          poor: 'Created conflict or hostility'
        }
      }
    },

    {
      id: require('crypto').randomUUID(),
      title: 'Software License Renewal - Methodology Training',
      description: 'A startup product manager negotiates with a software account manager to renew their annual license while facing cost-cutting pressures.',
      difficulty_level: 4,

      // Part 1: Human learner confidential instructions
      role1_instructions: `**Your Role: Startup Product Manager**

**Context:** Your team relies heavily on a specific design software. Your annual license is about to expire, and company leadership is stressing cost-cutting. However, your team has been asking for more user licenses to accommodate new hires and has been frustrated with the slow technical support.

**Your Interests:**
- Secure the software license at a reduced cost
- Improve the terms of the agreement to better suit your team's growing needs (more licenses, better support)

**Your Goals:**
- Renew the license
- Reduce the annual cost by at least 10%
- Increase user licenses from 5 to 7
- Get a better technical support plan

**Your BATNA:** Switch to a competitor's software. The migration would be a hassle, but the competitor offers a more flexible license model and a lower price point. You have a demo scheduled for next week.

**Negotiation Preparation:**
- This is an integrative negotiation with multiple issues to trade off
- Consider the vendor's interests in long-term relationships and revenue growth
- Look for win-win solutions that address both cost reduction and service improvement
- Think about what you can offer in return for better terms`,

      // Part 2: AI character confidential instructions
      role2_instructions: `**Your Role: Software Account Manager**

**Context:** You are an account manager for a major software company. Your client, a promising startup, is up for license renewal. They are growing rapidly and could become a significant source of future revenue. Your company is under pressure to increase revenue and secure more long-term contracts from existing clients.

**Your Interests:**
- Secure a long-term, multi-year contract to lock in future revenue
- Maintain a positive relationship with this client for future business

**Your Goals:**
- Get a two-year contract signed today
- Increase total revenue from the account by upselling more licenses or a premium support plan

**Your BATNA:** Renew the license for one year at the standard price. This is a secure option, but it does not meet your company's goal of securing a long-term commitment.

**AI Character Behavior:**
- Emphasize the value and reliability of your software
- Show interest in the client's growth and future needs
- Be willing to negotiate on price for longer-term commitments
- Offer package deals that include additional licenses and support
- Demonstrate understanding of startup budget constraints
- Focus on building long-term partnership rather than maximizing short-term revenue`,

      // Part 3: Teaching notes
      teaching_notes: `**Learning Objectives:**
- Practice creating value through multi-issue negotiation
- Learn to identify and make strategic trade-offs
- Develop skills in integrative bargaining
- Experience B2B relationship-based negotiations

**Key Concepts:**
- **Primary Focus:** Integrative Negotiation (60%)
- **Multi-issue Negotiation:** Price, contract length, licenses, support level
- **Trade-offs:** Exchanging concessions across different issues
- **Value Creation:** Finding win-win solutions that benefit both parties
- **Relationship Building:** Long-term partnership considerations

**Difficulty Level:** 4/10 - Intermediate level, multiple variables and relationship focus

**Skill Weighting:**
- Claiming Value: 20%
- Creating Value: 60%
- Relationship Management: 20%

**Expected Duration:** 15-20 minutes

**Debriefing Focus:**
- How well did the learner identify multiple negotiable issues?
- What creative solutions were proposed?
- How effectively were trade-offs made between different variables?
- What relationship-building strategies were employed?
- How did both parties move from positions to interests?

**Assessment Criteria:**
- **Excellent:** Achieved cost savings AND additional value (more licenses, better support) through multi-year deal
- **Good:** Negotiated improvements on 2-3 key issues with win-win solutions
- **Average:** Some progress on cost or terms but limited value creation
- **Poor:** Failed to renew or created adversarial relationship`,

      ai_character_config: {
        name: 'Jennifer Martinez',
        role: 'Software Account Manager',
        personality: 'Relationship-focused, solution-oriented, understands startup challenges',
        initial_position: 'Wants to grow the account and secure long-term commitment',
        negotiation_style: 'Collaborative, flexible on terms for right partnership'
      },

      scenario_context: {
        situation: 'Annual software license renewal meeting with budget pressure from leadership',
        your_role: 'Product Manager responsible for team tools and budget',
        stakes: 'Balancing cost reduction mandate with team productivity needs',
        constraints: ['Company cost-cutting pressure', 'Growing team needs', 'Potential switching costs'],
        background: 'Software is critical to operations but competitor alternatives exist'
      },

      evaluation_criteria: {
        claiming_value: {
          excellent: 'Achieved 10%+ cost reduction with additional benefits',
          good: 'Secured cost savings of 5-10% with some additional value',
          average: 'Minimal cost reduction but maintained current service',
          poor: 'No cost improvement or lost valuable terms'
        },
        creating_value: {
          excellent: 'Created innovative package deal benefiting both parties',
          good: 'Found multiple win-win trade-offs across issues',
          average: 'Some creative problem-solving on secondary issues',
          poor: 'Purely transactional approach with limited creativity'
        },
        managing_relationships: {
          excellent: 'Strengthened partnership for future growth',
          good: 'Maintained positive vendor relationship',
          average: 'Professional but transactional interaction',
          poor: 'Damaged relationship or created adversarial dynamic'
        }
      }
    },

    {
      id: require('crypto').randomUUID(),
      title: 'Project Team Staffing - Methodology Training', 
      description: 'Two senior project managers negotiate the allocation of a key technical resource for their competing high-priority projects.',
      difficulty_level: 6,

      // Part 1: Human learner confidential instructions
      role1_instructions: `**Your Role: Senior Project Manager (Urgent Timeline)**

**Context:** You are leading a high-priority, time-sensitive project. Your deadline is in three months, and you are behind schedule. A key piece of the project requires the unique expertise of a senior developer, Sarah, to succeed. You value collaboration, but you feel your project's short-term deadline makes your claim on Sarah more urgent.

**Your Interests:**
- Meet your project deadline
- Maintain a positive, collaborative relationship with your colleague for future work

**Your Goals:**
- Secure Sarah's full-time support for the next 3 months
- Avoid escalating the issue to senior management

**Your BATNA:** Escalate the issue to the executive leadership team. While this would likely get you the resource, it would create tension and damage your relationship with your colleague.

**Negotiation Preparation:**
- This is a collaborative problem-solving scenario with high relationship stakes
- Your colleague also has legitimate needs and concerns
- Look for creative solutions that might meet both projects' needs
- Consider partial solutions, phased approaches, or alternative resources
- Remember that you'll need to work with this colleague on future projects`,

      // Part 2: AI character confidential instructions
      role2_instructions: `**Your Role: Senior Project Manager (Strategic Priority)**

**Context:** You are the head of a department leading a complex, high-visibility project that has a longer deadline (six months from now) but is of greater strategic importance to the company's long-term vision. The success of this project also depends heavily on Sarah's unique expertise. You value collaboration over competition.

**Your Interests:**
- Ensure the long-term success of your strategically important project
- Foster a culture of collaboration and avoid creating conflict between departments

**Your Goals:**
- Secure Sarah's full-time support for the next 6 months
- Maintain a strong, positive relationship with your colleague

**Your BATNA:** Hire a short-term contractor to fill the gap. This would be costly and time-consuming, and the contractor would not have Sarah's institutional knowledge.

**AI Character Behavior:**
- Emphasize the strategic importance and long-term impact of your project
- Show understanding of your colleague's time pressure while advocating for your needs
- Propose collaborative solutions that might benefit both projects
- Be willing to explore creative alternatives like shared time, phased support, or knowledge transfer
- Maintain a collaborative tone even when advocating strongly for your position
- Look for solutions that strengthen rather than strain the working relationship`,

      // Part 3: Teaching notes
      teaching_notes: `**Learning Objectives:**
- Practice collaborative problem-solving under competing constraints
- Develop relationship management skills in peer negotiations
- Learn to balance assertiveness with empathy
- Experience complex organizational dynamics and competing priorities

**Key Concepts:**
- **Primary Focus:** Relationship Management (60%)
- **Collaborative Problem-Solving:** Finding solutions that address both parties' core needs
- **Empathetic Listening:** Understanding and acknowledging the other party's legitimate concerns
- **Creative Solution Generation:** Moving beyond zero-sum thinking
- **Organizational Dynamics:** Navigating peer relationships and avoiding escalation

**Difficulty Level:** 6/10 - Advanced intermediate, high emotional intelligence required

**Skill Weighting:**
- Claiming Value: 20%
- Creating Value: 20%
- Relationship Management: 60%

**Expected Duration:** 15-20 minutes

**Debriefing Focus:**
- How well did the learner demonstrate empathetic listening?
- What creative solutions were explored beyond the initial positions?
- How effectively was emotional regulation maintained under pressure?
- What relationship-building strategies were employed?
- How did both parties move from competing to collaborating?

**Assessment Criteria:**
- **Excellent:** Found creative solution meeting both projects' core needs while strengthening colleague relationship
- **Good:** Reached compromise that both parties could support with maintained professional relationship
- **Average:** Basic resource-sharing agreement with some relationship strain
- **Poor:** Failed to reach agreement, damaged working relationship, or required escalation`,

      ai_character_config: {
        name: 'David Chen',
        role: 'Senior Project Manager - Strategic Initiatives',
        personality: 'Collaborative, strategic thinker, values long-term relationships',
        initial_position: 'Believes strategic project deserves priority resource allocation',
        negotiation_style: 'Collaborative, empathetic, solution-focused'
      },

      scenario_context: {
        situation: 'Two peer managers meeting to resolve competing claims on key technical resource Sarah',
        your_role: 'Senior Project Manager with urgent deadline pressure',
        stakes: 'Project success vs. colleague relationship vs. organizational harmony',
        constraints: ['Fixed timeline', 'Limited technical expertise available', 'Peer relationship dynamics'],
        background: 'Both projects are legitimate priorities with senior management support'
      },

      evaluation_criteria: {
        claiming_value: {
          excellent: 'Secured adequate resource allocation for project needs',
          good: 'Achieved partial resource allocation with clear timeline',
          average: 'Some resource access but may impact project timeline',
          poor: 'Insufficient resource allocation or failed negotiation'
        },
        creating_value: {
          excellent: 'Developed innovative solution benefiting both projects',
          good: 'Found creative compromise addressing core needs of both parties',
          average: 'Basic resource-sharing arrangement',
          poor: 'Failed to explore creative alternatives to resource competition'
        },
        managing_relationships: {
          excellent: 'Strengthened colleague relationship through collaborative problem-solving',
          good: 'Maintained positive professional relationship throughout',
          average: 'Some tension but relationship remains workable',
          poor: 'Damaged working relationship or required external intervention'
        }
      }
    },

    {
      id: require('crypto').randomUUID(),
      title: 'New Employee Compensation - Methodology Training',
      description: 'A highly sought-after job candidate negotiates final compensation terms with a hiring manager, balancing market value against budget constraints.',
      difficulty_level: 8,

      // Part 1: Human learner confidential instructions
      role1_instructions: `**Your Role: Highly Sought-After Job Candidate**

**Context:** You are a highly sought-after professional who has just received a job offer from your dream company. The offer is for $90,000, which is below your target of $100,000. You also have a competing offer for $95,000, which you could accept. You are keen to start the relationship with your future employer on a positive note.

**Your Interests:**
- Secure a salary that reflects your market value
- Get a positive start to the new job

**Your Goals:**
- Get a salary of at least $95,000
- Negotiate a signing bonus and flexible work schedule

**Your BATNA:** The competing job offer for $95,000. It is a good offer from a reputable company and gives you leverage in this negotiation.

**Negotiation Preparation:**
- This is an advanced negotiation requiring integration of all key skills
- You have strong leverage with your competing offer
- Consider multiple forms of compensation beyond base salary
- Balance assertiveness with relationship building for your future role
- Think about both short-term compensation and long-term career growth
- Use anchoring strategically while remaining collaborative`,

      // Part 2: AI character confidential instructions
      role2_instructions: `**Your Role: Hiring Manager**

**Context:** You are the hiring manager for a leading tech company. You have found the perfect candidate for a critical role and have extended an offer of $90,000. The company has a strict budget, and you have limited flexibility on the base salary. However, you have some discretion to offer a signing bonus or discuss non-salary benefits.

**Your Interests:**
- Hire the best possible candidate within the allocated budget
- Build a strong, positive relationship with your new team member

**Your Goals:**
- Hire the candidate and get the offer accepted
- Stay as close to the initial offer of $90,000 as possible
- Use non-salary benefits (e.g., signing bonus, flexible work) to make the offer appealing

**Your BATNA:** Hire a different candidate from the interview pool. While this would be an acceptable hire, they are not as strong as the current candidate, and it would require additional time to get them up to speed.

**AI Character Behavior:**
- Express genuine enthusiasm for the candidate and their potential contribution
- Acknowledge budget constraints while showing flexibility where possible
- Focus on non-salary benefits and long-term growth opportunities
- Be prepared to justify the company's compensation philosophy
- Show understanding of the candidate's position while advocating for company constraints
- Aim to close the negotiation with a win-win outcome that starts the employment relationship positively`,

      // Part 3: Teaching notes
      teaching_notes: `**Learning Objectives:**
- Integrate all negotiation skills in a complex, high-stakes scenario
- Practice salary negotiation with multiple compensation elements
- Balance leverage from BATNA with relationship building
- Experience advanced anchoring and concession strategies

**Key Concepts:**
- **Integrated Skills:** Claiming Value, Creating Value, and Relationship Management
- **BATNA Power:** Using competitive offers as leverage
- **Anchoring:** Strategic use of initial positions and counteroffers
- **Multi-issue Negotiation:** Base salary, signing bonus, benefits, work arrangements
- **Relationship Dynamics:** Starting future employment relationship positively

**Difficulty Level:** 8/10 - Advanced level, requires sophisticated negotiation skills

**Skill Weighting:**
- Claiming Value: 40%
- Creating Value: 30%
- Relationship Management: 30%

**Expected Duration:** 15-20 minutes

**Debriefing Focus:**
- How effectively was the BATNA used without damaging the relationship?
- What anchoring strategies were employed by both parties?
- How well were non-monetary issues explored and leveraged?
- How was the tone managed throughout the negotiation?
- What creative compensation solutions were proposed?
- How did both parties balance their immediate needs with long-term relationship building?

**Assessment Criteria:**
- **Excellent:** Achieved salary target ($95,000+) plus additional benefits while building positive relationship with future manager
- **Good:** Secured significant salary increase ($92,000-$95,000) with some additional benefits and maintained good rapport
- **Average:** Modest salary improvement ($90,000-$92,000) with professional interaction
- **Poor:** Failed to improve offer, damaged relationship, or lost opportunity`,

      ai_character_config: {
        name: 'Lisa Rodriguez',
        role: 'Hiring Manager - Engineering',
        personality: 'Professional, enthusiastic about talent, budget-conscious but fair',
        initial_position: 'Really wants to hire this candidate but has budget constraints',
        negotiation_style: 'Collaborative but firm on budget, creative with benefits'
      },

      scenario_context: {
        situation: 'Final compensation negotiation call for dream job opportunity',
        your_role: 'Highly qualified candidate with competing offer',
        stakes: 'Career opportunity vs. fair market compensation vs. future working relationship',
        constraints: ['Company budget limits', 'Competing offer timeline', 'Future manager relationship'],
        background: 'Dream company role with strong mutual interest but compensation gap to bridge'
      },

      evaluation_criteria: {
        claiming_value: {
          excellent: 'Negotiated compensation package worth $95,000+ equivalent',
          good: 'Achieved $92,000-$95,000 equivalent through salary and benefits',
          average: 'Modest improvement to $90,000-$92,000 range',
          poor: 'No improvement or lost the opportunity'
        },
        creating_value: {
          excellent: 'Identified creative compensation solutions addressing both parties\' constraints',
          good: 'Successfully negotiated non-salary benefits and arrangements',
          average: 'Some discussion of benefits beyond base salary',
          poor: 'Failed to explore alternatives to base salary negotiation'
        },
        managing_relationships: {
          excellent: 'Built strong foundation for future working relationship',
          good: 'Maintained positive professional relationship throughout',
          average: 'Some tension but relationship remains positive',
          poor: 'Created conflict or damaged future working relationship'
        }
      }
    }
  ])
}

exports.down = async function (knex) {
  return knex('scenarios').where('title', 'like', '%Methodology Training%').del()
}