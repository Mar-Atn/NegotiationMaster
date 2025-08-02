/**
 * Example Prompt Templates for Different Negotiation Scenarios
 * 
 * Demonstrates the flexibility and sophistication of the AI prompt system
 * with ready-to-use templates for various business negotiation contexts.
 */

class PromptExamples {

  /**
   * Vendor Contract Negotiation Example
   */
  getVendorContractExample() {
    return {
      scenario: {
        title: "Enterprise Software License Negotiation",
        type: "vendor_negotiation",
        industry: "technology",
        keyIssues: ["pricing structure", "service level agreements", "implementation timeline", "contract duration"],
        counterpartProfile: "Senior sales director with pricing flexibility and service commitment authority",
        businessContext: "Annual contract renewal with potential for multi-year commitment"
      },
      sampleTranscript: `
        User: "Hi Sarah, thanks for meeting today. I wanted to discuss our upcoming contract renewal and see if we can find a structure that works better for both of us this year."

        Sarah: "Absolutely! I'm glad you reached out early. What aspects of the current agreement are you looking to adjust?"

        User: "Well, our usage has grown significantly - about 40% more users than last year. The current per-seat pricing is becoming quite expensive at our scale. I'm wondering if there might be volume discount options we could explore."

        Sarah: "That's great growth! Congratulations. We do have enterprise tiers that become more cost-effective at higher volumes. What kind of user count are we looking at for next year?"

        User: "We're projecting around 850 users by Q2. But I'm also concerned about the implementation support. Last year's rollout had some delays that cost us productivity. What kind of service level guarantees can you offer this time?"

        Sarah: "850 users definitely qualifies for our enterprise pricing. For implementation, we've actually restructured our professional services team. I can commit to a dedicated implementation manager and a 30-day go-live guarantee. If we miss that timeline, we'll provide additional consulting hours at no charge."

        User: "That sounds promising. What would the pricing look like at that volume? And I'd want to understand the penalties if service levels aren't met."

        Sarah: "At 850 seats, we could offer $45 per user per month, down from the current $65. For service levels, if we don't meet our 99.5% uptime commitment or miss implementation deadlines, you'd get 20% credit on that quarter's fees."

        User: "The pricing is moving in the right direction. However, given our growth trajectory and the risk we're taking on a larger commitment, I'd need to see pricing closer to $40 per user. Also, instead of quarterly credits, I'd prefer immediate make-good provisions - additional services or accelerated feature delivery."

        Sarah: "I appreciate your position. Let me think about how we could structure this... What if we did a two-year commitment at $42 per user, with built-in volume discounts if you exceed 1000 users? And for service recovery, we could offer priority feature requests or additional integration support rather than just credits."

        User: "That's creative thinking. The two-year commitment makes sense if we can build in some flexibility. What if we structured it as $42 for year one, $40 for year two, contingent on hitting the 1000 user milestone? And I like the service recovery approach - could we formalize that as a service level agreement?"
      `,
      expectedAnalysis: {
        claimingValue: {
          score: 78,
          strengths: ["Strong anchoring with specific volume pricing request", "Clear BATNA with growth projections", "Strategic concession patterns"],
          techniques: ["Volume-based anchoring", "Timeline pressure application", "Conditional concession strategy"]
        },
        creatingValue: {
          score: 82,
          strengths: ["Creative pricing structure proposal", "Alternative service recovery options", "Future growth planning"],
          techniques: ["Multi-year deal structuring", "Value trade-off identification", "Future opportunity creation"]
        },
        relationshipManagement: {
          score: 85,
          strengths: ["Professional tone throughout", "Acknowledged counterpart's constraints", "Collaborative problem-solving approach"],
          techniques: ["Active listening confirmation", "Empathy for service challenges", "Partnership framing"]
        }
      }
    }
  }

