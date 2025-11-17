import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'Valid userId is required',
        code: 'INVALID_USER_ID' 
      }, { status: 400 });
    }

    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, parseInt(userId)))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found for this user',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      caloriesGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal,
      weightGoal,
      fitnessLevel,
      allergies,
      dietaryPreferences,
      workoutTimeAvailable,
      equipmentAvailable,
      injuries
    } = body;

    // Validate required userId
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'Valid userId is required',
        code: 'INVALID_USER_ID' 
      }, { status: 400 });
    }

    // Check if profile already exists for this user
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, parseInt(userId)))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: 'Profile already exists for this user',
        code: 'PROFILE_ALREADY_EXISTS' 
      }, { status: 400 });
    }

    // Validate fitnessLevel if provided
    if (fitnessLevel && !VALID_FITNESS_LEVELS.includes(fitnessLevel)) {
      return NextResponse.json({ 
        error: 'fitnessLevel must be one of: beginner, intermediate, advanced',
        code: 'INVALID_FITNESS_LEVEL' 
      }, { status: 400 });
    }

    // Validate goal values are positive if provided
    if (caloriesGoal !== undefined && caloriesGoal !== null && caloriesGoal <= 0) {
      return NextResponse.json({ 
        error: 'caloriesGoal must be a positive number',
        code: 'INVALID_CALORIES_GOAL' 
      }, { status: 400 });
    }

    if (proteinGoal !== undefined && proteinGoal !== null && proteinGoal <= 0) {
      return NextResponse.json({ 
        error: 'proteinGoal must be a positive number',
        code: 'INVALID_PROTEIN_GOAL' 
      }, { status: 400 });
    }

    if (carbsGoal !== undefined && carbsGoal !== null && carbsGoal <= 0) {
      return NextResponse.json({ 
        error: 'carbsGoal must be a positive number',
        code: 'INVALID_CARBS_GOAL' 
      }, { status: 400 });
    }

    if (fatsGoal !== undefined && fatsGoal !== null && fatsGoal <= 0) {
      return NextResponse.json({ 
        error: 'fatsGoal must be a positive number',
        code: 'INVALID_FATS_GOAL' 
      }, { status: 400 });
    }

    if (weightGoal !== undefined && weightGoal !== null && weightGoal <= 0) {
      return NextResponse.json({ 
        error: 'weightGoal must be a positive number',
        code: 'INVALID_WEIGHT_GOAL' 
      }, { status: 400 });
    }

    if (workoutTimeAvailable !== undefined && workoutTimeAvailable !== null && workoutTimeAvailable <= 0) {
      return NextResponse.json({ 
        error: 'workoutTimeAvailable must be a positive number',
        code: 'INVALID_WORKOUT_TIME' 
      }, { status: 400 });
    }

    // Validate allergies is array if provided
    if (allergies !== undefined && allergies !== null && !Array.isArray(allergies)) {
      return NextResponse.json({ 
        error: 'allergies must be an array',
        code: 'INVALID_ALLERGIES_FORMAT' 
      }, { status: 400 });
    }

    // Validate equipmentAvailable is array if provided
    if (equipmentAvailable !== undefined && equipmentAvailable !== null && !Array.isArray(equipmentAvailable)) {
      return NextResponse.json({ 
        error: 'equipmentAvailable must be an array',
        code: 'INVALID_EQUIPMENT_FORMAT' 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const insertData: any = {
      userId: parseInt(userId),
      createdAt: now,
      updatedAt: now
    };

    if (caloriesGoal !== undefined && caloriesGoal !== null) insertData.caloriesGoal = caloriesGoal;
    if (proteinGoal !== undefined && proteinGoal !== null) insertData.proteinGoal = proteinGoal;
    if (carbsGoal !== undefined && carbsGoal !== null) insertData.carbsGoal = carbsGoal;
    if (fatsGoal !== undefined && fatsGoal !== null) insertData.fatsGoal = fatsGoal;
    if (weightGoal !== undefined && weightGoal !== null) insertData.weightGoal = weightGoal;
    if (fitnessLevel) insertData.fitnessLevel = fitnessLevel;
    if (allergies !== undefined && allergies !== null) insertData.allergies = JSON.stringify(allergies);
    if (dietaryPreferences) insertData.dietaryPreferences = dietaryPreferences.trim();
    if (workoutTimeAvailable !== undefined && workoutTimeAvailable !== null) insertData.workoutTimeAvailable = workoutTimeAvailable;
    if (equipmentAvailable !== undefined && equipmentAvailable !== null) insertData.equipmentAvailable = JSON.stringify(equipmentAvailable);
    if (injuries) insertData.injuries = injuries.trim();

    const newProfile = await db.insert(userProfiles)
      .values(insertData)
      .returning();

    // Parse JSON fields back to arrays for response
    const responseProfile = { ...newProfile[0] };
    if (responseProfile.allergies) {
      responseProfile.allergies = JSON.parse(responseProfile.allergies as string);
    }
    if (responseProfile.equipmentAvailable) {
      responseProfile.equipmentAvailable = JSON.parse(responseProfile.equipmentAvailable as string);
    }

    return NextResponse.json(responseProfile, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'Valid userId is required',
        code: 'INVALID_USER_ID' 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, parseInt(userId)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found for this user',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      caloriesGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal,
      weightGoal,
      fitnessLevel,
      allergies,
      dietaryPreferences,
      workoutTimeAvailable,
      equipmentAvailable,
      injuries
    } = body;

    // Validate fitnessLevel if provided
    if (fitnessLevel && !VALID_FITNESS_LEVELS.includes(fitnessLevel)) {
      return NextResponse.json({ 
        error: 'fitnessLevel must be one of: beginner, intermediate, advanced',
        code: 'INVALID_FITNESS_LEVEL' 
      }, { status: 400 });
    }

    // Validate goal values are positive if provided
    if (caloriesGoal !== undefined && caloriesGoal !== null && caloriesGoal <= 0) {
      return NextResponse.json({ 
        error: 'caloriesGoal must be a positive number',
        code: 'INVALID_CALORIES_GOAL' 
      }, { status: 400 });
    }

    if (proteinGoal !== undefined && proteinGoal !== null && proteinGoal <= 0) {
      return NextResponse.json({ 
        error: 'proteinGoal must be a positive number',
        code: 'INVALID_PROTEIN_GOAL' 
      }, { status: 400 });
    }

    if (carbsGoal !== undefined && carbsGoal !== null && carbsGoal <= 0) {
      return NextResponse.json({ 
        error: 'carbsGoal must be a positive number',
        code: 'INVALID_CARBS_GOAL' 
      }, { status: 400 });
    }

    if (fatsGoal !== undefined && fatsGoal !== null && fatsGoal <= 0) {
      return NextResponse.json({ 
        error: 'fatsGoal must be a positive number',
        code: 'INVALID_FATS_GOAL' 
      }, { status: 400 });
    }

    if (weightGoal !== undefined && weightGoal !== null && weightGoal <= 0) {
      return NextResponse.json({ 
        error: 'weightGoal must be a positive number',
        code: 'INVALID_WEIGHT_GOAL' 
      }, { status: 400 });
    }

    if (workoutTimeAvailable !== undefined && workoutTimeAvailable !== null && workoutTimeAvailable <= 0) {
      return NextResponse.json({ 
        error: 'workoutTimeAvailable must be a positive number',
        code: 'INVALID_WORKOUT_TIME' 
      }, { status: 400 });
    }

    // Validate allergies is array if provided
    if (allergies !== undefined && allergies !== null && !Array.isArray(allergies)) {
      return NextResponse.json({ 
        error: 'allergies must be an array',
        code: 'INVALID_ALLERGIES_FORMAT' 
      }, { status: 400 });
    }

    // Validate equipmentAvailable is array if provided
    if (equipmentAvailable !== undefined && equipmentAvailable !== null && !Array.isArray(equipmentAvailable)) {
      return NextResponse.json({ 
        error: 'equipmentAvailable must be an array',
        code: 'INVALID_EQUIPMENT_FORMAT' 
      }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (caloriesGoal !== undefined) updates.caloriesGoal = caloriesGoal;
    if (proteinGoal !== undefined) updates.proteinGoal = proteinGoal;
    if (carbsGoal !== undefined) updates.carbsGoal = carbsGoal;
    if (fatsGoal !== undefined) updates.fatsGoal = fatsGoal;
    if (weightGoal !== undefined) updates.weightGoal = weightGoal;
    if (fitnessLevel !== undefined) updates.fitnessLevel = fitnessLevel;
    if (allergies !== undefined) updates.allergies = allergies !== null ? JSON.stringify(allergies) : null;
    if (dietaryPreferences !== undefined) updates.dietaryPreferences = dietaryPreferences ? dietaryPreferences.trim() : null;
    if (workoutTimeAvailable !== undefined) updates.workoutTimeAvailable = workoutTimeAvailable;
    if (equipmentAvailable !== undefined) updates.equipmentAvailable = equipmentAvailable !== null ? JSON.stringify(equipmentAvailable) : null;
    if (injuries !== undefined) updates.injuries = injuries ? injuries.trim() : null;

    const updatedProfile = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, parseInt(userId)))
      .returning();

    // Parse JSON fields back to arrays for response
    const responseProfile = { ...updatedProfile[0] };
    if (responseProfile.allergies) {
      responseProfile.allergies = JSON.parse(responseProfile.allergies as string);
    }
    if (responseProfile.equipmentAvailable) {
      responseProfile.equipmentAvailable = JSON.parse(responseProfile.equipmentAvailable as string);
    }

    return NextResponse.json(responseProfile, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}