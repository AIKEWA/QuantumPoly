'use client';

import React from 'react';

export default function Newsletter() {
  return (
    <section className="py-16 px-4 md:px-6 bg-black bg-opacity-90">
      <div className="max-w-3xl mx-auto">
        <div className="p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 cyberpunk-border">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-cyan-400 cyberpunk-glow">
            Stay Connected
          </h2>
          
          <p className="text-center text-gray-400 mb-8">
            Sign up for updates on our journey into the future.
          </p>
          
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
} 