  /**
   * Partnership Agreement Example
   */
  getPartnershipAgreementExample() {
    return {
      scenario: {
        title: "Strategic Business Partnership Formation",
        type: "partnership_deal", 
        industry: "financial_services",
        keyIssues: ["revenue sharing", "technology integration", "market territories", "governance structure"],
        counterpartProfile: "Business development executive with partnership structuring experience",
        businessContext: "Creating joint offering for mid-market clients"
      },
      sampleTranscript: `
        User: "I'm excited about the potential for our firms to work together. Our clients have been asking for exactly the kind of integrated solution we could offer jointly."

        Partner: "The market timing seems perfect. Our research shows 73% of mid-market firms want unified financial and technology services. How do you envision structuring the revenue split?"

        User: "Before we get to economics, I'd like to understand how we'd serve clients together. What matters most to your team in terms of client experience and relationship ownership?"

        Partner: "That's a great starting point. We value being the primary relationship owner for existing clients, but we're open to shared ownership for new joint acquisitions. Our main concern is maintaining service quality standards."

        User: "I appreciate that - relationship continuity is crucial. What if we structured it so existing clients stay with their current primary contact, but all new joint clients have co-managed relationships? That way we both develop deeper client understanding."

        Partner: "That makes sense. For revenue sharing on joint clients, we typically see 60-40 splits based on who originates the relationship. But I'm more interested in how we can create additional value together rather than just splitting existing pie."

        User: "Exactly my thinking. What if we developed a new tier of service that neither of us offers alone? Something like integrated financial planning with real-time technology optimization? We could price that at a premium and split it 50-50 since it's truly collaborative."

        Partner: "Now that's interesting. We'd need to invest in some shared technology infrastructure, but the margin potential is significant. How would we handle the governance and decision-making for this joint offering?"

        User: "I'd suggest a steering committee with equal representation, but operational decisions stay with whoever has the expertise. For conflicts, maybe we could agree on an external advisor we both trust?"

        Partner: "That works. What about market territories? We have some overlap in the Northeast."

        User: "Rather than carving up geography, what if we focused on industry verticals? You're stronger in healthcare, we're stronger in manufacturing. For overlapping prospects, we could have a transparent lead-sharing protocol."
      `,
      expectedAnalysis: {
        claimingValue: {
          score: 72,
          strengths: ["Explored market research leverage", "Protected client relationship interests", "Structured governance advantages"],
          techniques: ["Information gathering on standards", "Client retention protection", "Decision-making leverage"]
        },
        creatingValue: {
          score: 88,
          strengths: ["Premium service tier creation", "Industry vertical specialization", "Shared infrastructure investment"],
          techniques: ["Joint value proposition development", "Complementary strength identification", "Future opportunity expansion"]
        },
        relationshipManagement: {
          score: 90,
          strengths: ["Partnership framing throughout", "Mutual benefit focus", "Collaborative conflict resolution"],
          techniques: ["Shared interest exploration", "Trust-building transparency", "Proactive conflict management"]
        }
      }
    }
  }

