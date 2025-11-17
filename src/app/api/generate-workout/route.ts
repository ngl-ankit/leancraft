import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_time: number;
  image_url: string;
  tips: string;
}

interface WorkoutPlan {
  workoutName: string;
  workoutType: string;
  focusArea: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
}

interface RequestBody {
  userId: number;
  workoutType?: string;
  focusArea?: string;
  difficulty?: string;
  duration?: number;
  equipmentAvailable?: string[];
  injuries?: string;
  fitnessLevel?: string;
}

const VALID_WORKOUT_TYPES = ['gym', 'home'];
const VALID_FOCUS_AREAS = ['full_body', 'upper', 'lower', 'core'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const EXERCISE_DATABASE = {
  beginner: {
    full_body: [
      { name: 'Bodyweight Squats', equipment: 'none', tips: 'Keep your back straight and knees behind toes. Focus on controlled movements.' },
      { name: 'Knee Push-ups', equipment: 'none', tips: 'Keep your core engaged and lower yourself slowly. Maintain a straight line from knees to head.' },
      { name: 'Plank', equipment: 'none', tips: 'Keep your body in a straight line from head to heels. Engage your core throughout.' },
      { name: 'Walking Lunges', equipment: 'none', tips: 'Step forward and lower your hips until both knees are bent at 90 degrees.' },
      { name: 'Glute Bridges', equipment: 'none', tips: 'Squeeze your glutes at the top and keep your core tight. Push through your heels.' },
    ],
    upper: [
      { name: 'Wall Push-ups', equipment: 'none', tips: 'Stand arm\'s length from wall, lean in and push back. Keep body straight.' },
      { name: 'Arm Circles', equipment: 'none', tips: 'Extend arms to sides and make small circles. Gradually increase size.' },
      { name: 'Shoulder Taps', equipment: 'none', tips: 'In plank position, tap opposite shoulder while keeping hips stable.' },
      { name: 'Tricep Dips (Chair)', equipment: 'chair', tips: 'Keep elbows close to body and lower yourself slowly.' },
    ],
    lower: [
      { name: 'Bodyweight Squats', equipment: 'none', tips: 'Keep chest up and weight in heels. Go as low as comfortable.' },
      { name: 'Calf Raises', equipment: 'none', tips: 'Rise up on toes, hold briefly, then lower slowly.' },
      { name: 'Side Leg Raises', equipment: 'none', tips: 'Keep leg straight and lift to the side without leaning.' },
      { name: 'Step-ups', equipment: 'chair', tips: 'Step fully onto chair/box and drive through heel.' },
    ],
    core: [
      { name: 'Basic Crunches', equipment: 'none', tips: 'Keep lower back pressed to floor. Lift shoulders off ground.' },
      { name: 'Plank', equipment: 'none', tips: 'Hold body in straight line. Don\'t let hips sag.' },
      { name: 'Dead Bug', equipment: 'none', tips: 'Keep lower back pressed to floor while moving limbs.' },
      { name: 'Bird Dog', equipment: 'none', tips: 'Extend opposite arm and leg while maintaining balance.' },
    ],
  },
  intermediate: {
    full_body: [
      { name: 'Goblet Squats', equipment: 'dumbbell', tips: 'Hold weight at chest level. Keep elbows inside knees.' },
      { name: 'Standard Push-ups', equipment: 'none', tips: 'Lower chest to ground with elbows at 45 degrees. Keep core tight.' },
      { name: 'Dumbbell Rows', equipment: 'dumbbell', tips: 'Pull weight to hip, keeping elbow close to body.' },
      { name: 'Overhead Press', equipment: 'dumbbell', tips: 'Press weights overhead without arching back excessively.' },
      { name: 'Romanian Deadlifts', equipment: 'dumbbell', tips: 'Hinge at hips, keep back straight, feel stretch in hamstrings.' },
    ],
    upper: [
      { name: 'Dumbbell Bench Press', equipment: 'dumbbell', tips: 'Lower weights to chest level, press up explosively.' },
      { name: 'Assisted Pull-ups', equipment: 'pullup_bar', tips: 'Focus on pulling with back muscles, not just arms.' },
      { name: 'Parallel Bar Dips', equipment: 'dip_bar', tips: 'Lower until upper arms are parallel to ground.' },
      { name: 'Dumbbell Shoulder Press', equipment: 'dumbbell', tips: 'Press weights overhead in controlled motion.' },
      { name: 'Dumbbell Bicep Curls', equipment: 'dumbbell', tips: 'Keep elbows stationary, curl weights to shoulders.' },
    ],
    lower: [
      { name: 'Goblet Squats', equipment: 'dumbbell', tips: 'Hold dumbbell at chest, squat deep with good form.' },
      { name: 'Bulgarian Split Squats', equipment: 'dumbbell', tips: 'Rear foot elevated, lower front knee to 90 degrees.' },
      { name: 'Dumbbell Lunges', equipment: 'dumbbell', tips: 'Hold weights at sides, step forward into lunge.' },
      { name: 'Single Leg Deadlifts', equipment: 'dumbbell', tips: 'Balance on one leg, hinge at hip with straight back.' },
    ],
    core: [
      { name: 'Russian Twists', equipment: 'dumbbell', tips: 'Rotate torso side to side while keeping feet elevated.' },
      { name: 'Mountain Climbers', equipment: 'none', tips: 'Drive knees to chest rapidly while in plank position.' },
      { name: 'Leg Raises', equipment: 'none', tips: 'Keep lower back pressed down, raise legs slowly.' },
      { name: 'Bicycle Crunches', equipment: 'none', tips: 'Rotate torso to bring elbow to opposite knee.' },
    ],
  },
  advanced: {
    full_body: [
      { name: 'Barbell Squats', equipment: 'barbell', tips: 'Bar on upper back, squat below parallel with controlled form.' },
      { name: 'Barbell Deadlifts', equipment: 'barbell', tips: 'Lift with legs first, keep bar close to body throughout.' },
      { name: 'Barbell Bench Press', equipment: 'barbell', tips: 'Lower bar to chest, press up explosively, maintain arch.' },
      { name: 'Pull-ups', equipment: 'pullup_bar', tips: 'Full range of motion, chin over bar, control the descent.' },
      { name: 'Barbell Overhead Press', equipment: 'barbell', tips: 'Press from shoulders to overhead, engage core for stability.' },
    ],
    upper: [
      { name: 'Weighted Pull-ups', equipment: 'pullup_bar', tips: 'Add weight via belt, maintain strict form throughout.' },
      { name: 'Barbell Bench Press', equipment: 'barbell', tips: 'Control the bar down, explosive press up.' },
      { name: 'Weighted Dips', equipment: 'dip_bar', tips: 'Add weight, lower to full depth, press up powerfully.' },
      { name: 'Barbell Rows', equipment: 'barbell', tips: 'Pull bar to lower chest, squeeze shoulder blades together.' },
      { name: 'Overhead Press', equipment: 'barbell', tips: 'Strict press from shoulders, no leg drive.' },
    ],
    lower: [
      { name: 'Barbell Back Squats', equipment: 'barbell', tips: 'Bar high on traps, squat to depth, drive up through heels.' },
      { name: 'Barbell Deadlifts', equipment: 'barbell', tips: 'Hip hinge pattern, explosive pull, control the descent.' },
      { name: 'Bulgarian Split Squats', equipment: 'barbell', tips: 'Heavy load, rear foot elevated, focus on front leg.' },
      { name: 'Leg Press', equipment: 'leg_press', tips: 'Full range of motion, push through heels, control the weight.' },
      { name: 'Weighted Calf Raises', equipment: 'barbell', tips: 'Full extension at top, stretch at bottom.' },
    ],
    core: [
      { name: 'Hanging Leg Raises', equipment: 'pullup_bar', tips: 'Raise legs to parallel or higher, control the swing.' },
      { name: 'Ab Wheel Rollouts', equipment: 'ab_wheel', tips: 'Roll out slowly, maintain tension in core throughout.' },
      { name: 'Weighted Russian Twists', equipment: 'dumbbell', tips: 'Heavy weight, explosive rotation, maintain form.' },
      { name: 'Dragon Flags', equipment: 'bench', tips: 'Advanced movement, keep body straight, lower with control.' },
    ],
  },
};

function getDifficultyParams(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return { sets: 2, minReps: 8, maxReps: 10, restTime: 75 };
    case 'intermediate':
      return { sets: 3, minReps: 10, maxReps: 12, restTime: 52 };
    case 'advanced':
      return { sets: 4, minReps: 12, maxReps: 15, restTime: 37 };
    default:
      return { sets: 3, minReps: 10, maxReps: 12, restTime: 52 };
  }
}

