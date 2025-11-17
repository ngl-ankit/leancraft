import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyCompletions } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('user_id');
    const daysParam = searchParams.get('days');

    // Validate user_id
    if (!userIdParam) {
      return NextResponse.json(
        { error: 'user_id is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: 'user_id must be a valid positive integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate and parse days parameter
    let days = 30;
    if (daysParam) {
      days = parseInt(daysParam);
      if (isNaN(days) || days < 1 || days > 365) {
        return NextResponse.json(
          { error: 'days must be a positive integer between 1 and 365', code: 'INVALID_DAYS' },
          { status: 400 }
        );
      }
    }

    // Calculate date range
    const today = new Date();
    const toDate = today.toISOString().split('T')[0];
    const fromDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Query daily completions for user within date range
    const completions = await db
      .select()
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          gte(dailyCompletions.date, fromDate),
          lte(dailyCompletions.date, toDate)
        )
      )
      .orderBy(desc(dailyCompletions.date));

    // Get today's completion record
    const todayRecord = completions.find((c) => c.date === toDate);
    const todayStatus = todayRecord
      ? {
          meals_completed: todayRecord.mealsCompleted,
          workout_completed: todayRecord.workoutCompleted,
          water_completed: todayRecord.waterCompleted,
          supplements_completed: todayRecord.supplementsCompleted,
        }
      : {
          meals_completed: 0,
          workout_completed: false,
          water_completed: false,
          supplements_completed: false,
        };

    // Calculate current streaks (consecutive days from today backwards)
    const calculateStreak = (checkFn: (record: typeof completions[0]) => boolean): number => {
      let streak = 0;
      const sortedCompletions = [...completions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Create a map of dates to completions for easy lookup
      const completionMap = new Map(sortedCompletions.map((c) => [c.date, c]));

      // Start from today and check backwards
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const record = completionMap.get(checkDate);

        if (!record || !checkFn(record)) {
          break;
        }
        streak++;
      }

      return streak;
    };

    const currentStreaks = {
      meal: calculateStreak((r) => r.mealsCompleted > 0),
      workout: calculateStreak((r) => r.workoutCompleted),
      water: calculateStreak((r) => r.waterCompleted),
      supplement: calculateStreak((r) => r.supplementsCompleted),
    };

    // Calculate completion rates
    const totalDays = completions.length > 0 ? days : 0;
    
    const calculateRate = (checkFn: (record: typeof completions[0]) => boolean): number => {
      if (totalDays === 0) return 0;
      const completedDays = completions.filter(checkFn).length;
      return Math.round((completedDays / totalDays) * 1000) / 10;
    };

    const completionRates = {
      meal: calculateRate((r) => r.mealsCompleted > 0),
      workout: calculateRate((r) => r.workoutCompleted),
      water: calculateRate((r) => r.waterCompleted),
      supplement: calculateRate((r) => r.supplementsCompleted),
    };

    // Get recent completions (last 10 records)
    const recentCompletions = completions.slice(0, 10).map((record) => ({
      id: record.id,
      user_id: record.userId,
      date: record.date,
      meals_completed: record.mealsCompleted,
      workout_completed: record.workoutCompleted,
      water_completed: record.waterCompleted,
      supplements_completed: record.supplementsCompleted,
      meal_streak: record.mealStreak,
      workout_streak: record.workoutStreak,
      water_streak: record.waterStreak,
      supplement_streak: record.supplementStreak,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        currentStreaks,
        completionRates,
        recentCompletions,
        todayStatus,
      },
      period: {
        from: fromDate,
        to: toDate,
        days,
      },
    });
  } catch (error) {
    console.error('GET completions stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}