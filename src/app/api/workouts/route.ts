import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and, like, or, gte, lte } from 'drizzle-orm';

const VALID_WORKOUT_TYPES = ['gym', 'home'];
const VALID_FOCUS_AREAS = ['full_body', 'upper', 'lower', 'core'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid workout ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const workout = await db
        .select()
        .from(workouts)
        .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, userIdInt)))
        .limit(1);

      if (workout.length === 0) {
        return NextResponse.json(
          { error: 'Workout not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(workout[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const workoutType = searchParams.get('workoutType');
    const focusArea = searchParams.get('focusArea');
    const difficulty = searchParams.get('difficulty');
    const completedParam = searchParams.get('completed');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let conditions = [eq(workouts.userId, userIdInt)];

    if (workoutType) {
      conditions.push(eq(workouts.workoutType, workoutType));
    }

    if (focusArea) {
      conditions.push(eq(workouts.focusArea, focusArea));
    }

    if (difficulty) {
      conditions.push(eq(workouts.difficulty, difficulty));
    }

    if (completedParam !== null) {
      const completedValue = completedParam === 'true';
      conditions.push(eq(workouts.completed, completedValue));
    }

    if (date) {
      conditions.push(eq(workouts.date, date));
    }

    if (search) {
      conditions.push(like(workouts.workoutName, `%${search}%`));
    }

    const results = await db
      .select()
      .from(workouts)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      workoutName,
      workoutType,
      focusArea,
      difficulty,
      duration,
      exercises,
      completed,
      date,
    } = body;

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!workoutName || typeof workoutName !== 'string' || workoutName.trim() === '') {
      return NextResponse.json(
        { error: 'workoutName is required and must be a non-empty string', code: 'INVALID_WORKOUT_NAME' },
        { status: 400 }
      );
    }

    if (!workoutType || !VALID_WORKOUT_TYPES.includes(workoutType)) {
      return NextResponse.json(
        { error: `workoutType must be one of: ${VALID_WORKOUT_TYPES.join(', ')}`, code: 'INVALID_WORKOUT_TYPE' },
        { status: 400 }
      );
    }

    if (!focusArea || !VALID_FOCUS_AREAS.includes(focusArea)) {
      return NextResponse.json(
        { error: `focusArea must be one of: ${VALID_FOCUS_AREAS.join(', ')}`, code: 'INVALID_FOCUS_AREA' },
        { status: 400 }
      );
    }

    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`, code: 'INVALID_DIFFICULTY' },
        { status: 400 }
      );
    }

    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      return NextResponse.json(
        { error: 'duration is required and must be a positive integer', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'exercises is required and must be a non-empty array', code: 'INVALID_EXERCISES' },
        { status: 400 }
      );
    }

    for (const exercise of exercises) {
      if (!exercise.name || typeof exercise.name !== 'string') {
        return NextResponse.json(
          { error: 'Each exercise must have a valid name', code: 'INVALID_EXERCISE_NAME' },
          { status: 400 }
        );
      }
      if (!exercise.sets || isNaN(parseInt(exercise.sets))) {
        return NextResponse.json(
          { error: 'Each exercise must have valid sets', code: 'INVALID_EXERCISE_SETS' },
          { status: 400 }
        );
      }
      if (!exercise.reps || isNaN(parseInt(exercise.reps))) {
        return NextResponse.json(
          { error: 'Each exercise must have valid reps', code: 'INVALID_EXERCISE_REPS' },
          { status: 400 }
        );
      }
      if (!exercise.rest_time || isNaN(parseInt(exercise.rest_time))) {
        return NextResponse.json(
          { error: 'Each exercise must have valid rest_time', code: 'INVALID_EXERCISE_REST_TIME' },
          { status: 400 }
        );
      }
    }

    const currentTimestamp = new Date().toISOString();
    const workoutDate = date || currentTimestamp;
    const isCompleted = completed !== undefined ? completed : false;

    const newWorkout = await db
      .insert(workouts)
      .values({
        userId: parseInt(userId),
        workoutName: workoutName.trim(),
        workoutType,
        focusArea,
        difficulty,
        duration: parseInt(duration),
        exercises: JSON.stringify(exercises),
        completed: isCompleted,
        date: workoutDate,
        createdAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newWorkout[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workout ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const workoutId = parseInt(id);
    const userIdInt = parseInt(userId);

    const existingWorkout = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userIdInt)))
      .limit(1);

    if (existingWorkout.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      workoutName,
      workoutType,
      focusArea,
      difficulty,
      duration,
      exercises,
      completed,
      date,
    } = body;

    const updates: any = {};

    if (workoutName !== undefined) {
      if (typeof workoutName !== 'string' || workoutName.trim() === '') {
        return NextResponse.json(
          { error: 'workoutName must be a non-empty string', code: 'INVALID_WORKOUT_NAME' },
          { status: 400 }
        );
      }
      updates.workoutName = workoutName.trim();
    }

    if (workoutType !== undefined) {
      if (!VALID_WORKOUT_TYPES.includes(workoutType)) {
        return NextResponse.json(
          { error: `workoutType must be one of: ${VALID_WORKOUT_TYPES.join(', ')}`, code: 'INVALID_WORKOUT_TYPE' },
          { status: 400 }
        );
      }
      updates.workoutType = workoutType;
    }

    if (focusArea !== undefined) {
      if (!VALID_FOCUS_AREAS.includes(focusArea)) {
        return NextResponse.json(
          { error: `focusArea must be one of: ${VALID_FOCUS_AREAS.join(', ')}`, code: 'INVALID_FOCUS_AREA' },
          { status: 400 }
        );
      }
      updates.focusArea = focusArea;
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        return NextResponse.json(
          { error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`, code: 'INVALID_DIFFICULTY' },
          { status: 400 }
        );
      }
      updates.difficulty = difficulty;
    }

    if (duration !== undefined) {
      if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
        return NextResponse.json(
          { error: 'duration must be a positive integer', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
      updates.duration = parseInt(duration);
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return NextResponse.json(
          { error: 'exercises must be a non-empty array', code: 'INVALID_EXERCISES' },
          { status: 400 }
        );
      }

      for (const exercise of exercises) {
        if (!exercise.name || typeof exercise.name !== 'string') {
          return NextResponse.json(
            { error: 'Each exercise must have a valid name', code: 'INVALID_EXERCISE_NAME' },
            { status: 400 }
          );
        }
        if (!exercise.sets || isNaN(parseInt(exercise.sets))) {
          return NextResponse.json(
            { error: 'Each exercise must have valid sets', code: 'INVALID_EXERCISE_SETS' },
            { status: 400 }
          );
        }
        if (!exercise.reps || isNaN(parseInt(exercise.reps))) {
          return NextResponse.json(
            { error: 'Each exercise must have valid reps', code: 'INVALID_EXERCISE_REPS' },
            { status: 400 }
          );
        }
        if (!exercise.rest_time || isNaN(parseInt(exercise.rest_time))) {
          return NextResponse.json(
            { error: 'Each exercise must have valid rest_time', code: 'INVALID_EXERCISE_REST_TIME' },
            { status: 400 }
          );
        }
      }

      updates.exercises = JSON.stringify(exercises);
    }

    if (completed !== undefined) {
      updates.completed = completed;
    }

    if (date !== undefined) {
      updates.date = date;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingWorkout[0], { status: 200 });
    }

    const updatedWorkout = await db
      .update(workouts)
      .set(updates)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userIdInt)))
      .returning();

    return NextResponse.json(updatedWorkout[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workout ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    const workoutId = parseInt(id);
    const userIdInt = parseInt(userId);

    const existingWorkout = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userIdInt)))
      .limit(1);

    if (existingWorkout.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userIdInt)))
      .returning();

    return NextResponse.json(
      {
        message: 'Workout deleted successfully',
        workout: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}