'use client';

import React from 'react';

export default function About() {
  return (
    <section className="py-20 px-4 md:px-6 bg-black bg-opacity-80">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center cyberpunk-glow text-cyan-400">
          About QuantumPoly
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <p className="text-lg leading-relaxed text-gray-300 mb-6">
              QuantumPoly is a visionary AI startup rethinking the future. Our mission is to align advanced machine
              intelligence with ecological sustainability and immersive digital realities.
            </p>
            <p className="text-lg leading-relaxed text-gray-300">
              We combine cutting-edge quantum computing principles with sustainable AI practices 
              to create transformative solutions for the next generation of technology.
            </p>
          </div>
          
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg cyberpunk-border p-1">
              <div className="w-full h-full rounded flex items-center justify-center bg-black bg-opacity-70">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🧠</div>
                  <p className="text-cyan-400 font-mono">{/* FUTURISTIC ILLUSTRATION */}VISUALIZATION</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 