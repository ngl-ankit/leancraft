'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, TrendingUp, Home, Building2, Plus, History, ChevronDown, ChevronUp, CheckCircle2, Flame, Star, Target, Zap, RefreshCw, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function WorkoutGenerator() {
  const [settings, setSettings] = useState({
    workout_type: 'gym',
    duration: '45',
    fitness_level: 'intermediate',
    equipment: '',
    injuries: '',
    goal: 'muscle_gain',
  });
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [todayStats, setTodayStats] = useState<any>(null);

  const coachMessages = [
    "Let's crush this workout!",
    "You're stronger than you think!",
    "Every rep counts - let's go!",
    "Beast mode activated!",
    "Your future self will thank you!",
  ];

  const [coachMessage] = useState(coachMessages[Math.floor(Math.random() * coachMessages.length)]);

  useEffect(() => {
    loadWorkoutHistory();
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) return;

      const response = await fetch(`/api/completions/today?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTodayStats(data.completion);
      }
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const handleWorkoutComplete = async () => {
    setCompletingWorkout(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('Please login to track completions');
        return;
      }

      const response = await fetch('/api/completions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          type: 'workout',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Workout completed! Streak: ${data.streaks.workout} days`, {
          description: "You're crushing it! Keep up the momentum!",
        });
        loadTodayStats();
      } else {
        toast.error(data.error || 'Failed to log workout completion');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to log workout completion');
    } finally {
      setCompletingWorkout(false);
    }
  };

  const loadWorkoutHistory = async () => {
    setLoadingHistory(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('Please login to view workout history');
        return;
      }

      const response = await fetch(`/api/workouts/history?user_id=${userId}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load workout history');
      }

      setHistory(data);
    } catch (error) {
      console.error('Error loading workout history:', error);
      toast.error('Failed to load workout history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateWorkout = async () => {
    setLoading(true);
    setWorkout(null);
    
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('Please login to generate workouts');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          workout_type: settings.workout_type,
          duration: parseInt(settings.duration),
          fitness_level: settings.fitness_level,
          equipment: settings.equipment,
          injuries: settings.injuries,
          goal: settings.goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout');
      }

      if (data.success && data.workout) {
        setWorkout(data.workout);
        toast.success('Workout generated successfully!');
        loadWorkoutHistory();
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast.error('Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center neon-border-cyan">
            <Dumbbell className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold neon-glow-cyan" style={{ fontFamily: 'Orbitron' }}>
            Workout Generator
          </h1>
        </div>
        <p className="text-xl text-gray-400">Dynamic routines powered by AI coaching intelligence</p>
      </motion.div>

      {/* AI Coach Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-6 neon-border-purple">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Your AI Coach says:</p>
              <p className="text-xl font-bold neon-glow-purple">{coachMessage}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's Progress Card */}
      {todayStats && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-card p-6 neon-border-cyan">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Today's Progress</span>
                </h3>
                <p className="text-sm text-gray-400">
                  {todayStats.workoutCompleted ? 'Workout completed!' : 'No workout completed yet'}
                   • {todayStats.workoutStreak} day streak
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-cyan-400">{todayStats.workoutStreak}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Day Streak
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="glass-panel p-2 w-full md:w-auto grid grid-cols-2 md:flex">
          <TabsTrigger value="generate" className="data-[state=active]:glass-card data-[state=active]:neon-border-cyan">
            <Zap className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:glass-card data-[state=active]:neon-border-purple">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-pink-400" />
                <h2 className="text-2xl font-bold">Customize Your Workout</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Workout Type</Label>
                  <Select value={settings.workout_type} onValueChange={(value) => setSettings({ ...settings, workout_type: value })}>
                    <SelectTrigger className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="gym">
                        <div className="flex items-center space-x-2">
                          <Dumbbell className="w-4 h-4" />
                          <span>Gym</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="home">
                        <div className="flex items-center space-x-2">
                          <Home className="w-4 h-4" />
                          <span>Home</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cardio">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Cardio</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="strength">
                        <div className="flex items-center space-x-2">
                          <Dumbbell className="w-4 h-4" />
                          <span>Strength</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Fitness Level</Label>
                  <Select value={settings.fitness_level} onValueChange={(value) => setSettings({ ...settings, fitness_level: value })}>
                    <SelectTrigger className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Duration (min)</Label>
                  <Select value={settings.duration} onValueChange={(value) => setSettings({ ...settings, duration: value })}>
                    <SelectTrigger className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Goal</Label>
                  <Select value={settings.goal} onValueChange={(value) => setSettings({ ...settings, goal: value })}>
                    <SelectTrigger className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Equipment (comma separated)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., dumbbells, barbell"
                    value={settings.equipment}
                    onChange={(e) => setSettings({ ...settings, equipment: e.target.value })}
                    className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Injuries (comma separated)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., knee, shoulder"
                    value={settings.injuries}
                    onChange={(e) => setSettings({ ...settings, injuries: e.target.value })}
                    className="glass-card border-white/10 focus:neon-border-cyan h-12 text-white"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={generateWorkout}
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 neon-border-cyan"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating Workout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Workout
                    </>
                  )}
                </Button>
              </motion.div>
            </Card>
          </motion.div>

          {/* Workout Display */}
          <AnimatePresence>
            {workout && workout.workoutData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Workout Summary */}
                <Card className="glass-card p-6 space-y-4">
                  <h2 className="text-3xl font-bold neon-glow-cyan">
                    {workout.workoutType.charAt(0).toUpperCase() + workout.workoutType.slice(1)} Workout
                  </h2>
                  
                  {/* Completion Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleWorkoutComplete}
                      disabled={completingWorkout || (todayStats && todayStats.workoutCompleted)}
                      className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completingWorkout ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Logging...
                        </>
                      ) : (todayStats && todayStats.workoutCompleted) ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Already Completed Today!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          I Completed This Workout!
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold">{workout.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold">{workout.fitnessLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-lg">
                      <Target className="w-5 h-5 text-pink-400" />
                      <span className="font-semibold">{workout.goal.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Card>

                {/* Warmup Section */}
                {workout.workoutData.warmup && workout.workoutData.warmup.exercises.length > 0 && (
                  <Card className="glass-card p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-purple-400 flex items-center space-x-2">
                      <Flame className="w-6 h-6" />
                      <span>Warm-up ({workout.workoutData.warmup.duration} min)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {workout.workoutData.warmup.exercises.map((exercise: any, idx: number) => (
                        <div key={idx} className="glass-panel p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{exercise.name}</h4>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                          </div>
                          {exercise.duration && (
                            <p className="text-sm text-cyan-400">{Math.floor(exercise.duration / 60)} minutes</p>
                          )}
                          <p className="text-sm text-gray-400">{exercise.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Main Workout Section */}
                {workout.workoutData.main && workout.workoutData.main.exercises.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-400 flex items-center space-x-2">
                      <Dumbbell className="w-6 h-6" />
                      <span>Main Workout ({workout.workoutData.main.duration} min)</span>
                    </h3>
                    {workout.workoutData.main.exercises.map((exercise: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="glass-card p-6 space-y-4 hover:scale-[1.01] transition-all-smooth">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-purple-400">#{idx + 1}</span>
                                <h4 className="text-xl font-bold">{exercise.name}</h4>
                              </div>
                              <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            {exercise.sets && (
                              <div className="glass-panel p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-purple-400">{exercise.sets}</div>
                                <div className="text-sm text-gray-400">Sets</div>
                              </div>
                            )}
                            {exercise.reps && (
                              <div className="glass-panel p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-cyan-400">{exercise.reps}</div>
                                <div className="text-sm text-gray-400">Reps</div>
                              </div>
                            )}
                            {exercise.duration && (
                              <div className="glass-panel p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-cyan-400">{exercise.duration}s</div>
                                <div className="text-sm text-gray-400">Duration</div>
                              </div>
                            )}
                            {exercise.rest_seconds && (
                              <div className="glass-panel p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-pink-400">{exercise.rest_seconds}s</div>
                                <div className="text-sm text-gray-400">Rest</div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-semibold text-gray-300 flex items-center space-x-2">
                              <Target className="w-4 h-4 text-yellow-400" />
                              <span>Pro Tips</span>
                            </h5>
                            <p className="text-gray-400 glass-panel p-3 rounded-lg">{exercise.instructions}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Cooldown Section */}
                {workout.workoutData.cooldown && workout.workoutData.cooldown.exercises.length > 0 && (
                  <Card className="glass-card p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-pink-400 flex items-center space-x-2">
                      <Heart className="w-6 h-6" />
                      <span>Cool-down ({workout.workoutData.cooldown.duration} min)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {workout.workoutData.cooldown.exercises.map((exercise: any, idx: number) => (
                        <div key={idx} className="glass-panel p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{exercise.name}</h4>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                          </div>
                          {exercise.duration && (
                            <p className="text-sm text-cyan-400">{Math.floor(exercise.duration / 60)} minutes</p>
                          )}
                          <p className="text-sm text-gray-400">{exercise.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Workout History</h2>
            <Button
              onClick={loadWorkoutHistory}
              disabled={loadingHistory}
              variant="outline"
              className="glass-card border-white/10 hover:neon-border-cyan"
            >
              {loadingHistory ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : history.length === 0 ? (
            <Card className="glass-card p-12 text-center space-y-4">
              <Dumbbell className="w-16 h-16 text-gray-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-400">No workouts yet</h3>
              <p className="text-gray-500">Generate your first workout to get started!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {history.map((workoutItem, idx) => (
                <motion.div
                  key={workoutItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="glass-card p-4 hover:scale-[1.01] transition-all-smooth">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">
                            {workoutItem.workoutType.charAt(0).toUpperCase() + workoutItem.workoutType.slice(1)} Workout
                          </h3>
                          <p className="text-sm text-gray-400">
                            {new Date(workoutItem.createdAt).toLocaleDateString()} • {workoutItem.goal.replace('_', ' ')}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="glass-panel px-2 py-1 rounded text-xs">
                              {workoutItem.duration} min
                            </span>
                            <span className="glass-panel px-2 py-1 rounded text-xs text-cyan-400">
                              {workoutItem.fitnessLevel}
                            </span>
                            {workoutItem.equipment && (
                              <span className="glass-panel px-2 py-1 rounded text-xs text-purple-400">
                                {workoutItem.equipment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}