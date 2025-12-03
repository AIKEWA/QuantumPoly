import { Persona, PersonaTraits, PersonaMemory } from '../types';

export class PersonaEngine {
  static instantiatePersona(id: string, name: string, traits: PersonaTraits): Persona {
    const initialMemory: PersonaMemory = {
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

  static updateMemory(
    persona: Persona,
    eventDescription: string,
    frustrationDelta: number,
    trustDelta: number,
  ): Persona {
    const newMemory: PersonaMemory = {
      frustration: Math.max(0, Math.min(100, persona.memory.frustration + frustrationDelta)),
      trust: Math.max(0, Math.min(100, persona.memory.trust + trustDelta)),
      recent_events: [...persona.memory.recent_events, eventDescription].slice(-5), // Keep last 5
    };

    return {
      ...persona,
      memory: newMemory,
    };
  }

  static resetMemory(persona: Persona): Persona {
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
