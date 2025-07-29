exports.seed = async function (knex) {
  await knex('scenarios').del()
  
  await knex('scenarios').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Salary Negotiation - Entry Level',
      description: 'Negotiate your starting salary for your first job out of college.',
      difficulty_level: 1,
      ai_character_config: {
        name: 'Sarah Chen',
        role: 'HR Manager',
        personality: 'Professional, somewhat rigid about budget constraints',
        initial_position: 'Company has a strict salary band for entry-level positions',
        negotiation_style: 'Conservative, focused on company policies'
      },
      scenario_context: {
        situation: 'You have been offered a position at TechStart Inc. The initial offer is $65,000.',
        your_role: 'Recent graduate with internship experience',
        stakes: 'Your starting salary will impact your career trajectory',
        constraints: ['Company budget limitations', 'Entry-level position', 'Standard benefits package'],
        background: 'Market rate for similar positions ranges from $60,000-$75,000'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Achieved salary above $70,000',
          good: 'Achieved salary between $67,000-$70,000',
          average: 'Achieved salary between $65,000-$67,000',
          poor: 'No improvement or lost the offer'
        },
        creating_value: {
          excellent: 'Identified creative compensation alternatives (flexible work, training budget, etc.)',
          good: 'Discussed some additional benefits beyond salary',
          average: 'Focused primarily on salary alone',
          poor: 'Made demands without considering company needs'
        },
        managing_relationships: {
          excellent: 'Built rapport, showed understanding of company constraints',
          good: 'Maintained professional tone throughout',
          average: 'Some tension but resolved professionally',
          poor: 'Created conflict or damaged relationship'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Vendor Contract Renewal',
      description: 'Renegotiate terms with a long-term software vendor facing budget pressures.',
      difficulty_level: 2,
      ai_character_config: {
        name: 'Michael Rodriguez',
        role: 'Account Manager',
        personality: 'Relationship-focused, concerned about losing the account',
        initial_position: 'Wants to maintain current pricing and terms',
        negotiation_style: 'Collaborative but defensive about price cuts'
      },
      scenario_context: {
        situation: 'Your company needs to reduce software costs by 20% across all vendors.',
        your_role: 'Procurement Manager',
        stakes: 'Budget mandate vs. maintaining vendor relationships',
        constraints: ['Company-wide cost reduction mandate', 'Existing contract has 6 months remaining', 'Switching costs are high'],
        background: 'This vendor has been reliable for 3 years, but costs have increased 15% annually'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Achieved 20%+ cost reduction',
          good: 'Achieved 15-20% cost reduction',
          average: 'Achieved 10-15% cost reduction',
          poor: 'Less than 10% reduction or no deal'
        },
        creating_value: {
          excellent: 'Found win-win solutions (longer terms, additional services, referrals)',
          good: 'Identified some mutual benefits',
          average: 'Basic discussion of alternatives',
          poor: 'Zero-sum approach only'
        },
        managing_relationships: {
          excellent: 'Strengthened long-term partnership',
          good: 'Maintained positive relationship',
          average: 'Some strain but relationship intact',
          poor: 'Damaged vendor relationship'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Partnership Equity Split',
      description: 'Negotiate equity distribution with co-founders of a new startup.',
      difficulty_level: 3,
      ai_character_config: {
        name: 'Alex Thompson',
        role: 'Co-founder & CTO',
        personality: 'Analytical, values technical contributions highly',
        initial_position: 'Believes technical skills deserve larger equity share',
        negotiation_style: 'Data-driven, can be stubborn about technical value'
      },
      scenario_context: {
        situation: 'Three co-founders need to agree on equity split before investor meetings.',
        your_role: 'Business-focused co-founder with industry connections',
        stakes: 'Equity split will affect control and financial returns for years',
        constraints: ['Investor meetings scheduled in 2 weeks', 'All three founders essential', 'Standard vesting schedules expected'],
        background: 'You bring business expertise and funding connections, Alex brings technical leadership, third founder brings domain expertise'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Secured fair equity reflecting your contributions (30-40%)',
          good: 'Achieved reasonable equity (25-30%)',
          average: 'Got basic equity but below your contribution (20-25%)',
          poor: 'Significantly undervalued or deal fell apart'
        },
        creating_value: {
          excellent: 'Structured creative vesting or performance-based adjustments',
          good: 'Addressed multiple contribution types and future roles',
          average: 'Basic equity split discussion',
          poor: 'Failed to consider long-term value creation'
        },
        managing_relationships: {
          excellent: 'Strengthened co-founder relationships and team dynamics',
          good: 'Maintained positive working relationships',
          average: 'Some tension but team still functional',
          poor: 'Created lasting conflicts among founders'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'International Joint Venture',
      description: 'Structure a complex joint venture between US and European companies.',
      difficulty_level: 4,
      ai_character_config: {
        name: 'Dr. Elisabeth Weber',
        role: 'Director of Strategic Partnerships',
        personality: 'Formal, detail-oriented, culturally cautious',
        initial_position: 'Prefers European legal framework and conservative terms',
        negotiation_style: 'Methodical, risk-averse, focused on compliance'
      },
      scenario_context: {
        situation: 'Your US tech company wants to enter European markets through a joint venture.',
        your_role: 'VP of Business Development',
        stakes: 'Success could double company revenue; failure could damage international reputation',
        constraints: ['Different legal systems', 'Currency exchange risks', 'Cultural differences', 'Regulatory compliance in both regions'],
        background: 'European partner has market access but needs your technology; you need their distribution network'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Secured favorable revenue sharing and control provisions',
          good: 'Balanced partnership with reasonable terms',
          average: 'Basic agreement with standard terms',
          poor: 'Unfavorable terms or failed negotiation'
        },
        creating_value: {
          excellent: 'Identified synergies beyond core business (R&D, talent exchange, etc.)',
          good: 'Structured mutually beneficial partnership terms',
          average: 'Standard joint venture structure',
          poor: 'Failed to maximize joint opportunities'
        },
        managing_relationships: {
          excellent: 'Built strong cross-cultural understanding and trust',
          good: 'Navigated cultural differences professionally',
          average: 'Some cultural friction but manageable',
          poor: 'Cultural misunderstandings damaged negotiations'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Crisis Acquisition Negotiation',
      description: 'Acquire a distressed competitor under time pressure with multiple bidders.',
      difficulty_level: 5,
      ai_character_config: {
        name: 'Robert Kim',
        role: 'Investment Banker representing seller',
        personality: 'Aggressive, time-pressured, plays bidders against each other',
        initial_position: 'Wants to maximize price despite company\'s problems',
        negotiation_style: 'High-pressure, deadline-focused, information-controlling'
      },
      scenario_context: {
        situation: 'Distressed competitor is for sale; acquisition could eliminate major rival or create integration nightmare.',
        your_role: 'M&A Director',
        stakes: 'Strategic opportunity vs. financial risk; competition from private equity firm',
        constraints: ['72-hour exclusive negotiation window', 'Limited due diligence time', 'Board approval required', 'Competing bidder with deeper pockets'],
        background: 'Target company has valuable IP and customer base but significant debt and operational issues'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Secured acquisition below market value with favorable terms',
          good: 'Fair price with good terms and conditions',
          average: 'Market price with standard terms',
          poor: 'Overpaid or lost to competitor'
        },
        creating_value: {
          excellent: 'Structured deal to maximize synergies and minimize risks',
          good: 'Identified key value drivers and protection mechanisms',
          average: 'Standard acquisition structure',
          poor: 'Failed to address integration challenges'
        },
        managing_relationships: {
          excellent: 'Maintained competitive advantage while building cooperation',
          good: 'Professional relationship despite high pressure',
          average: 'Survived the pressure with some strain',
          poor: 'Aggressive tactics backfired'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Labor Union Contract',
      description: 'Negotiate a new contract with the workers\' union during a potential strike.',
      difficulty_level: 6,
      ai_character_config: {
        name: 'Maria Santos',
        role: 'Union Representative',
        personality: 'Passionate advocate, distrusts management, under pressure from members',
        initial_position: 'Demanding significant wage increases and benefit improvements',
        negotiation_style: 'Emotional, principled, willing to escalate conflict'
      },
      scenario_context: {
        situation: 'Union contract expires in 2 weeks; workers threatening strike during peak season.',
        your_role: 'Chief Labor Relations Officer',
        stakes: 'Strike could cost millions daily; but excessive concessions could bankrupt company',
        constraints: ['Company financial constraints', 'Union member expectations', 'Peak season approaching', 'Media and public attention'],
        background: 'Previous negotiations were acrimonious; trust is low; economic pressures on both sides'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Avoided strike while controlling cost increases',
          good: 'Reasonable cost increases with no work stoppage',
          average: 'Higher costs but avoided major disruption',
          poor: 'Strike occurred or unsustainable cost increases'
        },
        creating_value: {
          excellent: 'Found innovative solutions benefiting both workers and company',
          good: 'Addressed multiple interests beyond just wages',
          average: 'Standard contract terms with limited creativity',
          poor: 'Failed to address underlying issues'
        },
        managing_relationships: {
          excellent: 'Rebuilt trust and improved long-term labor relations',
          good: 'Professional relationship maintained',
          average: 'Tensions remain but workable',
          poor: 'Relationship severely damaged'
        }
      }
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Multi-Party Government Contract',
      description: 'Lead consortium bid for major government infrastructure project with multiple stakeholders.',
      difficulty_level: 7,
      ai_character_config: {
        name: 'Director James Patterson',
        role: 'Government Procurement Director',
        personality: 'Bureaucratic, risk-averse, focused on compliance and public accountability',
        initial_position: 'Wants lowest cost with highest quality and strict compliance',
        negotiation_style: 'Process-focused, documentation-heavy, politically sensitive'
      },
      scenario_context: {
        situation: 'Leading a 4-company consortium bidding on $500M government infrastructure project.',
        your_role: 'Consortium Lead Negotiator',
        stakes: 'Largest contract in company history; sets precedent for future government work',
        constraints: ['Complex government regulations', 'Multiple consortium partners with different interests', 'Public scrutiny', 'Political sensitivities', 'Strict compliance requirements'],
        background: 'Government needs project completed on time and budget; your consortium offers best technical solution but higher cost than competitors'
      },
      evaluation_criteria: {
        claiming_value: {
          excellent: 'Won contract with favorable terms and pricing',
          good: 'Won contract with acceptable terms',
          average: 'Competitive bid but narrow margins',
          poor: 'Lost contract or unsustainable terms'
        },
        creating_value: {
          excellent: 'Created innovative public-private partnership benefiting all stakeholders',
          good: 'Structured deal addressing government and consortium needs',
          average: 'Standard contract structure',
          poor: 'Failed to address complex stakeholder interests'
        },
        managing_relationships: {
          excellent: 'Built strong government relationship and consortium unity',
          good: 'Maintained professional relationships with all parties',
          average: 'Some tensions but relationships intact',
          poor: 'Damaged relationships with key stakeholders'
        }
      }
    }
  ])
}