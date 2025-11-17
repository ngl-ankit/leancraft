import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Comprehensive fitness knowledge base for context-aware responses
const KNOWLEDGE_BASE = {
  greetings: [
    "Hey there, fitness warrior! 💪 Ready to crush those goals? What can I help you with today?",
    "What's up, champ! 🔥 Let's make today count. How can I support your fitness journey?",
    "Hey! Great to see you! 🚀 What's on your mind today - training, nutrition, or motivation?",
  ],
  
  weightLoss: {
    keywords: ['lose weight', 'fat loss', 'cutting', 'slim down', 'shed pounds', 'weight loss'],
    responses: [
      "Great goal! For sustainable weight loss, focus on:\n\n1. **Caloric Deficit**: Aim for 300-500 calories below maintenance (our meal planner can help!)\n2. **High Protein**: 1.6-2.2g per kg body weight to preserve muscle\n3. **Strength Training**: Builds muscle which boosts metabolism\n4. **Cardio**: 150-300 min/week of moderate activity\n5. **Sleep**: 7-9 hours - crucial for fat loss hormones\n6. **Hydration**: 3-4L water daily\n\nConsistency beats perfection! Small daily wins add up. 💪",
      
      "Weight loss is all about sustainable habits! Here's your action plan:\n\n**Nutrition (80% of results)**:\n- Create a 400-500 cal deficit\n- Eat whole, unprocessed foods\n- Track your meals (our planner helps!)\n- Don't skip meals - keeps metabolism steady\n\n**Training (20% but crucial)**:\n- Lift weights 3-4x/week to preserve muscle\n- Add 2-3 cardio sessions\n- Stay active daily (10k steps)\n\n**Mindset**: This is a marathon, not a sprint. Aim for 0.5-1kg loss per week for sustainable results! 🎯",
    ]
  },
  
  muscleBuilding: {
    keywords: ['build muscle', 'bulk', 'gain mass', 'get bigger', 'hypertrophy', 'muscle gain'],
    responses: [
      "Building muscle as a vegetarian? Absolutely doable! Here's your blueprint:\n\n**Nutrition**:\n- Caloric Surplus: 300-500 cals above maintenance\n- Protein: 1.6-2.2g per kg (paneer, tofu, legumes, protein powder)\n- Carbs: 4-6g per kg for energy and recovery\n- Fats: 0.8-1g per kg for hormones\n\n**Training**:\n- Progressive Overload: Increase weight/reps weekly\n- Compound Movements: Squats, deadlifts, bench, rows\n- 3-5 sets of 8-12 reps for hypertrophy\n- Rest: 48-72 hours between muscle groups\n\n**Recovery**: Sleep 8-9 hours, muscles grow when you rest! 💪",
      
      "Let's build that muscle mass!\n\n**Key Principles**:\n1. **Eat Big**: Surplus of 300-500 cals\n2. **Protein Power**: 150-180g daily from plant sources\n3. **Train Heavy**: Focus on compound lifts, progressive overload\n4. **Volume**: 10-20 sets per muscle group weekly\n5. **Rest**: Muscles grow outside the gym\n6. **Patience**: Expect 0.5-1kg muscle per month max\n\n**Top Vegetarian Protein Sources**: Greek yogurt, paneer, tofu, lentils, chickpeas, quinoa, protein shakes.\n\nConsistency is king! 👑",
    ]
  },
  
  nutrition: {
    keywords: ['nutrition', 'diet', 'eating', 'food', 'meal', 'calories', 'macros', 'protein', 'carbs', 'fats'],
    responses: [
      "Nutrition is 70-80% of your results! Here's what works:\n\n**Macronutrient Balance**:\n- Protein: 25-30% (muscle repair, satiety)\n- Carbs: 40-50% (energy, performance)\n- Fats: 20-30% (hormones, absorption)\n\n**Vegetarian Protein Champions**:\n- Paneer, Greek yogurt, tofu, tempeh\n- Lentils, chickpeas, black beans\n- Quinoa, edamame, protein powder\n- Nuts, seeds (hemp, chia)\n\n**Pro Tips**:\n- Eat every 3-4 hours to maintain energy\n- Pre/post-workout nutrition crucial\n- Hydrate constantly\n- Track your intake initially to learn portions\n\nUse our meal planner - it's designed for vegetarian athletes! 🥗",
    ]
  },
  
  workout: {
    keywords: ['workout', 'exercise', 'training', 'gym', 'routine', 'program', 'lift'],
    responses: [
      "Let's talk training! Here's what effective workouts look like:\n\n**Beginner** (0-6 months):\n- Full body 3x/week\n- Master form first, then add weight\n- Focus: Squats, push-ups, rows, planks\n- Cardio: 2-3x/week, 20-30 min\n\n**Intermediate** (6-24 months):\n- Upper/Lower or Push/Pull/Legs split\n- Progressive overload every week\n- 3-5 sets of 8-12 reps\n- Add isolation exercises\n\n**Advanced** (2+ years):\n- Specialized splits, periodization\n- Focus on weak points\n- Advanced techniques (drop sets, supersets)\n\nCheck our Workout Generator for personalized routines! 💪",
      
      "Training smart > training hard!\n\n**Workout Structure**:\n1. **Warm-up** (5-10 min): Dynamic stretches, light cardio\n2. **Compound Lifts** (20-30 min): Big movements first\n3. **Isolation Work** (15-20 min): Target specific muscles\n4. **Core** (5-10 min): Planks, rotations, anti-rotation\n5. **Cool-down** (5 min): Stretch, mobility\n\n**Key Principles**:\n- Progressive Overload (add weight/reps each week)\n- Mind-Muscle Connection (feel the muscle working)\n- Full Range of Motion (no ego lifting!)\n- Control the Negative (2-3 sec lowering)\n\n**Frequency**: Each muscle 2x/week for optimal growth! 🔥",
    ]
  },
  
  cardio: {
    keywords: ['cardio', 'running', 'hiit', 'conditioning', 'endurance', 'stamina'],
    responses: [
      "Cardio is crucial for heart health and fat loss! Here's the breakdown:\n\n**Types**:\n1. **LISS** (Low Intensity Steady State)\n   - 60-70% max heart rate\n   - 30-60 min\n   - Great for recovery days, fat burning\n   \n2. **MISS** (Moderate Intensity)\n   - 70-80% max heart rate\n   - 20-40 min\n   - Best overall fat loss\n   \n3. **HIIT** (High Intensity Interval Training)\n   - 85-95% max heart rate\n   - 15-25 min total\n   - Max calorie burn, metabolic boost\n\n**Weekly Plan**:\n- 2x HIIT sessions\n- 2-3x steady state\n- 10k+ steps daily\n\n**Pro Tip**: Do cardio after weights or separate session to preserve muscle! 🏃‍♂️",
    ]
  },
  
  recovery: {
    keywords: ['recovery', 'rest', 'sleep', 'sore', 'tired', 'fatigue', 'overtraining'],
    responses: [
      "Recovery is where the magic happens! Muscles grow when you REST, not train.\n\n**Sleep** (Most Important!):\n- 7-9 hours nightly\n- Dark, cool room (18-20°C)\n- Consistent schedule\n- No screens 1 hour before bed\n\n**Nutrition Recovery**:\n- Post-workout: Protein + Carbs within 2 hours\n- Anti-inflammatory foods (turmeric, ginger, berries)\n- Stay hydrated (3-4L daily)\n\n**Active Recovery**:\n- Light walking, yoga, swimming\n- Foam rolling, stretching\n- Massage if available\n\n**Rest Days**: 1-2 per week minimum!\n\n**Signs of Overtraining**: Persistent fatigue, decreased performance, mood issues, elevated resting heart rate.\n\nIf overtrained, take 3-5 days OFF completely. Your gains will thank you! 😴",
    ]
  },
  
  motivation: {
    keywords: ['motivation', 'lazy', 'unmotivated', 'give up', 'quit', 'tired', 'discouraged'],
    responses: [
      "Listen up! Motivation is overrated. DISCIPLINE is what separates champions from dreamers.\n\n**Mindset Shifts**:\n1. **Action Creates Motivation**: Don't wait to feel like it. START, motivation follows.\n2. **Progress > Perfection**: A 30-min workout beats no workout.\n3. **Identity**: You're not someone trying to get fit. You ARE a fit person who trains.\n4. **Why Power**: Connect deeply to WHY you started.\n\n**Tactical Tips**:\n- Lay out gym clothes night before\n- Tell someone your workout time (accountability)\n- Just commit to showing up - you'll finish once there\n- Track progress (photos, strength, measurements)\n- Celebrate small wins!\n\n**Truth Bomb**: You don't rise to your goals. You fall to your systems. Build bulletproof habits! 🔥\n\nRemember: Every champion was once a beginner who refused to give up. Your future self will thank you for showing up TODAY.",
    ]
  },
  
  supplements: {
    keywords: ['supplement', 'protein powder', 'creatine', 'vitamins', 'bcaa', 'pre-workout'],
    responses: [
      "Supplements for vegetarians - let's keep it real:\n\n**MUST-HAVES**:\n1. **Protein Powder** (Whey or Pea/Rice blend)\n   - 1-2 scoops post-workout\n   - 25-30g protein per serving\n   \n2. **Vitamin B12** (500-1000 mcg daily)\n   - Critical for vegetarians\n   - Supports energy, nervous system\n   \n3. **Vitamin D3** (2000-4000 IU daily)\n   - Bone health, immunity, mood\n   \n4. **Omega-3** (EPA/DHA from algae)\n   - 250-500mg daily\n   - Heart health, inflammation\n\n**PROVEN EFFECTIVE**:\n- **Creatine Monohydrate** (5g daily)\n   - Strength, muscle growth, cognitive function\n   - One of the most researched supplements\n   \n- **Iron** (if deficient, get tested first)\n   - Pair with Vitamin C for absorption\n\n**OPTIONAL**:\n- Pre-workout (caffeine + beta-alanine)\n- Magnesium for sleep\n\n**Skip**: Fat burners, BCAAs (if eating enough protein), most test boosters.\n\nFood first, supplements fill gaps! 💊",
    ]
  },
  
  plateau: {
    keywords: ['plateau', 'stuck', 'not progressing', 'same weight', 'no results', 'stalled'],
    responses: [
      "Hit a plateau? Normal! Here's how to break through:\n\n**Training Plateau**:\n1. **Change Rep Ranges**: If doing 8-12, try 4-6 (strength) or 15-20 (endurance)\n2. **Increase Volume**: Add 2-3 sets per muscle group\n3. **New Exercises**: Swap movements every 6-8 weeks\n4. **Deload Week**: Reduce volume by 50% for one week to recover\n5. **Check Form**: Maybe you need MORE weight, not less\n\n**Weight Loss Plateau**:\n1. **Recalculate**: Your TDEE decreased as you lost weight\n2. **Track Everything**: Measure portions, count liquid calories\n3. **Add NEAT**: 2000 more steps daily\n4. **Refeed Day**: One higher carb day weekly (not cheat day!)\n5. **Patience**: Weight fluctuates. Compare weekly averages.\n\n**General Reset**:\n- Take 3-5 days fully off\n- Change workout split entirely\n- Hire a coach/trainer for fresh perspective\n\nYour body adapts. Keep evolving! 📈",
    ]
  },
  
  beginner: {
    keywords: ['beginner', 'start', 'new', 'never worked out', 'first time', 'getting started'],
    responses: [
      "Welcome to your fitness journey! Best decision ever. Here's your roadmap:\n\n**Month 1-2: Foundation**\n- **Training**: Full body 3x/week, 30-45 min\n- **Focus**: FORM over weight. Master the basics.\n- **Start**: Bodyweight exercises, light dumbbells\n- **Cardio**: 2-3x weekly, 20-30 min moderate\n\n**Nutrition**:\n- Use our Meal Planner for structure\n- Don't change everything at once\n- Focus on adding good foods vs. removing bad\n- Stay hydrated!\n\n**Key Beginner Movements**:\n1. Bodyweight Squats → Goblet Squats\n2. Push-ups (knee or wall if needed)\n3. Dumbbell Rows\n4. Planks (20-60 seconds)\n5. Walking Lunges\n\n**Mindset**:\n- Soreness is normal (not injury)\n- Progress isn't linear\n- 6-8 weeks for habit formation\n- EVERYONE started where you are\n\n**First Week Goal**: Just show up 3 times. That's it. You got this! 🚀",
      
      "Starting from scratch? Perfect! Here's your simple start:\n\n**Week 1-2: Movement Basics**\n- Walk 30 min daily\n- 2-3 full body sessions (use our Home Workout generator!)\n- Learn: Squat, Push, Pull, Hinge, Carry\n- No need for gym yet if intimidated\n\n**Week 3-4: Build Consistency**\n- Increase to 3-4 sessions\n- Add light weights (dumbbells or water bottles)\n- Track your food (just observe, don't restrict)\n- Focus on showing up\n\n**Week 5-8: Progressive Overload**\n- Slightly increase weights/reps\n- Add 1 extra set to exercises\n- Start tracking progress photos\n- Notice how much BETTER you feel!\n\n**Common Beginner Mistakes to AVOID**:\n❌ Doing too much too soon\n❌ Not eating enough protein\n❌ Comparing to others\n❌ Skipping rest days\n❌ Perfect program searching (just START!)\n\nRemember: The best workout is the one you'll actually DO. Start small, stay consistent. 💪",
    ]
  },
  
  homeWorkout: {
    keywords: ['home workout', 'no gym', 'bodyweight', 'no equipment', 'workout at home'],
    responses: [
      "Home workouts can be just as effective! Here's the truth:\n\n**Effective Home Exercises**:\n\n**Lower Body**:\n- Bodyweight Squats (3x15-20)\n- Bulgarian Split Squats (3x12 each)\n- Single Leg Deadlifts (3x10 each)\n- Jump Squats (3x10)\n- Wall Sits (3x45-60 sec)\n\n**Upper Body**:\n- Push-ups (regular, wide, diamond) (3x max)\n- Pike Push-ups (shoulders) (3x10)\n- Inverted Rows (use table) (3x12)\n- Dips (use chairs) (3x10)\n\n**Core**:\n- Planks (3x60 sec)\n- Mountain Climbers (3x20 each)\n- Bicycle Crunches (3x20 each)\n- Dead Bugs (3x15)\n\n**Minimal Equipment Upgrades**:\n- Resistance bands ($15)\n- Pull-up bar ($25)\n- Adjustable dumbbells ($50-100)\n- Jump rope ($10)\n\nUse our Workout Generator and select 'Home' - it'll create perfect routines! No excuses! 🏠💪",
    ]
  },
  
  timeManagement: {
    keywords: ['no time', 'busy', 'time management', 'quick workout', 'short workout'],
    responses: [
      "Busy schedule? No problem! Quality > Quantity:\n\n**20-Minute Effective Workouts**:\n\n**Option 1: HIIT Circuit** (3 rounds)\n- Jump Squats (45 sec)\n- Push-ups (45 sec)\n- Mountain Climbers (45 sec)\n- Burpees (45 sec)\n- Rest (60 sec)\n\n**Option 2: Strength Focus**\n- Superset 1: Squats + Push-ups (4 sets)\n- Superset 2: Lunges + Rows (4 sets)\n- 30 seconds rest between\n\n**Option 3: EMOM** (Every Minute On the Minute - 20 min)\n- Min 1: 15 Squats\n- Min 2: 10 Push-ups\n- Min 3: 20 Crunches\n- Min 4: 30 sec Plank\n- Repeat 5x\n\n**Time-Saving Hacks**:\n- Workout at home (saves commute)\n- Early morning (before life interferes)\n- Meal prep on Sundays\n- Supersets and circuits\n\n**Truth**: If it's important, you MAKE time. 20 min > 0 min. No excuses! ⏰",
    ]
  },
  
  hydration: {
    keywords: ['water', 'hydration', 'drink', 'hydrate', 'dehydrated'],
    responses: [
      "Water is THE most overlooked performance enhancer!\n\n**Daily Water Target**:\n- Minimum: 3L (12 cups) for average person\n- Athletes/Training: 4-5L (16-20 cups)\n- Hot weather: Add 0.5-1L more\n\n**Why It Matters**:\n- 2% dehydration = 10% performance drop\n- Aids muscle recovery and growth\n- Regulates body temperature\n- Flushes toxins\n- Reduces hunger signals\n- Boosts metabolism\n\n**How to Hit Your Goal**:\n1. **Morning**: 500ml upon waking (before coffee!)\n2. **Training**: 200-300ml every 15-20 min\n3. **Post-Workout**: 500ml within 30 min\n4. **Throughout Day**: Sip constantly\n5. **Before Bed**: 250ml (not too much!)\n\n**Pro Tips**:\n- Use our reminder feature!\n- Get a marked water bottle\n- Flavor with lemon, cucumber, mint\n- Herbal tea counts!\n\n**Urine Check**: Should be light yellow. Dark = drink more! 💧",
    ]
  },
  
  form: {
    keywords: ['form', 'technique', 'proper form', 'correct way', 'how to'],
    responses: [
      "Form is EVERYTHING! Bad form = injury + no results.\n\n**Universal Form Principles**:\n1. **Neutral Spine**: No excessive arching or rounding\n2. **Controlled Movement**: 2 sec down, 1 sec up\n3. **Full Range of Motion**: Unless injury prevents it\n4. **Breathing**: Exhale on exertion (hard part)\n5. **Core Engaged**: Always, every exercise\n\n**Key Exercise Form Checks**:\n\n**Squats**:\n✅ Feet shoulder-width, toes slightly out\n✅ Knees track over toes\n✅ Chest up, eyes forward\n✅ Hips back and down\n✅ Depth: Thighs parallel or below\n\n**Push-ups**:\n✅ Hands under shoulders\n✅ Body in straight line (plank position)\n✅ Lower chest to ground\n✅ Elbows at 45° angle\n\n**Deadlifts**:\n✅ Bar over mid-foot\n✅ Neutral spine throughout\n✅ Shoulders over bar\n✅ Drive through heels\n✅ Hip hinge, not squat\n\n**When in Doubt**: Record yourself, watch tutorials, ask a trainer. Perfect practice makes perfect! 🎯",
    ]
  },
  
  mentalHealth: {
    keywords: ['mental health', 'depression', 'anxiety', 'stress', 'mental', 'mindset'],
    responses: [
      "Fitness & mental health are deeply connected. Let's talk about it:\n\n**Exercise Benefits for Mental Health**:\n- Increases endorphins (natural mood boosters)\n- Reduces cortisol (stress hormone)\n- Improves sleep quality\n- Builds confidence through achievement\n- Provides routine and structure\n- Social connection (if group fitness)\n\n**Recommended Approach**:\n1. **Consistency Over Intensity**: Regular moderate exercise > sporadic intense\n2. **Outdoor Exercise**: Nature + movement = powerful combo\n3. **Mind-Body Practices**: Yoga, tai chi, mindful walking\n4. **Strength Training**: Builds mental resilience, sense of control\n5. **Cardio**: Immediately boosts mood (20-30 min)\n\n**When You're Struggling**:\n- Just 10 min counts\n- Walk outside\n- Do gentle stretching\n- Lower expectations temporarily\n- Focus on showing up, not performance\n\n**Important**: Exercise helps but isn't a replacement for professional mental health support. If struggling, please reach out to a therapist or counselor.\n\nYour mental fitness matters just as much as physical! 🧠💙",
    ]
  },
};

