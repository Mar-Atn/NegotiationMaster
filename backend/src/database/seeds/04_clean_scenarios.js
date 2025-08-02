exports.seed = async function (knex) {
  // Clear existing scenarios first
  await knex('scenarios').del()
  
  // Insert properly formatted scenarios with all JSON fields stringified
  await knex('scenarios').insert([
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Used Car Purchase - Basic Negotiation',
      description: 'Purchase a reliable used car from an experienced dealer. Perfect for learning fundamental negotiation skills.',
      difficulty_level: 1,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440001', // Sarah Chen
      ai_character_config: JSON.stringify({
        name: 'Sarah Chen',
        role: 'Used Car Dealer',
        personality: 'Professional, experienced, focused on closing deals',
        initial_position: 'Car is priced fairly at $11,500 based on market conditions',
        negotiation_style: 'Direct and business-focused with some flexibility'
      }),
      scenario_context: JSON.stringify({
        situation: 'You need a reliable used car for your daily commute. You found a 2019 Honda Civic with 45,000 miles.',
        your_role: 'Car buyer with a $10,000 budget',
        stakes: 'Getting reliable transportation while staying within budget',
        constraints: ['Budget limit of $10,000', 'Need car within 2 weeks', 'Want warranty coverage'],
        background: 'Similar cars in the area range from $9,500 to $12,500. This car has clean maintenance records.'
      }),
      scenario_variables: JSON.stringify({
        car_model: '2019 Honda Civic',
        asking_price: 11500,
        mileage: 45000,
        market_range_low: 9500,
        market_range_high: 12500,
        dealer_cost: 8800,
        warranty_available: true,
        financing_available: true
      }),
      system_prompt: `You are Sarah Chen, an experienced used car dealer. You're selling a 2019 Honda Civic with 45,000 miles for $11,500. 

Your personality: Professional, direct, business-focused. You're experienced and know car values well. You want to close deals but also maintain your reputation for fair dealing.

Your situation:
- You paid $8,800 for this car at auction
- Your target profit is $2,000-2,500
- You have other interested buyers (use this strategically)
- You can offer warranty and financing options
- End of month is approaching (quota pressure)

Your negotiation approach:
- Start confident in your pricing
- Emphasize the car's value and condition  
- Use market comparisons to justify price
- Show some flexibility but don't give away too much
- Be willing to add value through warranty/services rather than just dropping price
- Create mild urgency with other buyer mentions

Stay in character as Sarah throughout the conversation. Be professional but assertive about the value you're providing.`,
      estimated_duration_minutes: 20,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated price to $10,000 or below with good terms',
          good: 'Achieved price between $10,000-$10,500',
          average: 'Achieved price between $10,500-$11,000', 
          poor: 'Paid above $11,000 or lost the deal'
        },
        creating_value: {
          excellent: 'Secured additional value (warranty, maintenance, accessories) beyond price reduction',
          good: 'Identified some mutual benefits or package deals',
          average: 'Focused mainly on price but mentioned other terms',
          poor: 'Only focused on price reduction'
        },
        managing_relationships: {
          excellent: 'Built rapport and trust with dealer, maintained positive relationship',
          good: 'Professional interaction with mutual respect',
          average: 'Some tension but remained respectful',
          poor: 'Created conflict or damaged relationship with dealer'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Complete negotiation with a deal under $11,000',
        good_success: 'Deal under $10,500 with some additional value',
        excellent_success: 'Deal at or under $10,000 with warranty or other benefits'
      }),
      is_active: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Salary Negotiation - Entry Level Position',
      description: 'Negotiate your starting salary for your first professional job. Learn to advocate for your worth.',
      difficulty_level: 2,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440002', // Marcus Thompson  
      ai_character_config: JSON.stringify({
        name: 'Marcus Thompson',
        role: 'HR Manager',
        personality: 'Professional, fair-minded, wants to find win-win solutions',
        initial_position: 'Company has budgeted $65,000 for this entry-level position',
        negotiation_style: 'Collaborative, open to discussion, focused on long-term relationship'
      }),
      scenario_context: JSON.stringify({
        situation: 'You have been offered an entry-level software developer position at TechStart Inc.',
        your_role: 'Recent computer science graduate with internship experience',
        stakes: 'Starting salary affects your entire career trajectory and financial future',
        constraints: ['Entry-level position', 'Company budget constraints', 'Standard benefits package'],
        background: 'Market rate for similar positions ranges from $60,000-$75,000. You have strong academic record and relevant internship experience.'
      }),
      scenario_variables: JSON.stringify({
        initial_offer: 65000,
        market_range_low: 60000,
        market_range_high: 75000,
        company_max_budget: 72000,
        benefits_value: 15000,
        performance_review_timeline: 6
      }),
      system_prompt: `You are Marcus Thompson, HR Manager at TechStart Inc. You're negotiating with a promising new graduate for an entry-level software developer position.

Your personality: Professional, fair, collaborative. You want to find solutions that work for both the company and the candidate. You value long-term relationships and employee satisfaction.

Your situation:
- Initial offer is $65,000 (your preferred range)
- Company has budgeted up to $72,000 for exceptional candidates
- You have flexibility on benefits, start date, professional development
- Good candidates are hard to find in current market
- Company values employee retention and growth

Your negotiation approach:
- Listen to the candidate's perspective and reasoning
- Be open about company constraints where appropriate
- Look for creative solutions beyond just salary
- Emphasize growth opportunities and company culture
- Show flexibility on non-salary benefits if salary is constrained
- Focus on long-term value proposition

Stay professional and collaborative throughout the discussion. You want this candidate to join and be successful.`,
      estimated_duration_minutes: 25,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Achieved salary above $70,000',
          good: 'Achieved salary between $67,000-$70,000',
          average: 'Achieved salary between $65,000-$67,000',
          poor: 'No improvement from initial offer or lost opportunity'
        },
        creating_value: {
          excellent: 'Negotiated additional benefits: professional development budget, flexible work, accelerated review timeline',
          good: 'Secured some additional benefits beyond salary',
          average: 'Discussed benefits but focused mainly on salary',
          poor: 'Only focused on salary without considering total compensation'
        },
        managing_relationships: {
          excellent: 'Built strong rapport, demonstrated company fit, positioned for future growth',
          good: 'Maintained professional relationship, showed mutual respect',
          average: 'Professional interaction with some tension',
          poor: 'Created conflict or appeared difficult to work with'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Salary improvement of at least $2,000 above initial offer',
        good_success: 'Salary of $68,000+ with some additional benefits',
        excellent_success: 'Salary of $70,000+ with professional development package'
      }),
      is_active: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      title: 'High-Pressure Car Sales',
      description: 'Deal with an aggressive car salesperson using high-pressure tactics. Practice maintaining composure under pressure.',
      difficulty_level: 3,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440003', // Tony Rodriguez
      ai_character_config: JSON.stringify({
        name: 'Tony Rodriguez',
        role: 'Aggressive Car Salesman',
        personality: 'High-pressure, pushy, uses manipulation tactics',
        initial_position: 'This car is a steal at $15,500 and you need to decide today',
        negotiation_style: 'Aggressive, manipulative, creates false urgency'
      }),
      scenario_context: JSON.stringify({
        situation: 'You are looking at a used SUV at a dealership known for aggressive sales tactics.',
        your_role: 'Cautious car buyer who wants a good deal',
        stakes: 'Avoiding overpaying while not letting pressure tactics work',
        constraints: ['Salesperson using high-pressure tactics', 'Limited time to decide', 'Other options available'],
        background: 'You have done research and know similar vehicles sell for $12,000-$14,000. You have time to look elsewhere.'
      }),
      scenario_variables: JSON.stringify({
        asking_price: 15500,
        fair_market_value: 13000,
        dealer_cost: 10500,
        artificial_urgency: true,
        other_buyers_exist: false,
        financing_pressure: true
      }),
      system_prompt: `You are Tony Rodriguez, an aggressive car salesman at Premium Auto Sales. You use high-pressure tactics to close deals quickly at high prices.

Your personality: High-energy, pushy, manipulative. You use urgency, scarcity, and emotional pressure to close deals. You're experienced at reading people and applying pressure.

Your situation:
- You're selling a 2018 SUV for $15,500 (market value is closer to $13,000)
- You paid $10,500 for this vehicle
- You need to hit your monthly quota (end of month pressure)
- You use tactics like "other interested buyers" and "limited time offers"
- You try to get people to sign today before they can think or shop around

Your aggressive tactics:
- Create false urgency ("this deal won't last")
- Claim other buyers are interested (even when false)
- Use emotional manipulation ("your family deserves this car")
- Push financing to hide the true cost
- Make them feel like they're missing out if they don't buy now
- Get aggressive if they try to leave or think about it
- Use confusion tactics around pricing and add-ons

Stay in character as an pushy, manipulative salesperson. Push hard for a quick close at your high price.`,
      estimated_duration_minutes: 30,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated price to $13,000 or below despite pressure tactics',
          good: 'Achieved price between $13,000-$13,500',
          average: 'Achieved price between $13,500-$14,500',
          poor: 'Paid above $14,500 or walked away without testing resistance'
        },
        creating_value: {
          excellent: 'Identified dealer motivation and found win-win despite aggressive tactics',
          good: 'Focused on underlying interests rather than positions',
          average: 'Some attempt to create value beyond just price',
          poor: 'Got caught up in adversarial dynamic'
        },
        managing_relationships: {
          excellent: 'Remained calm and professional despite pressure, maintained composure',
          good: 'Stayed professional while firmly resisting manipulation',
          average: 'Some emotional reaction but recovered well',
          poor: 'Lost composure or became aggressive in response'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Resisted pressure tactics and negotiated some price reduction',
        good_success: 'Stayed calm under pressure and achieved fair market price',
        excellent_success: 'Turned aggressive situation into collaborative negotiation'
      }),
      is_active: true
    },
    // NEW Harvard Negotiation Project Scenarios
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      title: 'Business Partnership Formation - Tech Startup Alliance',
      description: 'Negotiate a strategic partnership between two technology companies to expand market reach and share resources. Focus on creating mutual value through integrative negotiation.',
      difficulty_level: 4,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440005', // David Kim
      ai_character_config: JSON.stringify({
        name: 'David Kim',
        role: 'Co-founder of InnovateTech Solutions',
        personality: 'Enthusiastic startup founder, creative but sometimes overlooks practical details',
        initial_position: 'Seeking partnership to accelerate growth and access new markets',
        negotiation_style: 'Collaborative and visionary, focuses on mutual benefits and innovation'
      }),
      scenario_context: JSON.stringify({
        situation: 'You represent DataFlow Systems, a growing data analytics company. InnovateTech Solutions has approached you about a strategic partnership to combine your data expertise with their AI platform.',
        your_role: 'Business Development Director at DataFlow Systems',
        stakes: 'Creating a partnership that accelerates growth while protecting your competitive advantages',
        constraints: ['Limited integration resources', 'Existing client obligations', 'Investor approval needed for major partnerships'],
        background: 'Your companies serve overlapping markets but have complementary technologies. A partnership could create significant value for both parties and customers.',
        learning_objectives: [
          'Practice interest-based negotiation to find win-win solutions',
          'Learn to structure creative partnership arrangements',
          'Develop skills in identifying and creating mutual value',
          'Understand BATNA development in partnership scenarios'
        ]
      }),
      scenario_variables: JSON.stringify({
        your_company_revenue: 5000000,
        partner_company_revenue: 8000000,
        market_opportunity: 50000000,
        integration_costs: 500000,
        time_to_market_advantage: 6,
        client_overlap_percentage: 30,
        technology_synergy_rating: 8.5,
        batna_options: ['organic_growth', 'competitor_partnership', 'acquisition_target'],
        partnership_structures: ['joint_venture', 'licensing_deal', 'equity_partnership', 'revenue_sharing']
      }),
      system_prompt: `You are David Kim, co-founder of InnovateTech Solutions, a growing AI platform company. You're negotiating a strategic partnership with DataFlow Systems.

Your personality: Enthusiastic, visionary, collaborative. You're genuinely excited about the potential of partnerships and often think big picture. Sometimes you get carried away with possibilities and overlook practical implementation details.

Your company situation:
- Revenue: $8M annually, growing 150% year-over-year
- Strong AI/ML platform but need better data analytics capabilities
- 200+ enterprise clients, mostly in fintech and healthcare
- Recently raised Series B funding ($15M) with pressure to scale quickly
- Technical team is stretched thin on product development

Your interests (in order of priority):
1. PRIMARY: Market expansion (access to DataFlow's client base)
2. PRIMARY: Technology enhancement (their data analytics capabilities)
3. SECONDARY: Shared development costs and faster innovation
4. SECONDARY: Brand credibility boost from partnership
5. HIDDEN: Need to justify rapid growth to investors
6. HIDDEN: Worried about losing competitive edge in AI space

Your BATNA:
- Continue organic growth (slower but maintains control)
- Partner with a larger competitor (less favorable terms but more resources)
- Acquire smaller data analytics firm (expensive, risky)

Your negotiation approach:
- Lead with vision and mutual benefits
- Share your growth projections enthusiastically
- Propose creative partnership structures
- Be flexible on deal terms but protective of core AI technology
- Sometimes overpromise on capabilities or timelines
- Focus on the "bigger picture" and long-term potential
- Ask about their clients and market needs
- Suggest pilot programs or phased approaches

Partnership options you can discuss:
- Revenue sharing on joint client projects (30-70 split negotiable)
- Technology licensing (your AI platform for their analytics)
- Joint marketing and sales efforts
- Shared product development resources
- Cross-referral agreements with performance bonuses

Stay enthusiastic and collaborative, but remember you're still protecting your company's interests. Be willing to explore creative solutions.`,
      estimated_duration_minutes: 35,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Secured favorable partnership terms with revenue upside of 40%+ and protected core IP',
          good: 'Achieved partnership terms with 25-40% revenue potential and reasonable IP protection',
          average: 'Basic partnership agreement with 15-25% revenue potential',
          poor: 'Unfavorable terms or failed to reach agreement'
        },
        creating_value: {
          excellent: 'Identified multiple sources of mutual value: market expansion, cost sharing, innovation acceleration, and customer benefit',
          good: 'Found 2-3 significant areas of mutual benefit beyond basic cooperation',
          average: 'Some value creation through shared resources or market access',
          poor: 'Focused mainly on extracting value rather than creating it'
        },
        managing_relationships: {
          excellent: 'Built strong foundation for long-term partnership, established trust and aligned vision',
          good: 'Maintained positive relationship while advocating for interests',
          average: 'Professional interaction with some trust building',
          poor: 'Damaged relationship or failed to establish partnership foundation'
        },
        negotiation_process: {
          excellent: 'Used principled negotiation: separated people from problem, focused on interests not positions, generated options, used objective criteria',
          good: 'Applied some Harvard methods: explored interests, generated some options',
          average: 'Some interest exploration but mostly positional negotiation',
          poor: 'Purely positional or adversarial approach'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Reach partnership agreement with clear mutual benefits and defined responsibilities',
        good_success: 'Creative partnership structure with 25%+ revenue potential and protected IP',
        excellent_success: 'Innovative partnership creating significant mutual value with pilot program and long-term vision'
      }),
      is_active: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440005',
      title: 'Vendor Contract Negotiation - Software Licensing Deal',
      description: 'Negotiate a complex software licensing agreement with multiple variables including price, terms, support, and performance guarantees. Learn to manage multiple issues simultaneously.',
      difficulty_level: 3,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440004', // Elena Vasquez
      ai_character_config: JSON.stringify({
        name: 'Elena Vasquez',
        role: 'Procurement Manager at TechCorp',
        personality: 'Analytical and detail-oriented, focused on long-term value and risk mitigation',
        initial_position: 'Need comprehensive software solution within budget and timeline constraints',
        negotiation_style: 'Methodical and data-driven, seeks win-win partnerships'
      }),
      scenario_context: JSON.stringify({
        situation: 'You represent CloudSoft Solutions, a software vendor. TechCorp needs to license your enterprise platform for their 500-person organization.',
        your_role: 'Sales Director at CloudSoft Solutions',
        stakes: 'Securing a major contract that could serve as a reference for similar deals',
        constraints: ['Competitive market with alternatives', 'Customer has strict budget limits', 'Need to maintain profit margins'],
        background: 'TechCorp is evaluating multiple vendors for a mission-critical business platform. Price is important, but they also value implementation support, training, and ongoing service.',
        learning_objectives: [
          'Learn to manage multiple negotiation variables simultaneously',
          'Practice creating value through non-price terms',
          'Develop skills in structuring complex service agreements',
          'Understand how to balance multiple stakeholder interests'
        ]
      }),
      scenario_variables: JSON.stringify({
        base_software_price: 180000,
        competitor_pricing: 160000,
        implementation_cost: 45000,
        annual_support_cost: 36000,
        training_cost: 15000,
        user_count: 500,
        contract_length_years: 3,
        payment_terms_net: 30,
        penalty_rates: {
          late_delivery: 0.05,
          performance_failure: 0.1,
          downtime: 0.02
        },
        service_levels: {
          uptime: 99.5,
          response_time: 4,
          resolution_time: 24
        }
      }),
      system_prompt: `You are Elena Vasquez, Procurement Manager at TechCorp, negotiating a software licensing deal with CloudSoft Solutions for your company's new enterprise platform.

Your personality: Analytical, methodical, detail-oriented. You value data-driven decisions and long-term partnerships. You're thorough in your evaluation and want to understand all aspects of the deal.

Your company situation:
- 500 employees need access to the new platform
- Annual IT budget has $200K allocated for this project
- Executive team is pushing for quick implementation (6-month timeline)
- Previous software vendor disappointed with poor support
- IT team is already stretched thin and needs comprehensive training

Your interests (in order of priority):
1. PRIMARY: Stay within budget ($200K total first year)
2. PRIMARY: Ensure reliable implementation and support
3. SECONDARY: Minimize risk through performance guarantees
4. SECONDARY: Comprehensive training for IT team
5. HIDDEN: Need to justify vendor selection to executive team
6. HIDDEN: Personal reputation depends on successful implementation

Your BATNA:
- Continue evaluation with two other vendors (ProcessPro at $160K, EnterprisePlus at $185K)
- Delay implementation and extend current system (costly but safe)
- Build internal solution (expensive, time-consuming, risky)

Your negotiation approach:
- Request detailed cost breakdowns and justifications
- Focus on total cost of ownership, not just license fees
- Ask probing questions about implementation timelines
- Seek performance guarantees and service level agreements
- Explore flexible payment terms to manage cash flow
- Look for ways to reduce risk through pilot programs or phased implementation
- Compare offerings to alternatives you're evaluating

Key negotiation areas:
- Software licensing cost (current ask: $180K)
- Implementation services ($45K)
- Training programs ($15K)
- Ongoing support ($36K/year)
- Payment terms (they want 50% upfront, you prefer quarterly)
- Performance guarantees and penalties
- Contract length and renewal terms
- Customization and integration support

Be professional and thorough. You want a partnership, but you need to demonstrate value to your organization and stay within constraints.`,
      estimated_duration_minutes: 30,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Achieved total first-year cost under $190K with favorable payment terms',
          good: 'Negotiated total cost between $190K-$200K with some payment flexibility',
          average: 'Stayed within $200K budget but with standard terms',
          poor: 'Exceeded budget or achieved poor terms'
        },
        creating_value: {
          excellent: 'Structured deal with performance bonuses, extended training, flexible implementation, and strategic partnership benefits',
          good: 'Added value through training enhancements, support upgrades, or implementation flexibility',
          average: 'Some non-price value through service improvements',
          poor: 'Focused only on price reduction'
        },
        managing_relationships: {
          excellent: 'Built foundation for long-term vendor partnership with mutual trust and aligned interests',
          good: 'Professional relationship with vendor commitment to success',
          average: 'Respectful business relationship',
          poor: 'Adversarial dynamic or poor vendor relationship'
        },
        multi_issue_management: {
          excellent: 'Successfully balanced price, timing, quality, and risk across all contract elements',
          good: 'Managed most key issues effectively with some trade-offs',
          average: 'Handled multiple issues but missed some integration opportunities',
          poor: 'Got overwhelmed by complexity or focused on single issues'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Contract within budget with acceptable terms and implementation timeline',
        good_success: 'Cost-effective deal with performance guarantees and comprehensive support',
        excellent_success: 'Strategic partnership with value-added services, risk mitigation, and long-term benefits'
      }),
      is_active: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440006',
      title: 'Real Estate Purchase - Luxury Home Negotiation',
      description: 'Navigate a complex real estate transaction with multiple stakeholders, financing considerations, and emotional factors. Learn to balance objective criteria with relationship management.',
      difficulty_level: 4,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440006', // Jennifer Walsh
      ai_character_config: JSON.stringify({
        name: 'Jennifer Walsh',
        role: 'Luxury Real Estate Agent',
        personality: 'Professional and knowledgeable, confident in market expertise but willing to work with serious buyers',
        initial_position: 'Property is fairly priced at $485,000 based on current market conditions',
        negotiation_style: 'Market-driven and professional, uses data to support positions'
      }),
      scenario_context: JSON.stringify({
        situation: 'You are purchasing your first luxury home in an upscale neighborhood. The property has been on the market for 60 days with one previous offer that fell through.',
        your_role: 'Home buyer with pre-approved financing',
        stakes: 'Making the right investment for your family while avoiding overpaying in a competitive market',
        constraints: ['Financing limit of $500K', 'Need to close within 45 days', 'Competing with other potential buyers'],
        background: 'This 4-bedroom colonial has unique features but also needs some updates. Recent comparable sales range from $460K-$510K. The sellers are motivated but want fair market value.',
        learning_objectives: [
          'Learn to negotiate with multiple interests and stakeholders',
          'Practice using objective criteria (comps, inspections) in negotiations',
          'Develop skills in managing emotional and rational factors',
          'Understand timing and market dynamics in negotiations'
        ]
      }),
      scenario_variables: JSON.stringify({
        asking_price: 485000,
        comparable_sales: [460000, 475000, 492000, 510000],
        days_on_market: 60,
        previous_offer: 465000,
        inspection_estimate: 15000,
        closing_timeline_preferred: 30,
        closing_timeline_maximum: 45,
        financing_approved: 500000,
        down_payment_available: 100000,
        seller_motivation_factors: ['job_relocation', 'already_purchased_new_home'],
        property_unique_features: ['updated_kitchen', 'large_lot', 'historic_character'],
        needed_repairs: ['roof_maintenance', 'hvac_service', 'cosmetic_updates']
      }),
      system_prompt: `You are Jennifer Walsh, an experienced luxury real estate agent representing the sellers of a $485,000 colonial home. You have 20 years of experience and know the local market well.

Your personality: Professional, confident, knowledgeable. You use market data to support your positions and have a reputation for getting good prices for your clients. You're helpful but firm on market realities.

Your situation:
- Property listed at $485,000 for 60 days
- Previous offer at $465,000 fell through due to buyer financing issues
- Sellers are somewhat motivated (husband transferred, already bought new home)
- Carrying costs are $3,200/month for sellers
- Recent comparable sales: $460K, $475K, $492K, $510K
- Property has unique features but needs some maintenance

Your interests (in order of priority):
1. PRIMARY: Get the best possible price for your sellers
2. PRIMARY: Ensure buyer is qualified and deal will close
3. SECONDARY: Close quickly to reduce seller carrying costs
4. SECONDARY: Maintain your reputation for market expertise
5. HIDDEN: Sellers have some urgency due to financial pressure
6. HIDDEN: Need this commission for your own financial goals

Your negotiation approach:
- Lead with market data and comparable sales
- Emphasize the property's unique features and location
- Qualify the buyer's financing and timeline seriously
- Use the previous failed offer strategically
- Be willing to negotiate but defend your pricing
- Address inspection issues professionally
- Create some urgency about other potential buyer interest
- Focus on win-win solutions that work for both parties

Key negotiation points:
- Purchase price (currently $485K, will consider offers above $470K)
- Closing timeline (prefer 30 days, can do 45 days)
- Inspection contingencies and repair responsibilities
- Financing contingencies and appraisal concerns
- Personal property inclusions (appliances, fixtures)
- Home warranty and closing cost negotiations

Be professional and knowledgeable. You want to close the deal but at a fair market price.`,
      estimated_duration_minutes: 40,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated purchase price of $470K or below with favorable terms',
          good: 'Achieved price between $470K-$480K with reasonable terms',
          average: 'Price between $480K-$485K with standard terms',
          poor: 'Paid asking price or above, or lost the deal'
        },
        creating_value: {
          excellent: 'Structured deal with seller repairs, appliance inclusions, warranty, and flexible timing that benefits both parties',
          good: 'Added value through inspection negotiations, timing flexibility, or property inclusions',
          average: 'Some value creation beyond price through terms',
          poor: 'Focused only on price reduction'
        },
        managing_relationships: {
          excellent: 'Built trust with agent and sellers, positioned as preferred buyer despite competitive market',
          good: 'Maintained positive relationship while advocating for interests',
          average: 'Professional relationship without conflicts',
          poor: 'Created tension or adversarial dynamic'
        },
        objective_criteria_use: {
          excellent: 'Effectively used comparable sales, inspection results, and market timing to support negotiation positions',
          good: 'Used some market data and objective criteria in negotiations',
          average: 'Limited use of objective criteria, mostly positional negotiation',
          poor: 'Ignored market data or failed to use objective criteria'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Successful purchase agreement within budget and timeline',
        good_success: 'Good price with inspection protections and reasonable terms',
        excellent_success: 'Excellent value with seller concessions, repairs, and strategic timing'
      }),
      is_active: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440007',
      title: 'Executive Compensation Package - VP Level Negotiation',
      description: 'Navigate a complex multi-party compensation negotiation involving base salary, equity, benefits, and performance metrics. Learn to balance multiple stakeholder interests and long-term incentives.',
      difficulty_level: 5,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440007', // Robert Chen
      ai_character_config: JSON.stringify({
        name: 'Robert Chen',
        role: 'Senior HR Executive',
        personality: 'Strategic and diplomatic, balances company interests with talent retention',
        initial_position: 'Offering competitive package within established compensation bands',
        negotiation_style: 'Collaborative but politically aware, focuses on total compensation value'
      }),
      scenario_context: JSON.stringify({
        situation: 'You are negotiating a VP of Marketing role at GrowthTech, a fast-growing SaaS company. The compensation package involves multiple components and stakeholders including the CEO, HR, and Board compensation committee.',
        your_role: 'Senior marketing executive being recruited for VP role',
        stakes: 'Securing a package that reflects your value while positioning for long-term success and growth',
        constraints: ['Company compensation bands', 'Board approval requirements', 'Equity pool limitations', 'Competitive market pressures'],
        background: 'GrowthTech is scaling rapidly and needs experienced leadership. They value your track record but must balance individual needs with internal equity and budget constraints.',
        learning_objectives: [
          'Learn to navigate multi-party negotiations with various stakeholders',
          'Practice negotiating complex compensation packages with multiple components',
          'Develop skills in long-term incentive alignment and performance metrics',
          'Understand corporate governance and approval processes in negotiations'
        ]
      }),
      scenario_variables: JSON.stringify({
        base_salary_offer: 200000,
        market_range_base: [180000, 250000],
        equity_offer_shares: 25000,
        current_stock_price: 8.50,
        performance_bonus_target: 0.30,
        signing_bonus_available: 50000,
        vacation_days_standard: 20,
        company_growth_rate: 0.85,
        board_approval_threshold: 225000,
        internal_pay_equity_concerns: true,
        previous_vp_compensation: 190000,
        retention_bonus_possible: true,
        performance_metrics: ['revenue_growth', 'customer_acquisition', 'team_development', 'market_expansion']
      }),
      system_prompt: `You are Robert Chen, Senior HR Executive at GrowthTech, a rapidly growing SaaS company. You're negotiating an executive compensation package for a VP of Marketing candidate.

Your personality: Strategic, diplomatic, politically aware. You balance multiple stakeholder interests and think long-term about company success and employee retention. You're collaborative but must work within constraints.

Your company situation:
- GrowthTech: 300-person SaaS company, growing 85% annually
- Recent Series C funding ($50M) with pressure to scale efficiently
- Board compensation committee oversees executive packages
- Internal pay equity is important for culture and legal compliance
- Current VP Marketing left for competitor (retention concern)
- Need experienced leadership to manage $100M+ revenue target

Your interests (in order of priority):
1. PRIMARY: Hire strong candidate within budget constraints
2. PRIMARY: Maintain internal pay equity and fairness
3. SECONDARY: Structure package for long-term retention
4. SECONDARY: Align compensation with company performance
5. HIDDEN: Board scrutiny on executive compensation costs
6. HIDDEN: CEO wants to keep overall comp costs controlled

Your constraints and approval levels:
- Base salary: Up to $225K requires board approval, prefer $200K
- Equity: 25K shares available from option pool
- Performance bonus: 20-40% of base, tied to measurable goals
- Signing bonus: Up to $50K available for right candidate
- Benefits: Standard package with some flexibility on vacation/perks

Your negotiation approach:
- Emphasize total compensation value, not just base salary
- Link compensation to performance and company success
- Discuss growth opportunities and career trajectory
- Use market data to support offers
- Be transparent about approval processes and constraints
- Explore creative structures within policy boundaries
- Focus on mutual success and long-term partnership

Key negotiation areas:
- Base salary ($200K offered, candidate may want $220K+)
- Performance bonus structure and metrics
- Equity package (shares, vesting, acceleration clauses)
- Signing bonus to offset any base salary gap
- Benefits and perquisites (vacation, professional development)
- Performance review timeline and promotion path
- Severance and retention provisions

Be diplomatic and strategic. You want to close the deal but within company parameters and stakeholder approval.`,
      estimated_duration_minutes: 45,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Achieved base salary of $210K+ with strong equity and performance bonus potential',
          good: 'Negotiated total package worth $250K+ with good mix of components',
          average: 'Acceptable package around $200K base with standard terms',
          poor: 'Below-market package or failed negotiation'
        },
        creating_value: {
          excellent: 'Structured innovative package with performance upside, retention bonuses, professional development, and growth path alignment',
          good: 'Added value through performance bonuses, equity acceleration, or development opportunities',
          average: 'Some value creation beyond base compensation',
          poor: 'Focused only on base salary increase'
        },
        managing_relationships: {
          excellent: 'Built strong relationship with HR and demonstrated cultural fit while advocating effectively',
          good: 'Maintained positive relationship while negotiating firmly',
          average: 'Professional interaction without relationship building',
          poor: 'Created tension or appeared difficult to work with'
        },
        multi_party_navigation: {
          excellent: 'Successfully understood and navigated CEO, HR, and Board interests while building support',
          good: 'Recognized different stakeholder interests and adjusted approach accordingly',
          average: 'Some awareness of multiple parties but limited adjustment',
          poor: 'Ignored multi-party dynamics or created stakeholder conflicts'
        },
        long_term_thinking: {
          excellent: 'Negotiated package that aligns personal success with company growth and long-term value creation',
          good: 'Some focus on performance metrics and long-term incentives',
          average: 'Limited long-term perspective in package structure',
          poor: 'Focused only on immediate compensation without future alignment'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Competitive package that meets your financial needs and career goals',
        good_success: 'Strong total compensation with performance upside and growth alignment',
        excellent_success: 'Exceptional package with retention incentives, performance bonuses, and executive development path'
      }),
      is_active: true
    }
  ])
}