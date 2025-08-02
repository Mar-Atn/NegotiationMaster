/**
 * Comprehensive Scoring Rubric for Negotiation Assessment
 * 
 * Provides detailed criteria and benchmarks for evaluating negotiation performance
 * across three dimensions: Claiming Value, Creating Value, and Relationship Management.
 * Based on Harvard Negotiation Method principles and executive education standards.
 */

class ScoringRubric {

  /**
   * CLAIMING VALUE SCORING RUBRIC (0-100 points)
   * Measures competitive negotiation effectiveness and value claiming capabilities
   */
  getClaimingValueRubric() {
    return {
      dimension: 'claiming_value',
      maxScore: 100,
      description: 'Evaluates effectiveness in securing favorable outcomes through competitive negotiation techniques',
      
      components: {
        anchoring: {
          weight: 20,
          maxPoints: 20,
          description: 'Strategic positioning through opening offers and reference points',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Demonstrates masterful anchoring with market-researched positions, confident delivery, and strategic timing. Uses multiple anchoring techniques including numerical precision and comparative references.',
              indicators: [
                'Opens with well-researched, defensible position',
                'Uses specific numbers and market data',
                'Demonstrates confidence in anchor delivery',
                'Employs comparative anchoring techniques',
                'Recovers effectively from counterpart anchoring'
              ]
            },
            'proficient': {
              range: [14, 17],
              description: 'Shows strong anchoring skills with reasonable positions and good technique application. May lack some sophistication or market grounding.',
              indicators: [
                'Opens with reasonable, defendable position',
                'Uses some numerical specificity',
                'Shows adequate confidence in delivery',
                'Employs basic anchoring techniques',
                'Responds appropriately to counterpart anchors'
              ]
            },
            'developing': {
              range: [8, 13],
              description: 'Demonstrates basic anchoring awareness but lacks precision, confidence, or strategic thinking in application.',
              indicators: [
                'Makes opening offer but lacks precision',
                'Limited use of supporting data or rationale',
                'Shows uncertainty in position delivery',
                'Basic anchoring technique only',
                'Weak response to counterpart anchoring'
              ]
            },
            'inadequate': {
              range: [0, 7],
              description: 'Fails to establish effective anchoring position or demonstrates poor technique that undermines negotiation position.',
              indicators: [
                'No clear opening position established',
                'Lacks numerical precision or rationale',
                'Shows significant uncertainty or weakness',
                'No evidence of anchoring strategy',
                'Accepts counterpart anchors without challenge'
              ]
            }
          }
        },

        batna_leverage: {
          weight: 15,
          maxPoints: 15,
          description: 'Effective use of alternatives to strengthen negotiation position',
          criteria: {
            'excellent': {
              range: [14, 15],
              description: 'Masterfully leverages BATNA with credible alternatives, strategic revelation, and confident walk-away position.',
              indicators: [
                'Clearly articulates strong alternatives',
                'Demonstrates credible walk-away capability',
                'Times BATNA revelation strategically',
                'Uses alternatives to strengthen position',
                'Maintains genuine confidence in options'
              ]
            },
            'proficient': {
              range: [11, 13],
              description: 'Shows good BATNA utilization with clear alternatives and reasonable leverage.',
              indicators: [
                'References alternative options',
                'Shows willingness to walk away',
                'Uses alternatives for some leverage',
                'Demonstrates alternative thinking',
                'Maintains reasonable position strength'
              ]
            },
            'developing': {
              range: [6, 10],
              description: 'Limited BATNA awareness or weak alternative positioning.',
              indicators: [
                'Mentions alternatives but vaguely',
                'Limited credibility in walk-away position',
                'Minimal leverage from alternatives',
                'Basic alternative thinking only',
                'Position shows dependence on deal'
              ]
            },
            'inadequate': {
              range: [0, 5],
              description: 'No evidence of BATNA consideration or alternative leverage.',
              indicators: [
                'No alternatives mentioned or considered',
                'Shows complete dependence on current deal',
                'No evidence of walk-away capability',
                'Weak or desperate positioning',
                'Accepts terms without leverage consideration'
              ]
            }
          }
        },

        concession_strategy: {
          weight: 20,
          maxPoints: 20,
          description: 'Strategic concession patterns and reciprocity management',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Demonstrates sophisticated concession strategy with incremental patterns, conditional language, and reciprocity expectations.',
              indicators: [
                'Uses incremental concession patterns',
                'Employs conditional "if-then" language',
                'Demands reciprocity for concessions',
                'Protects key interests while conceding',
                'Times concessions strategically'
              ]
            },
            'proficient': {
              range: [14, 17],
              description: 'Shows good concession management with reasonable patterns and some reciprocity awareness.',
              indicators: [
                'Makes reasonable concession progression',
                'Uses some conditional language',
                'Shows reciprocity awareness',
                'Protects some key interests',
                'Demonstrates strategic thinking'
              ]
            },
            'developing': {
              range: [8, 13],
              description: 'Basic concession patterns but lacks sophistication or strategic thinking.',
              indicators: [
                'Makes concessions but pattern unclear',
                'Limited conditional language use',
                'Minimal reciprocity expectations',
                'Some protection of interests',
                'Basic strategic awareness only'
              ]
            },
            'inadequate': {
              range: [0, 7],
              description: 'Poor concession strategy with excessive or unstrategic concessions.',
              indicators: [
                'Excessive or rapid concessions',
                'No conditional language or reciprocity',
                'Fails to protect key interests',
                'No apparent concession strategy',
                'Gives away value unnecessarily'
              ]
            }
          }
        },

        information_seeking: {
          weight: 15,
          maxPoints: 15,
          description: 'Strategic information gathering and information protection',
          criteria: {
            'excellent': {
              range: [14, 15],
              description: 'Masterful information strategy with strategic questioning, information protection, and asymmetry utilization.',
              indicators: [
                'Uses strategic questioning techniques',
                'Protects sensitive information effectively',
                'Gathers critical intelligence',
                'Leverages information asymmetry',
                'Frames questions for maximum advantage'
              ]
            },
            'proficient': {
              range: [11, 13],
              description: 'Good information gathering with effective questioning and reasonable information management.',
              indicators: [
                'Asks relevant questions for information',
                'Shows some information protection',
                'Gathers useful intelligence',
                'Uses information appropriately',
                'Demonstrates information awareness'
              ]
            },
            'developing': {
              range: [6, 10],
              description: 'Basic information gathering but limited strategic thinking or protection.',
              indicators: [
                'Asks basic questions',
                'Limited information protection',
                'Gathers some relevant information',
                'Minimal strategic information use',
                'Basic information awareness'
              ]
            },
            'inadequate': {
              range: [0, 5],
              description: 'Poor information strategy with excessive disclosure or inadequate gathering.',
              indicators: [
                'Limited or poor questioning',
                'Reveals sensitive information unnecessarily',
                'Fails to gather critical intelligence',
                'No strategic information thinking',
                'Weak information management'
              ]
            }
          }
        },

        pressure_application: {
          weight: 15,
          maxPoints: 15,
          description: 'Effective use of time pressure and decision-forcing techniques',
          criteria: {
            'excellent': {
              range: [14, 15],
              description: 'Sophisticated pressure application with effective timing, urgency creation, and decision forcing without aggression.',
              indicators: [
                'Creates appropriate time pressure',
                'Uses deadlines effectively',
                'Forces decisions strategically',
                'Maintains professionalism under pressure',
                'Leverages urgency for advantage'
              ]
            },
            'proficient': {
              range: [11, 13],
              description: 'Good pressure utilization with reasonable timing and decision-forcing techniques.',
              indicators: [
                'Uses some time pressure appropriately',
                'References deadlines when relevant',
                'Shows some urgency without aggression',
                'Maintains reasonable pressure',
                'Demonstrates pressure awareness'
              ]
            },
            'developing': {
              range: [6, 10],
              description: 'Limited pressure application or poor timing in pressure techniques.',
              indicators: [
                'Minimal pressure application',
                'Poor timing of urgency',
                'Limited decision-forcing capability',
                'Basic pressure awareness only',
                'May be too aggressive or too passive'
              ]
            },
            'inadequate': {
              range: [0, 5],
              description: 'Ineffective pressure application or inappropriate pressure techniques.',
              indicators: [
                'No pressure application when appropriate',
                'Inappropriate or excessive pressure',
                'Poor timing and technique',
                'Creates negative dynamics',
                'Lacks pressure awareness'
              ]
            }
          }
        },

        deal_protection: {
          weight: 15,
          maxPoints: 15,
          description: 'Mechanisms to protect deal value and minimize risks',
          criteria: {
            'excellent': {
              range: [14, 15],
              description: 'Comprehensive deal protection with contingencies, conditions, and risk mitigation.',
              indicators: [
                'Uses contingency clauses effectively',
                'Builds in approval processes',
                'Creates performance conditions',
                'Mitigates identified risks',
                'Protects against future changes'
              ]
            },
            'proficient': {
              range: [11, 13],
              description: 'Good deal protection with some contingencies and risk awareness.',
              indicators: [
                'Uses some protective mechanisms',
                'Shows risk awareness',
                'Includes basic contingencies',
                'Demonstrates protection thinking',
                'Considers implementation challenges'
              ]
            },
            'developing': {
              range: [6, 10],
              description: 'Limited deal protection or basic risk management only.',
              indicators: [
                'Minimal protective mechanisms',
                'Limited risk awareness',
                'Basic contingency thinking',
                'Some protection consideration',
                'Elementary risk management'
              ]
            },
            'inadequate': {
              range: [0, 5],
              description: 'No deal protection or failure to consider implementation risks.',
              indicators: [
                'No protective mechanisms considered',
                'Lacks risk awareness',
                'No contingency planning',
                'Ignores implementation challenges',
                'Accepts terms without protection'
              ]
            }
          }
        }
      }
    }
  }

  /**
   * CREATING VALUE SCORING RUBRIC (0-100 points)
   * Measures collaborative problem-solving and value creation capabilities
   */
  getCreatingValueRubric() {
    return {
      dimension: 'creating_value',
      maxScore: 100,
      description: 'Evaluates effectiveness in identifying mutual gains and expanding negotiation value',
      
      components: {
        interest_exploration: {
          weight: 25,
          maxPoints: 25,
          description: 'Deep exploration of underlying interests and motivations',
          criteria: {
            'excellent': {
              range: [23, 25],
              description: 'Masterful interest exploration with deep questioning, genuine curiosity, and comprehensive understanding of counterpart motivations.',
              indicators: [
                'Asks probing "why" questions beyond positions',
                'Demonstrates genuine curiosity about motivations',
                'Uncovers non-obvious interests and constraints',
                'Shows deep understanding of business priorities',
                'Explores emotional and relationship interests'
              ]
            },
            'proficient': {
              range: [19, 22],
              description: 'Strong interest exploration with good questioning and reasonable understanding of motivations.',
              indicators: [
                'Asks relevant questions about motivations',
                'Shows interest in understanding priorities',
                'Uncovers some underlying interests',
                'Demonstrates business understanding',
                'Goes beyond surface positions'
              ]
            },
            'developing': {
              range: [13, 18],
              description: 'Basic interest exploration but limited depth or understanding.',
              indicators: [
                'Asks some questions about needs',
                'Shows limited curiosity about motivations',
                'Uncovers basic interests only',
                'Superficial understanding demonstrated',
                'Focuses mainly on stated positions'
              ]
            },
            'inadequate': {
              range: [0, 12],
              description: 'Fails to explore interests or focuses only on positions.',
              indicators: [
                'No exploration of underlying interests',
                'Focuses only on stated positions',
                'Shows no curiosity about motivations',
                'Lacks understanding of priorities',
                'Misses obvious interest exploration opportunities'
              ]
            }
          }
        },

        option_generation: {
          weight: 20,
          maxPoints: 20,
          description: 'Creative development of multiple solution alternatives',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Exceptional creativity in generating multiple options with innovative thinking and comprehensive alternative development.',
              indicators: [
                'Generates multiple creative alternatives',
                'Uses "what if" scenario thinking',
                'Demonstrates innovative problem-solving',
                'Builds package deals and combinations',
                'Shows brainstorming mindset'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good option generation with several alternatives and reasonable creativity.',
              indicators: [
                'Proposes several different options',
                'Shows some creative thinking',
                'Develops reasonable alternatives',
                'Considers different approaches',
                'Demonstrates solution orientation'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Limited option generation with few alternatives or minimal creativity.',
              indicators: [
                'Proposes few alternative options',
                'Limited creative thinking demonstrated',
                'Basic solution development only',
                'Minimal alternative consideration',
                'Shows some solution awareness'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Fails to generate meaningful alternatives or shows no creative thinking.',
              indicators: [
                'No alternative options proposed',
                'Lacks creative or innovative thinking',
                'Shows no solution orientation',
                'Focuses on single approach only',
                'Misses obvious alternative opportunities'
              ]
            }
          }
        },

        tradeoff_identification: {
          weight: 20,
          maxPoints: 20,
          description: 'Recognition and development of mutually beneficial exchanges',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Sophisticated trade-off analysis with clear identification of low-cost/high-value exchanges and multi-dimensional thinking.',
              indicators: [
                'Identifies low-cost/high-value exchanges',
                'Recognizes different priority values',
                'Develops multi-issue trade-offs',
                'Creates compensation mechanisms',
                'Shows sophisticated value thinking'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good trade-off recognition with reasonable exchange identification and value understanding.',
              indicators: [
                'Recognizes some trade-off opportunities',
                'Shows awareness of different values',
                'Develops basic exchange proposals',
                'Demonstrates value thinking',
                'Considers mutual benefit potential'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Limited trade-off awareness with basic exchange thinking only.',
              indicators: [
                'Shows minimal trade-off awareness',
                'Limited understanding of value differences',
                'Basic exchange thinking only',
                'Elementary mutual benefit consideration',
                'Focuses mainly on single issues'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Fails to recognize trade-off opportunities or shows no exchange thinking.',
              indicators: [
                'No trade-off recognition demonstrated',
                'Lacks understanding of value differences',
                'No exchange or compensation thinking',
                'Misses obvious mutual benefit opportunities',
                'Shows zero-sum mindset only'
              ]
            }
          }
        },

        future_focus: {
          weight: 15,
          maxPoints: 15,
          description: 'Long-term relationship and future value creation orientation',
          criteria: {
            'excellent': {
              range: [14, 15],
              description: 'Strong future orientation with relationship building, ongoing partnership thinking, and long-term value creation.',
              indicators: [
                'Focuses on long-term relationship building',
                'Discusses future opportunities',
                'Shows partnership mindset',
                'Plans for ongoing value creation',
                'Considers relationship impact of decisions'
              ]
            },
            'proficient': {
              range: [11, 13],
              description: 'Good future thinking with some relationship consideration and ongoing value awareness.',
              indicators: [
                'Shows some future thinking',
                'Considers relationship factors',
                'Mentions ongoing opportunities',
                'Demonstrates partnership awareness',
                'Balances short and long-term thinking'
              ]
            },
            'developing': {
              range: [6, 10],
              description: 'Limited future focus with minimal relationship or ongoing value consideration.',
              indicators: [
                'Limited future orientation',
                'Minimal relationship consideration',
                'Basic ongoing value awareness',
                'Short-term focus primarily',
                'Some partnership thinking'
              ]
            },
            'inadequate': {
              range: [0, 5],
              description: 'No future focus or relationship consideration, purely transactional approach.',
              indicators: [
                'No future thinking demonstrated',
                'Purely transactional approach',
                'No relationship consideration',
                'Ignores ongoing value potential',
                'Short-term focused exclusively'
              ]
            }
          }
        },

        creative_problem_solving: {
          weight: 20,
          maxPoints: 20,
          description: 'Innovative approaches to overcoming obstacles and constraints',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Exceptional creativity in problem-solving with innovative constraint solutions and breakthrough thinking.',
              indicators: [
                'Demonstrates innovative problem-solving',
                'Overcomes constraints creatively',
                'Shows breakthrough thinking',
                'Reframes problems as opportunities',
                'Uses unconventional approaches effectively'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good creative problem-solving with reasonable innovation and constraint management.',
              indicators: [
                'Shows good problem-solving creativity',
                'Addresses constraints constructively',
                'Demonstrates innovative thinking',
                'Reframes some problems positively',
                'Uses creative approaches appropriately'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Limited creativity in problem-solving with conventional approaches primarily.',
              indicators: [
                'Shows basic problem-solving creativity',
                'Limited constraint management',
                'Conventional approaches primarily',
                'Minimal reframing or innovation',
                'Some creative thinking demonstrated'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'No creative problem-solving or inability to overcome basic constraints.',
              indicators: [
                'No creative problem-solving demonstrated',
                'Cannot overcome basic constraints',
                'Lacks innovative thinking',
                'No reframing or breakthrough approaches',
                'Conventional thinking exclusively'
              ]
            }
          }
        }
      }
    }
  }

  /**
   * RELATIONSHIP MANAGEMENT SCORING RUBRIC (0-100 points)
   * Measures interpersonal effectiveness and relationship building capabilities
   */
  getRelationshipManagementRubric() {
    return {
      dimension: 'relationship_management',
      maxScore: 100,
      description: 'Evaluates effectiveness in managing interpersonal dynamics and building productive relationships',
      
      components: {
        active_listening: {
          weight: 20,
          maxPoints: 20,
          description: 'Demonstration of engaged listening and understanding techniques',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Masterful active listening with consistent acknowledgment, accurate paraphrasing, and building on counterpart input.',
              indicators: [
                'Consistently acknowledges and confirms understanding',
                'Accurately paraphrases and reflects content',
                'Builds on counterpart statements constructively',
                'Asks clarifying questions appropriately',
                'Demonstrates genuine engagement and attention'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Strong listening skills with good acknowledgment and reasonable understanding demonstration.',
              indicators: [
                'Regularly acknowledges counterpart input',
                'Shows good understanding of content',
                'Builds on statements appropriately',
                'Asks relevant clarifying questions',
                'Demonstrates engagement and attention'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Basic listening skills but inconsistent acknowledgment or understanding demonstration.',
              indicators: [
                'Occasionally acknowledges input',
                'Shows some understanding of content',
                'Limited building on statements',
                'Few clarifying questions asked',
                'Demonstrates basic engagement'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Poor listening skills with minimal acknowledgment or understanding demonstration.',
              indicators: [
                'Rarely acknowledges counterpart input',
                'Shows poor understanding of content',
                'Fails to build on statements',
                'No clarifying questions asked',
                'Demonstrates poor engagement'
              ]
            }
          }
        },

        empathy_understanding: {
          weight: 20,
          maxPoints: 20,
          description: 'Demonstration of perspective-taking and emotional understanding',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Exceptional empathy with deep perspective-taking, emotional validation, and genuine understanding of counterpart experience.',
              indicators: [
                'Demonstrates deep perspective-taking',
                'Validates emotions and concerns genuinely',
                'Shows understanding of counterpart experience',
                'Articulates counterpart position accurately',
                'Responds appropriately to emotional cues'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good empathy demonstration with reasonable perspective-taking and emotional awareness.',
              indicators: [
                'Shows good perspective-taking ability',
                'Validates concerns appropriately',
                'Demonstrates understanding of position',
                'Articulates counterpart views reasonably',
                'Shows emotional awareness'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Basic empathy with limited perspective-taking or emotional understanding.',
              indicators: [
                'Shows basic perspective-taking',
                'Limited validation of concerns',
                'Some understanding of position',
                'Minimal counterpart view articulation',
                'Basic emotional awareness'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Poor empathy with minimal perspective-taking or emotional understanding.',
              indicators: [
                'No perspective-taking demonstrated',
                'Fails to validate concerns',
                'Poor understanding of position',
                'Cannot articulate counterpart views',
                'Lacks emotional awareness'
              ]
            }
          }
        },

        communication_style: {
          weight: 20,
          maxPoints: 20,
          description: 'Professional, clear, and collaborative communication approach',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Exceptional communication with professional tone, clarity, collaboration, and appropriate language throughout.',
              indicators: [
                'Maintains professional tone consistently',
                'Communicates with exceptional clarity',
                'Uses collaborative language patterns',
                'Adapts communication style appropriately',
                'Demonstrates respect and courtesy throughout'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Strong communication with good professionalism, clarity, and collaborative approach.',
              indicators: [
                'Maintains professional tone generally',
                'Communicates with good clarity',
                'Uses mostly collaborative language',
                'Shows appropriate communication style',
                'Demonstrates respect and courtesy'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Basic communication with some professionalism but limited clarity or collaboration.',
              indicators: [
                'Maintains basic professional tone',
                'Communication clarity varies',
                'Limited collaborative language use',
                'Communication style somewhat appropriate',
                'Shows basic respect and courtesy'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Poor communication with unprofessional tone, lack of clarity, or adversarial approach.',
              indicators: [
                'Unprofessional or inappropriate tone',
                'Poor communication clarity',
                'Uses adversarial language patterns',
                'Inappropriate communication style',
                'Shows lack of respect or courtesy'
              ]
            }
          }
        },

        conflict_management: {
          weight: 20,
          maxPoints: 20,
          description: 'Effective handling of tension, disagreement, and conflict situations',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Masterful conflict management with effective de-escalation, reframing, and solution-focused approaches to tension.',
              indicators: [
                'De-escalates tension effectively',
                'Reframes conflicts as problems to solve',
                'Maintains composure under pressure',
                'Uses solution-focused language during conflicts',
                'Addresses disagreements constructively'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good conflict management with reasonable de-escalation and constructive disagreement handling.',
              indicators: [
                'Handles tension reasonably well',
                'Shows some reframing ability',
                'Maintains reasonable composure',
                'Uses mostly constructive language',
                'Addresses disagreements appropriately'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Basic conflict management with limited de-escalation skills or tension handling.',
              indicators: [
                'Limited tension handling ability',
                'Minimal reframing of conflicts',
                'Variable composure under pressure',
                'Some constructive language use',
                'Basic disagreement management'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Poor conflict management with escalation, poor composure, or adversarial responses to tension.',
              indicators: [
                'Escalates rather than de-escalates tension',
                'No reframing or constructive approaches',
                'Poor composure under pressure',
                'Uses inflammatory or adversarial language',
                'Handles disagreements poorly'
              ]
            }
          }
        },

        trust_building: {
          weight: 20,
          maxPoints: 20,
          description: 'Actions and communication that build credibility and trust',
          criteria: {
            'excellent': {
              range: [18, 20],
              description: 'Exceptional trust building with transparency, reliability demonstration, and consistent trust-enhancing behaviors.',
              indicators: [
                'Demonstrates transparency appropriately',
                'Shows reliability and consistency',
                'Builds credibility through actions',
                'Uses trust-enhancing language',
                'Creates psychological safety'
              ]
            },
            'proficient': {
              range: [15, 17],
              description: 'Good trust building with reasonable transparency and credibility demonstration.',
              indicators: [
                'Shows appropriate transparency',
                'Demonstrates reasonable reliability',
                'Builds some credibility',
                'Uses mostly trust-enhancing language',
                'Shows trustworthy behavior'
              ]
            },
            'developing': {
              range: [10, 14],
              description: 'Basic trust building with limited transparency or credibility demonstration.',
              indicators: [
                'Limited transparency demonstrated',
                'Some reliability shown',
                'Basic credibility building',
                'Occasional trust-enhancing language',
                'Shows basic trustworthy behavior'
              ]
            },
            'inadequate': {
              range: [0, 9],
              description: 'Poor trust building with lack of transparency, reliability, or trust-undermining behaviors.',
              indicators: [
                'No transparency or openness',
                'Shows unreliability or inconsistency',
                'Fails to build credibility',
                'Uses trust-undermining language',
                'Demonstrates untrustworthy behavior'
              ]
            }
          }
        }
      }
    }
  }

  /**
   * Overall Performance Level Determination
   * Converts numerical scores to performance levels with specific criteria
   */
  getPerformanceLevels() {
    return {
      'expert': {
        range: [90, 100],
        description: 'Exceptional negotiation mastery with consistent application of advanced techniques',
        characteristics: [
          'Demonstrates sophisticated strategic thinking',
          'Consistently applies advanced techniques',
          'Shows mastery across all dimensions',
          'Adapts approach based on situation',
          'Achieves superior outcomes consistently'
        ]
      },
      'advanced': {
        range: [80, 89],
        description: 'Strong negotiation competency with effective technique application',
        characteristics: [
          'Shows strong strategic thinking',
          'Effectively applies most techniques',
          'Demonstrates competency in all dimensions', 
          'Shows good situational awareness',
          'Achieves good outcomes regularly'
        ]
      },
      'proficient': {
        range: [70, 79],
        description: 'Solid negotiation foundation with developing expertise',
        characteristics: [
          'Demonstrates solid strategic thinking',
          'Applies techniques with reasonable effectiveness',
          'Shows competency in most dimensions',
          'Shows developing situational awareness',
          'Achieves acceptable outcomes'
        ]
      },
      'developing': {
        range: [60, 69],
        description: 'Basic negotiation capabilities with significant room for growth',
        characteristics: [
          'Shows basic strategic thinking',
          'Applies some techniques effectively',
          'Demonstrates developing competency',
          'Shows limited situational awareness',
          'Achieves mixed outcomes'
        ]
      },
      'foundational': {
        range: [0, 59],
        description: 'Early-stage negotiation skills requiring focused development',
        characteristics: [
          'Shows limited strategic thinking',
          'Applies few techniques effectively',
          'Demonstrates basic understanding only',
          'Shows minimal situational awareness',
          'Achieves poor outcomes generally'
        ]
      }
    }
  }

  /**
   * Calculate overall score from dimension scores
   */
  calculateOverallScore(claimingValue, creatingValue, relationshipManagement) {
    // Weighted average: all dimensions equal weight
    return Math.round((claimingValue + creatingValue + relationshipManagement) / 3)
  }

  /**
   * Get performance level from overall score
   */
  getPerformanceLevel(overallScore) {
    const levels = this.getPerformanceLevels()
    
    for (const [level, criteria] of Object.entries(levels)) {
      if (overallScore >= criteria.range[0] && overallScore <= criteria.range[1]) {
        return {
          level,
          score: overallScore,
          description: criteria.description,
          characteristics: criteria.characteristics
        }
      }
    }
    
    return levels.foundational // Default fallback
  }

  /**
   * Generate rubric-based scoring guidelines for AI prompts
   */
  getScoringGuidelines() {
    return `
# SCORING GUIDELINES FOR AI ANALYSIS

## GENERAL PRINCIPLES
- Scores must be justified by specific conversation evidence
- Higher scores require demonstration of advanced techniques
- Consider both technique application AND effectiveness
- Account for conversation context and complexity
- Balance recognition of strengths with identification of development areas

## CLAIMING VALUE (0-100)
- 90-100: Masterful competitive techniques with sophisticated strategy
- 80-89: Strong value claiming with effective technique application
- 70-79: Solid competitive approach with good technique use
- 60-69: Basic competitive awareness with developing skills
- 0-59: Limited competitive effectiveness or poor technique application

## CREATING VALUE (0-100)  
- 90-100: Exceptional collaborative problem-solving and innovation
- 80-89: Strong value creation with effective collaboration
- 70-79: Solid collaborative approach with good technique use
- 60-69: Basic collaborative awareness with developing skills
- 0-59: Limited collaborative effectiveness or poor technique application

## RELATIONSHIP MANAGEMENT (0-100)
- 90-100: Exceptional interpersonal skills and relationship building
- 80-89: Strong relationship management with effective communication
- 70-79: Solid interpersonal approach with good communication
- 60-69: Basic relationship awareness with developing skills
- 0-59: Limited interpersonal effectiveness or poor communication

## EVIDENCE REQUIREMENTS
- Each dimension must include minimum 3 conversation quotes
- Scores must be supported by specific behavioral observations
- Consider both what was done well AND what was missing
- Account for appropriateness of techniques to situation
- Evaluate consistency of application throughout conversation
`
  }
}

module.exports = new ScoringRubric()