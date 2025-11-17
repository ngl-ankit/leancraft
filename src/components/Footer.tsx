'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel border-t border-white/10 mt-auto"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl glass-card flex items-center justify-center neon-border-purple">
              <Dumbbell className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
              LeanCraft
            </h2>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center md:text-left">
            © 2025 LeanCraft. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