  /**
   * Salary Negotiation Example
   */
  getSalaryNegotiationExample() {
    return {
      scenario: {
        title: "Senior Manager Compensation Review",
        type: "salary_negotiation",
        industry: "technology",
        keyIssues: ["base salary increase", "bonus structure", "equity participation", "promotion timeline"],
        counterpartProfile: "HR director with compensation authority and budget constraints",
        businessContext: "Annual performance review with strong results and expanded responsibilities"
      },
      sampleTranscript: `
        User: "Thank you for scheduling this compensation discussion. I've really enjoyed the expanded role this year and wanted to discuss how my compensation might reflect these new responsibilities."

        Manager: "I'm glad you brought this up. Your performance has been excellent, especially leading the new product launch. What aspects of compensation are most important to you going forward?"

        User: "I appreciate that feedback. I've done some research on market rates for similar roles with my expanded scope. Based on industry benchmarks, I believe my base salary should be in the $145-155k range, up from my current $125k."

        Manager: "That's a significant increase. Help me understand how you're positioning this relative to your role evolution and market data."

        User: "Absolutely. This year I took on team leadership for 8 people plus the technical architecture for our core platform. According to CompTech salary survey, senior technical managers with my scope average $150k in our market. Plus, I've delivered $2.1M in measurable value through the efficiency improvements."

        Manager: "Those are strong results. Our budget process is challenging this year, but I want to find a way to recognize your contributions. What if we looked at total compensation, including bonus and equity?"

        User: "I'm definitely open to a comprehensive package. My priority is reaching market rate for total compensation. If we can't get to $150k base immediately, perhaps we could structure it as $140k base plus a guaranteed performance bonus that gets me to market rate?"

        Manager: "That's creative thinking. We do have more flexibility in variable compensation. What about $138k base, plus a $12k retention bonus, plus bringing your equity grant up to senior manager level?"

        User: "I appreciate the creative structuring. The retention bonus helps, but I'm concerned about the one-time nature. Could we convert that to an enhanced annual bonus target? Say $138k base plus 15% bonus target instead of my current 8%?"

        Manager: "That makes the numbers work long-term. And it ties your compensation growth to performance, which I can justify more easily. Let me also fast-track your promotion timeline - I think we can move you to Senior Manager level by Q2 instead of waiting until next year."

        User: "That sounds like a package that works for both of us. The promotion timeline acceleration is valuable beyond just the compensation. When could we formalize this arrangement?"
      `,
      expectedAnalysis: {
        claimingValue: {
          score: 85,
          strengths: ["Strong market research anchoring", "Quantified value delivery", "Strategic package structuring"],
          techniques: ["Benchmark-based anchoring", "Value proposition articulation", "Alternative structure negotiation"]
        },
        creatingValue: {
          score: 80,
          strengths: ["Creative bonus structuring", "Long-term incentive alignment", "Promotion timeline acceleration"],
          techniques: ["Total compensation framing", "Performance linkage creation", "Timeline value recognition"]
        },
        relationshipManagement: {
          score: 88,
          strengths: ["Collaborative problem-solving", "Budget constraint acknowledgment", "Mutual benefit framing"],
          techniques: ["Empathy for budget challenges", "Partnership approach", "Professional appreciation"]
        }
      }
    }
  }

  /**
   * Conflict Resolution Example
   */
  getConflictResolutionExample() {
    return {
      scenario: {
        title: "Interdepartmental Resource Allocation Dispute",
        type: "conflict_resolution",
        industry: "healthcare",
        keyIssues: ["budget allocation", "project priorities", "resource sharing", "timeline conflicts"],
        counterpartProfile: "Department head with competing priorities and resource constraints",
        businessContext: "Q4 budget planning with overlapping project needs"
      },
      sampleTranscript: `
        User: "Thanks for making time for this conversation. I know we're both under pressure with Q4 planning, and I'd like to find a way to resolve the resource allocation issue that works for both our departments."

        Colleague: "I appreciate you reaching out directly. This has been frustrating for my team - we planned the EHR upgrade based on the original budget allocation, and now we're hearing IT resources might be redirected."

        User: "I understand that frustration, and I want to acknowledge that the timing isn't ideal. Help me understand what's at risk if the EHR upgrade gets delayed, and what minimum resources you'd need to maintain progress."

        Colleague: "Patient safety is my primary concern. We're seeing more system crashes with the old version, and our compliance audit is in January. We need at least two senior developers for the next six weeks to hit our go-live date."

        User: "Patient safety absolutely has to be the priority - we're completely aligned there. My challenge is that we have the regulatory filing deadline that also can't move. What if we looked at this as a sequencing problem rather than a resource competition?"

        Colleague: "What do you mean by sequencing?"

        User: "Well, your EHR upgrade needs intensive development for six weeks, then moves to testing and training. Our regulatory project needs analysis and documentation first, then development. What if we front-loaded your development work, then shifted those resources to us for the final push?"

        Colleague: "That could work timing-wise, but what about the risk if either project hits delays? We can't afford to leave the EHR implementation half-finished."

        User: "Good point. What if we built in some protection? We could agree that EHR gets first priority for the next six weeks, and if it stays on schedule, the resources transition to regulatory work. If there are delays, we find alternative solutions for the regulatory project."

        Colleague: "I like that you're willing to take the back-end risk. But what alternative solutions would you have for regulatory if we run over?"

        User: "We could bring in contract developers or potentially negotiate a short extension with the regulatory body if we show progress. The key is that patient safety doesn't get compromised for a filing deadline."

        Colleague: "That's a fair approach. Could we also agree on some shared project checkpoints? If we see early warning signs of delays, we address them together rather than each protecting our own projects?"

        User: "Absolutely. Weekly joint status meetings for the next two months? And if either project hits roadblocks, we problem-solve together rather than competing for resources."
      `,
      expectedAnalysis: {
        claimingValue: {
          score: 70,
          strengths: ["Protected critical timeline", "Negotiated risk allocation", "Secured resource commitment"],
          techniques: ["Priority establishment", "Risk management negotiation", "Contingency planning"]
        },
        creatingValue: {
          score: 92,
          strengths: ["Resource sequencing solution", "Joint problem-solving protocol", "Shared risk management"],
          techniques: ["Creative scheduling solution", "Collaborative governance structure", "Mutual support system"]
        },
        relationshipManagement: {
          score: 95,
          strengths: ["Empathy for colleague's pressure", "Patient safety prioritization", "Trust-building transparency"],
          techniques: ["Active listening to concerns", "Shared value acknowledgment", "Collaborative conflict resolution"]
        }
      }
    }
  }

