"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scenario_injector_1 = require("../src/lib/simulator/engine/scenario-injector");
// Parse arguments
const args = process.argv.slice(2);
const getArg = (name) => {
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
const personasPath = path_1.default.join(process.cwd(), 'src/lib/simulator/data/personas.json');
const scenariosDir = path_1.default.join(process.cwd(), 'src/lib/simulator/data/scenarios');
try {
    const personas = JSON.parse(fs_1.default.readFileSync(personasPath, 'utf-8'));
    const scenarioPath = path_1.default.join(scenariosDir, `${scenarioName}.json`);
    console.log(`\n🤖 AI Persona Simulation Environment (Block 11.1)`);
    console.log(`------------------------------------------------`);
    console.log(`Policy:   ${policyPath}`);
    console.log(`Scenario: ${scenarioName}`);
    console.log(`Personas: ${personas.length} loaded\n`);
    const scenario = scenario_injector_1.ScenarioInjector.loadScenario(scenarioPath);
    const results = scenario_injector_1.ScenarioInjector.runSimulation(scenario, policyPath, personas);
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
    }
    else {
        console.log(`\n✅ Simulation Passed: All personas within acceptable parameters.`);
        process.exit(0);
    }
}
catch (error) {
    console.error('Simulation Error:', error);
    process.exit(1);
}
