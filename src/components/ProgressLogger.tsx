'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Flame, Dumbbell, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressLoggerProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ProgressLogger({ onSuccess, onClose }: ProgressLoggerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    workoutMinutes: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // Prepare log data
      const logData: any = {
        userId: parseInt(userId),
        date: new Date().toISOString().split('T')[0],
      };

      if (formData.weight) logData.weight = parseFloat(formData.weight);
      if (formData.calories) logData.calories = parseInt(formData.calories);
      if (formData.protein) logData.protein = parseInt(formData.protein);
      if (formData.carbs) logData.carbs = parseInt(formData.carbs);
      if (formData.fats) logData.fats = parseInt(formData.fats);
      if (formData.workoutMinutes) logData.workoutMinutes = parseInt(formData.workoutMinutes);
      if (formData.notes) logData.notes = formData.notes;

      const response = await fetch('/api/progress/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log progress');
      }

      toast.success('Progress logged successfully!');
      onLogSuccess?.();
      
      // Reset form
      setFormData({
        weight: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        workoutMinutes: '',
        notes: '',
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error logging progress:', error);
      toast.error(error.message || 'Failed to log progress');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron' }}>
                Log Progress
              </h2>
              <p className="text-sm text-gray-400">Track your daily fitness data</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Body Metrics */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-cyan-400">
              <Scale className="w-4 h-4" />
              <span>Body Metrics</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm text-gray-300">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 75.5"
                  className="glass-panel border-white/10 focus:neon-border-cyan"
                />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-purple-400">
              <Flame className="w-4 h-4" />
              <span>Nutrition</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-sm text-gray-300">
                  Calories
                </Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="e.g., 2200"
                  className="glass-panel border-white/10 focus:neon-border-purple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm text-gray-300">
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  value={formData.protein}
                  onChange={handleChange}
                  placeholder="e.g., 150"
                  className="glass-panel border-white/10 focus:neon-border-purple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm text-gray-300">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  value={formData.carbs}
                  onChange={handleChange}
                  placeholder="e.g., 250"
                  className="glass-panel border-white/10 focus:neon-border-purple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats" className="text-sm text-gray-300">
                  Fats (g)
                </Label>
                <Input
                  id="fats"
                  name="fats"
                  type="number"
                  value={formData.fats}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                  className="glass-panel border-white/10 focus:neon-border-purple"
                />
              </div>
            </div>
          </div>

          {/* Workout */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-pink-400">
              <Dumbbell className="w-4 h-4" />
              <span>Workout</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workoutMinutes" className="text-sm text-gray-300">
                Workout Duration (minutes)
              </Label>
              <Input
                id="workoutMinutes"
                name="workoutMinutes"
                type="number"
                value={formData.workoutMinutes}
                onChange={handleChange}
                placeholder="e.g., 60"
                className="glass-panel border-white/10 focus:neon-border-pink"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm text-gray-300">
              Notes (optional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="How are you feeling today? Any achievements or challenges?"
              rows={3}
              className="w-full glass-panel border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:neon-border-cyan focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-6 rounded-xl transition-all-smooth"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Log Progress</span>
                </span>
              )}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-8 py-6 border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
}