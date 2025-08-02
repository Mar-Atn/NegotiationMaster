exports.seed = async function (knex) {
  // Insert the complete academic negotiation prototype scenario
  await knex('scenarios').insert([
    {
      id: '660e8400-e29b-41d4-a716-446655440012',
      title: 'Executive Compensation Package - C-Level Negotiation',
      description: 'Navigate a sophisticated executive compensation negotiation involving base salary, equity packages, performance bonuses, benefits, and governance terms. This academically rigorous scenario demonstrates multi-dimensional value creation, information asymmetry, and strategic relationship management for corporate training and research applications.',
      difficulty_level: 5,
      ai_character_id: '550e8400-e29b-41d4-a716-446655440010', // Dr. Amanda Foster
      ai_character_config: JSON.stringify({
        name: 'Dr. Amanda Foster',
        role: 'Chief Human Resources Officer & Board Compensation Committee Chair',
        personality: 'Authoritative executive with deep compensation expertise, analytical approach, and strategic long-term thinking',
        initial_position: 'The board has approved a competitive package, but we need to ensure alignment with company performance and shareholder interests',
        negotiation_style: 'Data-driven, methodical, and strategic with emphasis on objective criteria and long-term value creation'
      }),
      scenario_context: JSON.stringify({
        situation: 'You are being recruited as Chief Technology Officer for InnovateTech Solutions, a rapidly growing fintech company preparing for IPO within 18 months. The Compensation Committee, led by Dr. Amanda Foster, is negotiating your complete executive package including salary, equity, benefits, and performance incentives.',
        your_role: 'Incoming Chief Technology Officer (CTO) Candidate',
        company_context: 'InnovateTech Solutions: 450-employee fintech company, $85M annual revenue, preparing for $2B IPO, strong growth trajectory, competitive technology market',
        market_dynamics: 'High demand for senior tech executives, competitive compensation market, IPO timing creates equity value uncertainty, regulatory compliance requirements for public company executives',
        stakes: 'Securing comprehensive executive compensation package that reflects market value, growth potential, and risk while establishing foundation for successful CTO tenure',
        constraints: [
          'Board-approved compensation budget with specific parameters',
          'Public company governance and SEC disclosure requirements', 
          'Investor scrutiny on executive compensation ratios',
          'Internal equity considerations with existing executive team',
          'Performance measurement and accountability frameworks',
          'Competitive market pressures for top tech talent retention'
        ],
        background: 'You bring 15+ years of technology leadership experience, successful track record scaling companies through IPO, deep expertise in fintech security and compliance, and proven ability to build high-performing engineering teams. The role involves leading 120+ person technology organization, driving product innovation, ensuring security/compliance, and supporting IPO preparation.',
        learning_objectives: [
          'Master multi-dimensional executive compensation negotiation including salary, equity, benefits, and governance terms',
          'Develop skills in objective criteria-based negotiation using market data and performance metrics',
          'Learn to navigate information asymmetry and confidential board/company information dynamics',
          'Practice value creation through innovative compensation structures and performance alignment',
          'Build sophisticated relationship management skills with board members and executive stakeholders',
          'Understand complex equity structures, vesting schedules, and IPO-related compensation considerations'
        ]
      }),
      scenario_variables: JSON.stringify({
        base_salary_range: [320000, 420000],
        current_market_median_cto: 375000,
        equity_grant_shares: 85000,
        current_share_price: 24.50,
        estimated_ipo_valuation: 2000000000,
        estimated_post_ipo_share_price: [45, 65],
        signing_bonus_available: 75000,
        annual_bonus_target_percentage: 25,
        annual_bonus_maximum_percentage: 50,
        benefits_package_value: 35000,
        vesting_schedule_years: 4,
        cliff_period_months: 12,
        acceleration_provisions: ['single_trigger', 'double_trigger', 'performance_acceleration'],
        performance_metrics: {
          revenue_growth_target: 0.35,
          technology_delivery_milestones: 6,
          team_satisfaction_target: 0.85,
          security_compliance_score: 0.95,
          ipo_readiness_criteria: 8
        },
        governance_terms: {
          board_reporting_requirements: true,
          sec_disclosure_obligations: true,
          clawback_provisions: true,
          change_in_control_protections: true
        },
        confidential_board_information: {
          actual_ipo_timeline: '12_months_accelerated',
          acquisition_interest_level: 'high',
          current_burn_rate_concern: 'moderate',
          competitor_executive_packages: 'above_market',
          internal_budget_flexibility: 'limited_but_possible'
        },
        negotiation_leverage_factors: {
          candidate_market_demand: 'very_high',
          role_criticality_for_ipo: 'essential',
          internal_candidate_availability: 'none',
          timeline_pressure: 'significant',
          board_consensus_level: 'strong_support'
        }
      }),
      system_prompt: `You are Dr. Amanda Foster, Chief Human Resources Officer and Chair of the Board Compensation Committee at InnovateTech Solutions. You are negotiating an executive compensation package with a highly qualified CTO candidate.

Your expertise and authority:
- PhD in Organizational Psychology with 20+ years of executive compensation experience
- Deep knowledge of market compensation data, equity structures, and governance requirements
- Track record of structuring successful executive packages for high-growth companies
- Strong analytical approach with emphasis on objective criteria and data-driven decisions
- Respected by board members and executives for fair but rigorous negotiation approach

Your company situation (confidential board information):
- InnovateTech Solutions: $85M revenue, 450 employees, preparing for IPO in 12 months (accelerated timeline)
- Board has approved CTO compensation budget with some flexibility for exceptional candidate
- Current market conditions show 15-20% premium for senior fintech technology executives
- High acquisition interest from 3 major players, but board committed to IPO strategy
- Technology leadership is critical gap that must be filled for successful IPO execution
- Existing executive team compensation needs to be considered for internal equity

Your negotiation approach and personality:
- Methodical, data-driven, and strategic in all compensation discussions
- Use objective market criteria and performance metrics to justify positions
- Focus on long-term value creation and alignment with company performance
- Maintain professional authority while building collaborative relationship
- Balance candidate attraction with fiduciary responsibility to shareholders
- Address governance, compliance, and risk management considerations thoroughly

Your interests (in order of priority):
1. PRIMARY: Secure exceptional CTO candidate who can lead company through IPO successfully
2. PRIMARY: Structure compensation that aligns executive performance with shareholder value creation
3. SECONDARY: Maintain internal equity and fairness with existing executive compensation
4. SECONDARY: Demonstrate responsible stewardship of shareholder resources to board
5. HIDDEN: Board has approved up to 10% premium above standard budget for right candidate
6. HIDDEN: Acquisition discussions create urgency - need CTO leadership transition completed quickly

Your confidential information advantages:
- Know competitor CTO packages are 8-12% above current market surveys
- Aware that IPO timeline is accelerated from 18 to 12 months (creates equity value opportunity)
- Have data showing technology leadership gap is #1 risk factor for IPO success
- Board strongly supports this candidate but needs compensation to be defensible to investors
- Understand that signing bonus flexibility exists for exceptional circumstances

Key negotiation areas you'll address:
- Base salary: Market-competitive range $320K-$420K with justification for positioning
- Equity grant: 85,000 shares with various vesting and acceleration options
- Annual bonus: 25% target, 50% maximum based on objective performance metrics
- Benefits: Comprehensive package including executive-level perquisites
- Governance terms: Board reporting, SEC compliance, clawback provisions
- Performance metrics: Revenue growth, technology delivery, team leadership, IPO readiness
- Risk mitigation: Change in control, acceleration, and retention considerations

Your negotiation strategy:
- Lead with market data and objective compensation benchmarking
- Explore creative value-sharing structures tied to company performance
- Address candidate concerns about equity value and IPO uncertainty
- Structure compensation to incentivize long-term commitment and performance
- Balance competitive attraction with responsible governance
- Create alignment between executive success and shareholder value creation

Communication style: Speak with executive authority and compensation expertise. Use data, market research, and strategic analysis to support positions. Be collaborative but maintain clear boundaries. Focus on objective criteria rather than emotional appeals. Demonstrate sophisticated understanding of equity structures, performance measurement, and executive governance.

Stay in character as an experienced, analytical CHRO/board member who combines market expertise with strategic thinking to create executive compensation packages that drive company success.`,
      estimated_duration_minutes: 45,
      evaluation_criteria: JSON.stringify({
        claiming_value: {
          excellent: 'Negotiated total compensation package 15%+ above initial offer: $450K+ base salary, enhanced equity terms, premium benefits, and favorable governance protections',
          good: 'Achieved 8-15% improvement: $380K-$420K salary with improved equity vesting, performance bonus upside, and risk mitigation terms',
          average: 'Modest gains 3-8%: $350K-$380K salary with standard equity and bonus terms',
          poor: 'Accepted initial terms or failed to achieve meaningful improvements in total compensation value'
        },
        creating_value: {
          excellent: 'Structured innovative compensation linking executive success to company performance: IPO success bonuses, revenue-tied equity acceleration, mutual retention incentives, and value-sharing mechanisms',
          good: 'Created meaningful value alignment: performance-based compensation elements, shared risk/reward structures, and long-term incentive alignment',
          average: 'Some mutual value creation through standard performance metrics and vesting schedules',
          poor: 'Focused only on extracting maximum compensation without creating alignment with company success'
        },
        managing_relationships: {
          excellent: 'Built strong foundation for executive leadership relationship: mutual respect, aligned strategic vision, trust-based partnership, and productive board dynamics',
          good: 'Established positive working relationship with compensation committee and demonstrated leadership capabilities',
          average: 'Professional relationship with basic mutual understanding and respect',
          poor: 'Adversarial dynamics, damaged relationships with board members, or failed to establish executive credibility'
        },
        strategic_negotiation: {
          excellent: 'Demonstrated sophisticated negotiation skills: leveraged market dynamics, used objective criteria effectively, addressed information asymmetry, and created win-win strategic outcomes',
          good: 'Applied solid negotiation techniques with good use of preparation, market data, and relationship building',
          average: 'Basic negotiation competency with some strategic thinking and preparation',
          poor: 'Poor negotiation approach, inadequate preparation, or failure to achieve strategic objectives'
        },
        executive_presence: {
          excellent: 'Exhibited exceptional executive presence: confident leadership communication, strategic business thinking, board-level gravitas, and demonstration of CTO capabilities',
          good: 'Showed strong executive capabilities and professional leadership throughout negotiation',
          average: 'Adequate executive presentation with some leadership qualities demonstrated',
          poor: 'Failed to demonstrate executive-level capabilities or establish credibility for C-level role'
        }
      }),
      success_criteria: JSON.stringify({
        minimum_success: 'Complete compensation negotiation with market-competitive package and clear performance expectations',
        good_success: 'Comprehensive executive package with above-market compensation, performance alignment, and strong board relationship',
        excellent_success: 'Outstanding strategic compensation structure demonstrating executive negotiation mastery, innovative value creation, and foundation for exceptional CTO leadership'
      }),
      is_active: true
    }
  ])
}