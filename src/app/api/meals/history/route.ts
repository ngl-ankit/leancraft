import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const limitParam = searchParams.get('limit') ?? '20';
    const offsetParam = searchParams.get('offset') ?? '0';

    // Validate user_id is required
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'user_id is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate user_id is a valid integer
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { 
          error: 'user_id must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate and parse limit
    const limit = parseInt(limitParam);
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { 
          error: 'limit must be a positive integer',
          code: 'INVALID_LIMIT' 
        },
        { status: 400 }
      );
    }

    // Cap limit at 100
    const finalLimit = Math.min(limit, 100);

    // Validate and parse offset
    const offset = parseInt(offsetParam);
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: 'offset must be a non-negative integer',
          code: 'INVALID_OFFSET' 
        },
        { status: 400 }
      );
    }

    // Query database for meals
    const mealsList = await db
      .select()
      .from(meals)
      .where(eq(meals.userId, userIdInt))
      .orderBy(desc(meals.createdAt))
      .limit(finalLimit)
      .offset(offset);

    // Transform the results to match the response format
    const formattedMeals = mealsList.map(meal => ({
      id: meal.id,
      userId: meal.userId,
      mealName: meal.mealName,
      mealType: meal.mealType,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
      alternatives: meal.alternatives,
      date: meal.date,
      createdAt: meal.createdAt
    }));

    return NextResponse.json(
      {
        success: true,
        meals: formattedMeals,
        count: formattedMeals.length,
        limit: finalLimit,
        offset: offset
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET meal history error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}