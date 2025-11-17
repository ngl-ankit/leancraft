import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Sparkles, TrendingUp, User, Mail, Lock, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onLogin: (userId: number, username: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: formData.email || formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Login failed. Please check your credentials.');
          setIsLoading(false);
          return;
        }

        if (data.success && data.user) {
          onLogin(data.user.id, data.user.username);
        }
      } else {
        // Signup - validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (!formData.username.trim()) {
          setError('Please enter a username');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.code === 'DUPLICATE_EMAIL') {
            setError('This email is already registered. Please login instead.');
          } else if (data.code === 'DUPLICATE_USERNAME') {
            setError('This username is already taken. Please choose another.');
          } else {
            setError(data.error || 'Registration failed. Please try again.');
          }
          setIsLoading(false);
          return;
        }

        if (data.success && data.user) {
          onLogin(data.user.id, data.user.username);
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen w-full animated-gradient bg-grid-pattern flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-col space-y-8"
        >
          <div className="space-y-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center neon-border-purple">
                <Dumbbell className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-5xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
                LeanCraft
              </h1>
            </motion.div>
            <p className="text-xl text-gray-400">
              Your AI-Powered Fitness Revolution
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Sparkles, title: 'Smart AI Coaching', desc: 'Personalized guidance that adapts to your progress', color: 'purple' },
              { icon: TrendingUp, title: 'Vegetarian Meal Plans', desc: 'Macro-optimized nutrition for peak performance', color: 'cyan' },
              { icon: Dumbbell, title: 'Dynamic Workouts', desc: 'Gym & home routines with animated previews', color: 'pink' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                className="glass-card p-6 rounded-2xl space-y-2 cursor-pointer transition-all-smooth hover:bg-white/5"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-${feature.color}-500/20 neon-border-${feature.color}`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-400 pl-12">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-panel p-8 md:p-12 rounded-3xl space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center neon-border-purple">
              <Dumbbell className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold neon-glow-purple" style={{ fontFamily: 'Orbitron' }}>
              LeanCraft
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Orbitron' }}>
              {isLogin ? 'Welcome Back' : 'Start Your Journey'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Login to continue your transformation' : 'Create your account and level up'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex space-x-2 p-1 glass-card rounded-xl">
            <button
              type="button"
              onClick={() => isLogin ? null : toggleMode()}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all-smooth ${
                isLogin
                  ? 'bg-purple-600 text-white neon-border-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => !isLogin ? null : toggleMode()}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all-smooth ${
                !isLogin
                  ? 'bg-cyan-600 text-white neon-border-cyan'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-12 glass-card border-white/10 focus:neon-border-purple h-12 text-white placeholder:text-gray-500"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 glass-card border-white/10 focus:neon-border-cyan h-12 text-white placeholder:text-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 glass-card border-white/10 focus:neon-border-pink h-12 text-white placeholder:text-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-12 glass-card border-white/10 focus:neon-border-pink h-12 text-white placeholder:text-gray-500"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 neon-border-purple disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                  </span>
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors disabled:opacity-50"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}