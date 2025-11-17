import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    // Input validation
    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Identifier (email or username) is required',
          code: 'MISSING_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Query database to find user by email OR username
    const trimmedIdentifier = identifier.trim();
    const user = await db.select()
      .from(users)
      .where(
        or(
          eq(users.email, trimmedIdentifier.toLowerCase()),
          eq(users.username, trimmedIdentifier)
        )
      )
      .limit(1);

    // Check if user exists
    if (user.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Verify password using bcrypt
    const isPasswordValid = bcrypt.compareSync(password, foundUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Return success response without password
    return NextResponse.json(
      {
        success: true,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}