'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, TrendingUp, Calendar, Plus, History, ChevronDown, ChevronUp, Flame, Sparkles, RefreshCw, CheckCircle, Check, Apple } from 'lucide-react';
import { toast } from 'sonner';

export default function DietPlanner() {
  const [preferences, setPreferences] = useState({
    calories: '2200',
    protein: '110',
    carbs: '275',
    fats: '73',
    goal: 'maintenance',
    allergies: '',
    preferences: '',
    mealTime: 'breakfast',
  });
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [completingMeal, setCompletingMeal] = useState(false);
  const [todayStats, setTodayStats] = useState<any>(null);

  useEffect(() => {
    loadHistory();
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

  const handleMealComplete = async () => {
    setCompletingMeal(true);
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
          type: 'meal',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Meal logged! Streak: ${data.streaks.meal} days`, {
          description: `You've completed ${data.completion.mealsCompleted} meals today!`,
        });
        loadTodayStats();
      } else {
        toast.error(data.error || 'Failed to log meal completion');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to log meal completion');
    } finally {
      setCompletingMeal(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) return;

      const response = await fetch(`/api/meals/history?user_id=${userId}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        const mealsArray = Array.isArray(data) ? data : (data.meals || []);
        setHistory(mealsArray);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    setMealPlan(null);
    
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('Please login to generate meal plans');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          calories: parseInt(preferences.calories),
          protein: parseInt(preferences.protein),
          carbs: parseInt(preferences.carbs),
          fats: parseInt(preferences.fats),
          goal: preferences.goal,
          allergies: preferences.allergies,
          dietary_preferences: preferences.preferences,
          meal_time: preferences.mealTime,
        }),
      });

      const data = await response.json();

      if (data.success && data.meal) {
        setMealPlan(data.meal);
        toast.success('Meal plan generated successfully!');
        loadHistory();
      } else {
        toast.error(data.error || 'Failed to generate meal plan');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = (calories: string, goal: string) => {
    const cals = parseInt(calories) || 2200;
    let proteinRatio = 0.30, carbRatio = 0.40, fatRatio = 0.30;

    if (goal === 'weight_loss') {
      proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
    } else if (goal === 'muscle_gain') {
      proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25;
    }

    setPreferences({
      ...preferences,
      calories,
      goal,
      protein: Math.round((cals * proteinRatio) / 4).toString(),
      carbs: Math.round((cals * carbRatio) / 4).toString(),
      fats: Math.round((cals * fatRatio) / 9).toString(),
    });
  };

  // Helper function to safely parse items
  const parseItems = (items: any) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch (e) {
        console.error('Error parsing items:', e);
        return [];
      }
    }
    return [];
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center neon-border-purple">
            <Utensils className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
            Smart Diet Planner
          </h1>
        </div>
        <p className="text-xl text-gray-400">AI-powered vegetarian meal plans</p>
      </motion.div>

      {/* Today's Progress Card */}
      {todayStats && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-card p-6 neon-border-purple">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Today's Progress</span>
                </h3>
                <p className="text-sm text-gray-400">
                  {todayStats.mealsCompleted} meals completed • {todayStats.mealStreak} day streak
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-400">{todayStats.mealStreak}</div>
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
        <TabsList className="glass-panel p-2 w-full md:w-auto grid grid-cols-2">
          <TabsTrigger value="generate" className="data-[state=active]:glass-card data-[state=active]:neon-border-purple">
            <Sparkles className="w-4 h-4 mr-2" />Generate
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:glass-card data-[state=active]:neon-border-cyan">
            <History className="w-4 h-4 mr-2" />History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span>Customize Your Plan</span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="calories">Daily Calories</Label>
                  <Input id="calories" type="number" value={preferences.calories}
                    onChange={(e) => calculateMacros(e.target.value, preferences.goal)}
                    className="glass-card border-white/10 h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Select value={preferences.goal} onValueChange={(value) => calculateMacros(preferences.calories, value)}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="weight_loss">Lose Weight</SelectItem>
                      <SelectItem value="maintenance">Maintain</SelectItem>
                      <SelectItem value="muscle_gain">Gain Muscle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mealTime">Meal Time</Label>
                  <Select value={preferences.mealTime} onValueChange={(value) => setPreferences({ ...preferences, mealTime: value })}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input id="protein" type="number" value={preferences.protein}
                    onChange={(e) => setPreferences({ ...preferences, protein: e.target.value })}
                    className="glass-card border-white/10 h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input id="carbs" type="number" value={preferences.carbs}
                    onChange={(e) => setPreferences({ ...preferences, carbs: e.target.value })}
                    className="glass-card border-white/10 h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input id="fats" type="number" value={preferences.fats}
                    onChange={(e) => setPreferences({ ...preferences, fats: e.target.value })}
                    className="glass-card border-white/10 h-12" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input id="allergies" placeholder="e.g., nuts, soy" value={preferences.allergies}
                    onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                    className="glass-card border-white/10 h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences">Preferences</Label>
                  <Input id="preferences" placeholder="e.g., vegan" value={preferences.preferences}
                    onChange={(e) => setPreferences({ ...preferences, preferences: e.target.value })}
                    className="glass-card border-white/10 h-12" />
                </div>
              </div>

              <Button onClick={generateMealPlan} disabled={loading}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-cyan-600">
                {loading ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generating...</> : 
                  <><Sparkles className="w-5 h-5 mr-2" />Generate Meal Plan</>}
              </Button>
            </Card>
          </motion.div>

          <AnimatePresence>
            {mealPlan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{mealPlan.mealName}</h3>
                    <div className="text-2xl font-bold text-cyan-400">{mealPlan.calories} cal</div>
                  </div>
                  
                  {/* Completion Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleMealComplete}
                      disabled={completingMeal}
                      className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/30"
                    >
                      {completingMeal ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Logging...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          I Ate This Meal!
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-400">{mealPlan.protein}g</div>
                      <div className="text-sm text-gray-400">Protein</div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-cyan-400">{mealPlan.carbs}g</div>
                      <div className="text-sm text-gray-400">Carbs</div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-pink-400">{mealPlan.fats}g</div>
                      <div className="text-sm text-gray-400">Fats</div>
                    </div>
                  </div>

                  {mealPlan.items && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Apple className="w-4 h-4 text-green-400" /><span>Items</span>
                      </h4>
                      <div className="space-y-2">
                        {parseItems(mealPlan.items).map((item: any, idx: number) => (
                          <div key={idx} className="glass-panel p-3 rounded-lg flex items-start space-x-2">
                            <Check className="w-4 h-4 text-green-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-gray-400">{item.quantity}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.calories}cal • P:{item.protein}g • C:{item.carbs}g • F:{item.fats}g
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mealPlan.alternatives && (
                    <div className="glass-panel p-4 rounded-xl">
                      <p className="text-sm text-gray-400"><strong>Alternatives:</strong> {mealPlan.alternatives}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Meal History</h2>
            <Button onClick={loadHistory} disabled={loadingHistory} variant="outline"
              className="glass-card border-white/10">
              <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : history.length === 0 ? (
            <Card className="glass-card p-12 text-center space-y-4">
              <Utensils className="w-16 h-16 text-gray-500 mx-auto" />
              <h3 className="text-xl text-gray-400">No meal plans yet</h3>
              <p className="text-gray-500">Generate your first meal plan!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((meal, idx) => (
                <motion.div key={meal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}>
                  <Card className="glass-card p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{meal.mealName}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(meal.createdAt).toLocaleDateString()} • {meal.mealType}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="glass-panel px-2 py-1 rounded text-xs">{meal.calories} cal</span>
                          <span className="glass-panel px-2 py-1 rounded text-xs text-purple-400">P:{meal.protein}g</span>
                          <span className="glass-panel px-2 py-1 rounded text-xs text-cyan-400">C:{meal.carbs}g</span>
                          <span className="glass-panel px-2 py-1 rounded text-xs text-pink-400">F:{meal.fats}g</span>
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