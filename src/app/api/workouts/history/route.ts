import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate user_id is present
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate user_id is a valid integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'User ID must be a valid number',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query workouts filtered by userId, ordered by createdAt DESC
    const results = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, parsedUserId))
      .orderBy(desc(workouts.createdAt))
      .limit(limit)
      .offset(offset);

    // workoutData is already parsed as JSON due to { mode: 'json' } in schema
    // No manual parsing needed
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET workouts error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}