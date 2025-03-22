'use client';

import React from 'react';

const pillars = [
  {
    emoji: '🌐',
    title: 'Artificial Intelligence',
    description: 'Advanced neural networks and quantum algorithms to augment human potential responsibly and ethically.'
  },
  {
    emoji: '🌱',
    title: 'Sustainability',
    description: 'Every innovation supports planetary health, ensuring that technological progress sustains our environment.'
  },
  {
    emoji: '🕶️',
    title: 'Metaverse Integration',
    description: 'Creating immersive, inclusive digital experiences that bridge the gap between virtual and physical realities.'
  }
];

export default function Vision() {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center cyberpunk-glow text-cyan-400">
          Our Vision
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div 
              key={index}
              className="relative bg-black bg-opacity-50 p-8 rounded-lg cyberpunk-border flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:z-10"
            >
              <div className="text-6xl mb-4">{pillar.emoji}</div>
              <h3 className="text-xl font-bold mb-4 text-cyan-300">{pillar.title}</h3>
              <p className="text-gray-400">{pillar.description}</p>
              
              {/* Decorative element */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1/4 h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 