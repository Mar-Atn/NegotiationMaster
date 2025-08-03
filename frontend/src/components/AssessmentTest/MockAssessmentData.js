/**
 * Mock Assessment Data for Testing
 * This provides sample assessment results to test the frontend interface
 * while the backend assessment engine is being developed.
 */

export const mockAssessmentData = {
  assessmentId: 'mock-assessment-' + Date.now(),
  conversationId: 'conv_6401k1phxhyzfz2va165272pmakz',
  methodologyCompliant: true,
  
  // 3D Scoring System
  scores: {
    overall: 7.8,
    claimingValue: 8.2,
    creatingValue: 7.1,
    relationshipManagement: 8.1
  },

  performanceLevel: 'Advanced',

  // Professional Assessment Sections
  executiveSummary: `The negotiation demonstrates strong analytical skills and strategic thinking. The participant effectively identified key value creation opportunities while maintaining a collaborative approach. Communication was clear and professional throughout, with good use of questioning techniques to understand the other party's needs. Areas for improvement include more assertive value claiming and better preparation for potential deadlock scenarios.`,

  whatWasDoneWell: `Excellent relationship building was demonstrated throughout the conversation, with the participant showing genuine interest in finding mutually beneficial solutions. The use of open-ended questions like "What would make this deal work best for your team?" showed strong information gathering skills.

Value creation was particularly effective when the participant suggested: "We could structure this as a three-year partnership with built-in flexibility for both sides." This demonstrates understanding of creative deal structuring.

The participant maintained professionalism even when facing pushback, responding to challenges with statements like "I understand your concerns, let's explore how we might address them together." This collaborative approach built trust and kept negotiations moving forward.`,

  areasForImprovement: `Value claiming could be strengthened through more confident anchoring and better preparation of supporting data. When the other party made their initial offer, the participant could have responded more assertively rather than immediately seeking compromise.

The participant missed several opportunities to leverage time pressure and alternative options (BATNA). For example, when discussing timeline constraints, a more strategic response would have been: "Given our timeline constraints, we need to see significant movement on price to make this work."

Preparation could be enhanced by developing stronger supporting arguments for key positions. When asked about pricing justification, the response was somewhat general rather than specific and data-driven.`,

  nextSteps: `Focus on developing stronger anchoring techniques and confidence in initial offers. Practice BATNA development and communication to improve leverage in future negotiations. Consider additional training in data-driven argument construction to support key positions more effectively.

Recommended areas for skill development: strategic concession planning, deadline pressure utilization, and stakeholder analysis for complex multi-party negotiations.`
}

export const mockTranscriptData = {
  conversationId: 'conv_6401k1phxhyzfz2va165272pmakz',
  status: 'done',
  transcript: [
    {
      role: 'agent',
      message: 'Hi! How are you! I\'m Sara, and I understand you\'re interested in our Honda Civic.',
      time_in_call_secs: 0
    },
    {
      role: 'user',
      message: 'I\'m fine, Sara. Yes, I\'m interested in that Honda Civic.',
      time_in_call_secs: 2
    },
    {
      role: 'agent', 
      message: 'Great! The Honda Civic is an excellent choice. What specifically interests you about this model?',
      time_in_call_secs: 5
    },
    {
      role: 'user',
      message: 'Well, I\'m looking for something reliable and fuel-efficient. What kind of pricing are we looking at?',
      time_in_call_secs: 8
    },
    {
      role: 'agent',
      message: 'For the base model, we\'re looking at $24,000. But let me ask - what\'s your budget range and what features are most important to you?',
      time_in_call_secs: 12
    },
    {
      role: 'user',
      message: 'That\'s a bit higher than I was hoping. I was thinking more like $22,000. What can we do to get there?',
      time_in_call_secs: 16
    },
    {
      role: 'agent',
      message: 'I understand you\'re looking for value. Let\'s see what we can work out. What if we could include some additional warranty coverage or maintenance packages that would add value while working within your budget?',
      time_in_call_secs: 20
    },
    {
      role: 'user',
      message: 'That could be interesting. What kind of warranty are we talking about?',
      time_in_call_secs: 24
    }
  ]
}