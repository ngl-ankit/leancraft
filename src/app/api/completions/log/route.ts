import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyCompletions } from '@/db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, date } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        error: "type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    // Validate user_id is a positive integer
    if (!Number.isInteger(user_id) || user_id <= 0) {
      return NextResponse.json({ 
        error: "user_id must be a positive integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Validate type
    const validTypes = ['meal', 'workout', 'water', 'supplement'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: "type must be one of: meal, workout, water, supplement",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    // Get or default date
    let targetDate: string;
    if (date) {
      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json({ 
          error: "date must be in YYYY-MM-DD format",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      
      // Validate date is valid
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ 
          error: "date is not a valid date",
          code: "INVALID_DATE" 
        }, { status: 400 });
      }
      
      targetDate = date;
    } else {
      targetDate = new Date().toISOString().split('T')[0];
    }

    // Check if record exists for user_id and date
    const existingRecords = await db.select()
      .from(dailyCompletions)
      .where(and(
        eq(dailyCompletions.userId, user_id),
        eq(dailyCompletions.date, targetDate)
      ))
      .limit(1);

    let completionRecord;
    const now = new Date().toISOString();

    if (existingRecords.length > 0) {
      // Update existing record
      const existing = existingRecords[0];
      const updates: any = {
        updatedAt: now
      };

      // Update based on type
      switch (type) {
        case 'meal':
          updates.mealsCompleted = (existing.mealsCompleted || 0) + 1;
          break;
        case 'workout':
          updates.workoutCompleted = true;
          break;
        case 'water':
          updates.waterCompleted = true;
          break;
        case 'supplement':
          updates.supplementsCompleted = true;
          break;
      }

      const updated = await db.update(dailyCompletions)
        .set(updates)
        .where(and(
          eq(dailyCompletions.userId, user_id),
          eq(dailyCompletions.date, targetDate)
        ))
        .returning();

      completionRecord = updated[0];
    } else {
      // Create new record
      const newRecord: any = {
        userId: user_id,
        date: targetDate,
        mealsCompleted: 0,
        workoutCompleted: false,
        waterCompleted: false,
        supplementsCompleted: false,
        mealStreak: 0,
        workoutStreak: 0,
        waterStreak: 0,
        supplementStreak: 0,
        createdAt: now,
        updatedAt: now
      };

      // Set based on type
      switch (type) {
        case 'meal':
          newRecord.mealsCompleted = 1;
          break;
        case 'workout':
          newRecord.workoutCompleted = true;
          break;
        case 'water':
          newRecord.waterCompleted = true;
          break;
        case 'supplement':
          newRecord.supplementsCompleted = true;
          break;
      }

      const inserted = await db.insert(dailyCompletions)
        .values(newRecord)
        .returning();

      completionRecord = inserted[0];
    }

    // Calculate streaks
    const allCompletions = await db.select()
      .from(dailyCompletions)
      .where(eq(dailyCompletions.userId, user_id))
      .orderBy(desc(dailyCompletions.date));

    // Helper function to calculate streak for a specific type
    const calculateStreak = (completions: any[], targetDate: string, checkField: string): number => {
      let streak = 0;
      let currentDate = new Date(targetDate);
      
      for (let i = 0; i < completions.length; i++) {
        const completion = completions[i];
        const completionDate = completion.date;
        const expectedDate = currentDate.toISOString().split('T')[0];
        
        if (completionDate !== expectedDate) {
          // Date gap found
          break;
        }
        
        // Check if activity completed
        let isCompleted = false;
        if (checkField === 'mealsCompleted') {
          isCompleted = (completion[checkField] || 0) > 0;
        } else {
          isCompleted = completion[checkField] === true || completion[checkField] === 1;
        }
        
        if (isCompleted) {
          streak++;
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    };

    const mealStreak = calculateStreak(allCompletions, targetDate, 'mealsCompleted');
    const workoutStreak = calculateStreak(allCompletions, targetDate, 'workoutCompleted');
    const waterStreak = calculateStreak(allCompletions, targetDate, 'waterCompleted');
    const supplementStreak = calculateStreak(allCompletions, targetDate, 'supplementsCompleted');

    // Update streaks in the record
    const finalRecord = await db.update(dailyCompletions)
      .set({
        mealStreak,
        workoutStreak,
        waterStreak,
        supplementStreak,
        updatedAt: now
      })
      .where(and(
        eq(dailyCompletions.userId, user_id),
        eq(dailyCompletions.date, targetDate)
      ))
      .returning();

    return NextResponse.json({
      success: true,
      completion: finalRecord[0],
      streaks: {
        meal: mealStreak,
        workout: workoutStreak,
        water: waterStreak,
        supplement: supplementStreak
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}