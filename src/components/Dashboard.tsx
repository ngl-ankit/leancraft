'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Dumbbell, TrendingUp, Target, Flame, Sparkles, RefreshCw, ArrowRight, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  username: string;
  onNavigate: (page: 'dashboard' | 'diet' | 'workout' | 'progress' | 'coach') => void;
}

export default function Dashboard({ username, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      // Load progress stats
      const statsResponse = await fetch(`/api/progress/stats?user_id=${userId}&days=7`);
      const statsData = await statsResponse.json();

      if (statsResponse.ok && statsData.stats) {
        setStats(statsData.stats);
      }

      // Load recent meals
      const mealsResponse = await fetch(`/api/meals/history?user_id=${userId}&limit=3`);
      const mealsData = await mealsResponse.json();

      // Load recent workouts
      const workoutsResponse = await fetch(`/api/workouts/history?user_id=${userId}&limit=3`);
      const workoutsData = await workoutsResponse.json();

      // Combine and sort by created date
      const activities: any[] = [];
      
      if (mealsResponse.ok && mealsData.meals && Array.isArray(mealsData.meals)) {
        mealsData.meals.forEach((meal: any) => {
          activities.push({
            type: 'meal',
            title: `Logged ${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} - ${meal.calories} cal`,
            time: formatTimeAgo(meal.createdAt),
            icon: Utensils,
            createdAt: meal.createdAt,
          });
        });
      }

      if (workoutsResponse.ok && workoutsData.workouts && Array.isArray(workoutsData.workouts)) {
        workoutsData.workouts.forEach((workout: any) => {
          activities.push({
            type: 'workout',
            title: `Completed ${workout.workoutType.charAt(0).toUpperCase() + workout.workoutType.slice(1)} Workout`,
            time: formatTimeAgo(workout.createdAt),
            icon: Dumbbell,
            createdAt: workout.createdAt,
          });
        });
      }

      // Sort by most recent
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const quickActions = [
    {
      title: 'Smart Diet Planner',
      description: 'Generate personalized vegetarian meal plans with macros',
      icon: Utensils,
      color: 'purple',
      gradient: 'from-purple-600 to-purple-800',
      action: () => onNavigate('diet'),
    },
    {
      title: 'Workout Generator',
      description: 'Get custom gym or home workout routines',
      icon: Dumbbell,
      color: 'cyan',
      gradient: 'from-cyan-600 to-cyan-800',
      action: () => onNavigate('workout'),
    },
    {
      title: 'Track Progress',
      description: 'View detailed charts and body measurements',
      icon: TrendingUp,
      color: 'pink',
      gradient: 'from-pink-600 to-pink-800',
      action: () => onNavigate('progress'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron' }}>
            Welcome back, <span className="neon-glow-purple">{username}</span>
          </h1>
          <p className="text-xl text-gray-400 flex items-center space-x-2">
            <span>Let's crush your fitness goals today!</span>
            <Dumbbell className="w-5 h-5 text-purple-400" />
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={loading}
          variant="outline"
          className="glass-card border-white/10 hover:neon-border-purple"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && stats.totalEntries > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card p-6 space-y-3 hover:scale-105 transition-all-smooth cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Flame className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold">
                      {stats.calorieTrends && stats.calorieTrends.length > 0
                        ? Math.round(stats.calorieTrends.reduce((sum: number, day: any) => sum + day.calories, 0) / stats.calorieTrends.length)
                        : 0}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Avg Calories</p>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="glass-card p-6 space-y-3 hover:scale-105 transition-all-smooth cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Target className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold">{stats.macroAverages.protein}g</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Avg Protein</p>
                    <p className="text-xs text-gray-500">Daily average</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="glass-card p-6 space-y-3 hover:scale-105 transition-all-smooth cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Dumbbell className="w-8 h-8 text-pink-400" />
                    <span className="text-2xl font-bold">{stats.workoutCompletionRate}%</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Workout Rate</p>
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="glass-card p-6 space-y-3 hover:scale-105 transition-all-smooth cursor-pointer">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold">
                      {stats.weightHistory && stats.weightHistory.length > 0
                        ? stats.weightHistory[stats.weightHistory.length - 1].weight
                        : 0}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Current Weight</p>
                    <p className="text-xs text-gray-500">
                      {stats.weightHistory && stats.weightHistory.length >= 2
                        ? `${(stats.weightHistory[0].weight - stats.weightHistory[stats.weightHistory.length - 1].weight).toFixed(1)} kg change`
                        : 'Start tracking'}
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`glass-card p-6 space-y-4 cursor-pointer group hover:neon-border-${action.color}`}
                    onClick={action.action}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium text-purple-400 group-hover:translate-x-2 transition-all-smooth">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <Card className="glass-card p-6 space-y-4">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 + idx * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-all-smooth cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center">
                      <activity.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-gray-400">{activity.time}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500" />
                  </motion.div>
                ))}
              </Card>
            </motion.div>
          )}

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card className="glass-card p-8 text-center space-y-4 neon-border-cyan">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto" />
              <blockquote className="text-2xl font-bold neon-glow-cyan" style={{ fontFamily: 'Orbitron' }}>
                "The body achieves what the mind believes"
              </blockquote>
              <p className="text-gray-400 flex items-center justify-center space-x-2">
                <span>Keep pushing your limits!</span>
                <Rocket className="w-5 h-5 text-cyan-400" />
              </p>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}