  /**
   * Multi-Party Negotiation Example
   */
  getMultiPartyExample() {
    return {
      scenario: {
        title: "Joint Venture Formation - Three Company Alliance",
        type: "multi_party",
        industry: "manufacturing",
        keyIssues: ["ownership structure", "technology sharing", "market territories", "governance rights"],
        counterpartProfile: "Two business development executives representing different competitive advantages",
        businessContext: "Creating joint venture to enter new international market"
      },
      sampleTranscript: `
        User: "I want to thank both of you for coming together on this opportunity. The Asian market entry requires capabilities that none of us have alone, but together we could be formidable."

        Partner A: "Agreed. Our manufacturing expertise plus your distribution network and Partner B's technology could be powerful. But I want to make sure we structure this fairly from the start."

        Partner B: "Fairness is key, but so is effectiveness. We need governance that allows quick decisions in a competitive market. What's your thinking on ownership structure?"

        User: "I'd suggest we start with what each party brings to the table, then work backwards to ownership. Partner A brings manufacturing capacity worth about $50M in equivalent investment. Partner B brings IP and technology platform valued at $40M. We bring established distribution and $30M in market development investment."

        Partner A: "Those valuations seem reasonable, but sweat equity should count too. We'll be managing day-to-day manufacturing operations. That ongoing contribution should factor into governance rights."

        Partner B: "I agree operational control should reflect operational responsibility. But technology evolution will be critical to long-term success. We'd need ongoing R&D authority and budget allocation."

        User: "What if we structured ownership based on capital contribution - roughly 42%, 33%, 25% - but gave operational authority to whoever leads each function? Manufacturing decisions with Partner A, technology with Partner B, market strategy with us."

        Partner A: "That makes sense operationally, but what about major strategic decisions? Market expansion, new products, exit strategies?"

        User: "For strategic decisions, we could require majority approval, but with a caveat - any party can escalate to external arbitration if they feel their core interests are threatened. That protects everyone while enabling decisions."

        Partner B: "I like the protection mechanism. What about intellectual property? Our technology is valuable, but we'd be enhancing it based on market feedback from this venture."

        User: "Fair concern. What if base IP stays with original owners, but improvements developed through the JV become joint property? That way everyone benefits from the collaboration while protecting pre-existing assets."

        Partner A: "That works. But we should address what happens if someone wants to exit early. We need both protection for the remaining partners and fairness for whoever leaves."

        User: "Right-of-first-refusal with independent valuation? And maybe a non-compete period that's reasonable but protects the joint venture's market position?"

        Partner B: "Two years non-compete in this specific market segment seems fair. Gives the JV time to establish itself without immediate competition from an exiting partner."

        Partner A: "I can work with that. Should we also discuss success metrics and profit distribution methodology?"

        User: "Absolutely. I'd suggest quarterly performance reviews against agreed metrics, with profit distribution following ownership percentages unless we agree on performance bonuses for exceptional contribution."
      `,
      expectedAnalysis: {
        claimingValue: {
          score: 80,
          strengths: ["Strong asset valuation anchoring", "Governance protection mechanisms", "Exit strategy negotiation"],
          techniques: ["Value-based ownership positioning", "Authority allocation strategy", "Risk mitigation planning"]
        },
        creatingValue: {
          score: 87,
          strengths: ["Joint IP enhancement structure", "Functional authority alignment", "Collaborative decision framework"],
          techniques: ["Asset contribution optimization", "Operational efficiency design", "Innovation incentive alignment"]
        },
        relationshipManagement: {
          score: 85,
          strengths: ["Three-way collaboration facilitation", "Fair process acknowledgment", "Conflict prevention planning"],
          techniques: ["Multi-party mediation", "Interest balancing", "Trust-building transparency"]
        }
      }
    }
  }

