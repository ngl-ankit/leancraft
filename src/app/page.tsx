'use client';

import { useState, useEffect } from 'react';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';
import DietPlanner from '@/components/DietPlanner';
import WorkoutGenerator from '@/components/WorkoutGenerator';
import ProgressPage from '@/components/ProgressPage';
import Footer from '@/components/Footer';

export default function Home() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'diet' | 'workout' | 'progress' | 'coach'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('leancraft_user_id');
    const storedUsername = localStorage.getItem('leancraft_username');
    
    if (storedUserId && storedUsername) {
      setUser({
        id: parseInt(storedUserId),
        username: storedUsername
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userId: number, username: string) => {
    const userData = { id: userId, username };
    setUser(userData);
    localStorage.setItem('leancraft_user_id', userId.toString());
    localStorage.setItem('leancraft_username', username);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    // Clear all user data
    localStorage.clear();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient bg-grid-pattern flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen animated-gradient bg-grid-pattern">
      <Navbar 
        username={user.username} 
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <main className="pt-32 md:pt-28 pb-8 px-2">
        {currentPage === 'dashboard' && <Dashboard username={user.username} onNavigate={setCurrentPage} />}
        {currentPage === 'diet' && <DietPlanner />}
        {currentPage === 'workout' && <WorkoutGenerator />}
        {currentPage === 'progress' && <ProgressPage initialTab="progress" />}
        {currentPage === 'coach' && <ProgressPage initialTab="coach" />}
      </main>
      <Footer />
    </div>
  );
}