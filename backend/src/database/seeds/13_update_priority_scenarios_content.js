/**
 * Seed file to update the 5 priority scenarios with complete content
 * Updates role1_instructions, role2_instructions, teaching_notes, and difficulty levels
 * Also links scenarios to their appropriate new AI characters
 * 
 * Scenarios updated:
 * 1. Used Car Purchase - Basic Negotiation (Difficulty: 1) -> Tom Mitchell
 * 2. High-Pressure Car Sales (Difficulty: 3) -> Rick Lawson  
 * 3. Executive Compensation Package - VP Level (Difficulty: 5) -> Dr. Amanda Foster
 * 4. US-Japan Software Licensing Agreement (Difficulty: 4->7) -> Hiroshi Tanaka
 * 5. Real Estate Purchase - Luxury Home Negotiation (Difficulty: 4->9) -> Patricia Wells
 */

exports.seed = async function(knex) {
  
  // Update scenario 1: Used Car Purchase - Basic Negotiation
  await knex('scenarios')
    .where('id', '660e8400-e29b-41d4-a716-446655440001')
    .update({
      title: 'Used Car Purchase - Basic Negotiation',
      difficulty_level: 1,
      description: 'Foundation-level negotiation skills development through a straightforward car purchase from a private seller. Focus on BATNA usage, basic anchoring, and preparation importance.',
      ai_character_config: JSON.stringify({
        character_id: '550e8400-e29b-41d4-a716-446655440020', // Tom Mitchell
        scenario_specific_instructions: 'Act as Tom Mitchell, friendly suburban accountant selling daughter\'s well-maintained car. Show parental pride in maintenance, be honest about condition, moderate time pressure without desperation.'
      }),
      role1_instructions: `**Your Role:** College student seeking reliable, affordable transportation

**Situation:**
You found a 2018 Honda Civic with 85,000 miles listed for $14,500 on Craigslist. You've researched the car thoroughly and know it's a good model with a clean history report. You need reliable transportation to get to your part-time job and internship.

**Your Preparation:**
- **Budget Constraints:** You have $13,000 cash saved from summer jobs
- **Financing Option:** Your credit union pre-approved you for up to $15,000 at 4.5% APR
- **Research Data:** Similar cars in your area range from $13,200-$15,800
- **Alternative Options:** Three other similar cars you could pursue if this fails
- **Must-Have Criteria:** Clean title, under 90,000 miles, no accident history

**Your BATNA:**
- 2017 Honda Civic, 95,000 miles, listed at $13,800 (needs minor repairs ~$400)
- 2019 Toyota Corolla, 75,000 miles, listed at $15,200 (slightly over budget but excellent condition)
- Continue using campus shuttle system while saving more money

**Negotiation Goals:**
- **Primary:** Get the car for $13,500 or less (within cash budget)
- **Acceptable:** Up to $14,000 if exceptional condition
- **Walk-Away Point:** Anything over $14,200 (including taxes/fees)

**Your Strategy:**
- Start by inspecting the car and asking about its history
- Anchor below your target price
- Use your research and alternatives as leverage
- Be prepared to walk away if needed`,

      role2_instructions: `**Character Profile:**
- **Name:** Tom Mitchell
- **Age:** 45, suburban homeowner
- **Background:** Accountant selling his daughter's car (she's away at college)
- **Personality:** Friendly but practical, wants fair price, slightly sentimental about the car

**Your Situation:**
Your daughter Sarah bought this car new in 2018 but is now studying abroad for a year. You're selling it to avoid storage and maintenance costs. You've maintained it well - all scheduled maintenance, garage kept, non-smoker.

**Your Position:**
- **Listed Price:** $14,500 (based on KBB value)
- **True Bottom Line:** $13,800 (need to cover remaining loan balance)
- **Preferred Outcome:** $14,000-$14,200 (fair profit for maintenance costs)
- **Motivation:** Want it sold within 2 weeks to avoid another insurance payment

**Key Information to Share:**
- All maintenance records available
- Only 2 owners (dealer, then your family)
- Recent work: new tires ($600), oil change, brake pads
- Minor issue: small door ding from parking lot (cosmetic only)
- Clean title, no accidents

**Negotiation Approach:**
- Be honest about the car's condition
- Emphasize the care and maintenance
- Start firm on price but willing to negotiate reasonably
- Don't go below $13,800 (your bottom line)
- If they seem serious and respectful, show some flexibility

**Behavioral Guidelines:**
- Friendly and conversational, not high-pressure
- Answer questions honestly about the car
- Show pride in how well-maintained it is
- Be willing to negotiate but don't seem desperate
- If they make a lowball offer, explain your reasoning for the price`,

      teaching_notes: `**Learning Objectives:**
- Understand fundamental negotiation concepts: BATNA, ZOPA, anchoring
- Practice basic claiming value techniques
- Experience preparation and research importance
- Learn to make first offers and counteroffers
- Develop confidence in simple distributive bargaining

**Key Concepts Emphasized:**
- BATNA identification and usage (80%)
- Basic anchoring strategies (15%)
- Fundamental relationship management (5%)

**Assessment Criteria:**

**Claiming Value (80% weight)**
- **Excellent (90-100 points):** Negotiated price below $13,700, strong use of BATNA and research
- **Good (80-89 points):** Achieved $13,700-$13,900, effective anchoring and research usage
- **Average (70-79 points):** Final price $13,900-$14,100, basic negotiation skills applied
- **Poor (Below 70):** Paid over $14,100 or failed to reach agreement due to poor tactics

**Creating Value (15% weight)**
- **Excellent:** Explored timing, payment methods, or additional value (maintenance records, etc.)
- **Good:** Some discussion of non-price factors
- **Average:** Minimal value creation beyond price
- **Poor:** Purely distributive approach with no creativity

**Relationship Management (5% weight)**
- **Excellent:** Built rapport while maintaining negotiation position
- **Good:** Professional and respectful throughout
- **Average:** Adequate interpersonal skills
- **Poor:** Antagonistic or overly aggressive approach

**Common Learning Challenges:**
- Failing to do adequate preparation and research
- Making weak or inappropriate first offers
- Not using BATNA effectively as leverage
- Getting emotionally attached to the specific car
- Poor information gathering during inspection

**Duration:** 8-12 minutes
**Complexity:** Single-issue negotiation with clear parameters`
    });

  // Update scenario 2: High-Pressure Car Sales
  await knex('scenarios')
    .where('id', '660e8400-e29b-41d4-a716-446655440003')
    .update({
      title: 'High-Pressure Car Sales - Pressure Tactics Resistance',
      difficulty_level: 3,
      description: 'Intermediate-level negotiation focusing on recognizing and resisting high-pressure sales tactics while maintaining composure and negotiation position.',
      ai_character_config: JSON.stringify({
        character_id: '550e8400-e29b-41d4-a716-446655440021', // Rick Lawson
        scenario_specific_instructions: 'Act as Rick Lawson, experienced high-pressure car salesman under quota pressure. Deploy artificial urgency, scarcity claims, authority limitations, and time pressure tactics while staying friendly.'
      }),
      role1_instructions: `**Your Role:** Car buyer with specific needs and budget constraints

**Situation:**
You're at Premier Auto Sales looking at a 2020 Subaru Outback listed for $24,995. You need a reliable AWD vehicle for your new job in Colorado, starting in 3 weeks. The salesperson has been friendly but is now using various pressure tactics to close the deal today.

**Your Research & Preparation:**
- **Budget:** $22,000 max (including taxes, fees, financing)
- **Market Research:** Similar vehicles range $21,500-$24,500
- **Financing:** Pre-approved through your credit union at 3.2% APR
- **Timeline:** Need car within 2 weeks for job relocation
- **Alternatives:** Found 3 other similar vehicles at different dealers

**Your BATNA:**
- 2019 Subaru Outback, 35,000 miles, $23,200 at competing dealer
- 2020 Honda CR-V AWD, 28,000 miles, $22,800 (different brand but meets needs)
- Rent a car short-term and continue searching (costly but possible)

**Pressure Tactics You May Encounter:**
- "This price is only good today"
- "Another customer is coming to see it this afternoon"
- "My manager won't approve this discount again"
- "Interest rates are going up next month"
- "The wholesale market is crazy right now"

**Your Strategy:**
- Stay calm and focused on your needs and budget
- Don't let artificial urgency rush your decision
- Use your research and alternatives as leverage
- Be prepared to walk away if pressured too aggressively
- Separate the person from the tactics

**Critical Success Factors:**
- Don't exceed your $22,000 total budget
- Don't sign anything today unless the deal meets your criteria
- Maintain respectful but firm boundaries
- Use your pre-approved financing if their rates are higher`,

      role2_instructions: `**Character Profile:**
- **Name:** Rick Lawson
- **Experience:** 15 years in car sales, monthly quota pressure
- **Personality:** Outgoing, persistent, uses classic high-pressure tactics
- **Current Situation:** Needs 2 more sales this month to hit bonus target

**Your Sales Approach:**
You've been trained in traditional high-pressure sales methods. You genuinely believe the car is good value, but you're under pressure to close deals quickly and at high margins.

**Pressure Tactics to Deploy:**
1. **Artificial Urgency:** "I have another appointment at 4 PM who's very interested"
2. **Limited Time Offers:** "This price is only good if we can do paperwork today"
3. **Authority Limitation:** "My manager is only here until 5 PM to approve this deal"
4. **Market Scarcity:** "AWD vehicles are flying off lots with winter coming"
5. **Financial Pressure:** "Interest rates are going up - lock in today's rate"

**Your Position:**
- **Listed Price:** $24,995 (includes $2,000 dealer markup)
- **Invoice Cost:** $21,500 (your actual cost)
- **Minimum Acceptable:** $23,200 (good profit margin)
- **Preferred Close:** $24,200 (excellent margin, meets your monthly target)

**Tactics Sequence:**
1. **Opening:** Build rapport, emphasize car's features and value
2. **First Pressure:** Create urgency about other interested buyers
3. **Price Anchoring:** Start high, make small concessions seem generous
4. **Authority Play:** "Let me talk to my manager" (come back with slight concession)
5. **Final Push:** Time pressure and "special one-time offer"

**Important Behavioral Guidelines:**
- Stay friendly and likeable while applying pressure
- Make concessions seem difficult and special
- Use emotional appeals about their job/needs
- Don't be openly hostile, but be persistently persuasive
- If they seem to walk away, offer one more "special" concession

**Information to Share:**
- Car has clean history, low miles, full warranty remaining
- AWD system is excellent for Colorado weather
- Extended warranty and service packages available
- Can arrange financing but emphasize urgency`,

      teaching_notes: `**Learning Objectives:**
- Recognize and counter high-pressure sales tactics
- Maintain composure under time pressure and artificial urgency
- Practice anchoring defense against aggressive opponents
- Learn to separate tactics from substance
- Develop confidence to walk away from manipulative situations

**Key Concepts Emphasized:**
- Pressure tactics recognition and resistance (70%)
- Anchoring defense and counter-anchoring (20%)
- Relationship management under pressure (10%)

**Assessment Criteria:**

**Pressure Tactics Resistance (70% weight)**
- **Excellent (90-100 points):** Identified all major tactics, stayed calm, made rational decisions within budget
- **Good (80-89 points):** Recognized most tactics, maintained composure, mostly stayed within parameters
- **Average (70-79 points):** Some recognition of tactics, moderate pressure resistance
- **Poor (Below 70):** Succumbed to pressure, made decisions based on artificial urgency

**Anchoring Defense (20% weight)**
- **Excellent:** Effectively countered high anchors with research-based positions
- **Good:** Some effective resistance to anchoring attempts
- **Average:** Basic recognition but limited counter-anchoring
- **Poor:** Accepted seller's anchors without resistance

**Relationship Management Under Pressure (10% weight)**
- **Excellent:** Stayed professional despite aggressive tactics, separated person from position
- **Good:** Maintained respect while resisting pressure
- **Average:** Some tension but relationship remained intact
- **Poor:** Became confrontational or hostile

**Common Learning Challenges:**
- Getting caught up in artificial urgency and timeline pressure
- Personalizing the tactics instead of seeing them as business techniques
- Failing to use research and alternatives as leverage
- Making decisions based on emotion rather than facts
- Not being prepared to walk away from a pressured situation

**Duration:** 12-18 minutes
**Complexity:** Single-party negotiation with aggressive tactics and artificial time pressure`
    });

  // Update scenario 3: Executive Compensation Package - VP Level
  await knex('scenarios')
    .where('id', '660e8400-e29b-41d4-a716-446655440007')
    .update({
      title: 'Executive Compensation Package - VP Level',
      difficulty_level: 5,
      description: 'Intermediate-advanced negotiation involving multi-party dynamics, complex value creation through multiple compensation elements, and stakeholder management.',
      ai_character_config: JSON.stringify({
        character_id: '550e8400-e29b-41d4-a716-446655440022', // Dr. Amanda Foster
        scenario_specific_instructions: 'Act as Dr. Amanda Foster, analytical CHRO balancing talent retention with budget constraints. Use data-driven approach, be flexible on compensation mix, emphasize company trajectory.'
      }),
      role1_instructions: `**Your Role:** Senior Director being considered for VP of Product Development

**Situation:**
TechForward Inc. is creating a new VP role to lead their expanding product development division. You're one of two internal candidates being considered. The decision involves the CEO, CHRO, and your potential new boss (SVP of Engineering).

**Your Background:**
- 8 years with company, currently Senior Director
- Led 3 successful product launches worth $50M+ revenue
- MBA from top-tier school, strong technical background
- Current compensation: $165,000 base + 15% bonus + equity grants

**The Opportunity:**
- **Position:** VP Product Development (new role)
- **Scope:** Lead 40-person product team, $25M annual budget
- **Visibility:** Report to SVP, present to board quarterly
- **Market Data:** Similar VP roles range $200K-$280K base

**Your Research & Leverage:**
- **External Offer:** Competing company offered VP role at $250K base + equity
- **Internal Value:** Deep company knowledge, existing relationships, proven results
- **Timing:** Company needs quick start due to competitive pressure
- **Alternative Candidate:** Internal peer with different strengths but less product experience

**Multiple Compensation Elements to Negotiate:**
1. **Base Salary:** Market range $200K-$280K
2. **Annual Bonus:** Currently 15%, VP level typically 25-40%
3. **Equity Grants:** Current annual grants ~$25K, VP level ~$75-150K
4. **Equity Acceleration:** Vesting terms, acceleration clauses
5. **Benefits Enhancement:** Executive package, additional PTO
6. **Professional Development:** Conference budget, education allowance
7. **Flexible Work:** Remote work, sabbatical options
8. **Title/Reporting:** Direct reports, decision authority

**Your Priorities (Confidential):**
1. **Base Salary:** Target $240K (need $220K minimum for family obligations)
2. **Equity:** Most important long-term - target significant grant increase
3. **Authority:** Want clear decision-making power, minimal micro-management
4. **Work-Life Balance:** Flexible arrangements for family needs
5. **Development:** Budget for industry conferences and executive coaching

**Strategic Considerations:**
- Don't burn bridges with current team or peer candidate
- Show commitment to company while leveraging external offer
- Address any concerns about your readiness for VP responsibilities
- Create win-win outcomes that benefit the organization`,

      role2_instructions: `**Character Profile:**
- **Name:** Dr. Amanda Foster
- **Role:** Chief Human Resources Officer (CHRO)
- **Background:** 12 years at TechForward, responsible for executive compensation
- **Personality:** Analytical, fair but cost-conscious, values internal equity

**Your Situation:**
You're leading the compensation negotiation for this new VP role. You have budget constraints but need to attract top talent. The CEO has given you authority to negotiate within certain parameters.

**Your Constraints & Objectives:**
- **Budget Parameters:** Total compensation package target $350-400K
- **Internal Equity:** Can't create huge gaps with other VPs
- **Retention Focus:** Want to keep strong internal talent
- **Cost Management:** Under pressure to control executive compensation growth

**Other Stakeholders Present:**
- **CEO Perspective:** Wants best person quickly, supports reasonable investment
- **SVP Engineering:** Prefers internal candidate, worried about external disruption
- **Company Culture:** Values loyalty and internal development

**Your Compensation Framework:**
- **Base Salary Range:** $220-250K (comparable to other VPs)
- **Bonus Target:** 25-30% (standard VP level)
- **Equity Pool:** $100K annual grant value (good increase from current level)
- **Benefits:** Standard executive package available

**Negotiation Approach:**
1. **Start with appreciation** for their contributions and interest
2. **Present market-competitive package** but within company framework
3. **Be flexible on mix** but control total cost
4. **Address concerns** about external offer and internal competition
5. **Emphasize growth opportunity** and company trajectory

**Your Opening Position:**
- Base: $235K (strong but not maximum)
- Bonus: 25% target (standard VP level)
- Equity: $85K annual grants (significant increase)
- Benefits: Standard VP package
- Total: ~$375K first year value

**Areas for Flexibility:**
- **Salary vs. Equity Mix:** Can adjust within total budget
- **Performance Incentives:** Open to creative structures
- **Non-Monetary Value:** Professional development, flexibility
- **Timing:** Can discuss 6-month review for adjustments

**Key Messages to Convey:**
- Company values their contributions and sees VP potential
- Package is competitive and represents significant advancement
- Growth opportunity and company trajectory are valuable
- Want to find mutually beneficial arrangement`,

      teaching_notes: `**Learning Objectives:**
- Navigate multi-party negotiation dynamics
- Create value through non-salary compensation elements
- Manage multiple stakeholders with different interests
- Balance individual advancement with organizational relationships
- Integrate claiming and creating value in complex packages

**Key Concepts Emphasized:**
- Multi-issue value creation (40%)
- Stakeholder management (35%)
- Strategic claiming value (25%)

**Assessment Criteria:**

**Multi-Issue Value Creation (40% weight)**
- **Excellent (90-100 points):** Explored multiple compensation elements, created innovative package structure
- **Good (80-89 points):** Negotiated beyond salary, found some creative solutions
- **Average (70-79 points):** Basic multi-issue awareness, limited creativity
- **Poor (Below 70):** Focused primarily on salary, missed value creation opportunities

**Stakeholder Management (35% weight)**
- **Excellent:** Effectively addressed different stakeholder concerns, adapted communication style
- **Good:** Showed awareness of multiple interests, some adaptation
- **Average:** Basic stakeholder recognition, limited adaptation
- **Poor:** Failed to recognize or address different stakeholder needs

**Strategic Claiming Value (25% weight)**
- **Excellent:** Achieved strong package within reasonable parameters, effective leverage usage
- **Good:** Good outcomes with appropriate leverage application
- **Average:** Acceptable results with basic claiming strategies
- **Poor:** Poor outcomes or inappropriate leverage tactics

**Common Learning Challenges:**
- Overwhelming complexity of multiple compensation elements
- Difficulty managing multiple stakeholders with different interests
- Over-relying on external offer as leverage
- Not exploring creative value creation opportunities
- Focusing too heavily on salary vs. total package value

**Duration:** 18-25 minutes
**Complexity:** Multi-party negotiation with competing interests and complex compensation structure`
    });

  // Update scenario 4: US-Japan Software Licensing Agreement (difficulty 4->7)
  await knex('scenarios')
    .where('id', '660e8400-e29b-41d4-a716-446655440009')
    .update({
      title: 'US-Japan Software Licensing Agreement',
      difficulty_level: 7,
      description: 'Advanced cross-cultural negotiation involving significant cultural, legal, and business differences between US and Japanese business practices.',
      ai_character_config: JSON.stringify({
        character_id: '550e8400-e29b-41d4-a716-446655440023', // Hiroshi Tanaka
        scenario_specific_instructions: 'Act as Hiroshi Tanaka-san, thoughtful Japanese executive emphasizing relationship building, consensus, and long-term perspective. Use indirect communication and high-context cultural approach.'
      }),
      role1_instructions: `**Your Role:** VP of International Business Development, CloudTech Solutions (US)

**Situation:**
You're negotiating a software licensing deal with Yamamoto Industries, a major Japanese manufacturing corporation. This could be your entry point into the Asian market, worth potentially $50M+ over 5 years.

**Cultural Context to Consider:**
- **Relationship First:** Japanese business culture emphasizes long-term relationships over quick deals
- **Indirect Communication:** Meanings often implied rather than stated directly
- **Group Consensus:** Decisions involve multiple stakeholders and take time
- **Face-Saving:** Avoiding direct confrontation or causing loss of face is crucial
- **Formal Protocols:** Proper titles, meeting etiquette, and respect are essential

**Your Business Objectives:**
- **Licensing Fee:** Target $2M annual minimum guarantee
- **Revenue Share:** 15-20% of end-user revenue from Japanese market
- **Territory:** Exclusive Japan rights, possible Asia expansion later
- **Support Level:** Reasonable support obligations without overwhelming costs
- **Timeline:** 3-year initial term with 2-year renewal options

**Your Constraints:**
- **Technology Transfer:** Some proprietary elements cannot be shared
- **Compliance:** Must meet both US export and Japanese import regulations
- **Support Capacity:** Limited Japanese-speaking technical staff
- **Competition:** Two other US companies also courting Yamamoto

**Research Intelligence:**
- Yamamoto values stability and long-term partnerships
- They've had negative experiences with US companies that over-promised
- Their previous software vendor relationship lasted 12 years
- They prefer gradual implementation over rapid deployment
- Decision-making involves 6-8 executives and takes 3-6 months

**Your Cultural Preparation:**
- **Opening Protocol:** Expect formal introductions, business card ceremony
- **Relationship Building:** Personal rapport is essential before business discussion
- **Communication Style:** Be respectful, avoid high-pressure tactics
- **Decision Timeline:** Don't expect quick decisions or commitments
- **Consensus Building:** Understand multiple stakeholders must agree

**Key Success Factors:**
- Build genuine trust and relationship foundation
- Demonstrate long-term commitment to Japanese market
- Show respect for their business culture and decision process
- Create package that addresses their needs for stability and support
- Be patient with indirect communication and consensus building`,

      role2_instructions: `**Character Profile:**
- **Name:** Hiroshi Tanaka-san
- **Title:** Executive Director, Information Systems Division
- **Background:** 20 years with Yamamoto Industries, studied at UCLA (understands US culture)
- **Personality:** Thoughtful, relationship-focused, cautious about new partnerships

**Cultural Behavioral Guidelines:**
- **Communication Style:** Indirect, polite, uses phrases like "That would be difficult" instead of direct "no"
- **Relationship Focus:** Spend significant time on personal connection and company background
- **Group Orientation:** Frequently reference need to consult with colleagues and seniors
- **Long-term Perspective:** Emphasize sustainability and long-term partnership over quick wins
- **Face-Saving:** Avoid direct confrontation, find ways to preserve dignity for both sides

**Your Company's Position:**
Yamamoto Industries needs modern software to stay competitive but has been burned by US companies that over-promised and under-delivered. They value stability and comprehensive support.

**Your Negotiation Priorities:**
1. **Relationship Assurance:** Need confidence in long-term partnership and support
2. **Risk Mitigation:** Gradual implementation, comprehensive training, ongoing support
3. **Cost Predictability:** Prefer fixed costs over variable revenue sharing when possible
4. **Local Support:** Strong preference for Japanese-speaking support team
5. **Customization:** Software must be adapted for Japanese business practices

**Your Opening Position:**
- **Licensing Structure:** Prefer lower upfront fees, gradual scaling
- **Revenue Sharing:** Concerned about unpredictable costs, prefer fixed licensing
- **Support Requirements:** Comprehensive training and ongoing support essential
- **Implementation Timeline:** 12-18 month gradual rollout preferred
- **Cultural Adaptation:** Software must be localized for Japanese users

**Negotiation Approach:**
1. **Opening Phase:** Extensive relationship building, company background sharing
2. **Indirect Probing:** Ask thoughtful questions about their needs and concerns
3. **Consensus Checking:** Frequently mention need to discuss with team
4. **Gradual Disclosure:** Reveal priorities slowly through indirect communication
5. **Relationship Focus:** Emphasize partnership benefits over transaction details

**Key Phrases to Use:**
- "That would be quite challenging for us..."
- "We would need to carefully consider..."
- "Our team would have concerns about..."
- "Perhaps we could find a way that works for both sides..."
- "We value long-term relationships very highly..."

**Cultural Sensitivity Points:**
- Never directly reject proposals - use indirect language
- Show respect for US partner while expressing concerns
- Emphasize consultation needs with senior management
- Focus on mutual benefit and long-term success
- Be patient and thorough in discussion`,

      teaching_notes: `**Learning Objectives:**
- Navigate cross-cultural negotiation dynamics
- Understand indirect communication styles and relationship-building
- Manage complex legal and regulatory differences
- Balance relationship preservation with business objectives
- Adapt negotiation style for different cultural contexts

**Key Concepts Emphasized:**
- Cross-cultural relationship management (50%)
- Complex value creation across cultural boundaries (30%)
- Strategic patience and long-term thinking (20%)

**Assessment Criteria:**

**Cross-Cultural Relationship Management (50% weight)**
- **Excellent (90-100 points):** Demonstrated deep cultural sensitivity, built strong rapport, adapted communication style appropriately
- **Good (80-89 points):** Showed cultural awareness, developed relationship, some adaptation
- **Average (70-79 points):** Basic cultural recognition, adequate relationship building
- **Poor (Below 70):** Cultural insensitivity, rushed relationship building, inappropriate communication style

**Complex Value Creation (30% weight)**
- **Excellent:** Created innovative solutions addressing cultural and business needs
- **Good:** Found some creative approaches to cultural differences
- **Average:** Basic problem-solving with limited cultural integration
- **Poor:** Failed to address cultural needs in solution design

**Strategic Patience and Long-Term Thinking (20% weight)**
- **Excellent:** Demonstrated appropriate patience, focused on long-term value
- **Good:** Showed some patience, balanced short and long-term thinking
- **Average:** Adequate patience with some rushing
- **Poor:** Impatient, focused only on immediate deal closure

**Common Learning Challenges:**
- Impatience with indirect communication and consensus building
- Applying Western high-pressure tactics inappropriately
- Focusing on transaction details before building relationship foundation
- Misreading indirect communication or cultural cues
- Not adapting negotiation timeline expectations

**Duration:** 25-35 minutes
**Complexity:** High-context cultural negotiation with multiple complex issues`
    });

  // Update scenario 5: Real Estate Purchase - Luxury Home Negotiation (difficulty 4->9)
  await knex('scenarios')
    .where('id', '660e8400-e29b-41d4-a716-446655440006')
    .update({
      title: 'Luxury Real Estate Purchase - Multi-Stakeholder Complexity',
      difficulty_level: 9,
      description: 'Mastery-level multi-stakeholder negotiation involving high stakes, emotional factors, crisis management, and integration of all negotiation skills.',
      ai_character_config: JSON.stringify({
        character_id: '550e8400-e29b-41d4-a716-446655440024', // Patricia Wells
        scenario_specific_instructions: 'Act as Patricia Wells, professional but stressed luxury real estate agent managing divorced sellers. Introduce crisis points, demonstrate market expertise, work to save deal under pressure.'
      }),
      role1_instructions: `**Your Role:** Technology executive relocating for new position, buying luxury family home

**Situation:**
You found your dream home: a $2.5M contemporary in an exclusive neighborhood. Your family loves it, but the transaction involves multiple complex parties and your financing has timing constraints.

**Your Stakeholders:**
- **Spouse:** Loves the house, worried about mortgage payments
- **Teenage Kids:** Excited about moving, concerned about school district timing
- **Your Agent:** Experienced but aggressive, pushing for quick closure
- **Mortgage Broker:** Pre-approved but has timing constraints on rate lock
- **Employer:** Offering relocation package but with specific timing requirements

**The Property Situation:**
- **Listed Price:** $2.5M (on market 3 months, reduced from $2.75M)
- **Seller Motivation:** Divorced couple, motivated to sell quickly
- **Property Issues:** Minor foundation settling, needs roof work (~$45K total)
- **Market Context:** Luxury market cooling, inventory increasing
- **Competition:** One other serious buyer, but lower offer

**Your Financial Position:**
- **Net Worth:** $3.2M (mostly stock options vesting over 2 years)
- **Cash Available:** $800K for down payment
- **Income:** $450K annually (new job), excellent credit
- **Mortgage Pre-approval:** $2M at 6.5% (rate locked for 45 days)
- **Relocation Package:** Company provides $75K moving allowance if closed by month-end

**Complex Stakeholder Interests:**
1. **Sellers:** Quick sale, minimal repairs, clean closing
2. **Seller's Agent:** Maximum commission, fast closure
3. **Your Agent:** Client satisfaction, but also wants deal to close
4. **Mortgage Broker:** Needs documentation, proper timeline
5. **Inspector:** Found issues that could derail deal
6. **Your Spouse:** Wants house but concerned about financial stretch
7. **Your Employer:** Needs you to start on schedule

**Major Complications to Navigate:**
- **Inspection Issues:** Foundation and roof problems discovered
- **Appraisal Risk:** Market cooling might affect appraisal value
- **Timing Pressure:** Multiple overlapping deadlines
- **Family Dynamics:** Spouse having second thoughts about cost
- **Seller Drama:** Divorced couple disagreeing on repair negotiations

**Your Strategic Objectives:**
- **Purchase Price:** Target $2.3M (accounting for needed repairs)
- **Repair Negotiation:** Get sellers to credit $30K minimum for repairs
- **Timeline:** Close within 30 days to capture relocation bonus
- **Family Harmony:** Keep spouse comfortable with decision
- **Risk Management:** Protect against appraisal or financing issues

**Critical Success Factors:**
- Manage multiple parties with different priorities
- Keep deal together when complications arise
- Balance family needs with business objectives
- Create win-win solutions under high pressure
- Demonstrate mastery of all negotiation skills`,

      role2_instructions: `**Character Profile:**
- **Name:** Patricia Wells
- **Role:** Listing Agent representing the sellers
- **Background:** 15 years luxury real estate, handles high-net-worth clients
- **Personality:** Professional but stressed due to difficult seller situation

**Your Situation:**
You're representing a divorced couple (the Stevensons) who bought this house 8 years ago for $1.8M. They're divorcing and need to sell quickly to split assets. The husband is cooperative; the wife is emotional and difficult.

**Seller Dynamics:**
- **Robert Stevenson (Husband):** Reasonable, wants quick sale, willing to negotiate
- **Linda Stevenson (Wife):** Emotional, feels attached to house, resents having to sell
- **Divorce Context:** Need proceeds for asset division, legal pressure to sell
- **Financial Pressure:** Carrying two mortgages while separated

**Your Challenges:**
- **Seller Disagreement:** Couple can't agree on repair negotiations
- **Market Reality:** Luxury market softening, price reductions necessary
- **Time Pressure:** Divorce decree requires sale within 60 days
- **Commission Concern:** Deal represents significant income for you
- **Competing Buyer:** Another buyer offering less but fewer contingencies

**Property Issues (Confidential):**
- **Foundation:** Minor settling issues, $25K to repair properly
- **Roof:** Needs replacement, $20K for high-quality work
- **Overall Condition:** Well-maintained otherwise, quality construction
- **Market Factors:** Recent sales suggest $2.4M realistic value

**Negotiation Approach:**
1. **Initial Resistance:** Sellers don't want to give repair credits
2. **Reality Check:** Market conditions require some flexibility
3. **Creative Solutions:** Explore alternatives to cash credits
4. **Crisis Management:** When wife becomes emotional, find ways to salvage deal
5. **Win-Win Focus:** Help all parties achieve core objectives

**Areas for Flexibility:**
- **Price vs. Repairs:** Can adjust either price or repair credits
- **Timing:** Flexible on closing date within reason
- **Terms:** Open to creative financing or contingency solutions
- **Non-Monetary Value:** Seller emotional needs and dignity

**Crisis Points to Introduce:**
- **Seller Disagreement:** Wife initially refuses repair credits
- **Appraisal Concern:** Appraiser questions value given market conditions
- **Inspection Drama:** More issues discovered during re-inspection
- **Timeline Pressure:** Mortgage rate lock expiring, relocation deadline

**Your Behavioral Patterns:**
- Start professional but reveal stress as complications arise
- Show flexibility when creative solutions are proposed
- Become advocate for reasonable compromise when sellers are unreasonable
- Demonstrate real estate expertise while managing difficult clients
- Work to save the deal when it seems to be falling apart`,

      teaching_notes: `**Learning Objectives:**
- Master complex multi-stakeholder negotiation management
- Navigate high-stakes emotional and financial decisions
- Integrate all negotiation skills: claiming, creating value, relationship management
- Manage information flow and coalition dynamics
- Handle crisis negotiation when deals nearly collapse

**Key Concepts Emphasized:**
- Advanced multi-party stakeholder management (40%)
- Integrated negotiation skills application (35%)
- Crisis negotiation and deal recovery (25%)

**Assessment Criteria:**

**Advanced Multi-Party Stakeholder Management (40% weight)**
- **Excellent (90-100 points):** Masterfully managed all stakeholders, built effective coalitions, adapted approach perfectly
- **Good (80-89 points):** Effectively handled most stakeholders, good adaptation and management
- **Average (70-79 points):** Basic stakeholder management, some adaptation
- **Poor (Below 70):** Failed to recognize or manage stakeholder complexity

**Integrated Negotiation Skills Application (35% weight)**
- **Excellent:** Seamlessly integrated claiming value, creating value, and relationship management
- **Good:** Demonstrated competency across all skill areas with good integration
- **Average:** Basic competency in multiple areas, limited integration
- **Poor:** Focused on single skill area, failed to integrate approaches

**Crisis Negotiation and Deal Recovery (25% weight)**
- **Excellent:** Masterfully handled crises, found creative solutions, kept deal together
- **Good:** Effectively managed most complications, good problem-solving
- **Average:** Adequate crisis management, basic problem-solving
- **Poor:** Failed to handle complications, deal fell apart or poor outcomes

**Common Learning Challenges:**
- Overwhelming complexity of multiple stakeholders and interests
- Difficulty maintaining strategic perspective under emotional pressure
- Poor information management leading to coalition problems
- Inability to handle crisis points and near-deal collapse
- Failing to integrate all negotiation skills under high stakes

**Duration:** 30-40 minutes
**Complexity:** Multi-party, high-stakes, emotionally charged negotiation with potential crisis points

**Program Completion Recognition:**
Students who successfully complete this scenario have demonstrated mastery-level negotiation competency suitable for senior executive roles and complex business situations.`
    });

  console.log('Successfully updated all 5 priority scenarios with complete content and updated difficulty levels.');
};