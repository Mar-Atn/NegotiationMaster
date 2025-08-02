exports.seed = async function (knex) {
  // Clear existing scenarios first
  await knex('scenarios').del()
  
  // Insert updated scenarios with AI character integration
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
      ai_character_config: {
        name: 'Marcus Thompson',
        role: 'HR Manager',
        personality: 'Professional, fair-minded, wants to find win-win solutions',
        initial_position: 'Company has budgeted $65,000 for this entry-level position',
        negotiation_style: 'Collaborative, open to discussion, focused on long-term relationship'
      },
      scenario_context: {
        situation: 'You have been offered an entry-level software developer position at TechStart Inc.',
        your_role: 'Recent computer science graduate with internship experience',
        stakes: 'Starting salary affects your entire career trajectory and financial future',
        constraints: ['Entry-level position', 'Company budget constraints', 'Standard benefits package'],
        background: 'Market rate for similar positions ranges from $60,000-$75,000. You have strong academic record and relevant internship experience.'
      },
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
      evaluation_criteria: {
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
      },
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
      ai_character_config: {
        name: 'Tony Rodriguez',
        role: 'Aggressive Car Salesman',
        personality: 'High-pressure, pushy, uses manipulation tactics',
        initial_position: 'This car is a steal at $15,500 and you need to decide today',
        negotiation_style: 'Aggressive, manipulative, creates false urgency'
      },
      scenario_context: {
        situation: 'You are looking at a used SUV at a dealership known for aggressive sales tactics.',
        your_role: 'Cautious car buyer who wants a good deal',
        stakes: 'Avoiding overpaying while not letting pressure tactics work',
        constraints: ['Salesperson using high-pressure tactics', 'Limited time to decide', 'Other options available'],
        background: 'You have done research and know similar vehicles sell for $12,000-$14,000. You have time to look elsewhere.'
      },
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
      evaluation_criteria: {
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
      },
      success_criteria: JSON.stringify({
        minimum_success: 'Resisted pressure tactics and negotiated some price reduction',
        good_success: 'Stayed calm under pressure and achieved fair market price',
        excellent_success: 'Turned aggressive situation into collaborative negotiation'
      }),
      is_active: true
    }
  ])
}