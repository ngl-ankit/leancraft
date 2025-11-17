import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const daysParam = searchParams.get('days') ?? '7';

    // Validate user_id
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'user_id is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'user_id must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate days
    const days = parseInt(daysParam);
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { 
          error: 'days must be a positive integer between 1 and 365',
          code: 'INVALID_DAYS' 
        },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    // Query progress entries within date range
    const entries = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, parsedUserId),
          gte(progress.date, startDateISO),
          lte(progress.date, endDateISO)
        )
      )
      .orderBy(asc(progress.date));

    // Calculate statistics
    const totalEntries = entries.length;

    // Calorie trends
    const calorieTrends = entries
      .filter(entry => entry.caloriesConsumed !== null)
      .map(entry => ({
        date: entry.date,
        calories: entry.caloriesConsumed!
      }));

    // Macro averages
    const entriesWithMacros = entries.filter(
      entry => entry.protein !== null || entry.carbs !== null || entry.fat !== null
    );

    let macroAverages = {
      protein: 0,
      carbs: 0,
      fats: 0
    };

    if (entriesWithMacros.length > 0) {
      const proteinEntries = entries.filter(e => e.protein !== null);
      const carbsEntries = entries.filter(e => e.carbs !== null);
      const fatEntries = entries.filter(e => e.fat !== null);

      const totalProtein = proteinEntries.reduce((sum, e) => sum + (e.protein ?? 0), 0);
      const totalCarbs = carbsEntries.reduce((sum, e) => sum + (e.carbs ?? 0), 0);
      const totalFat = fatEntries.reduce((sum, e) => sum + (e.fat ?? 0), 0);

      macroAverages = {
        protein: proteinEntries.length > 0 ? Math.round((totalProtein / proteinEntries.length) * 10) / 10 : 0,
        carbs: carbsEntries.length > 0 ? Math.round((totalCarbs / carbsEntries.length) * 10) / 10 : 0,
        fats: fatEntries.length > 0 ? Math.round((totalFat / fatEntries.length) * 10) / 10 : 0
      };
    }

    // Weight history
    const weightHistory = entries
      .filter(entry => entry.weight !== null)
      .map(entry => ({
        date: entry.date,
        weight: entry.weight!
      }));

    // Workout completion rate
    let workoutCompletionRate = 0;
    if (totalEntries > 0) {
      const workoutsCompleted = entries.filter(entry => entry.workoutCompleted === 1).length;
      workoutCompletionRate = Math.round((workoutsCompleted / days) * 1000) / 10;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalEntries,
        calorieTrends,
        macroAverages,
        weightHistory,
        workoutCompletionRate
      },
      period: {
        from: startDateISO,
        to: endDateISO,
        days
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}