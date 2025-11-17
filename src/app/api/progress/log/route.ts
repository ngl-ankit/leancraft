import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      date, 
      weight, 
      calories, 
      protein, 
      carbs, 
      fats, 
      workout_completed, 
      notes 
    } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { 
          error: 'user_id is required',
          code: 'MISSING_USER_ID' 
        }, 
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { 
          error: 'date is required',
          code: 'MISSING_DATE' 
        }, 
        { status: 400 }
      );
    }

    // Validate user_id is a positive integer
    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { 
          error: 'user_id must be a valid positive integer',
          code: 'INVALID_USER_ID' 
        }, 
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { 
          error: 'date must be in ISO format (YYYY-MM-DD)',
          code: 'INVALID_DATE_FORMAT' 
        }, 
        { status: 400 }
      );
    }

    // Validate date is a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { 
          error: 'date must be a valid date',
          code: 'INVALID_DATE' 
        }, 
        { status: 400 }
      );
    }

    // Validate numeric values are positive if provided
    if (weight !== undefined && weight !== null) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        return NextResponse.json(
          { 
            error: 'weight must be a positive number',
            code: 'INVALID_WEIGHT' 
          }, 
          { status: 400 }
        );
      }
    }

    if (calories !== undefined && calories !== null) {
      const caloriesNum = parseInt(calories);
      if (isNaN(caloriesNum) || caloriesNum <= 0) {
        return NextResponse.json(
          { 
            error: 'calories must be a positive integer',
            code: 'INVALID_CALORIES' 
          }, 
          { status: 400 }
        );
      }
    }

    if (protein !== undefined && protein !== null) {
      const proteinNum = parseInt(protein);
      if (isNaN(proteinNum) || proteinNum <= 0) {
        return NextResponse.json(
          { 
            error: 'protein must be a positive integer',
            code: 'INVALID_PROTEIN' 
          }, 
          { status: 400 }
        );
      }
    }

    if (carbs !== undefined && carbs !== null) {
      const carbsNum = parseInt(carbs);
      if (isNaN(carbsNum) || carbsNum <= 0) {
        return NextResponse.json(
          { 
            error: 'carbs must be a positive integer',
            code: 'INVALID_CARBS' 
          }, 
          { status: 400 }
        );
      }
    }

    if (fats !== undefined && fats !== null) {
      const fatsNum = parseInt(fats);
      if (isNaN(fatsNum) || fatsNum <= 0) {
        return NextResponse.json(
          { 
            error: 'fats must be a positive integer',
            code: 'INVALID_FATS' 
          }, 
          { status: 400 }
        );
      }
    }

    // Validate workout_completed is boolean if provided
    if (workout_completed !== undefined && workout_completed !== null) {
      if (typeof workout_completed !== 'boolean') {
        return NextResponse.json(
          { 
            error: 'workout_completed must be a boolean',
            code: 'INVALID_WORKOUT_COMPLETED' 
          }, 
          { status: 400 }
        );
      }
    }

    // Check if entry already exists for this user and date
    const existingEntry = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.date, date)))
      .limit(1);

    // Prepare data object with field mapping
    const progressData: {
      weight?: number;
      caloriesConsumed?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      workoutCompleted?: number;
      notes?: string;
    } = {};

    if (weight !== undefined && weight !== null) {
      progressData.weight = parseFloat(weight);
    }
    if (calories !== undefined && calories !== null) {
      progressData.caloriesConsumed = parseInt(calories);
    }
    if (protein !== undefined && protein !== null) {
      progressData.protein = parseInt(protein);
    }
    if (carbs !== undefined && carbs !== null) {
      progressData.carbs = parseInt(carbs);
    }
    if (fats !== undefined && fats !== null) {
      progressData.fat = parseInt(fats);
    }
    if (workout_completed !== undefined && workout_completed !== null) {
      progressData.workoutCompleted = workout_completed ? 1 : 0;
    }
    if (notes !== undefined && notes !== null) {
      progressData.notes = notes.trim();
    }

    let entry;
    let created = false;

    if (existingEntry.length > 0) {
      // Update existing entry
      const updated = await db
        .update(progress)
        .set(progressData)
        .where(and(eq(progress.userId, userId), eq(progress.date, date)))
        .returning();

      entry = updated[0];
      created = false;
    } else {
      // Create new entry
      const insertData = {
        userId,
        date,
        ...progressData,
      };

      const inserted = await db
        .insert(progress)
        .values(insertData)
        .returning();

      entry = inserted[0];
      created = true;
    }

    // Convert workoutCompleted back to boolean for response
    const responseEntry = {
      ...entry,
      workoutCompleted: entry.workoutCompleted === 1 ? true : entry.workoutCompleted === 0 ? false : null,
    };

    return NextResponse.json(
      {
        success: true,
        entry: responseEntry,
        created,
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    console.error('POST progress error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}