function findBestResponse(message: string, userContext?: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Check greetings first
  const greetingWords = ['hi', 'hello', 'hey', 'sup', 'yo', 'greetings'];
  if (greetingWords.some(word => lowerMessage.includes(word)) && message.length < 20) {
    return KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)];
  }
  
  // Check each knowledge category
  const categories = [
    KNOWLEDGE_BASE.weightLoss,
    KNOWLEDGE_BASE.muscleBuilding,
    KNOWLEDGE_BASE.nutrition,
    KNOWLEDGE_BASE.workout,
    KNOWLEDGE_BASE.cardio,
    KNOWLEDGE_BASE.recovery,
    KNOWLEDGE_BASE.motivation,
    KNOWLEDGE_BASE.supplements,
    KNOWLEDGE_BASE.plateau,
    KNOWLEDGE_BASE.beginner,
    KNOWLEDGE_BASE.homeWorkout,
    KNOWLEDGE_BASE.timeManagement,
    KNOWLEDGE_BASE.hydration,
    KNOWLEDGE_BASE.form,
    KNOWLEDGE_BASE.mentalHealth,
  ];
  
  // Find matching category
  for (const category of categories) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = category.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Generic helpful response if no match
  return `Great question! I'm here to help with:\n\n💪 **Training**: Workout programs, exercise form, splits\n🥗 **Nutrition**: Meal planning, macros, vegetarian diet\n📈 **Progress**: Tracking, breaking plateaus, goal setting\n🧘 **Recovery**: Sleep, rest days, injury prevention\n🔥 **Motivation**: Mindset, consistency, discipline\n\nWhat specific area would you like to dive into? I'll give you actionable advice tailored to your goals!`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, conversationHistory, userContext } = body;
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    // Generate context-aware response
    const response = findBestResponse(message.trim(), userContext);
    
    return NextResponse.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
