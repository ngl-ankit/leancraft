'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  MessageSquare, 
  Bell, 
  Droplets, 
  Utensils, 
  Dumbbell, 
  Pill,
  Send,
  Sparkles,
  LineChart,
  Activity,
  Target,
  RefreshCw,
  Clock,
  Volume2,
  Vibrate,
  CheckCircle,
  Flame,
  Calendar,
  Award,
  TrendingDown,
  Zap,
  BarChart3,
  PieChart,
  Scale,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Minus,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReminders } from '@/hooks/useReminders';
import NotificationDialog from '@/components/NotificationDialog';

interface ProgressPageProps {
  initialTab?: 'progress' | 'reminders' | 'coach';
}

export default function ProgressPage({ initialTab = 'progress' }: ProgressPageProps) {
  const [reminders, setReminders] = useState({
    water: { enabled: false, time: '09:00' },
    meal: { enabled: false, time: '12:00' },
    workout: { enabled: false, time: '18:00' },
    supplement: { enabled: false, time: '08:00' },
  });
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [loadingCompletionStats, setLoadingCompletionStats] = useState(false);

  // Notification system
  const {
    hasPermission,
    isSupported,
    requestPermission,
    checkReminders,
    playSound,
    vibrate,
  } = useReminders();

  const [notificationDialog, setNotificationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'water' | 'meal' | 'workout' | 'supplement';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'water',
  });

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hey champion! I'm your AI fitness coach with deep knowledge on training, nutrition, recovery, and mindset. Ask me anything - weight loss, muscle building, meal plans, workout techniques, supplements, or motivation. I'm here to help you succeed!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Progress stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadReminders();
    loadProgressStats();
    loadTodayStats();
    loadCompletionStats();
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

  const loadCompletionStats = async () => {
    setLoadingCompletionStats(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) return;

      const response = await fetch(`/api/completions/stats?user_id=${userId}&days=30`);
      const data = await response.json();

      if (response.ok) {
        setCompletionStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading completion stats:', error);
    } finally {
      setLoadingCompletionStats(false);
    }
  };

  const handleActivityComplete = async (type: 'water' | 'supplement') => {
    setCompletingActivity(type);
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
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const icon = type === 'water' ? 'Droplet' : 'Pill';
        const activityName = type === 'water' ? '5L Water' : 'Supplement';
        toast.success(`${activityName} completed successfully!`, {
          description: `Current streak: ${data.streaks[type]} days. Keep up the excellent work!`,
        });
        loadTodayStats();
        loadCompletionStats();
      } else {
        toast.error(data.error || `Failed to complete ${type} activity`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to complete ${type} activity`);
    } finally {
      setCompletingActivity(null);
    }
  };

  // Check reminders every minute
  useEffect(() => {
    const reminderData = [
      {
        type: 'water',
        enabled: reminders.water.enabled,
        time: reminders.water.time,
        title: 'Hydration Time!',
        message: "Time to drink water! Stay hydrated to optimize your performance and recovery.",
      },
      {
        type: 'meal',
        enabled: reminders.meal.enabled,
        time: reminders.meal.time,
        title: 'Meal Time!',
        message: "Time for your meal! Fuel your body with nutritious food to reach your goals.",
      },
      {
        type: 'workout',
        enabled: reminders.workout.enabled,
        time: reminders.workout.time,
        title: 'Workout Time!',
        message: "Time to train! Let's crush this workout and build that strength!",
      },
      {
        type: 'supplement',
        enabled: reminders.supplement.enabled,
        time: reminders.supplement.time,
        title: 'Supplement Time!',
        message: "Time for your supplements! Don't forget to take them for optimal results.",
      },
    ];

    const checkNow = () => {
      checkReminders(reminderData);
      
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      reminderData.forEach((reminder) => {
        if (reminder.enabled && reminder.time === currentTime) {
          setNotificationDialog({
            isOpen: true,
            title: reminder.title,
            message: reminder.message,
            type: reminder.type as 'water' | 'meal' | 'workout' | 'supplement',
          });
        }
      });
    };

    checkNow();
    const interval = setInterval(checkNow, 15000);
    return () => clearInterval(interval);
  }, [reminders, checkReminders]);

  const loadReminders = async () => {
    setLoadingReminders(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) return;

      const response = await fetch(`/api/reminders?user_id=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load reminders');
      }

      const remindersMap: any = {};
      data.forEach((reminder: any) => {
        remindersMap[reminder.type] = {
          enabled: reminder.enabled,
          time: reminder.time,
        };
      });
      setReminders({ ...reminders, ...remindersMap });
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoadingReminders(false);
    }
  };

  const loadProgressStats = async () => {
    setLoadingStats(true);
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) return;

      const response = await fetch(`/api/progress/stats?user_id=${userId}&days=30`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load progress stats');
      }

      setStats(data.stats);
    } catch (error) {
      console.error('Error loading progress stats:', error);
      toast.error('Failed to load progress statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const updateReminder = async (type: string, enabled: boolean, time: string) => {
    try {
      const userId = localStorage.getItem('leancraft_user_id');
      if (!userId) {
        toast.error('Please login to update reminders');
        return;
      }

      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          type,
          enabled,
          time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update reminder');
      }

      toast.success('Reminder updated successfully!');
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
      loadReminders();
    }
  };

  const handleReminderToggle = async (key: string, checked: boolean) => {
    if (checked && !hasPermission && isSupported) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Please enable notifications in your browser settings to receive reminders');
        return;
      }
    }

    const updated = { ...reminders, [key]: { ...reminders[key as keyof typeof reminders], enabled: checked } };
    setReminders(updated);
    updateReminder(key, checked, reminders[key as keyof typeof reminders].time);
  };

  const handleTimeChange = (key: string, time: string) => {
    const updated = { ...reminders, [key]: { ...reminders[key as keyof typeof reminders], time } };
    setReminders(updated);
    if (reminders[key as keyof typeof reminders].enabled) {
      updateReminder(key, true, time);
    }
  };

  const testNotification = () => {
    playSound();
    vibrate();
    setNotificationDialog({
      isOpen: true,
      title: 'Test Notification',
      message: 'This is how your reminders will look and sound!',
      type: 'water',
    });
    toast.success('Test notification triggered!');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    const userMsg = {
      id: chatMessages.length + 1,
      type: 'user',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages([...chatMessages, userMsg]);
    setNewMessage('');
    setSendingMessage(true);

    try {
      const userId = localStorage.getItem('leancraft_user_id');
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          userId: userId ? parseInt(userId) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMsg = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Calculate advanced analytics
  const getAdvancedAnalytics = () => {
    if (!stats || !completionStats) return null;

    // Weekly consistency (last 7 days)
    const last7Days = completionStats.recentCompletions?.slice(0, 7) || [];
    const weeklyConsistency = last7Days.length > 0 
      ? Math.round((last7Days.filter((d: any) => d.workout_completed || d.meals_completed > 0).length / 7) * 100)
      : 0;

    // Best streak
    const bestStreak = Math.max(
      completionStats.currentStreaks.meal,
      completionStats.currentStreaks.workout,
      completionStats.currentStreaks.water,
      completionStats.currentStreaks.supplement
    );

    // Calorie consistency (variation)
    const calorieTrends = stats.calorieTrends || [];
    let calorieConsistency = 0;
    if (calorieTrends.length > 1) {
      const avgCalories = calorieTrends.reduce((sum: number, d: any) => sum + d.calories, 0) / calorieTrends.length;
      const variance = calorieTrends.reduce((sum: number, d: any) => sum + Math.pow(d.calories - avgCalories, 2), 0) / calorieTrends.length;
      const stdDev = Math.sqrt(variance);
      calorieConsistency = Math.max(0, 100 - (stdDev / avgCalories * 100));
    }

    // Weight change trend
    const weightHistory = stats.weightHistory || [];
    let weightTrend = 'stable';
    let weightChange = 0;
    if (weightHistory.length >= 2) {
      const firstWeight = weightHistory[0].weight;
      const lastWeight = weightHistory[weightHistory.length - 1].weight;
      weightChange = lastWeight - firstWeight;
      if (weightChange < -0.5) weightTrend = 'losing';
      else if (weightChange > 0.5) weightTrend = 'gaining';
    }

    // Total activities completed
    const totalActivities = completionStats.recentCompletions?.reduce((sum: number, d: any) => {
      return sum + d.meals_completed + (d.workout_completed ? 1 : 0) + (d.water_completed ? 1 : 0) + (d.supplements_completed ? 1 : 0);
    }, 0) || 0;

    return {
      weeklyConsistency,
      bestStreak,
      calorieConsistency: Math.round(calorieConsistency),
      weightTrend,
      weightChange,
      totalActivities
    };
  };

  const analytics = getAdvancedAnalytics();

  return (
    <div className="container mx-auto px-4 py-8">
      <NotificationDialog
        isOpen={notificationDialog.isOpen}
        onClose={() => setNotificationDialog({ ...notificationDialog, isOpen: false })}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />

      <Tabs defaultValue={initialTab} className="space-y-8">
        <TabsList className="glass-panel p-2 w-full md:w-auto grid grid-cols-3 md:flex">
          <TabsTrigger value="progress" className="data-[state=active]:glass-card data-[state=active]:neon-border-purple text-xs md:text-sm">
            <LineChart className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Progress</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:glass-card data-[state=active]:neon-border-cyan text-xs md:text-sm">
            <Bell className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Reminders</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="coach" className="data-[state=active]:glass-card data-[state=active]:neon-border-pink text-xs md:text-sm">
            <MessageSquare className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">AI Coach</span>
            <span className="sm:hidden">Coach</span>
          </TabsTrigger>
        </TabsList>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center neon-border-purple shadow-lg shadow-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
                    Progress Tracking
                  </h1>
                  <p className="text-sm md:text-xl text-gray-400">Monitor your transformation journey</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  loadProgressStats();
                  loadCompletionStats();
                }}
                disabled={loadingStats || loadingCompletionStats}
                variant="outline"
                className="glass-card border-white/10 hover:neon-border-purple"
              >
                {(loadingStats || loadingCompletionStats) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Loading State */}
          {(loadingCompletionStats || loadingStats) ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
                <p className="text-gray-400">Loading advanced analytics...</p>
              </div>
            </div>
          ) : (completionStats || stats) ? (
            <>
              {/* Advanced Analytics Dashboard */}
              {analytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card className="glass-card p-6 space-y-6 shadow-xl shadow-purple-500/10 neon-border-purple">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                        <span>Advanced Analytics Dashboard</span>
                      </h2>
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <Target className="w-8 h-8 text-green-400" />
                          <Target className="w-10 h-10 text-green-400/30" />
                        </div>
                        <div className="text-3xl font-bold text-green-400">{analytics.weeklyConsistency}%</div>
                        <div className="text-sm text-gray-400">7-Day Consistency</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <Flame className="w-8 h-8 text-orange-400" />
                          <Trophy className="w-10 h-10 text-yellow-400/30" />
                        </div>
                        <div className="text-3xl font-bold text-orange-400">{analytics.bestStreak}</div>
                        <div className="text-sm text-gray-400">Best Active Streak</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <Activity className="w-8 h-8 text-cyan-400" />
                          <Zap className="w-10 h-10 text-cyan-400/30" />
                        </div>
                        <div className="text-3xl font-bold text-cyan-400">{analytics.totalActivities}</div>
                        <div className="text-sm text-gray-400">Total Activities</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <Utensils className="w-8 h-8 text-purple-400" />
                          <Utensils className="w-10 h-10 text-purple-400/30" />
                        </div>
                        <div className="text-3xl font-bold text-purple-400">{analytics.calorieConsistency}%</div>
                        <div className="text-sm text-gray-400">Calorie Consistency</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <Scale className="w-8 h-8 text-pink-400" />
                          {analytics.weightTrend === 'losing' && <TrendingDown className="w-10 h-10 text-green-400/30" />}
                          {analytics.weightTrend === 'gaining' && <TrendingUp className="w-10 h-10 text-orange-400/30" />}
                          {analytics.weightTrend === 'stable' && <ArrowRight className="w-10 h-10 text-pink-400/30" />}
                        </div>
                        <div className="text-3xl font-bold text-pink-400">
                          {analytics.weightChange > 0 ? '+' : ''}{analytics.weightChange.toFixed(1)}kg
                        </div>
                        <div className="text-sm text-gray-400">Weight Change</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                        className="glass-panel p-6 rounded-xl space-y-3 hover:scale-105 transition-all-smooth"
                      >
                        <div className="flex items-center justify-between">
                          <PieChart className="w-8 h-8 text-yellow-400" />
                          <BarChart3 className="w-10 h-10 text-yellow-400/30" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">
                          {Math.round((completionStats?.completionRates.meal + completionStats?.completionRates.workout + completionStats?.completionRates.water + completionStats?.completionRates.supplement) / 4)}%
                        </div>
                        <div className="text-sm text-gray-400">Overall Score</div>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Completion Stats Section */}
              {completionStats && (
                <>
                  {/* Current Streaks */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="glass-card p-6 space-y-6 shadow-xl shadow-orange-500/10 neon-border-pink">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center space-x-2">
                          <Flame className="w-6 h-6 text-orange-400" />
                          <span>Current Streaks</span>
                        </h2>
                        <Award className="w-8 h-8 text-yellow-400" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="glass-panel p-6 rounded-xl space-y-3 text-center hover:scale-105 transition-all-smooth cursor-pointer"
                        >
                          <Utensils className="w-8 h-8 text-purple-400 mx-auto" />
                          <div className="text-4xl font-bold text-purple-400">{completionStats.currentStreaks.meal}</div>
                          <div className="text-sm text-gray-400">Meal Days</div>
                          <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 }}
                          className="glass-panel p-6 rounded-xl space-y-3 text-center hover:scale-105 transition-all-smooth cursor-pointer"
                        >
                          <Dumbbell className="w-8 h-8 text-pink-400 mx-auto" />
                          <div className="text-4xl font-bold text-pink-400">{completionStats.currentStreaks.workout}</div>
                          <div className="text-sm text-gray-400">Workout Days</div>
                          <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="glass-panel p-6 rounded-xl space-y-3 text-center hover:scale-105 transition-all-smooth cursor-pointer"
                        >
                          <Droplets className="w-8 h-8 text-cyan-400 mx-auto" />
                          <div className="text-4xl font-bold text-cyan-400">{completionStats.currentStreaks.water}</div>
                          <div className="text-sm text-gray-400">5 L Water Days</div>
                          <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.35 }}
                          className="glass-panel p-6 rounded-xl space-y-3 text-center hover:scale-105 transition-all-smooth cursor-pointer"
                        >
                          <Pill className="w-8 h-8 text-green-400 mx-auto" />
                          <div className="text-4xl font-bold text-green-400">{completionStats.currentStreaks.supplement}</div>
                          <div className="text-sm text-gray-400">Supplement Days</div>
                          <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Completion Rates */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="glass-card p-6 space-y-6 shadow-xl shadow-cyan-500/10">
                      <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <Target className="w-6 h-6 text-cyan-400" />
                        <span>30-Day Completion Rates</span>
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Meals */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Utensils className="w-5 h-5 text-purple-400" />
                              <span className="font-semibold">Meals</span>
                            </div>
                            <span className="text-2xl font-bold text-purple-400">{completionStats.completionRates.meal}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionStats.completionRates.meal}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-lg shadow-purple-500/50"
                            />
                          </div>
                        </div>

                        {/* Workouts */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Dumbbell className="w-5 h-5 text-pink-400" />
                              <span className="font-semibold">Workouts</span>
                            </div>
                            <span className="text-2xl font-bold text-pink-400">{completionStats.completionRates.workout}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionStats.completionRates.workout}%` }}
                              transition={{ duration: 1, delay: 0.4 }}
                              className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full shadow-lg shadow-pink-500/50"
                            />
                          </div>
                        </div>

                        {/* Water */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Droplets className="w-5 h-5 text-cyan-400" />
                              <span className="font-semibold">5 L Water Intake</span>
                            </div>
                            <span className="text-2xl font-bold text-cyan-400">{completionStats.completionRates.water}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionStats.completionRates.water}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-lg shadow-cyan-500/50"
                            />
                          </div>
                        </div>

                        {/* Supplements */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Pill className="w-5 h-5 text-green-400" />
                              <span className="font-semibold">Supplements</span>
                            </div>
                            <span className="text-2xl font-bold text-green-400">{completionStats.completionRates.supplement}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionStats.completionRates.supplement}%` }}
                              transition={{ duration: 1, delay: 0.6 }}
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-lg shadow-green-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Activity Calendar/History */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="glass-card p-6 space-y-6 shadow-xl shadow-purple-500/10">
                      <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        <span>Recent Activity History</span>
                      </h2>
                      
                      {completionStats.recentCompletions && completionStats.recentCompletions.length > 0 ? (
                        <div className="space-y-3">
                          {completionStats.recentCompletions.map((record: any, idx: number) => (
                            <motion.div
                              key={record.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + idx * 0.05 }}
                              className="glass-panel p-4 rounded-xl hover:bg-white/5 transition-all-smooth"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="font-semibold text-sm">
                                    {new Date(record.date).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {record.meals_completed > 0 && (
                                    <div className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded-full">
                                      <Utensils className="w-3 h-3 text-purple-400" />
                                      <span className="text-xs text-purple-400">{record.meals_completed}</span>
                                    </div>
                                  )}
                                  {record.workout_completed && (
                                    <div className="bg-pink-500/20 p-1 rounded-full">
                                      <Dumbbell className="w-3 h-3 text-pink-400" />
                                    </div>
                                  )}
                                  {record.water_completed && (
                                    <div className="bg-cyan-500/20 p-1 rounded-full">
                                      <Droplets className="w-3 h-3 text-cyan-400" />
                                    </div>
                                  )}
                                  {record.supplements_completed && (
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                      <Pill className="w-3 h-3 text-green-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="text-gray-400">Meals</div>
                                  <div className="font-bold text-purple-400">{record.meals_completed}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Workout</div>
                                  <div className="font-bold text-pink-400">{record.workout_completed ? '✓' : '—'}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">5 L Water</div>
                                  <div className="font-bold text-cyan-400">{record.water_completed ? '✓' : '—'}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Supps</div>
                                  <div className="font-bold text-green-400">{record.supplements_completed ? '✓' : '—'}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No activity history yet. Start tracking today!</p>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* Overall Performance Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="glass-card p-6 space-y-4 shadow-xl shadow-green-500/10">
                      <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <span>Overall Performance</span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-panel p-4 rounded-xl text-center">
                          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-green-400">
                            {Math.round((completionStats.completionRates.meal + completionStats.completionRates.workout + completionStats.completionRates.water + completionStats.completionRates.supplement) / 4)}%
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Average Completion</div>
                        </div>
                        
                        <div className="glass-panel p-4 rounded-xl text-center">
                          <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-orange-400">
                            {Math.max(completionStats.currentStreaks.meal, completionStats.currentStreaks.workout, completionStats.currentStreaks.water, completionStats.currentStreaks.supplement)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Longest Active Streak</div>
                        </div>
                        
                        <div className="glass-panel p-4 rounded-xl text-center">
                          <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-yellow-400">
                            {[completionStats.completionRates.meal, completionStats.completionRates.workout, completionStats.completionRates.water, completionStats.completionRates.supplement].filter(rate => rate >= 80).length}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Goals Above 80%</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </>
              )}

              {/* Progress Stats (Weight, Macros, etc.) */}
              {stats && stats.totalEntries > 0 && (
                <>
                  {/* Weight Progress with Trend */}
                  {stats.weightHistory && stats.weightHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="glass-card p-4 md:p-6 space-y-6 shadow-xl shadow-purple-500/10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
                            <Scale className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
                            <span>Weight Progress & Trends</span>
                          </h2>
                          {stats.weightHistory.length >= 2 && (
                            <div className="text-right">
                              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                                {stats.weightHistory[stats.weightHistory.length - 1].weight} kg
                              </div>
                              <div className={`text-xs md:text-sm font-semibold ${
                                (stats.weightHistory[0].weight - stats.weightHistory[stats.weightHistory.length - 1].weight) > 0 
                                  ? 'text-green-400' 
                                  : 'text-orange-400'
                              }`}>
                                {(stats.weightHistory[0].weight - stats.weightHistory[stats.weightHistory.length - 1].weight) > 0 ? '↓' : '↑'} 
                                {Math.abs(stats.weightHistory[0].weight - stats.weightHistory[stats.weightHistory.length - 1].weight).toFixed(1)} kg
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-end justify-between h-48 md:h-64 border-l-2 border-b-2 border-white/10 pl-2 md:pl-4 pb-4">
                            {stats.weightHistory.map((data: any, idx: number) => {
                              const maxWeight = Math.max(...stats.weightHistory.map((w: any) => w.weight));
                              const minWeight = Math.min(...stats.weightHistory.map((w: any) => w.weight));
                              const range = maxWeight - minWeight || 1;
                              const heightPercent = ((data.weight - minWeight) / range) * 80 + 10;

                              return (
                                <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                                    className="w-full max-w-[40px] md:max-w-[60px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg hover:from-purple-500 hover:to-purple-300 transition-all-smooth cursor-pointer relative group"
                                  >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs md:text-sm whitespace-nowrap">
                                      {data.weight} kg
                                    </div>
                                  </motion.div>
                                  <span className="text-[10px] md:text-xs text-gray-400">
                                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Weight Stats Summary */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="glass-panel p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 mb-1">Starting</div>
                            <div className="text-xl font-bold text-purple-400">{stats.weightHistory[0].weight}kg</div>
                          </div>
                          <div className="glass-panel p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 mb-1">Current</div>
                            <div className="text-xl font-bold text-cyan-400">
                              {stats.weightHistory[stats.weightHistory.length - 1].weight}kg
                            </div>
                          </div>
                          <div className="glass-panel p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 mb-1">Change</div>
                            <div className={`text-xl font-bold ${
                              (stats.weightHistory[0].weight - stats.weightHistory[stats.weightHistory.length - 1].weight) > 0 
                                ? 'text-green-400' 
                                : 'text-orange-400'
                            }`}>
                              {(stats.weightHistory[stats.weightHistory.length - 1].weight - stats.weightHistory[0].weight) > 0 ? '+' : ''}
                              {(stats.weightHistory[stats.weightHistory.length - 1].weight - stats.weightHistory[0].weight).toFixed(1)}kg
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Nutrition & Macro Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="glass-card p-4 md:p-6 space-y-6 shadow-xl shadow-cyan-500/10">
                      <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
                        <PieChart className="w-5 md:w-6 h-5 md:h-6 text-cyan-400" />
                        <span>Nutrition & Macro Breakdown</span>
                      </h2>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 }}
                          className="glass-panel p-3 md:p-4 rounded-xl space-y-2 shadow-lg hover:shadow-purple-500/20 transition-all-smooth"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs md:text-sm text-gray-400">Protein</div>
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-purple-400">{stats.macroAverages.protein}g</div>
                          <div className="text-xs text-gray-500">Avg per day</div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.75 }}
                          className="glass-panel p-3 md:p-4 rounded-xl space-y-2 shadow-lg hover:shadow-cyan-500/20 transition-all-smooth"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs md:text-sm text-gray-400">Carbs</div>
                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.macroAverages.carbs}g</div>
                          <div className="text-xs text-gray-500">Avg per day</div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 }}
                          className="glass-panel p-3 md:p-4 rounded-xl space-y-2 shadow-lg hover:shadow-pink-500/20 transition-all-smooth"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs md:text-sm text-gray-400">Fats</div>
                            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-pink-400">{stats.macroAverages.fats}g</div>
                          <div className="text-xs text-gray-500">Avg per day</div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.85 }}
                          className="glass-panel p-3 md:p-4 rounded-xl space-y-2 shadow-lg hover:shadow-green-500/20 transition-all-smooth"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs md:text-sm text-gray-400">Workouts</div>
                            <Dumbbell className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.workoutCompletionRate}%</div>
                          <div className="text-xs text-gray-500">Completion</div>
                        </motion.div>
                      </div>

                      {/* Macro Distribution Visual */}
                      <div className="glass-panel p-4 rounded-xl space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400">Macro Distribution</h3>
                        <div className="flex h-8 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.macroAverages.protein / (stats.macroAverages.protein + stats.macroAverages.carbs + stats.macroAverages.fats)) * 100}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                            className="bg-purple-500 flex items-center justify-center text-xs font-bold"
                          >
                            P
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.macroAverages.carbs / (stats.macroAverages.protein + stats.macroAverages.carbs + stats.macroAverages.fats)) * 100}%` }}
                            transition={{ duration: 1, delay: 0.95 }}
                            className="bg-cyan-500 flex items-center justify-center text-xs font-bold"
                          >
                            C
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.macroAverages.fats / (stats.macroAverages.protein + stats.macroAverages.carbs + stats.macroAverages.fats)) * 100}%` }}
                            transition={{ duration: 1, delay: 1 }}
                            className="bg-pink-500 flex items-center justify-center text-xs font-bold"
                          >
                            F
                          </motion.div>
                        </div>
                      </div>

                      <div className="glass-panel p-4 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Data Points:</span>
                          <span className="font-semibold">{stats.totalEntries} days tracked</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </>
              )}
            </>
          ) : (
            <Card className="glass-card p-12 text-center space-y-4">
              <Activity className="w-16 h-16 text-gray-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-400">No data yet</h3>
              <p className="text-gray-500">Start tracking your activities and progress to see advanced analytics!</p>
            </Card>
          )}
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center neon-border-cyan shadow-lg shadow-cyan-500/20">
                  <Bell className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold neon-glow-cyan" style={{ fontFamily: 'Orbitron' }}>
                    Smart Reminders
                  </h1>
                  <p className="text-sm md:text-xl text-gray-400">Stay on track with intelligent notifications</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Activity Status */}
          {todayStats && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="glass-card p-6 neon-border-purple">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Today's Activities</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <Droplets className={`w-6 h-6 mx-auto mb-2 ${todayStats.waterCompleted ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <div className="text-xs text-gray-400">5 L Water</div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm font-bold">{todayStats.waterStreak} days</span>
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <Utensils className={`w-6 h-6 mx-auto mb-2 ${todayStats.mealsCompleted > 0 ? 'text-purple-400' : 'text-gray-500'}`} />
                    <div className="text-xs text-gray-400">Meals</div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm font-bold">{todayStats.mealStreak} days</span>
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <Dumbbell className={`w-6 h-6 mx-auto mb-2 ${todayStats.workoutCompleted ? 'text-pink-400' : 'text-gray-500'}`} />
                    <div className="text-xs text-gray-400">Workout</div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm font-bold">{todayStats.workoutStreak} days</span>
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <Pill className={`w-6 h-6 mx-auto mb-2 ${todayStats.supplementsCompleted ? 'text-green-400' : 'text-gray-500'}`} />
                    <div className="text-xs text-gray-400">Supplements</div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm font-bold">{todayStats.supplementStreak} days</span>
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <Card className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Quick Log Activities</span>
            </h3>
            <p className="text-sm text-gray-400">Track your daily activities instantly</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleActivityComplete('water')}
                  disabled={completingActivity === 'water' || (todayStats && todayStats.waterCompleted)}
                  className="w-full h-16 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 disabled:opacity-50"
                >
                  {completingActivity === 'water' ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (todayStats && todayStats.waterCompleted) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      5L Water Completed
                    </>
                  ) : (
                    <>
                      <Droplets className="w-5 h-5 mr-2" />
                      Complete 5L Water Intake
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleActivityComplete('supplement')}
                  disabled={completingActivity === 'supplement' || (todayStats && todayStats.supplementsCompleted)}
                  className="w-full h-16 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/30 disabled:opacity-50"
                >
                  {completingActivity === 'supplement' ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (todayStats && todayStats.supplementsCompleted) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Supplements Completed
                    </>
                  ) : (
                    <>
                      <Pill className="w-5 h-5 mr-2" />
                      Complete Supplement Intake
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>

          {/* Notification Status Card */}
          <Card className="glass-card p-4 md:p-6 space-y-4 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  {hasPermission ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Notifications Enabled</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5 text-yellow-400" />
                      <span>Enable Notifications</span>
                    </>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  {hasPermission
                    ? 'You will receive reminders with sound and vibration'
                    : 'Allow notifications to receive timely reminders'}
                </p>
              </div>
              {!hasPermission && isSupported && (
                <Button
                  onClick={requestPermission}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  Enable
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={testNotification}
                variant="outline"
                size="sm"
                className="glass-card border-white/10 hover:neon-border-cyan"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Notification
              </Button>
              <div className="flex items-center space-x-2 glass-panel px-3 py-2 rounded-lg text-xs">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>Sound</span>
              </div>
              <div className="flex items-center space-x-2 glass-panel px-3 py-2 rounded-lg text-xs">
                <Vibrate className="w-3 h-3 text-purple-400" />
                <span>Vibration</span>
              </div>
              <div className="flex items-center space-x-2 glass-panel px-3 py-2 rounded-lg text-xs">
                <Bell className="w-3 h-3 text-pink-400" />
                <span>Pop-up</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4 md:p-8 space-y-6 shadow-xl shadow-cyan-500/10">
            {[
              { key: 'water', icon: Droplets, title: '5 L Water Intake', desc: 'Stay hydrated with 5 liters daily', color: 'cyan' },
              { key: 'meal', icon: Utensils, title: 'Meal Times', desc: 'Never miss your meals', color: 'purple' },
              { key: 'workout', icon: Dumbbell, title: 'Workout Sessions', desc: 'Time to train and build strength', color: 'pink' },
              { key: 'supplement', icon: Pill, title: 'Supplements', desc: 'Daily supplement reminder', color: 'green' },
            ].map((reminder, idx) => (
              <motion.div
                key={reminder.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 glass-panel rounded-xl hover:bg-white/5 transition-all-smooth shadow-md space-y-3 md:space-y-0"
              >
                <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${reminder.color}-500/20 flex items-center justify-center shadow-lg`}>
                    <reminder.icon className={`w-5 h-5 md:w-6 md:h-6 text-${reminder.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-lg">{reminder.title}</h3>
                    <p className="text-xs md:text-sm text-gray-400">{reminder.desc}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="flex items-center space-x-2 glass-card px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <Input
                      type="time"
                      value={reminders[reminder.key as keyof typeof reminders].time}
                      onChange={(e) => handleTimeChange(reminder.key, e.target.value)}
                      disabled={loadingReminders}
                      className="w-24 h-8 bg-transparent border-none text-sm focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                  <Switch
                    checked={reminders[reminder.key as keyof typeof reminders].enabled}
                    onCheckedChange={(checked) => handleReminderToggle(reminder.key, checked)}
                    disabled={loadingReminders}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </motion.div>
            ))}
          </Card>
        </TabsContent>

        {/* AI Coach Chat Tab */}
        <TabsContent value="coach" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center neon-border-pink shadow-lg shadow-pink-500/20">
                <MessageSquare className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold neon-glow-pink" style={{ fontFamily: 'Orbitron' }}>
                  AI Coach Chat
                </h1>
                <p className="text-sm md:text-xl text-gray-400">Your 24/7 fitness mentor</p>
              </div>
            </div>
          </motion.div>

          <Card className="glass-card h-[500px] md:h-[600px] flex flex-col shadow-xl shadow-pink-500/10">
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/50">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">AI Fitness Coach</h3>
                <p className="text-xs md:text-sm text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Online & Ready
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] space-y-1 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 p-3 md:p-4 rounded-2xl rounded-br-sm shadow-lg shadow-purple-500/30'
                        : 'glass-panel p-3 md:p-4 rounded-2xl rounded-bl-sm shadow-lg'
                    }`}
                  >
                    <p className="text-white text-sm md:text-base leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] md:text-xs text-gray-300 opacity-70">{msg.time}</p>
                  </div>
                </motion.div>
              ))}
              {sendingMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-panel p-3 md:p-4 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-3 md:p-6 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
                  placeholder="Ask your coach anything..."
                  disabled={sendingMessage}
                  className="flex-1 glass-card border-white/10 focus:neon-border-purple h-10 md:h-12 text-sm md:text-base text-white placeholder:text-gray-500"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 neon-border-purple shadow-lg shadow-purple-500/50"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}