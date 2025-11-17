'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'water' | 'meal' | 'workout' | 'supplement';
}

const iconColors = {
  water: 'text-cyan-400 bg-cyan-500/20',
  meal: 'text-purple-400 bg-purple-500/20',
  workout: 'text-pink-400 bg-pink-500/20',
  supplement: 'text-green-400 bg-green-500/20',
};

const borderColors = {
  water: 'neon-border-cyan',
  meal: 'neon-border-purple',
  workout: 'neon-border-pink',
  supplement: 'border-green-500/50',
};

export default function NotificationDialog({
  isOpen,
  onClose,
  title,
  message,
  type,
}: NotificationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50"
          >
            <div className={`glass-card p-6 rounded-2xl shadow-2xl ${borderColors[type]}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${iconColors[type]} flex items-center justify-center shadow-lg`}
                  >
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm text-gray-400">Reminder Alert</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-base text-gray-200 leading-relaxed">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