function filterExercisesByEquipment(exercises: any[], equipmentAvailable: string[], workoutType: string) {
  if (workoutType === 'home') {
    const homeEquipment = ['none', 'chair', 'dumbbell', ...equipmentAvailable];
    return exercises.filter(ex => homeEquipment.includes(ex.equipment));
  }
  return exercises;
}

function filterExercisesByInjuries(exercises: any[], injuries?: string) {
  if (!injuries) return exercises;
  
  const injuryLower = injuries.toLowerCase();
  const injuryFilters: { [key: string]: string[] } = {
    'knee': ['squats', 'lunges', 'leg press'],
    'shoulder': ['push-ups', 'press', 'pull-ups', 'dips'],
    'back': ['deadlifts', 'rows', 'squats'],
    'wrist': ['push-ups', 'plank', 'dips'],
  };

  return exercises.filter(ex => {
    const exerciseLower = ex.name.toLowerCase();
    for (const [injury, restricted] of Object.entries(injuryFilters)) {
      if (injuryLower.includes(injury)) {
        if (restricted.some(r => exerciseLower.includes(r))) {
          return false;
        }
      }
    }
    return true;
  });
}

function generateWorkoutPlan(
  workoutType: string,
  focusArea: string,
  difficulty: string,
  duration: number,
  equipmentAvailable: string[],
  injuries?: string
): WorkoutPlan {
  const params = getDifficultyParams(difficulty);
  let exercises = EXERCISE_DATABASE[difficulty as keyof typeof EXERCISE_DATABASE]?.[focusArea as keyof typeof EXERCISE_DATABASE.beginner] || [];
  
  exercises = filterExercisesByEquipment(exercises, equipmentAvailable, workoutType);
  exercises = filterExercisesByInjuries(exercises, injuries);

  if (exercises.length === 0) {
    exercises = EXERCISE_DATABASE.beginner.full_body.filter(ex => ex.equipment === 'none');
  }

  const timePerExercise = 3;
  const estimatedTimePerSet = timePerExercise + (params.restTime / 60);
  const totalSetsNeeded = Math.floor(duration / estimatedTimePerSet);
  const exercisesNeeded = Math.ceil(totalSetsNeeded / params.sets);
  
  const selectedExercises = exercises.slice(0, Math.min(exercisesNeeded, exercises.length));
  
  const workoutExercises: Exercise[] = selectedExercises.map(ex => ({
    name: ex.name,
    sets: params.sets,
    reps: focusArea === 'core' && ex.name.toLowerCase().includes('plank') 
      ? `${30 + (difficulty === 'intermediate' ? 15 : difficulty === 'advanced' ? 30 : 0)} seconds`
      : `${params.minReps}-${params.maxReps}`,
    rest_time: params.restTime,
    image_url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(ex.name)}`,
    tips: ex.tips,
  }));

  const workoutName = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${focusArea.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${workoutType === 'gym' ? 'Gym' : 'Home'} Workout`;

  return {
    workoutName,
    workoutType,
    focusArea,
    difficulty,
    duration,
    exercises: workoutExercises,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { 
      userId, 
      workoutType = 'home', 
      focusArea = 'full_body', 
      difficulty = 'beginner',
      duration = 30,
      equipmentAvailable = [],
      injuries,
      fitnessLevel
    } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ 
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 400 });
    }

    if (!VALID_WORKOUT_TYPES.includes(workoutType)) {
      return NextResponse.json({ 
        error: `Invalid workout type. Must be one of: ${VALID_WORKOUT_TYPES.join(', ')}`,
        code: 'INVALID_WORKOUT_TYPE'
      }, { status: 400 });
    }

    if (!VALID_FOCUS_AREAS.includes(focusArea)) {
      return NextResponse.json({ 
        error: `Invalid focus area. Must be one of: ${VALID_FOCUS_AREAS.join(', ')}`,
        code: 'INVALID_FOCUS_AREA'
      }, { status: 400 });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ 
        error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        code: 'INVALID_DIFFICULTY'
      }, { status: 400 });
    }

    if (duration < 10 || duration > 180) {
      return NextResponse.json({ 
        error: 'Duration must be between 10 and 180 minutes',
        code: 'INVALID_DURATION'
      }, { status: 400 });
    }

    const workout = generateWorkoutPlan(
      workoutType,
      focusArea,
      difficulty,
      duration,
      equipmentAvailable,
      injuries
    );

    return NextResponse.json({
      success: true,
      workout,
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}