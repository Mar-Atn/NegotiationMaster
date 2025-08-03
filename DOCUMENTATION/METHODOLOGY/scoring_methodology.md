## Scoring & Assessment System

This system will provide a dynamic, multi-dimensional score (1-100) by blending objective data with AI-driven qualitative analysis.

    The Three Core Skills:

        Claiming Value: Measures competitive effectiveness.

        Creating Value: Measures collaborative problem-solving.

        Relationship Management: Measures interpersonal dynamics.

    Scoring Formula: SkillScore = (ObjectiveMetricsWeight * ObjectiveScore) + (QualitativeAnalysisWeight * QualitativeScore)

        Objective Metrics: Measurable data such as deal outcome (% of ZOPA), deal completion (binary), and time to agreement.

        AI Qualitative Analysis: The AI will analyze the conversation for specific behaviors, providing a numerical score based on the effectiveness of anchoring, justification of demands, empathetic listening, and collaborative language.

    Dynamic Weighting:

        The Weighting from the Teaching Notes provides the initial score allocation.

        The AI agent will analyze the actual conversation. If the user's behavior shifts the negotiation's dynamic (e.g., introducing a creative solution in a distributive scenario), the AI will dynamically adjust the weighting to reflect and reward this advanced behavior in the final score.

    Overall Composite Score: This is a weighted average of the three skill scores, using the final, dynamically adjusted weightings.

3. Progress Tracking & Gamification

A modified ELO-style system will be used to track and gamify skill development.

    ELO-Style Rating: Each user starts with a base rating (e.g., 1200). The rating changes after each scenario based on the user's performance and the scenario's difficulty.

    ELO Change Formula: NewRating = OldRating + K * (S - E)

        K (K-factor): A dynamic multiplier based on the scenario's difficulty. Harder scenarios have a larger K value, leading to more significant rating changes.

        S (Actual Score): The user's Overall Composite Score (scaled to a 1.0-2.0 range).

        E (Expected Score): A prediction of the user's score based on their current ELO and the scenario's difficulty rating.

    Time Decay: A gentle decay function will be applied to the ELO score after a period of inactivity (e.g., 30 days) to ensure the rating reflects current skill.

    Plateau Detection: The system will flag a plateau when the user's ELO change is minimal over a set number of scenarios, prompting suggestions for new, more challenging scenarios.

4. Benchmarking & User Reporting

The platform will provide users with insights into their performance relative to others and their own progress over time.

    Peer Comparison: After each scenario, the user's performance will be benchmarked against all other users who have completed the same scenario, providing a percentile ranking for each skill.

    Expected Performance: Before each scenario, the system will provide an Expected Score Range based on the user's current ELO rating.

    Improvement Velocity: A visual dashboard will track the user's skill ratings over time, showing their rate of development and highlighting key milestones.

