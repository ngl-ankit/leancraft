import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const ALLOWED_REMINDER_TYPES = ['water', 'meal', 'workout', 'supplement'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

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
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { 
          error: 'User ID must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query reminders filtered by userId, ordered by type
    const results = await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userIdInt))
      .orderBy(asc(reminders.type));

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, enabled, time } = body;

    // Validate required fields
    if (user_id === undefined || !type || enabled === undefined || !time) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: user_id, type, enabled, and time are required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Validate user_id
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

    // Validate type
    if (!ALLOWED_REMINDER_TYPES.includes(type)) {
      return NextResponse.json(
        { 
          error: `type must be one of: ${ALLOWED_REMINDER_TYPES.join(', ')}`,
          code: 'INVALID_REMINDER_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM in 24-hour format)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { 
          error: 'time must be in HH:MM format (24-hour)',
          code: 'INVALID_TIME_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Convert enabled to boolean if needed
    const enabledBool = enabled === true || enabled === 1 || enabled === '1' || enabled === 'true';

    // Check if reminder exists for this user and type
    const existingReminder = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.userId, userId), eq(reminders.type, type)))
      .limit(1);

    const updatedAt = new Date().toISOString();

    if (existingReminder.length > 0) {
      // Update existing reminder
      const updated = await db
        .update(reminders)
        .set({
          enabled: enabledBool,
          time,
          updatedAt
        })
        .where(and(eq(reminders.userId, userId), eq(reminders.type, type)))
        .returning();

      return NextResponse.json(
        {
          success: true,
          reminder: updated[0],
          updated: true
        },
        { status: 200 }
      );
    } else {
      // Insert new reminder
      const newReminder = await db
        .insert(reminders)
        .values({
          userId,
          type,
          enabled: enabledBool,
          time,
          updatedAt
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          reminder: newReminder[0],
          updated: false
        },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error('PUT reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}