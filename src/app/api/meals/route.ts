import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Validate userId is provided
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const userIdInt = parseInt(userId);

    // Single meal fetch
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const meal = await db.select()
        .from(meals)
        .where(and(
          eq(meals.id, parseInt(id)),
          eq(meals.userId, userIdInt)
        ))
        .limit(1);

      if (meal.length === 0) {
        return NextResponse.json({ 
          error: 'Meal not found' 
        }, { status: 404 });
      }

      // Parse JSON fields
      const mealData = {
        ...meal[0],
        items: JSON.parse(meal[0].items)
      };

      return NextResponse.json(mealData, { status: 200 });
    }

    // List meals with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const mealType = searchParams.get('mealType');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let conditions = [eq(meals.userId, userIdInt)];

    // Add mealType filter
    if (mealType) {
      if (!VALID_MEAL_TYPES.includes(mealType)) {
        return NextResponse.json({ 
          error: `Invalid mealType. Must be one of: ${VALID_MEAL_TYPES.join(', ')}`,
          code: "INVALID_MEAL_TYPE" 
        }, { status: 400 });
      }
      conditions.push(eq(meals.mealType, mealType));
    }

    // Add date filter
    if (date) {
      conditions.push(like(meals.date, `${date}%`));
    }

    // Add search filter
    if (search) {
      conditions.push(like(meals.mealName, `%${search}%`));
    }

    const results = await db.select()
      .from(meals)
      .where(and(...conditions))
      .orderBy(desc(meals.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for all results
    const mealsData = results.map(meal => ({
      ...meal,
      items: JSON.parse(meal.items)
    }));

    return NextResponse.json(mealsData, { status: 200 });

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
      mealName, 
      mealType, 
      calories, 
      protein, 
      carbs, 
      fats, 
      items, 
      alternatives,
      date 
    } = body;

    // Validate required fields
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    if (!mealName || typeof mealName !== 'string' || mealName.trim() === '') {
      return NextResponse.json({ 
        error: "mealName is required and must be a non-empty string",
        code: "MISSING_MEAL_NAME" 
      }, { status: 400 });
    }

    if (!mealType || !VALID_MEAL_TYPES.includes(mealType)) {
      return NextResponse.json({ 
        error: `mealType is required and must be one of: ${VALID_MEAL_TYPES.join(', ')}`,
        code: "INVALID_MEAL_TYPE" 
      }, { status: 400 });
    }

    if (calories === undefined || calories === null || isNaN(parseInt(calories)) || parseInt(calories) < 0) {
      return NextResponse.json({ 
        error: "calories is required and must be a positive number",
        code: "INVALID_CALORIES" 
      }, { status: 400 });
    }

    if (protein === undefined || protein === null || isNaN(parseFloat(protein)) || parseFloat(protein) < 0) {
      return NextResponse.json({ 
        error: "protein is required and must be a positive number",
        code: "INVALID_PROTEIN" 
      }, { status: 400 });
    }

    if (carbs === undefined || carbs === null || isNaN(parseFloat(carbs)) || parseFloat(carbs) < 0) {
      return NextResponse.json({ 
        error: "carbs is required and must be a positive number",
        code: "INVALID_CARBS" 
      }, { status: 400 });
    }

    if (fats === undefined || fats === null || isNaN(parseFloat(fats)) || parseFloat(fats) < 0) {
      return NextResponse.json({ 
        error: "fats is required and must be a positive number",
        code: "INVALID_FATS" 
      }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: "items is required and must be a non-empty array",
        code: "INVALID_ITEMS" 
      }, { status: 400 });
    }

    // Prepare data
    const now = new Date().toISOString();
    const mealDate = date || now;

    const newMeal = await db.insert(meals)
      .values({
        userId: parseInt(userId),
        mealName: mealName.trim(),
        mealType,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        items: JSON.stringify(items),
        alternatives: alternatives ? alternatives.trim() : null,
        date: mealDate,
        createdAt: now,
      })
      .returning();

    // Parse JSON fields in response
    const mealData = {
      ...newMeal[0],
      items: JSON.parse(newMeal[0].items)
    };

    return NextResponse.json(mealData, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Validate required params
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const idInt = parseInt(id);
    const userIdInt = parseInt(userId);

    // Check if meal exists and belongs to user
    const existingMeal = await db.select()
      .from(meals)
      .where(and(
        eq(meals.id, idInt),
        eq(meals.userId, userIdInt)
      ))
      .limit(1);

    if (existingMeal.length === 0) {
      return NextResponse.json({ 
        error: 'Meal not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.mealName !== undefined) {
      if (typeof body.mealName !== 'string' || body.mealName.trim() === '') {
        return NextResponse.json({ 
          error: "mealName must be a non-empty string",
          code: "INVALID_MEAL_NAME" 
        }, { status: 400 });
      }
      updates.mealName = body.mealName.trim();
    }

    if (body.mealType !== undefined) {
      if (!VALID_MEAL_TYPES.includes(body.mealType)) {
        return NextResponse.json({ 
          error: `mealType must be one of: ${VALID_MEAL_TYPES.join(', ')}`,
          code: "INVALID_MEAL_TYPE" 
        }, { status: 400 });
      }
      updates.mealType = body.mealType;
    }

    if (body.calories !== undefined) {
      if (isNaN(parseInt(body.calories)) || parseInt(body.calories) < 0) {
        return NextResponse.json({ 
          error: "calories must be a positive number",
          code: "INVALID_CALORIES" 
        }, { status: 400 });
      }
      updates.calories = parseInt(body.calories);
    }

    if (body.protein !== undefined) {
      if (isNaN(parseFloat(body.protein)) || parseFloat(body.protein) < 0) {
        return NextResponse.json({ 
          error: "protein must be a positive number",
          code: "INVALID_PROTEIN" 
        }, { status: 400 });
      }
      updates.protein = parseFloat(body.protein);
    }

    if (body.carbs !== undefined) {
      if (isNaN(parseFloat(body.carbs)) || parseFloat(body.carbs) < 0) {
        return NextResponse.json({ 
          error: "carbs must be a positive number",
          code: "INVALID_CARBS" 
        }, { status: 400 });
      }
      updates.carbs = parseFloat(body.carbs);
    }

    if (body.fats !== undefined) {
      if (isNaN(parseFloat(body.fats)) || parseFloat(body.fats) < 0) {
        return NextResponse.json({ 
          error: "fats must be a positive number",
          code: "INVALID_FATS" 
        }, { status: 400 });
      }
      updates.fats = parseFloat(body.fats);
    }

    if (body.items !== undefined) {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json({ 
          error: "items must be a non-empty array",
          code: "INVALID_ITEMS" 
        }, { status: 400 });
      }
      updates.items = JSON.stringify(body.items);
    }

    if (body.alternatives !== undefined) {
      updates.alternatives = body.alternatives ? body.alternatives.trim() : null;
    }

    if (body.date !== undefined) {
      updates.date = body.date;
    }

    // Perform update
    const updated = await db.update(meals)
      .set(updates)
      .where(and(
        eq(meals.id, idInt),
        eq(meals.userId, userIdInt)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Meal not found' 
      }, { status: 404 });
    }

    // Parse JSON fields in response
    const mealData = {
      ...updated[0],
      items: JSON.parse(updated[0].items)
    };

    return NextResponse.json(mealData, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Validate required params
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const idInt = parseInt(id);
    const userIdInt = parseInt(userId);

    // Check if meal exists and belongs to user
    const existingMeal = await db.select()
      .from(meals)
      .where(and(
        eq(meals.id, idInt),
        eq(meals.userId, userIdInt)
      ))
      .limit(1);

    if (existingMeal.length === 0) {
      return NextResponse.json({ 
        error: 'Meal not found' 
      }, { status: 404 });
    }

    // Perform delete
    const deleted = await db.delete(meals)
      .where(and(
        eq(meals.id, idInt),
        eq(meals.userId, userIdInt)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Meal not found' 
      }, { status: 404 });
    }

    // Parse JSON fields in response
    const mealData = {
      ...deleted[0],
      items: JSON.parse(deleted[0].items)
    };

    return NextResponse.json({ 
      message: 'Meal deleted successfully',
      meal: mealData
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}