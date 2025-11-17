import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';

const ALLOWED_WORKOUT_TYPES = ['gym', 'home', 'cardio', 'strength'];
const ALLOWED_FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const MIN_DURATION = 15;
const MAX_DURATION = 180;

interface Exercise {
  name: string;
  sets?: number;
  reps?: number | string;
  duration?: number;
  rest_seconds: number;
  instructions: string;
  difficulty: string;
}

interface WorkoutSection {
  type: string;
  duration: number;
  exercises: Exercise[];
}

interface WorkoutData {
  warmup: WorkoutSection;
  main: WorkoutSection;
  cooldown: WorkoutSection;
  totalDuration: number;
}

function generateWarmupExercises(duration: number, injuries: string[]): Exercise[] {
  const allWarmups = [
    { name: 'Jumping Jacks', duration: 2, instructions: 'Keep movements controlled, land softly', difficulty: 'easy' },
    { name: 'Arm Circles', duration: 1, instructions: 'Forward and backward, gradually increase range', difficulty: 'easy' },
    { name: 'Leg Swings', duration: 2, instructions: 'Front to back, then side to side', difficulty: 'easy' },
    { name: 'Hip Circles', duration: 1, instructions: 'Clockwise and counter-clockwise', difficulty: 'easy' },
    { name: 'High Knees', duration: 2, instructions: 'Bring knees to hip level, pump arms', difficulty: 'moderate' },
    { name: 'Butt Kicks', duration: 2, instructions: 'Kick heels to glutes, stay on balls of feet', difficulty: 'moderate' },
    { name: 'Torso Twists', duration: 1, instructions: 'Rotate from core, keep hips stable', difficulty: 'easy' },
    { name: 'Shoulder Rolls', duration: 1, instructions: 'Forward and backward, full range of motion', difficulty: 'easy' },
    { name: 'Walking Lunges', duration: 2, instructions: 'Step forward, knee at 90 degrees', difficulty: 'moderate' },
    { name: 'Cat-Cow Stretch', duration: 1, instructions: 'Alternate arching and rounding spine', difficulty: 'easy' },
  ];

  const filteredWarmups = allWarmups.filter(exercise => {
    if (injuries.includes('knee') && ['High Knees', 'Butt Kicks', 'Walking Lunges'].includes(exercise.name)) return false;
    if (injuries.includes('shoulder') && ['Arm Circles', 'Shoulder Rolls'].includes(exercise.name)) return false;
    if (injuries.includes('back') && ['Cat-Cow Stretch', 'Torso Twists'].includes(exercise.name)) return false;
    return true;
  });

  const selected: Exercise[] = [];
  let totalTime = 0;
  const shuffled = [...filteredWarmups].sort(() => Math.random() - 0.5);

  for (const exercise of shuffled) {
    if (totalTime + exercise.duration <= duration) {
      selected.push({
        name: exercise.name,
        duration: exercise.duration * 60,
        rest_seconds: 0,
        instructions: exercise.instructions,
        difficulty: exercise.difficulty
      });
      totalTime += exercise.duration;
    }
    if (totalTime >= duration - 1) break;
  }

  return selected;
}

function generateCooldownExercises(duration: number, injuries: string[]): Exercise[] {
  const allCooldowns = [
    { name: 'Standing Quad Stretch', duration: 1, instructions: 'Hold each leg, keep knees together', difficulty: 'easy' },
    { name: 'Hamstring Stretch', duration: 1, instructions: 'Reach for toes, keep back straight', difficulty: 'easy' },
    { name: 'Chest Stretch', duration: 1, instructions: 'Clasp hands behind back, lift chest', difficulty: 'easy' },
    { name: 'Shoulder Stretch', duration: 1, instructions: 'Pull arm across body, hold', difficulty: 'easy' },
    { name: 'Tricep Stretch', duration: 1, instructions: 'Reach arm overhead, pull elbow', difficulty: 'easy' },
    { name: 'Hip Flexor Stretch', duration: 1, instructions: 'Lunge position, push hips forward', difficulty: 'easy' },
    { name: 'Spinal Twist', duration: 1, instructions: 'Seated or lying, rotate spine gently', difficulty: 'easy' },
    { name: 'Child\'s Pose', duration: 2, instructions: 'Sit back on heels, arms extended forward', difficulty: 'easy' },
    { name: 'Deep Breathing', duration: 2, instructions: 'Inhale 4 counts, hold 4, exhale 6', difficulty: 'easy' },
    { name: 'Calf Stretch', duration: 1, instructions: 'Push against wall, heel down', difficulty: 'easy' },
  ];

  const filteredCooldowns = allCooldowns.filter(exercise => {
    if (injuries.includes('knee') && ['Standing Quad Stretch', 'Hip Flexor Stretch'].includes(exercise.name)) return false;
    if (injuries.includes('shoulder') && ['Chest Stretch', 'Shoulder Stretch', 'Tricep Stretch'].includes(exercise.name)) return false;
    if (injuries.includes('back') && ['Spinal Twist', 'Child\'s Pose'].includes(exercise.name)) return false;
    return true;
  });

  const selected: Exercise[] = [];
  let totalTime = 0;
  const shuffled = [...filteredCooldowns].sort(() => Math.random() - 0.5);

  for (const exercise of shuffled) {
    if (totalTime + exercise.duration <= duration) {
      selected.push({
        name: exercise.name,
        duration: exercise.duration * 60,
        rest_seconds: 0,
        instructions: exercise.instructions,
        difficulty: exercise.difficulty
      });
      totalTime += exercise.duration;
    }
    if (totalTime >= duration - 1) break;
  }

  return selected;
}

