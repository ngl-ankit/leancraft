'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Reminder {
  type: string;
  enabled: boolean;
  time: string;
  title: string;
  message: string;
}

export function useReminders() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notifiedToday = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setHasPermission(Notification.permission === 'granted');
    }

    // Initialize Web Audio API for generating beep sound
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Reset notified set at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      notifiedToday.current.clear();
      // Set up daily reset
      setInterval(() => {
        notifiedToday.current.clear();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const playSound = useCallback(() => {
    // Generate a pleasant notification beep using Web Audio API
    if (!audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
      const currentTime = context.currentTime;

      // Create oscillator for the beep sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Pleasant notification tone (two-tone beep)
      oscillator.frequency.setValueAtTime(800, currentTime);
      oscillator.frequency.setValueAtTime(600, currentTime + 0.1);

      // Volume envelope (fade in/out)
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.3);

      console.log('🔊 Notification sound played');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      // Vibrate pattern: vibrate for 200ms, pause 100ms, vibrate 200ms
      navigator.vibrate([200, 100, 200]);
      console.log('📳 Vibration triggered');
    }
  }, []);

  const showNotification = useCallback(
    async (title: string, message: string, type: string) => {
      console.log(`🔔 Notification triggered: ${title} at ${new Date().toLocaleTimeString()}`);
      
      // Play sound and vibrate
      playSound();
      vibrate();

      // Show browser notification if permission granted
      if (hasPermission && isSupported) {
        try {
          const notification = new Notification(title, {
            body: message,
            icon: '/icon.png',
            badge: '/icon.png',
            tag: `reminder-${type}`,
            requireInteraction: false,
            silent: false,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto-close after 10 seconds
          setTimeout(() => {
            notification.close();
          }, 10000);
          
          console.log('✅ Browser notification shown');
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      } else {
        console.log('⚠️ Browser notifications not enabled - only sound/vibration/popup will show');
      }

      return true;
    },
    [hasPermission, isSupported, playSound, vibrate]
  );

  const checkReminders = useCallback(
    (reminders: Reminder[]) => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      reminders.forEach((reminder) => {
        if (!reminder.enabled) return;

        const notificationKey = `${reminder.type}-${currentTime}`;
        
        // Check if this reminder has already been shown today
        if (notifiedToday.current.has(notificationKey)) {
          return;
        }

        // Check if current time matches reminder time
        if (reminder.time === currentTime) {
          notifiedToday.current.add(notificationKey);
          showNotification(reminder.title, reminder.message, reminder.type);
          
          console.log(`🔔 Reminder triggered: ${reminder.title} at ${currentTime}`);
        }
      });
    },
    [showNotification]
  );

  return {
    hasPermission,
    isSupported,
    requestPermission,
    checkReminders,
    showNotification,
    playSound,
    vibrate,
  };
}