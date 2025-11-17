'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, LayoutDashboard, Utensils, Dumbbell as WorkoutIcon, TrendingUp, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  username: string;
  onLogout: () => void;
  currentPage: 'dashboard' | 'diet' | 'workout' | 'progress' | 'coach';
  onNavigate: (page: 'dashboard' | 'diet' | 'workout' | 'progress' | 'coach') => void;
}

export default function Navbar({ username, onLogout, currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diet' as const, label: 'Diet', icon: Utensils },
    { id: 'workout' as const, label: 'Workout', icon: WorkoutIcon },
    { id: 'progress' as const, label: 'Progress', icon: TrendingUp },
    { id: 'coach' as const, label: 'Coach', icon: MessageSquare },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 shadow-2xl"
    >
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo with Branding */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl glass-card flex items-center justify-center neon-border-purple shadow-glow-purple">
              <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold neon-glow-purple tracking-wider" style={{ fontFamily: 'Orbitron' }}>
                LeanCraft
              </h1>
              <p className="text-[10px] md:text-xs text-cyan-400/80 font-medium tracking-wide">Fitness Reinvented</p>
            </div>
          </motion.div>

          {/* Nav Items - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl font-medium transition-all-smooth ${
                  currentPage === item.id
                    ? 'glass-card neon-border-purple text-purple-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 glass-card px-3 py-1.5 md:px-4 md:py-2 rounded-xl">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-300">{username}</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="glass-card hover:neon-border-pink hover:bg-pink-500/10 h-8 w-8 md:h-10 md:w-10"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Nav - Compact */}
        <div className="md:hidden flex items-center justify-around mt-2 pt-2 border-t border-white/10">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center space-y-0.5 px-1 py-1 rounded-lg transition-all-smooth ${
                currentPage === item.id
                  ? 'text-purple-400'
                  : 'text-gray-500 hover:text-white'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}