function generateMainWorkout(
  workoutType: string,
  duration: number,
  fitnessLevel: string,
  equipment: string[],
  injuries: string[],
  goal: string
): Exercise[] {
  const levelMultipliers = {
    beginner: { sets: 2, reps: 0.7, rest: 60 },
    intermediate: { sets: 3, reps: 1.0, rest: 45 },
    advanced: { sets: 4, reps: 1.3, rest: 30 }
  };

  const multiplier = levelMultipliers[fitnessLevel as keyof typeof levelMultipliers];

  const exerciseLibrary: { [key: string]: Exercise[] } = {
    gym: [
      { name: 'Barbell Bench Press', sets: 4, reps: 10, rest_seconds: 90, instructions: 'Lower bar to chest, press up explosively', difficulty: 'moderate' },
      { name: 'Barbell Squats', sets: 4, reps: 12, rest_seconds: 90, instructions: 'Depth to parallel, drive through heels', difficulty: 'hard' },
      { name: 'Deadlifts', sets: 4, reps: 8, rest_seconds: 120, instructions: 'Keep back straight, hinge at hips', difficulty: 'hard' },
      { name: 'Lat Pulldowns', sets: 3, reps: 12, rest_seconds: 60, instructions: 'Pull to upper chest, squeeze shoulder blades', difficulty: 'moderate' },
      { name: 'Cable Rows', sets: 3, reps: 12, rest_seconds: 60, instructions: 'Pull to abdomen, keep torso stable', difficulty: 'moderate' },
      { name: 'Leg Press', sets: 3, reps: 15, rest_seconds: 60, instructions: 'Full range of motion, controlled descent', difficulty: 'moderate' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest_seconds: 60, instructions: 'Press overhead, controlled descent', difficulty: 'moderate' },
      { name: 'Tricep Dips', sets: 3, reps: 12, rest_seconds: 45, instructions: 'Lower until upper arms parallel to ground', difficulty: 'moderate' },
      { name: 'Barbell Curls', sets: 3, reps: 12, rest_seconds: 45, instructions: 'Curl to shoulders, no swinging', difficulty: 'easy' },
      { name: 'Leg Curls', sets: 3, reps: 12, rest_seconds: 45, instructions: 'Curl heels to glutes, squeeze at top', difficulty: 'easy' },
    ],
    home: [
      { name: 'Push-ups', sets: 3, reps: 15, rest_seconds: 45, instructions: 'Body in straight line, chest to ground', difficulty: 'moderate' },
      { name: 'Bodyweight Squats', sets: 3, reps: 20, rest_seconds: 45, instructions: 'Sit back, knees over toes', difficulty: 'easy' },
      { name: 'Lunges', sets: 3, reps: 12, rest_seconds: 45, instructions: 'Step forward, both knees at 90 degrees', difficulty: 'moderate' },
      { name: 'Plank', sets: 3, reps: '60 seconds', rest_seconds: 45, instructions: 'Hold straight line from head to heels', difficulty: 'moderate' },
      { name: 'Mountain Climbers', sets: 3, reps: 20, rest_seconds: 30, instructions: 'Drive knees to chest alternately', difficulty: 'hard' },
      { name: 'Burpees', sets: 3, reps: 10, rest_seconds: 60, instructions: 'Jump back, push-up, jump up', difficulty: 'hard' },
      { name: 'Glute Bridges', sets: 3, reps: 15, rest_seconds: 30, instructions: 'Lift hips, squeeze glutes at top', difficulty: 'easy' },
      { name: 'Tricep Dips (Chair)', sets: 3, reps: 12, rest_seconds: 45, instructions: 'Use chair or bench, lower body', difficulty: 'moderate' },
      { name: 'Wall Sit', sets: 3, reps: '45 seconds', rest_seconds: 45, instructions: 'Back against wall, thighs parallel to ground', difficulty: 'moderate' },
      { name: 'Superman Hold', sets: 3, reps: '30 seconds', rest_seconds: 30, instructions: 'Lift arms and legs simultaneously', difficulty: 'moderate' },
    ],
    cardio: [
      { name: 'Running Intervals', sets: 1, duration: 10, rest_seconds: 0, instructions: '2 min moderate, 1 min sprint, repeat', difficulty: 'hard' },
      { name: 'Jump Rope', sets: 4, duration: 3, rest_seconds: 60, instructions: 'Maintain steady rhythm, light on feet', difficulty: 'moderate' },
      { name: 'High Knees', sets: 4, reps: 30, rest_seconds: 30, instructions: 'Drive knees to hip level, fast pace', difficulty: 'hard' },
      { name: 'Burpees', sets: 4, reps: 15, rest_seconds: 45, instructions: 'Full range, jump explosively', difficulty: 'hard' },
      { name: 'Box Jumps', sets: 4, reps: 12, rest_seconds: 60, instructions: 'Jump onto stable surface, land softly', difficulty: 'hard' },
      { name: 'Mountain Climbers', sets: 4, reps: 40, rest_seconds: 30, instructions: 'Fast alternating knees to chest', difficulty: 'hard' },
      { name: 'Jumping Jacks', sets: 4, reps: 50, rest_seconds: 30, instructions: 'Full arm extension overhead', difficulty: 'moderate' },
      { name: 'Shadow Boxing', sets: 4, duration: 3, rest_seconds: 45, instructions: 'Punches with footwork, stay light', difficulty: 'moderate' },
      { name: 'Stair Climbing', sets: 1, duration: 15, rest_seconds: 0, instructions: 'Continuous climb, steady pace', difficulty: 'moderate' },
      { name: 'Bicycle Crunches', sets: 4, reps: 30, rest_seconds: 30, instructions: 'Alternate elbow to opposite knee', difficulty: 'moderate' },
    ],
    strength: [
      { name: 'Push-ups', sets: 4, reps: 15, rest_seconds: 60, instructions: 'Full range, body straight', difficulty: 'moderate' },
      { name: 'Pull-ups', sets: 4, reps: 8, rest_seconds: 90, instructions: 'Chin over bar, controlled descent', difficulty: 'hard' },
      { name: 'Dumbbell Rows', sets: 4, reps: 12, rest_seconds: 60, instructions: 'Pull to hip, squeeze back', difficulty: 'moderate' },
      { name: 'Goblet Squats', sets: 4, reps: 15, rest_seconds: 60, instructions: 'Hold weight at chest, squat deep', difficulty: 'moderate' },
      { name: 'Romanian Deadlifts', sets: 4, reps: 12, rest_seconds: 60, instructions: 'Hinge at hips, feel hamstring stretch', difficulty: 'moderate' },
      { name: 'Overhead Press', sets: 4, reps: 10, rest_seconds: 60, instructions: 'Press weight overhead, lock out', difficulty: 'moderate' },
      { name: 'Dumbbell Chest Press', sets: 4, reps: 12, rest_seconds: 60, instructions: 'Press up and together, squeeze chest', difficulty: 'moderate' },
      { name: 'Walking Lunges', sets: 3, reps: 20, rest_seconds: 45, instructions: 'Step forward with weights, alternate legs', difficulty: 'moderate' },
      { name: 'Plank to Push-up', sets: 3, reps: 10, rest_seconds: 45, instructions: 'Alternate from plank to push-up position', difficulty: 'hard' },
      { name: 'Farmer\'s Carry', sets: 3, duration: 2, rest_seconds: 60, instructions: 'Walk with heavy weights, upright posture', difficulty: 'moderate' },
    ]
  };

  let availableExercises = exerciseLibrary[workoutType] || exerciseLibrary.home;

  // Filter based on injuries
  availableExercises = availableExercises.filter(exercise => {
    if (injuries.includes('knee') && ['Squats', 'Lunges', 'Box Jumps', 'Leg Press'].some(term => exercise.name.includes(term))) return false;
    if (injuries.includes('shoulder') && ['Press', 'Pull-ups', 'Overhead'].some(term => exercise.name.includes(term))) return false;
    if (injuries.includes('back') && ['Deadlifts', 'Rows', 'Romanian'].some(term => exercise.name.includes(term))) return false;
    if (injuries.includes('wrist') && ['Push-ups', 'Plank'].some(term => exercise.name.includes(term))) return false;
    return true;
  });

  // Filter based on equipment for gym workouts
  if (workoutType === 'gym' && equipment.length > 0) {
    availableExercises = availableExercises.filter(exercise => {
      const exerciseLower = exercise.name.toLowerCase();
      if (exerciseLower.includes('barbell') && !equipment.includes('barbell')) return false;
      if (exerciseLower.includes('dumbbell') && !equipment.includes('dumbbells')) return false;
      if (exerciseLower.includes('cable') && !equipment.includes('cable machine')) return false;
      return true;
    });
  }

  // Shuffle and select exercises
  const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
  const numExercises = Math.min(8, Math.max(5, Math.floor(duration / 6)));
  const selected = shuffled.slice(0, numExercises);

  // Adjust for fitness level
  return selected.map(exercise => ({
    ...exercise,
    sets: Math.max(2, Math.round((exercise.sets || 3) * (multiplier.sets / 3))),
    reps: typeof exercise.reps === 'number' 
      ? Math.round(exercise.reps * multiplier.reps)
      : exercise.reps,
    duration: exercise.duration ? Math.round(exercise.duration * multiplier.reps) : undefined,
    rest_seconds: Math.round((exercise.rest_seconds || 45) * (multiplier.rest / 45))
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      workout_type,
      duration,
      fitness_level,
      equipment,
      injuries,
      goal
    } = body;

    // Validate required fields
    if (!user_id || !workout_type || !duration || !fitness_level || !goal) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: user_id, workout_type, duration, fitness_level, and goal are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate user_id is a valid integer
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

    // Validate workout_type
    if (!ALLOWED_WORKOUT_TYPES.includes(workout_type)) {
      return NextResponse.json(
        { 
          error: `workout_type must be one of: ${ALLOWED_WORKOUT_TYPES.join(', ')}`,
          code: 'INVALID_WORKOUT_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate fitness_level
    if (!ALLOWED_FITNESS_LEVELS.includes(fitness_level)) {
      return NextResponse.json(
        { 
          error: `fitness_level must be one of: ${ALLOWED_FITNESS_LEVELS.join(', ')}`,
          code: 'INVALID_FITNESS_LEVEL'
        },
        { status: 400 }
      );
    }

    // Validate duration
    const durationInt = parseInt(duration);
    if (isNaN(durationInt) || durationInt < MIN_DURATION || durationInt > MAX_DURATION) {
      return NextResponse.json(
        { 
          error: `duration must be a positive integer between ${MIN_DURATION} and ${MAX_DURATION} minutes`,
          code: 'INVALID_DURATION'
        },
        { status: 400 }
      );
    }

    // Parse equipment and injuries
    const equipmentList = equipment ? equipment.split(',').map((e: string) => e.trim().toLowerCase()) : [];
    const injuriesList = injuries ? injuries.split(',').map((i: string) => i.trim().toLowerCase()) : [];

    // Calculate section durations
    const warmupDuration = Math.min(10, Math.floor(durationInt * 0.15));
    const cooldownDuration = Math.min(10, Math.floor(durationInt * 0.15));
    const mainDuration = durationInt - warmupDuration - cooldownDuration;

    // Generate workout sections
    const warmupExercises = generateWarmupExercises(warmupDuration, injuriesList);
    const mainExercises = generateMainWorkout(workout_type, mainDuration, fitness_level, equipmentList, injuriesList, goal);
    const cooldownExercises = generateCooldownExercises(cooldownDuration, injuriesList);

    const workoutData: WorkoutData = {
      warmup: {
        type: 'warmup',
        duration: warmupDuration,
        exercises: warmupExercises
      },
      main: {
        type: 'main',
        duration: mainDuration,
        exercises: mainExercises
      },
      cooldown: {
        type: 'cooldown',
        duration: cooldownDuration,
        exercises: cooldownExercises
      },
      totalDuration: durationInt
    };

    // Insert into database
    const newWorkout = await db.insert(workouts)
      .values({
        userId,
        workoutType: workout_type,
        duration: durationInt,
        fitnessLevel: fitness_level,
        equipment: equipment || null,
        injuries: injuries || null,
        goal: goal.trim(),
        workoutData: JSON.stringify(workoutData),
        createdAt: new Date().toISOString()
      })
      .returning();

    const workout = newWorkout[0];

    return NextResponse.json(
      {
        success: true,
        workout: {
          id: workout.id,
          userId: workout.userId,
          workoutType: workout.workoutType,
          duration: workout.duration,
          fitnessLevel: workout.fitnessLevel,
          goal: workout.goal,
          workoutData: JSON.parse(workout.workoutData as string),
          createdAt: workout.createdAt
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