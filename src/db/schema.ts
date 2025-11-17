import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});

export const meals = sqliteTable('meals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  mealName: text('meal_name').notNull(),
  mealType: text('meal_type').notNull(),
  calories: integer('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fats: real('fats').notNull(),
  items: text('items').notNull(),
  alternatives: text('alternatives'),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  workoutType: text('workout_type').notNull(),
  duration: integer('duration').notNull(),
  fitnessLevel: text('fitness_level').notNull(),
  equipment: text('equipment'),
  injuries: text('injuries'),
  goal: text('goal').notNull(),
  workoutData: text('workout_data', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const progress = sqliteTable('progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  weight: real('weight'),
  caloriesConsumed: integer('calories_consumed'),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fat: integer('fat'),
  workoutCompleted: integer('workout_completed', { mode: 'boolean' }),
  notes: text('notes'),
});

export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
  time: text('time').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const dailyCompletions = sqliteTable('daily_completions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  mealsCompleted: integer('meals_completed').notNull().default(0),
  workoutCompleted: integer('workout_completed', { mode: 'boolean' }).notNull().default(false),
  waterCompleted: integer('water_completed', { mode: 'boolean' }).notNull().default(false),
  supplementsCompleted: integer('supplements_completed', { mode: 'boolean' }).notNull().default(false),
  mealStreak: integer('meal_streak').notNull().default(0),
  workoutStreak: integer('workout_streak').notNull().default(0),
  waterStreak: integer('water_streak').notNull().default(0),
  supplementStreak: integer('supplement_streak').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});