"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioInjector = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const persona_engine_1 = require("./persona-engine");
const reaction_analyzer_1 = require("./reaction-analyzer");
class ScenarioInjector {
    static loadScenario(scenarioPath) {
        const fullPath = path_1.default.resolve(scenarioPath);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`Scenario file not found at: ${fullPath}`);
        }
        const content = fs_1.default.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content);
    }
    static runSimulation(scenario, policyPath, personas) {
        const policyContent = fs_1.default.readFileSync(policyPath, 'utf-8');
        const artifact = {
            id: 'injected-policy',
            name: path_1.default.basename(policyPath),
            type: 'policy',
            content: policyContent,
        };
        const results = [];
        for (const persona of personas) {
            // Reset persona memory before starting scenario?
            // Or keep it if we want to simulate cumulative fatigue across *multiple* scenarios (out of scope for now)
            const freshPersona = persona_engine_1.PersonaEngine.resetMemory(persona);
            // In a full simulation, we would step through scenario.steps
            // For now, we assume the scenario involves interacting with the injected artifact
            // This is a simplification for the MVP
            const result = reaction_analyzer_1.ReactionAnalyzer.evaluateResponse(freshPersona, artifact);
            // Tag with scenario ID
            result.scenario_id = scenario.id;
            results.push(result);
        }
        return results;
    }
}
exports.ScenarioInjector = ScenarioInjector;
