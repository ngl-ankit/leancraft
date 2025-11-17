import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Email is required and must be a non-empty string',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json(
        { 
          error: 'Username is required and must be at least 3 characters long',
          code: 'INVALID_USERNAME'
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { 
          error: 'Password is required and must be at least 6 characters long',
          code: 'INVALID_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim();

    // Check for duplicate email or username
    const existingUsers = await db.select()
      .from(users)
      .where(
        or(
          eq(users.email, sanitizedEmail),
          eq(users.username, sanitizedUsername)
        )
      );

    if (existingUsers.length > 0) {
      const duplicateEmail = existingUsers.find(u => u.email === sanitizedEmail);
      const duplicateUsername = existingUsers.find(u => u.username === sanitizedUsername);

      if (duplicateEmail) {
        return NextResponse.json(
          { 
            error: 'Email already exists',
            code: 'DUPLICATE_EMAIL'
          },
          { status: 400 }
        );
      }

      if (duplicateUsername) {
        return NextResponse.json(
          { 
            error: 'Username already exists',
            code: 'DUPLICATE_USERNAME'
          },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the new user
    const newUser = await db.insert(users)
      .values({
        email: sanitizedEmail,
        username: sanitizedUsername,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Return success response without password
    const { password: _, ...userWithoutPassword } = newUser[0];

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userWithoutPassword.id,
          username: userWithoutPassword.username,
          email: userWithoutPassword.email
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}