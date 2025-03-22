'use client';

import React from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';

const socialLinks = [
  { icon: <FaTwitter size={20} />, label: 'Twitter', href: '#' },
  { icon: <FaLinkedin size={20} />, label: 'LinkedIn', href: '#' },
  { icon: <FaGithub size={20} />, label: 'GitHub', href: '#' },
  { icon: <FaDiscord size={20} />, label: 'Discord', href: '#' },
];

export default function Footer() {
  return (
    <footer className="py-12 px-4 md:px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 cyberpunk-glow">QuantumPoly</h2>
          </div>
          
          <div className="flex justify-center gap-6 mb-8">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                aria-label={link.label}
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
              >
                {link.icon}
              </a>
            ))}
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} QuantumPoly. All rights reserved.</p>
            <p className="mt-2">Building the future, responsibly.</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 