"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaEngine = void 0;
class PersonaEngine {
    static instantiatePersona(id, name, traits) {
        const initialMemory = {
            frustration: 0,
            trust: 50, // Neutral start
            recent_events: [],
        };
        return {
            id,
            name,
            traits,
            memory: initialMemory,
        };
    }
    static updateMemory(persona, eventDescription, frustrationDelta, trustDelta) {
        const newMemory = {
            frustration: Math.max(0, Math.min(100, persona.memory.frustration + frustrationDelta)),
            trust: Math.max(0, Math.min(100, persona.memory.trust + trustDelta)),
            recent_events: [...persona.memory.recent_events, eventDescription].slice(-5), // Keep last 5
        };
        return {
            ...persona,
            memory: newMemory,
        };
    }
    static resetMemory(persona) {
        return {
            ...persona,
            memory: {
                frustration: 0,
                trust: 50,
                recent_events: [],
            },
        };
    }
}
exports.PersonaEngine = PersonaEngine;
