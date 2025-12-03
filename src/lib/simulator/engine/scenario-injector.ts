import fs from 'fs';
import path from 'path';

import { Scenario, GovernanceArtifact, Persona, SimulationResult } from '../types';
import { PersonaEngine } from './persona-engine';
import { ReactionAnalyzer } from './reaction-analyzer';

export class ScenarioInjector {
  static loadScenario(scenarioPath: string): Scenario {
    const fullPath = path.resolve(scenarioPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Scenario file not found at: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as Scenario;
  }

  static runSimulation(
    scenario: Scenario,
    policyPath: string,
    personas: Persona[],
  ): SimulationResult[] {
    const policyContent = fs.readFileSync(policyPath, 'utf-8');
    const artifact: GovernanceArtifact = {
      id: 'injected-policy',
      name: path.basename(policyPath),
      type: 'policy',
      content: policyContent,
    };

    const results: SimulationResult[] = [];

    for (const persona of personas) {
      // Reset persona memory before starting scenario?
      // Or keep it if we want to simulate cumulative fatigue across *multiple* scenarios (out of scope for now)
      const freshPersona = PersonaEngine.resetMemory(persona);

      // In a full simulation, we would step through scenario.steps
      // For now, we assume the scenario involves interacting with the injected artifact
      // This is a simplification for the MVP

      const result = ReactionAnalyzer.evaluateResponse(freshPersona, artifact);

      // Tag with scenario ID
      result.scenario_id = scenario.id;

      results.push(result);
    }

    return results;
  }
}
