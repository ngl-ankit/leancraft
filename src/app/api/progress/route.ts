import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progressEntries } from '@/db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

const VALID_ENTRY_TYPES = ['weight', 'calories', 'strength'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Validate userId is provided
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const parsedUserId = parseInt(userId);

    // Single record fetch
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const parsedId = parseInt(id);
      const entry = await db.select()
        .from(progressEntries)
        .where(and(
          eq(progressEntries.id, parsedId),
          eq(progressEntries.userId, parsedUserId)
        ))
        .limit(1);

      if (entry.length === 0) {
        return NextResponse.json({ 
          error: 'Progress entry not found' 
        }, { status: 404 });
      }

      return NextResponse.json(entry[0], { status: 200 });
    }

    // List with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const entryType = searchParams.get('entryType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = searchParams.get('sort') ?? 'date';
    const order = searchParams.get('order') ?? 'desc';

    // Validate sort parameters
    if (!VALID_SORT_FIELDS.includes(sort)) {
      return NextResponse.json({ 
        error: `Invalid sort field. Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
        code: "INVALID_SORT_FIELD" 
      }, { status: 400 });
    }

    if (!VALID_SORT_ORDERS.includes(order)) {
      return NextResponse.json({ 
        error: `Invalid sort order. Must be one of: ${VALID_SORT_ORDERS.join(', ')}`,
        code: "INVALID_SORT_ORDER" 
      }, { status: 400 });
    }

    // Validate entryType if provided
    if (entryType && !VALID_ENTRY_TYPES.includes(entryType)) {
      return NextResponse.json({ 
        error: `Invalid entryType. Must be one of: ${VALID_ENTRY_TYPES.join(', ')}`,
        code: "INVALID_ENTRY_TYPE" 
      }, { status: 400 });
    }

    // Build where conditions
    const conditions = [eq(progressEntries.userId, parsedUserId)];

    if (entryType) {
      conditions.push(eq(progressEntries.entryType, entryType));
    }

    if (dateFrom) {
      conditions.push(gte(progressEntries.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(progressEntries.date, dateTo));
    }

    // Build query with sorting
    let query = db.select()
      .from(progressEntries)
      .where(and(...conditions));

    // Apply sorting
    const sortField = sort === 'date' ? progressEntries.date : progressEntries.value;
    const sortOrder = order === 'asc' ? asc(sortField) : desc(sortField);
    
    const results = await query
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { userId, entryType, value, notes, date } = body;

    // Validate required fields
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid userId is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    if (!entryType) {
      return NextResponse.json({ 
        error: "entryType is required",
        code: "MISSING_ENTRY_TYPE" 
      }, { status: 400 });
    }

    if (!VALID_ENTRY_TYPES.includes(entryType)) {
      return NextResponse.json({ 
        error: `entryType must be one of: ${VALID_ENTRY_TYPES.join(', ')}`,
        code: "INVALID_ENTRY_TYPE" 
      }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ 
        error: "value is required",
        code: "MISSING_VALUE" 
      }, { status: 400 });
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return NextResponse.json({ 
        error: "value must be a positive number",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    // Prepare insert data with auto-generated fields
    const now = new Date().toISOString();
    const insertData = {
      userId: parseInt(userId),
      entryType: entryType.trim(),
      value: numericValue,
      notes: notes ? notes.trim() : null,
      date: date ? date : now,
      createdAt: now
    };

    const newEntry = await db.insert(progressEntries)
      .values(insertData)
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // Validate required parameters
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

    const parsedId = parseInt(id);
    const parsedUserId = parseInt(userId);

    // Check if entry exists and belongs to user
    const existing = await db.select()
      .from(progressEntries)
      .where(and(
        eq(progressEntries.id, parsedId),
        eq(progressEntries.userId, parsedUserId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Progress entry not found' 
      }, { status: 404 });
    }

    // Delete the entry
    const deleted = await db.delete(progressEntries)
      .where(and(
        eq(progressEntries.id, parsedId),
        eq(progressEntries.userId, parsedUserId)
      ))
      .returning();

    return NextResponse.json({
      message: 'Progress entry deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}