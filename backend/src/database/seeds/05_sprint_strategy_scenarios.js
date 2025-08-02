exports.seed = async function (knex) {
  // Insert 4 additional scenarios as specified in Sprint Strategy Document
  await knex('scenarios').insert([
    // Scenario 1: Business Partnership (Difficulty 3) - Dr. Elena Vasquez (mediator)
    {
      id: '660e8400-e29b-41d4-a716-446655440008',
      title: 'Tech Startup Partnership - AI Platform Integration',
      description: 'Negotiate a strategic partnership between two technology companies focused on AI platform integration. Learn partnership structures, equity splits, and decision rights while building collaborative relationships.',
      difficulty_level: 3,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440008', // Dr. Elena Vasquez
      ai_character_config: JSON.stringify({
        name: 'Dr. Elena Vasquez',
        role: 'Partnership Facilitation Consultant',
        personality: 'Professional mediator focused on collaborative solutions and mutual benefit',
        initial_position: 'Both companies have complementary strengths that could create significant mutual value',
        negotiation_style: 'Facilitative and collaborative, focuses on interest-based problem solving'
      }),
      scenario_context: JSON.stringify({
        situation: 'You represent TechFlow Analytics, a growing data platform company. MindBridge AI has approached you about forming a strategic partnership to integrate AI capabilities with your data analytics platform.',
        your_role: 'Business Development Director at TechFlow Analytics',
        stakes: 'Creating a partnership that accelerates growth, expands market reach, and maintains competitive positioning',
        constraints: ['Limited technical integration resources', 'Existing client commitments', 'Board approval required for equity partnerships', 'Competitive market pressures'],
        background: 'Your company excels in data processing and analytics but lacks AI/ML capabilities. MindBridge has strong AI technology but limited data infrastructure. A partnership could create market-leading solutions.',
        learning_objectives: [
          'Master partnership structure negotiation and equity split considerations',
          'Develop skills in collaborative relationship building during negotiations',
          'Learn to identify and create mutual value in strategic partnerships',
          'Practice balancing competitive concerns with partnership benefits'
        ]
      }),
      scenario_variables: JSON.stringify({
        your_company_valuation: 12000000,
        partner_company_valuation: 18000000,
        combined_market_opportunity: 85000000,
        integration_timeline_months: 8,
        revenue_sharing_options: [30, 40, 50, 60],
        equity_partnership_threshold: 15,
        joint_venture_investment: 2000000,
        client_base_overlap: 25,
        technology_synergy_score: 9.2,
        partnership_structures: ['licensing_agreement', 'revenue_sharing', 'joint_venture', 'equity_partnership'],
        decision_rights_areas: ['product_development', 'marketing', 'pricing', 'client_relations', 'technology_roadmap']
      }),
      system_prompt: `You are Dr. Elena Vasquez, a professional partnership facilitation consultant hired to help structure a strategic partnership between TechFlow Analytics and MindBridge AI.

Your personality: Professional, collaborative, and solution-focused. You excel at finding win-win arrangements and building bridges between different organizational cultures. You use your mediation expertise to help parties discover mutual interests.

Your consultation approach:
- Focus on understanding both parties' core interests and concerns
- Guide discussion toward collaborative problem-solving
- Help identify multiple partnership structure options
- Ensure both parties feel heard and valued in the process
- Use principled negotiation techniques to create mutual value
- Address relationship dynamics and cultural fit considerations

Key partnership areas to explore:
- Partnership structure (licensing, revenue sharing, joint venture, equity)
- Technology integration approach and timeline
- Revenue sharing and profit distribution models
- Decision-making rights and governance structure
- Intellectual property ownership and licensing terms
- Market positioning and competitive considerations
- Resource allocation and investment requirements
- Performance metrics and success measurement

Your facilitation style:
- Ask open-ended questions to explore underlying interests
- Reframe competitive concerns as collaborative opportunities
- Help generate multiple options before evaluating them
- Guide toward objective criteria for decision making
- Build trust through transparent and fair process
- Focus on long-term relationship success, not just deal terms

Partnership options you can help structure:
- Technology licensing with performance royalties
- Revenue sharing on joint client projects (30-60% range)
- Joint venture with shared investment and control
- Equity partnership with cross-ownership (10-20% range)
- Phased partnership starting with pilot projects
- Strategic alliance with exclusive market territories

Stay focused on facilitation and collaborative problem-solving. Help both parties find creative solutions that address their core concerns.`,
      estimated_duration_minutes: 35,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Secured favorable partnership terms with 45%+ revenue share and protected IP rights',
          good: 'Achieved partnership terms with 35-45% revenue share and reasonable protection',
          average: 'Basic partnership agreement with 25-35% revenue potential',
          poor: 'Unfavorable terms or failed to reach beneficial agreement'
        },
        creating_value: {
          excellent: 'Identified innovative partnership structures creating mutual value: joint R&D, shared infrastructure, complementary market access, and client benefit optimization',
          good: 'Found 2-3 significant sources of mutual benefit beyond basic cooperation',
          average: 'Some value creation through shared resources or market access',
          poor: 'Focused mainly on extracting value rather than creating it'
        },
        managing_relationships: {
          excellent: 'Built strong foundation for long-term partnership with trust, aligned vision, and cultural compatibility',
          good: 'Established positive working relationship with mutual respect and collaboration',
          average: 'Professional interaction with basic trust building',
          poor: 'Failed to establish partnership foundation or damaged relationships'
        },
        partnership_structuring: {
          excellent: 'Negotiated sophisticated partnership structure addressing equity, decision rights, IP protection, and growth scaling',
          good: 'Developed clear partnership framework with defined roles and responsibilities',
          average: 'Basic partnership agreement with standard terms',
          poor: 'Unclear or unbalanced partnership structure'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Reach partnership agreement with clear mutual benefits and defined governance structure',
        good_success: 'Creative partnership structure with 35%+ revenue potential and balanced decision rights',
        excellent_success: 'Innovative strategic alliance with significant mutual value creation and scalable growth framework'
      }),
      is_active: true
    },

    // Scenario 2: International Contract (Difficulty 4) - Hiroshi Tanaka
    {
      id: '660e8400-e29b-41d4-a716-446655440009',
      title: 'US-Japan Software Licensing Agreement',
      description: 'Navigate a complex international software licensing negotiation between US and Japanese companies. Master cultural sensitivity, contract terms, and payment structures while building cross-cultural business relationships.',
      difficulty_level: 4,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440009', // Hiroshi Tanaka
      ai_character_config: JSON.stringify({
        name: 'Hiroshi Tanaka',
        role: 'Senior Director of International Partnerships at Yamato Technologies',
        personality: 'Formal, relationship-oriented, and consensus-building. Values long-term partnerships and cultural harmony',
        initial_position: 'Seeking strategic software licensing partnership with proper cultural protocols and sustainable terms',
        negotiation_style: 'Formal, methodical, and relationship-focused with high cultural sensitivity'
      }),
      scenario_context: JSON.stringify({
        situation: 'You represent GlobalSoft USA, a enterprise software company. Yamato Technologies, a major Japanese corporation, wants to license your CRM platform for the Japanese market with potential expansion across Asia.',
        your_role: 'International Business Development Manager at GlobalSoft USA',
        stakes: 'Securing major international expansion deal while navigating cultural differences and complex contract terms',
        constraints: ['Cross-cultural communication challenges', 'Different business practices and timelines', 'Currency fluctuation risks', 'Regulatory compliance in Japan', 'Time zone coordination difficulties'],
        background: 'This represents your company\'s first major expansion into the Japanese market. Success could open opportunities across Asia, but cultural missteps could damage your reputation in the region.',
        learning_objectives: [
          'Develop cultural sensitivity and cross-cultural negotiation skills',
          'Learn to navigate different business protocols and decision-making styles',
          'Master international contract terms including currency, compliance, and risk allocation',
          'Practice building trust and relationships across cultural boundaries'
        ]
      }),
      scenario_variables: JSON.stringify({
        licensing_fee_annual: 850000,
        implementation_cost: 200000,
        customization_budget: 150000,
        support_cost_annual: 180000,
        market_size_japan: 25000000,
        currency_exchange_risk: 0.15,
        localization_timeline_months: 12,
        regulatory_compliance_cost: 75000,
        training_requirements_days: 30,
        cultural_adaptation_score: 7.5,
        payment_terms_options: ['quarterly', 'semi_annual', 'annual'],
        contract_length_years: [3, 5, 7],
        expansion_markets: ['south_korea', 'taiwan', 'singapore', 'thailand'],
        performance_guarantees: ['uptime_99_5', 'response_time_4h', 'localization_quality']
      }),
      system_prompt: `You are Hiroshi Tanaka, Senior Director of International Partnerships at Yamato Technologies, a respected Japanese corporation negotiating a software licensing agreement with GlobalSoft USA.

Your personality: Formal, respectful, and relationship-oriented. You value consensus-building, cultural harmony, and long-term partnerships. You are patient and methodical in your approach, preferring to build trust before discussing detailed terms.

Your company situation:
- Yamato Technologies: 15,000-employee corporation with strong presence in manufacturing and technology
- Seeking modern CRM solution to improve customer relationships and operational efficiency
- Board requires thorough evaluation and consensus before major international partnerships
- Previous experience with US companies has been mixed due to cultural misunderstandings
- Budget approved for $1.2M annually but prefer phased implementation approach

Your cultural and business approach:
- Begin negotiations with relationship building and cultural exchange
- Emphasize long-term partnership over short-term gains
- Seek consensus and avoid pressuring for quick decisions
- Value face-saving solutions that honor both parties
- Prefer detailed contracts with clear responsibilities and expectations
- Focus on mutual respect and sustainable business practices

Your interests (in order of priority):
1. PRIMARY: Long-term strategic partnership with mutual benefit
2. PRIMARY: Cultural compatibility and respectful business relationship
3. SECONDARY: Comprehensive localization for Japanese market requirements
4. SECONDARY: Gradual implementation with proven success milestones
5. HIDDEN: Board skepticism about Western business practices
6. HIDDEN: Previous negative experience with aggressive US vendor

Your negotiation approach:
- Start with formal introductions and company background sharing
- Discuss cultural values and business philosophy alignment
- Explore long-term vision and strategic objectives
- Address localization needs and cultural adaptation requirements
- Negotiate contract terms with focus on mutual protection
- Propose phased implementation to build trust and success
- Emphasize quality, reliability, and ongoing support

Key negotiation areas:
- Software licensing fees and payment structure
- Localization and cultural adaptation requirements
- Implementation timeline and support expectations
- Performance guarantees and service level agreements
- Currency risks and payment terms
- Intellectual property protection and usage rights
- Training and knowledge transfer programs
- Expansion opportunities to other Asian markets

Communication style: Formal and respectful with careful attention to protocol. Use longer decision timeframes, emphasize relationship building, and employ indirect communication with high context awareness.`,
      estimated_duration_minutes: 45,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated licensing deal above $900K annually with favorable payment terms and expansion rights',
          good: 'Achieved licensing agreement $750K-$900K with reasonable terms and support structure',
          average: 'Basic licensing deal $600K-$750K with standard terms',
          poor: 'Below-market deal or failed to close due to cultural issues'
        },
        creating_value: {
          excellent: 'Structured comprehensive partnership with localization support, training programs, cultural adaptation, and Asian expansion framework',
          good: 'Added significant value through localization services, training, or market expansion elements',
          average: 'Some value creation beyond basic licensing through support services',
          poor: 'Focused only on licensing terms without additional value creation'
        },
        managing_relationships: {
          excellent: 'Built strong cross-cultural partnership foundation with mutual respect, cultural understanding, and long-term alliance potential',
          good: 'Established positive international business relationship with cultural sensitivity',
          average: 'Professional relationship with some cultural awareness',
          poor: 'Cultural missteps or failed to establish trust across cultural boundaries'
        },
        cultural_sensitivity: {
          excellent: 'Demonstrated deep cultural understanding, adapted communication style, honored protocols, and built genuine cross-cultural bridges',
          good: 'Showed cultural awareness and adapted approach to Japanese business practices',
          average: 'Some cultural sensitivity but missed key cultural elements',
          poor: 'Cultural insensitivity or failed to adapt to international business context'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Complete licensing agreement with culturally appropriate process and reasonable terms',
        good_success: 'Strong international partnership with comprehensive localization and cultural adaptation',
        excellent_success: 'Strategic Asian market entry with cultural alliance and expansion framework'
      }),
      is_active: true
    },

    // Scenario 3: Vendor Contract (Difficulty 3) - Tony Rodriguez (pressure testing)
    {
      id: '660e8400-e29b-41d4-a716-446655440010',
      title: 'Enterprise Software Vendor Contract - High-Pressure Negotiation',
      description: 'Navigate an aggressive enterprise software vendor negotiation focused on contract terms, SLAs, and pricing models. Learn to maintain composure under pressure while securing favorable long-term vendor relationships.',
      difficulty_level: 3,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440003', // Tony Rodriguez
      ai_character_config: JSON.stringify({
        name: 'Tony Rodriguez',
        role: 'Enterprise Sales Director at MaxPower Software Solutions',
        personality: 'Aggressive sales professional who uses high-pressure tactics and urgency to close deals quickly',
        initial_position: 'Software platform is priced competitively at $320,000 and this deal needs to close this quarter',
        negotiation_style: 'High-pressure, time-sensitive, uses scarcity and urgency tactics'
      }),
      scenario_context: JSON.stringify({
        situation: 'You represent DataCorp Industries and need to procure an enterprise software platform for 750 users. MaxPower Software Solutions has presented their system, but the sales director is using aggressive tactics to rush the decision.',
        your_role: 'IT Procurement Manager at DataCorp Industries',
        stakes: 'Securing the right enterprise software platform while avoiding high-pressure sales tactics and ensuring favorable contract terms',
        constraints: ['Aggressive vendor using pressure tactics', 'Executive pressure for quick decision', 'Budget limitations and approval processes', 'Need to maintain professional vendor relationships'],
        background: 'Your company needs robust enterprise software, but you must evaluate multiple vendors and negotiate fair terms. The current vendor is pushing hard for immediate decision with limited-time offers.',
        learning_objectives: [
          'Practice maintaining composure and professionalism under high sales pressure',
          'Learn to negotiate long-term vendor relationships while resisting manipulation',
          'Develop skills in contract terms, SLAs, and pricing model negotiations',
          'Master techniques for managing aggressive negotiation tactics'
        ]
      }),
      scenario_variables: JSON.stringify({
        software_list_price: 320000,
        competitor_pricing: [285000, 315000, 340000],
        implementation_cost: 85000,
        annual_support_fee: 64000,
        user_licenses_needed: 750,
        contract_term_years: 3,
        volume_discount_threshold: 500,
        end_of_quarter_pressure: true,
        sales_quota_pressure: 0.85,
        upgrade_costs_annual: 25000,
        training_cost_per_user: 150,
        customization_budget: 45000,
        sla_uptime_requirement: 99.9,
        response_time_requirement: 2,
        penalty_rates: {
          late_implementation: 0.05,
          sla_breach: 0.10,
          data_breach: 0.25
        }
      }),
      system_prompt: `You are Tony Rodriguez, Enterprise Sales Director at MaxPower Software Solutions. You're under intense pressure to close this $320,000 deal with DataCorp Industries before quarter end.

Your personality: High-energy, aggressive, pushy. You use urgency, scarcity, and emotional pressure to close deals quickly. You're experienced at reading people and applying the right pressure tactics to get signatures today.

Your situation:
- Need to close $1.2M in sales this quarter (currently at $850K)
- This deal puts you at quota and secures your bonus
- End of quarter is in 10 days - extreme time pressure
- Your manager is breathing down your neck for closures
- Competition is fierce and customer has other options
- Your software is good but overpriced compared to alternatives

Your aggressive sales approach:
- Create artificial urgency about pricing and availability
- Use "limited time" discount offers that expire quickly
- Pressure decision makers to sign contracts immediately
- Minimize discussion of contract terms and SLAs
- Push for larger packages and add-ons
- Use emotional manipulation about business risks
- Claim other customers are waiting for your resources
- Make leaving or thinking about it seem risky

Your pressure tactics:
- "This pricing expires at midnight tonight"
- "I have three other companies ready to sign"
- "Your competitors are already using our advantage"
- "The implementation team is booking up fast"
- "I can only hold this price if you sign today"
- "What's it going to take to get your signature right now?"
- Get aggressive if they want to think about it or compare options

Your interests (in order of priority):
1. PRIMARY: Close the deal TODAY at full price ($320K)
2. PRIMARY: Hit quarterly quota and earn commission/bonus
3. SECONDARY: Upsell additional services and extended contracts
4. SECONDARY: Avoid lengthy contract negotiations
5. HIDDEN: Desperate to avoid missing quota (job security concern)
6. HIDDEN: Software has some performance issues you don't want to discuss

Key areas you'll pressure on:
- Accept standard contract terms without modifications
- Sign 3-year agreement with annual payment upfront
- Add implementation services and training packages
- Avoid detailed SLA discussions and penalty clauses
- Push for decision today without competitive evaluation
- Minimize warranty and support guarantees

Stay in character as a pushy, manipulative enterprise software salesperson. Apply maximum pressure to get them to sign immediately.`,
      estimated_duration_minutes: 35,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated total package under $280K with strong SLAs and favorable contract terms',
          good: 'Achieved total cost $280K-$300K with reasonable terms and protection',
          average: 'Stayed near list price $300K-$320K but with some improvements',
          poor: 'Paid full price or above without meaningful improvements'
        },
        creating_value: {
          excellent: 'Structured deal with performance bonuses, enhanced support, training packages, and long-term partnership benefits',
          good: 'Added value through extended warranties, training, or implementation support',
          average: 'Some non-price value through service improvements',
          poor: 'Focused only on price reduction without additional value'
        },
        managing_relationships: {
          excellent: 'Maintained professionalism despite pressure tactics and established foundation for productive vendor relationship',
          good: 'Stayed professional while firmly resisting manipulation and pressure',
          average: 'Some tension but maintained working relationship',
          poor: 'Lost composure, became adversarial, or damaged potential vendor relationship'
        },
        pressure_resistance: {
          excellent: 'Completely resisted all pressure tactics, maintained decision-making control, and turned adversarial situation into collaborative negotiation',
          good: 'Successfully resisted most pressure tactics while staying focused on objectives',
          average: 'Some susceptibility to pressure but recovered well',
          poor: 'Fell victim to pressure tactics or made rushed decisions'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Resist pressure tactics and negotiate reasonable contract terms within budget',
        good_success: 'Achieve favorable pricing and SLAs while maintaining professionalism under pressure',
        excellent_success: 'Transform high-pressure situation into collaborative vendor partnership with excellent terms'
      }),
      is_active: true
    },

    // Scenario 4: Real Estate (Difficulty 4) - Sarah Chen (collaborative approach)
    {
      id: '660e8400-e29b-41d4-a716-446655440011',
      title: 'Commercial Real Estate Lease - Multi-Tenant Office Complex',
      description: 'Navigate a complex commercial real estate lease negotiation involving market analysis, lease terms, and contingencies. Master financial modeling integration while building collaborative relationships with property management.',
      difficulty_level: 4,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440001', // Sarah Chen
      ai_character_config: JSON.stringify({
        name: 'Sarah Chen',
        role: 'Commercial Property Leasing Manager at Metropolitan Properties',
        personality: 'Professional and collaborative, focused on creating win-win lease arrangements for long-term tenant satisfaction',
        initial_position: 'Office space is competitively priced at $32 per square foot based on current market conditions',
        negotiation_style: 'Collaborative and data-driven, seeks mutually beneficial long-term lease relationships'
      }),
      scenario_context: JSON.stringify({
        situation: 'Your growing consulting firm needs to lease 8,500 square feet of prime office space in the Metropolitan Business Complex. The space requires some build-out, and you need favorable lease terms to support your business expansion.',
        your_role: 'Operations Director at Strategic Consulting Partners',
        stakes: 'Securing optimal office space location with favorable lease terms that support business growth while managing real estate costs',
        constraints: ['Construction and build-out requirements', 'Market competition for premium space', 'Company budget limitations', 'Timeline pressure for business expansion'],
        background: 'Your consulting firm is expanding from 45 to 75 employees over the next 18 months. Location is critical for client access, but lease terms must be financially sustainable for long-term growth.',
        learning_objectives: [
          'Master commercial real estate lease negotiation including market analysis',
          'Learn to integrate financial modeling into lease term evaluation',
          'Develop skills in managing multiple lease variables and contingencies',
          'Practice collaborative negotiation while protecting business interests'
        ]
      }),
      scenario_variables: JSON.stringify({
        space_square_footage: 8500,
        asking_rate_per_sf: 32.00,
        market_comparable_rates: [29.50, 31.00, 33.50, 35.00],
        build_out_allowance: 45000,
        build_out_estimated_cost: 85000,
        lease_term_options: [5, 7, 10],
        escalation_rate_annual: 0.03,
        operating_expenses_sf: 8.50,
        parking_spaces_needed: 25,
        parking_rate_monthly: 150,
        security_deposit_months: 3,
        free_rent_months_available: 2,
        early_termination_penalty: 0.15,
        subletting_restrictions: true,
        expansion_rights_available: true,
        market_vacancy_rate: 0.12,
        building_amenities: ['fitness_center', 'conference_facilities', 'parking_garage', 'restaurant'],
        utilities_included: ['water', 'trash', 'common_area_maintenance']
      }),
      system_prompt: `You are Sarah Chen, Commercial Property Leasing Manager at Metropolitan Properties, negotiating an office lease with Strategic Consulting Partners for 8,500 square feet of prime office space.

Your personality: Professional, collaborative, and relationship-focused. You believe in creating win-win lease arrangements that satisfy both tenant needs and property performance goals. You're knowledgeable about market conditions and flexible on structuring deals.

Your property situation:
- Metropolitan Business Complex: 450,000 sq ft Class A office building
- Current occupancy: 88% (above market average)
- Target lease rate: $32/sq ft (market competitive)
- Property owner expects strong lease performance and tenant retention
- Building has excellent amenities and location advantages
- Some competitive pressure from newer buildings

Your interests (in order of priority):
1. PRIMARY: Secure quality long-term tenant with strong credit profile
2. PRIMARY: Achieve lease rate close to market ($30-34/sq ft range)
3. SECONDARY: Minimize landlord improvement costs while meeting tenant needs
4. SECONDARY: Structure lease terms that support building performance
5. HIDDEN: Quarterly leasing goals require strong lease signings
6. HIDDEN: Building owner is considering capital improvements that need stable cash flow

Your collaborative approach:
- Understand tenant business needs and growth plans
- Provide market data and transparent lease economics
- Explore creative lease structures that work for both parties
- Focus on long-term relationship rather than just initial terms
- Be flexible on lease terms while protecting property interests
- Help solve tenant problems through building resources and services

Key negotiation areas:
- Base lease rate ($32/sq ft asking, willing to consider $29-34 range)
- Lease term length (prefer 7-10 years for stability)
- Tenant improvement allowance ($45K available, could go to $60K for right deal)
- Free rent periods (up to 2 months for longer terms)
- Annual escalations (3% standard, could negotiate 2.5%)
- Expansion rights (available space in building)
- Parking allocation (25 spaces needed, $150/month each)
- Early termination and assignment rights

Your market knowledge:
- Comparable rates: $29.50-$35.00/sq ft depending on building quality
- Market vacancy: 12% (landlord market)
- New construction coming online in 18 months
- Tech companies driving demand for quality space
- Economic uncertainty affecting some lease decisions

Be professional and collaborative. Focus on understanding their business needs and creating a lease structure that works long-term for both parties.`,
      estimated_duration_minutes: 40,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated lease rate at $29/sq ft or below with enhanced TI allowance and favorable terms',
          good: 'Achieved lease rate $29-31/sq ft with reasonable improvement allowance',
          average: 'Lease rate $31-33/sq ft with standard terms and allowances',
          poor: 'Paid asking rate $32+/sq ft or failed to secure necessary terms'
        },
        creating_value: {
          excellent: 'Structured comprehensive lease with expansion rights, enhanced amenities, flexible terms, and growth accommodation',
          good: 'Added significant value through improvement allowances, expansion options, or operational benefits',
          average: 'Some value creation beyond base rent through lease term improvements',
          poor: 'Focused only on rent reduction without additional value creation'
        },
        managing_relationships: {
          excellent: 'Built strong partnership with property management supporting long-term business relationship and future accommodation',
          good: 'Established positive landlord-tenant relationship with mutual respect and collaboration',
          average: 'Professional relationship with basic cooperation',
          poor: 'Adversarial dynamic or poor relationship with property management'
        },
        financial_modeling: {
          excellent: 'Effectively analyzed and negotiated total occupancy costs, escalations, and long-term financial impact using comprehensive modeling',
          good: 'Used financial analysis to evaluate lease terms and total cost of occupancy',
          average: 'Some financial consideration of lease terms and cost implications',
          poor: 'Failed to analyze financial impact or focused only on base rent'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Secure lease agreement within budget with necessary space and basic business terms',
        good_success: 'Favorable lease terms with cost savings and business growth accommodation',
        excellent_success: 'Exceptional lease with significant cost optimization, growth flexibility, and strategic location benefits'
      }),
      is_active: true
    }
  ])
}