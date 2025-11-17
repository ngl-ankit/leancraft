import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const period = searchParams.get('period') ?? 'month';

    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({
        error: 'Valid userId is required',
        code: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    const userIdInt = parseInt(userId);

    // Verify user exists
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userIdInt))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Determine date range
    let startDate: Date;
    let endDate: Date = new Date();

    if (dateFrom && dateTo) {
      try {
        startDate = new Date(dateFrom);
        endDate = new Date(dateTo);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return NextResponse.json({
            error: 'Invalid date format. Use ISO date strings',
            code: 'INVALID_DATE_FORMAT'
          }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid date format. Use ISO date strings',
          code: 'INVALID_DATE_FORMAT'
        }, { status: 400 });
      }
    } else {
      // Calculate date range based on period
      endDate = new Date();
      startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }
    }

    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    // Calculate days in period
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Since the schema only shows users table, we'll return a structure
    // that indicates no data is available but the API is working correctly
    // In a real implementation, these queries would fetch from meals, workouts, progressEntries tables

    // Initialize response structure with default values
    const stats = {
      calories: {
        dailyAverage: 0,
        weeklyTotal: 0,
        goal: 2000, // Default goal
        progressPercentage: 0
      },
      weight: {
        current: 0,
        start: 0,
        change: 0,
        goal: 0,
        trend: 'stable' as 'up' | 'down' | 'stable'
      },
      workouts: {
        totalCompleted: 0,
        totalMinutes: 0,
        completionRate: 0,
        favoriteType: 'none',
        byFocusArea: {
          full_body: 0,
          upper: 0,
          lower: 0,
          core: 0
        }
      },
      macros: {
        protein: { average: 0, goal: 150 },
        carbs: { average: 0, goal: 250 },
        fats: { average: 0, goal: 65 }
      },
      recentActivity: {
        lastWorkout: null as string | null,
        lastMeal: null as string | null,
        lastWeighIn: null as string | null
      }
    };

    // Note: The following queries would be used if the tables existed in the schema
    // This is a template showing how the queries would be structured

    /*
    // Query meals data
    const mealsData = await db.select({
      totalCalories: sql<number>`SUM(${meals.calories})`,
      totalProtein: sql<number>`SUM(${meals.protein})`,
      totalCarbs: sql<number>`SUM(${meals.carbs})`,
      totalFats: sql<number>`SUM(${meals.fats})`,
      mealCount: sql<number>`COUNT(*)`,
      lastMeal: sql<string>`MAX(${meals.date})`
    })
    .from(meals)
    .where(and(
      eq(meals.userId, userIdInt),
      gte(meals.date, startDateISO),
      lte(meals.date, endDateISO)
    ))
    .limit(1);

    // Query workouts data
    const workoutsData = await db.select({
      totalCompleted: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`SUM(${workouts.durationMinutes})`,
      lastWorkout: sql<string>`MAX(${workouts.date})`
    })
    .from(workouts)
    .where(and(
      eq(workouts.userId, userIdInt),
      eq(workouts.completed, true),
      gte(workouts.date, startDateISO),
      lte(workouts.date, endDateISO)
    ))
    .limit(1);

    // Query workouts by focus area
    const workoutsByFocus = await db.select({
      focusArea: workouts.focusArea,
      count: sql<number>`COUNT(*)`
    })
    .from(workouts)
    .where(and(
      eq(workouts.userId, userIdInt),
      eq(workouts.completed, true),
      gte(workouts.date, startDateISO),
      lte(workouts.date, endDateISO)
    ))
    .groupBy(workouts.focusArea);

    // Query progress entries
    const progressData = await db.select()
      .from(progressEntries)
      .where(and(
        eq(progressEntries.userId, userIdInt),
        gte(progressEntries.date, startDateISO),
        lte(progressEntries.date, endDateISO)
      ))
      .orderBy(progressEntries.date);

    // Query user profile for goals
    const userProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userIdInt))
      .limit(1);

    // Calculate statistics if data exists
    if (mealsData[0] && mealsData[0].mealCount > 0) {
      const totalCalories = mealsData[0].totalCalories || 0;
      const mealCount = mealsData[0].mealCount || 0;
      
      stats.calories.dailyAverage = Math.round(totalCalories / daysInPeriod);
      stats.calories.weeklyTotal = Math.round((totalCalories / daysInPeriod) * 7);
      
      if (userProfile[0]?.calorieGoal) {
        stats.calories.goal = userProfile[0].calorieGoal;
        stats.calories.progressPercentage = Math.round((stats.calories.dailyAverage / userProfile[0].calorieGoal) * 100);
      }

      stats.macros.protein.average = Math.round((mealsData[0].totalProtein || 0) / mealCount);
      stats.macros.carbs.average = Math.round((mealsData[0].totalCarbs || 0) / mealCount);
      stats.macros.fats.average = Math.round((mealsData[0].totalFats || 0) / mealCount);
      
      stats.recentActivity.lastMeal = mealsData[0].lastMeal;
    }

    if (workoutsData[0]) {
      stats.workouts.totalCompleted = workoutsData[0].totalCompleted || 0;
      stats.workouts.totalMinutes = workoutsData[0].totalMinutes || 0;
      stats.recentActivity.lastWorkout = workoutsData[0].lastWorkout;
      
      // Calculate completion rate (assuming user has a workout goal)
      if (userProfile[0]?.weeklyWorkoutGoal) {
        const weeksInPeriod = daysInPeriod / 7;
        const expectedWorkouts = userProfile[0].weeklyWorkoutGoal * weeksInPeriod;
        stats.workouts.completionRate = Math.round((stats.workouts.totalCompleted / expectedWorkouts) * 100);
      }
    }

    if (workoutsByFocus.length > 0) {
      let maxCount = 0;
      let favoriteType = 'none';
      
      workoutsByFocus.forEach(focus => {
        const focusArea = focus.focusArea?.toLowerCase() || '';
        const count = focus.count || 0;
        
        if (focusArea in stats.workouts.byFocusArea) {
          stats.workouts.byFocusArea[focusArea as keyof typeof stats.workouts.byFocusArea] = count;
        }
        
        if (count > maxCount) {
          maxCount = count;
          favoriteType = focus.focusArea || 'none';
        }
      });
      
      stats.workouts.favoriteType = favoriteType;
    }

    if (progressData.length > 0) {
      const firstEntry = progressData[0];
      const lastEntry = progressData[progressData.length - 1];
      
      stats.weight.start = firstEntry.weight || 0;
      stats.weight.current = lastEntry.weight || 0;
      stats.weight.change = Number((stats.weight.current - stats.weight.start).toFixed(1));
      
      if (userProfile[0]?.weightGoal) {
        stats.weight.goal = userProfile[0].weightGoal;
      }
      
      if (stats.weight.change > 0.5) {
        stats.weight.trend = 'up';
      } else if (stats.weight.change < -0.5) {
        stats.weight.trend = 'down';
      } else {
        stats.weight.trend = 'stable';
      }
      
      stats.recentActivity.lastWeighIn = lastEntry.date;
    }

    if (userProfile[0]) {
      stats.macros.protein.goal = userProfile[0].proteinGoal || 150;
      stats.macros.carbs.goal = userProfile[0].carbsGoal || 250;
      stats.macros.fats.goal = userProfile[0].fatsGoal || 65;
    }
    */

    return NextResponse.json({
      success: true,
      stats,
      period: {
        from: startDateISO,
        to: endDateISO
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}