  /**
   * Get all examples for testing and validation
   */
  getAllExamples() {
    return {
      vendor_contract: this.getVendorContractExample(),
      partnership_agreement: this.getPartnershipAgreementExample(),
      salary_negotiation: this.getSalaryNegotiationExample(),
      conflict_resolution: this.getConflictResolutionExample(),
      multi_party: this.getMultiPartyExample()
    }
  }

  /**
   * Get example by scenario type
   */
  getExample(scenarioType) {
    const examples = this.getAllExamples()
    return examples[scenarioType] || examples.vendor_contract
  }

  /**
   * Generate test prompts for validation
   */
  generateTestPrompts(scenarioType = 'vendor_contract') {
    const example = this.getExample(scenarioType)
    const feedbackPrompts = require('./feedbackPrompts')
    
    return {
      masterPrompt: feedbackPrompts.getMasterAnalysisPrompt(
        example.sampleTranscript,
        example.scenario
      ),
      dimensionPrompts: {
        claimingValue: feedbackPrompts.getClaimingValuePrompt(
          example.sampleTranscript,
          example.scenario
        ),
        creatingValue: feedbackPrompts.getCreatingValuePrompt(
          example.sampleTranscript,
          example.scenario
        ),
        relationshipManagement: feedbackPrompts.getRelationshipManagementPrompt(
          example.sampleTranscript,
          example.scenario
        )
      },
      scenarioSpecific: feedbackPrompts.getScenarioSpecificPrompt(
        scenarioType,
        example.sampleTranscript,
        example.scenario
      ),
      expectedResults: example.expectedAnalysis
    }
  }

  /**
   * Validate example quality for educational use
   */
  validateExample(exampleKey) {
    const example = this.getExample(exampleKey)
    const validation = {
      isValid: true,
      score: 100,
      issues: []
    }

    // Check transcript length and complexity
    if (example.sampleTranscript.length < 1000) {
      validation.issues.push('Transcript may be too short for comprehensive analysis')
      validation.score -= 15
    }

    // Check for negotiation technique diversity
    const transcriptLower = example.sampleTranscript.toLowerCase()
    const techniques = [
      'anchoring', 'question', 'interest', 'option', 'trade', 
      'value', 'concession', 'alternative', 'benefit'
    ]

    const presentTechniques = techniques.filter(tech => transcriptLower.includes(tech))
    if (presentTechniques.length < 5) {
      validation.issues.push('Limited variety of negotiation techniques demonstrated')
      validation.score -= 10
    }

    // Check expected analysis completeness
    const requiredScores = ['claimingValue', 'creatingValue', 'relationshipManagement']
    requiredScores.forEach(dimension => {
      if (!example.expectedAnalysis[dimension] || !example.expectedAnalysis[dimension].score) {
        validation.issues.push(`Missing expected analysis for ${dimension}`)
        validation.score -= 20
      }
    })

    validation.isValid = validation.score >= 70
    return validation
  }
}

module.exports = new PromptExamples()