import { Persona, GovernanceArtifact, SimulationResult } from '../types';

export class ReactionAnalyzer {
  /**
   * Evaluates how a Persona reacts to a specific Governance Artifact within a Scenario context.
   */
  static evaluateResponse(persona: Persona, artifact: GovernanceArtifact): SimulationResult {
    const logs: string[] = [];
    logs.push(`Analyzing reaction for persona: ${persona.name} (${persona.id})`);
    logs.push(`Artifact: ${artifact.name} (${artifact.type})`);

    // 1. Estimate Artifact Complexity (if not provided)
    const complexity = artifact.complexity_score ?? this.estimateComplexity(artifact.content);
    logs.push(`Estimated Complexity: ${complexity}/100`);

    // 2. Calculate Comprehension
    // Higher tech literacy -> Higher comprehension
    // Higher complexity -> Lower comprehension
    let baseComprehension = 100 - complexity;

    if (persona.traits.tech_literacy === 'high') baseComprehension += 20;
    if (persona.traits.tech_literacy === 'low') baseComprehension -= 20;

    // Cap at 0-100
    const comprehensionScore = Math.max(0, Math.min(100, baseComprehension));
    logs.push(`Calculated Comprehension: ${comprehensionScore}`);

    // 3. Calculate Friction
    // Low literacy + high complexity = High friction
    // Low stress threshold + high complexity = High friction
    let friction = complexity * 0.5;
    if (persona.traits.tech_literacy === 'low') friction *= 1.5;
    if (persona.traits.stress_threshold === 'low') friction *= 1.2;

    const frictionScore = Math.max(0, Math.min(100, friction));
    logs.push(`Calculated Friction: ${frictionScore}`);

    // 4. Calculate Sentiment Delta & Refusal
    // Privacy sensitive people hate "tracking" words
    let sentimentDelta = 0;
    let refusal = false;

    const privacyTriggerWords = ['track', 'share', 'third-party', 'marketing', 'monitor'];
    const hasPrivacyTriggers = privacyTriggerWords.some((word) =>
      artifact.content.toLowerCase().includes(word),
    );

    if (hasPrivacyTriggers) {
      if (persona.traits.privacy_sensitivity === 'high') {
        sentimentDelta -= 30;
        logs.push('Privacy triggers detected for sensitive persona. Strong negative sentiment.');
        // High chance of refusal if trust is already low or friction is high
        if (persona.memory.trust < 60 || frictionScore > 70) {
          refusal = true;
          logs.push('Refusal triggered by privacy concerns.');
        }
      } else if (persona.traits.privacy_sensitivity === 'medium') {
        sentimentDelta -= 10;
      }
    } else {
      // Clear communication boosts sentiment
      if (comprehensionScore > 80) {
        sentimentDelta += 5;
      }
    }

    // Frustration from friction
    sentimentDelta -= frictionScore / 5;

    return {
      persona_id: persona.id,
      scenario_id: 'single-interaction', // Placeholder if just checking one artifact
      sentiment_delta: Math.round(sentimentDelta),
      friction_score: Math.round(frictionScore),
      comprehension_score: Math.round(comprehensionScore),
      refusal,
      logs,
    };
  }

  private static estimateComplexity(text: string): number {
    // Very basic heuristic: word count and sentence length
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgSentenceLength = words / (sentences || 1);

    let score = 30; // Base
    if (words > 500) score += 20;
    if (words > 1000) score += 20;
    if (avgSentenceLength > 20) score += 20;

    // Check for "legalese"
    const legalese = ['hereby', 'aforementioned', 'indemnify', 'pursuant', 'notwithstanding'];
    const legaleseCount = legalese.filter((w) => text.toLowerCase().includes(w)).length;
    score += legaleseCount * 5;

    return Math.min(100, score);
  }
}
