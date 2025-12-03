import fs from 'fs';
import path from 'path';

import { ScenarioInjector } from '../src/lib/simulator/engine/scenario-injector';
import { Persona } from '../src/lib/simulator/types';

// Parse arguments
const args = process.argv.slice(2);
const getArg = (name: string) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const policyPath = getArg('policy');
const scenarioName = getArg('scenario');

if (!policyPath || !scenarioName) {
  console.error('Usage: npm run simulate:governance -- --policy=<path> --scenario=<name>');
  process.exit(1);
}

// Load data
const personasPath = path.join(process.cwd(), 'src/lib/simulator/data/personas.json');
const scenariosDir = path.join(process.cwd(), 'src/lib/simulator/data/scenarios');

try {
  const personas: Persona[] = JSON.parse(fs.readFileSync(personasPath, 'utf-8'));
  const scenarioPath = path.join(scenariosDir, `${scenarioName}.json`);

  console.log(`\n🤖 AI Persona Simulation Environment (Block 11.1)`);
  console.log(`------------------------------------------------`);
  console.log(`Policy:   ${policyPath}`);
  console.log(`Scenario: ${scenarioName}`);
  console.log(`Personas: ${personas.length} loaded\n`);

  const scenario = ScenarioInjector.loadScenario(scenarioPath);
  const results = ScenarioInjector.runSimulation(scenario, policyPath, personas);

  // Output results
  console.table(results.map(r => ({
      Persona: r.persona_id.replace('persona_', ''),
      Sentiment: r.sentiment_delta,
      Friction: r.friction_score,
      Comprehension: r.comprehension_score,
      Refusal: r.refusal ? 'YES' : 'NO'
  })));

  // Check for failures (Simple regression check)
  const failed = results.filter(r => r.refusal || r.friction_score > 80 || r.comprehension_score < 40);
  
  if (failed.length > 0) {
      console.error(`\n❌ Simulation Failed: ${failed.length} persona(s) experienced critical issues.`);
      failed.forEach(f => {
          console.error(`   - ${f.persona_id}: Friction=${f.friction_score}, Refusal=${f.refusal}`);
      });
      process.exit(1); // Fail CI
  } else {
      console.log(`\n✅ Simulation Passed: All personas within acceptable parameters.`);
      process.exit(0);
  }

} catch (error) {
  console.error('Simulation Error:', error);
  process.exit(1);
}

