'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar, Scale, Flame, Beef, Cookie, Droplets, Dumbbell, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressLogFormProps {
  onSuccess?: () => void;
}

export default function ProgressLogForm({ onSuccess }: ProgressLogFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    workoutCompleted: false,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('leancraft_user_id');
    if (!userId) {
      toast.error('Please log in to track progress');
      return;
    }

    // Validate at least one field is filled
    if (!formData.weight && !formData.calories && !formData.protein && !formData.carbs && !formData.fats && !formData.workoutCompleted && !formData.notes) {
      toast.error('Please fill in at least one field');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        user_id: parseInt(userId),
        date: formData.date,
      };

      // Only include fields that have values
      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.calories) payload.calories = parseInt(formData.calories);
      if (formData.protein) payload.protein = parseInt(formData.protein);
      if (formData.carbs) payload.carbs = parseInt(formData.carbs);
      if (formData.fats) payload.fats = parseInt(formData.fats);
      if (formData.workoutCompleted) payload.workout_completed = formData.workoutCompleted;
      if (formData.notes.trim()) payload.notes = formData.notes.trim();

      const response = await fetch('/api/progress/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log progress');
      }

      toast.success(data.created ? 'Progress logged successfully!' : 'Progress updated successfully!');
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        workoutCompleted: false,
        notes: '',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-card p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
            Log Your Progress
          </h2>
          <p className="text-gray-400">Track your daily fitness metrics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Date</span>
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="glass-card border-white/10 focus:neon-border-purple"
              required
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Weight (kg)</span>
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g., 75.5"
              value={formData.weight}
              onChange={handleChange}
              className="glass-card border-white/10 focus:neon-border-cyan"
            />
          </div>

          {/* Macros Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Nutrition</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Calories */}
              <div className="space-y-2">
                <Label htmlFor="calories" className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Calories</span>
                </Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  placeholder="e.g., 2000"
                  value={formData.calories}
                  onChange={handleChange}
                  className="glass-card border-white/10 focus:neon-border-orange"
                />
              </div>

              {/* Protein */}
              <div className="space-y-2">
                <Label htmlFor="protein" className="flex items-center space-x-2">
                  <Beef className="w-4 h-4 text-red-400" />
                  <span>Protein (g)</span>
                </Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  min="0"
                  placeholder="e.g., 150"
                  value={formData.protein}
                  onChange={handleChange}
                  className="glass-card border-white/10 focus:neon-border-red"
                />
              </div>

              {/* Carbs */}
              <div className="space-y-2">
                <Label htmlFor="carbs" className="flex items-center space-x-2">
                  <Cookie className="w-4 h-4 text-yellow-400" />
                  <span>Carbs (g)</span>
                </Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  placeholder="e.g., 200"
                  value={formData.carbs}
                  onChange={handleChange}
                  className="glass-card border-white/10 focus:neon-border-yellow"
                />
              </div>

              {/* Fats */}
              <div className="space-y-2">
                <Label htmlFor="fats" className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Fats (g)</span>
                </Label>
                <Input
                  id="fats"
                  name="fats"
                  type="number"
                  min="0"
                  placeholder="e.g., 60"
                  value={formData.fats}
                  onChange={handleChange}
                  className="glass-card border-white/10 focus:neon-border-blue"
                />
              </div>
            </div>
          </div>

          {/* Workout Completed */}
          <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-5 h-5 text-pink-400" />
              <div>
                <Label htmlFor="workoutCompleted" className="text-base font-semibold">
                  Workout Completed
                </Label>
                <p className="text-sm text-gray-400">Mark if you finished today's workout</p>
              </div>
            </div>
            <Switch
              id="workoutCompleted"
              checked={formData.workoutCompleted}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, workoutCompleted: checked }))
              }
              className="data-[state=checked]:bg-pink-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="How did you feel today? Any achievements or challenges?"
              value={formData.notes}
              onChange={handleChange}
              className="glass-card border-white/10 focus:neon-border-purple min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Logging Progress...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Log Progress
              </>
            )}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}