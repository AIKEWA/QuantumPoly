export type PersonaTraitLevel = 'low' | 'medium' | 'high';

export interface PersonaTraits {
  tech_literacy: PersonaTraitLevel;
  privacy_sensitivity: PersonaTraitLevel;
  cultural_context: string;
  stress_threshold: PersonaTraitLevel;
  curiosity: PersonaTraitLevel; // Affects likelihood to read details
}

export interface PersonaMemory {
  frustration: number; // 0-100
  trust: number; // 0-100
  recent_events: string[];
}

export interface Persona {
  id: string;
  name: string;
  traits: PersonaTraits;
  memory: PersonaMemory;
}

export interface GovernanceArtifact {
  id: string;
  name: string;
  type: 'policy' | 'modal' | 'notice';
  content: string;
  complexity_score?: number; // 0-100, estimated
}

export interface SimulationStep {
  id: string;
  description: string;
  expected_action?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: SimulationStep[];
  target_metric: 'friction' | 'comprehension' | 'refusal';
}

export interface SimulationResult {
  persona_id: string;
  scenario_id: string;
  sentiment_delta: number;
  friction_score: number; // Time/steps normalized
  comprehension_score: number; // 0-100
  refusal: boolean;
  logs: string[];
}
