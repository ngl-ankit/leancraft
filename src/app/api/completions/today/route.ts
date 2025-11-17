import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyCompletions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Validate user_id parameter
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'user_id parameter is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return NextResponse.json(
        { 
          error: 'user_id must be a valid positive integer',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Query for today's completion record
    const records = await db
      .select()
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, parsedUserId),
          eq(dailyCompletions.date, today)
        )
      )
      .limit(1);

    // If no record exists for today, return default values
    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        completion: {
          userId: parsedUserId,
          date: today,
          mealsCompleted: 0,
          workoutCompleted: false,
          waterCompleted: false,
          supplementsCompleted: false,
          mealStreak: 0,
          workoutStreak: 0,
          waterStreak: 0,
          supplementStreak: 0
        }
      });
    }

    // Record exists, format and return it
    const record = records[0];
    return NextResponse.json({
      success: true,
      completion: {
        id: record.id,
        userId: record.userId,
        date: record.date,
        mealsCompleted: record.mealsCompleted,
        workoutCompleted: Boolean(record.workoutCompleted),
        waterCompleted: Boolean(record.waterCompleted),
        supplementsCompleted: Boolean(record.supplementsCompleted),
        mealStreak: record.mealStreak,
        workoutStreak: record.workoutStreak,
        waterStreak: record.waterStreak,
        supplementStreak: record.supplementStreak,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    });
  } catch (error) {
    console.error('GET /api/completions/today error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}