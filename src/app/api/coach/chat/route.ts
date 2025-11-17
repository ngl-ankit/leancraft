import { NextRequest, NextResponse } from 'next/server';

// Comprehensive fitness knowledge base for AI responses
const getAIResponse = (userMessage: string, context?: { userId?: number; userGoal?: string }): string => {
  const msg = userMessage.toLowerCase();
  
  // Greetings and basic interactions
  if (msg.match(/\b(hi|hello|hey|good morning|good evening|sup|what's up|yo)\b/)) {
    const greetings = [
      "Hey there, champion! 🔥 Ready to crush your fitness goals today? I'm here to guide you every step of the way!",
      "What's up, fitness warrior! 💪 Let's make today count. What can I help you with?",
      "Hello! Your AI coach is ready to help you dominate your fitness journey. Let's go! 🚀",
      "Hey! Great to see you. Ready to level up your training? Let's talk strategy! ⚡"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Weight loss questions
  if (msg.match(/\b(lose weight|weight loss|fat loss|cut|cutting|slim down|lose fat|drop weight|shed pounds)\b/)) {
    return "Great question! For effective weight loss: 1) Create a caloric deficit of 300-500 calories daily (use our Diet Planner to calculate), 2) Prioritize protein (0.8-1g per lb bodyweight) to preserve muscle mass, 3) Combine strength training 3-4x/week with cardio 2-3x/week, 4) Stay consistent with your vegetarian meal plan - focus on whole foods, 5) Get 7-9 hours of quality sleep for hormonal balance, 6) Track your progress weekly and adjust as needed. Remember: sustainable weight loss is 1-2 lbs per week. Patience wins! 💪";
  }
  
  // Muscle gain questions
  if (msg.match(/\b(gain muscle|build muscle|bulk|bulking|muscle building|get bigger|mass|hypertrophy|size|grow)\b/)) {
    return "Let's build that muscle! 💪 For optimal muscle gain: 1) Eat in a slight caloric surplus (200-300 calories above maintenance), 2) Consume 0.8-1g protein per lb bodyweight from tofu, tempeh, legumes, Greek yogurt, and protein powder, 3) Progressive overload is KEY - increase weight or reps every week, 4) Train each muscle group 2x per week with 10-20 sets per muscle group, 5) Rest 48-72 hours between training the same muscles, 6) Sleep 8+ hours for growth hormone release. Use our Workout Generator for structured programs. Patience and consistency are everything!";
  }
  
  // Diet and nutrition questions
  if (msg.match(/\b(diet|nutrition|meal|eat|food|calories|macros|protein|carbs|fats|vegetarian diet)\b/)) {
    return "Nutrition is 70% of your success! 🥗 For your vegetarian diet: Focus on whole foods - quinoa, lentils, chickpeas, tofu, tempeh, Greek yogurt, and protein-rich grains. Macro split: 40% carbs, 30% protein, 30% healthy fats. Essential nutrients for vegetarians: B12 (supplement!), iron (spinach, lentils), omega-3s (flaxseed, chia), zinc, and vitamin D. Meal timing: Eat protein with every meal, pre-workout carbs for energy, post-workout protein + carbs within 2 hours. Meal prep on Sundays to stay consistent. Use our Diet Planner for customized meal plans with exact macros!";
  }
  
  // Workout questions
  if (msg.match(/\b(workout|exercise|training|routine|program|lift|gym|fitness plan|split)\b/)) {
    return "Let's talk training! 🏋️ For best results: Follow a structured program with progressive overload. I recommend a 4-5 day split: Day 1: Chest/Triceps, Day 2: Back/Biceps, Day 3: Rest/Cardio, Day 4: Shoulders/Abs, Day 5: Legs, Days 6-7: Active recovery. Compound movements (squats, deadlifts, bench, rows, overhead press) should be your foundation - they give you the most bang for your buck. Aim for 3-4 sets of 8-12 reps for hypertrophy. Track your lifts and aim to beat last week's numbers! Use our Workout Generator for personalized routines based on your goals!";
  }
  
  // Cardio questions
  if (msg.match(/\b(cardio|running|jogging|hiit|run|sprint|conditioning|treadmill|bike|cycling)\b/)) {
    return "Cardio is essential! 🏃 Strategic approach: 1) HIIT 2-3x/week (20-30 min) for fat loss and conditioning - 30sec sprint, 90sec rest, repeat, 2) LISS (low-intensity steady state) 2x/week (30-45 min) for active recovery and endurance, 3) Time cardio strategically - after weights or on separate days to preserve muscle, 4) Fasted morning cardio is optional but effective for fat loss. Don't overdo it - excessive cardio (60+ min daily) can hinder muscle growth. Quality over quantity! Mix it up: running, cycling, rowing, jump rope.";
  }
  
  // Recovery and rest questions
  if (msg.match(/\b(recovery|rest|sleep|tired|sore|overtraining|fatigue|rest day|deload)\b/)) {
    return "Recovery is where you actually grow! 💤 Priorities: 1) 7-9 hours of quality sleep - non-negotiable for muscle growth and hormone balance, 2) Rest days are crucial - at least 2 per week, more if you're feeling rundown, 3) Active recovery (yoga, walking, light stretching, foam rolling), 4) Nutrition timing - protein within 2 hours post-workout for muscle repair, 5) Manage stress through meditation or breathing exercises - cortisol kills gains. Listen to your body - persistent fatigue, declining performance, or mood changes mean you need MORE rest. Growth happens during recovery, not in the gym!";
  }
  
  // Motivation and mental health
  if (msg.match(/\b(motivation|motivated|inspire|give up|quit|hard|difficult|struggle|mental|mindset|depression|anxiety)\b/)) {
    return "I see that fire in you! 🔥 Mental game is everything: 1) Progress isn't linear - bad days are totally normal, embrace them, 2) Focus on the process, not just the outcome - enjoy the journey, 3) Celebrate small wins daily (an extra rep, better form, healthier choice), 4) Your 'why' is your anchor - write it down and review it when motivation dips, 5) Community matters - share your journey, find accountability partners, 6) Discipline beats motivation - build habits, systems, and routines. Remember: You're not competing with anyone else, only yesterday's version of yourself. You're stronger than you think, and every rep counts. Keep showing up! 💪";
  }
  
  // Supplements questions
  if (msg.match(/\b(supplement|supplements|protein powder|creatine|vitamin|preworkout|bcaa|multivitamin)\b/)) {
    return "Smart supplementation! 💊 Essential for vegetarians: 1) Protein powder (pea, hemp, or soy blend) - 1-2 scoops daily, especially post-workout, 2) B12 - 1000mcg daily (CRUCIAL for vegetarians!), 3) Creatine monohydrate - 5g daily (proven and safe, boosts strength and recovery), 4) Vitamin D3 - 2000-4000 IU daily (most people are deficient), 5) Iron if needed (get bloodwork done first). Optional but helpful: Omega-3 (algae-based for vegetarians), zinc, magnesium (sleep quality), pre-workout (caffeine + beta-alanine for energy). Focus on whole foods first - supplements fill the gaps, they don't replace real nutrition!";
  }
  
  // Progress tracking
  if (msg.match(/\b(progress|track|tracking|measure|measurement|weight|scale|photos|results)\b/)) {
    return "Tracking is accountability! 📊 Best metrics to measure: 1) Body weight (weekly average, same time/conditions - morning, after bathroom, before food), 2) Progress photos (every 2 weeks, same lighting/pose/time), 3) Body measurements (chest, waist, arms, thighs monthly with measuring tape), 4) Strength gains (log EVERY workout - this is the most important!), 5) Energy levels and mood (subjective but important). Don't obsess over daily fluctuations - your weight can swing 2-5 lbs daily from water, food, stress. Focus on 4-6 week trends. Use our Progress Tracking feature to visualize your journey and stay motivated!";
  }
  
  // Plateaus
  if (msg.match(/\b(plateau|stuck|not progressing|no progress|stall|stalled|not losing|not gaining)\b/)) {
    return "Plateaus are normal - let's break through! 🚀 Solutions: 1) Recalculate your calories (metabolic adaptation happens after 8-12 weeks - your TDEE changes), 2) Change training variables (different rep ranges, tempo, rest periods, exercise selection - confuse your muscles), 3) Deload week (reduce volume/intensity by 50% for full recovery), 4) Assess sleep and stress (biggest overlooked factors), 5) Try refeed days (higher carbs 1-2x/week) if cutting for 8+ weeks, 6) Check protein intake - might need more. Sometimes you need to take a step back to leap forward. Patience and small adjustments win!";
  }
  
  // Beginner questions
  if (msg.match(/\b(beginner|start|starting|new|never|first time|how to begin|just starting)\b/)) {
    return "Welcome to your fitness journey! 🌟 Perfect starting points: 1) Start with 3 full-body workouts per week (Monday, Wednesday, Friday), 2) Master form before adding weight - quality over ego ALWAYS, 3) Use our Workout Generator for beginner-friendly routines with video demos, 4) Track calories using our Diet Planner - start with maintenance calories to establish baseline, 5) Learn the basic movements: squat, deadlift, bench press, row, overhead press, 6) Be patient - real, lasting change takes 8-12 weeks to see and 6+ months to solidify. Focus on building habits and consistency over perfection. Small daily improvements compound into massive results. You've got this! 💪";
  }
  
  // Home workout questions
  if (msg.match(/\b(home workout|at home|no gym|bodyweight|calisthenics|no equipment)\b/)) {
    return "You can build an amazing physique at home! 🏠 Effective home exercises: Push-ups (decline, diamond, archer variations), pull-ups (invest in a doorway bar - $20 game changer), bodyweight squats, Bulgarian split squats, lunges, pistol squats, planks (all variations), dips (use chairs), pike push-ups. Progressive overload at home: slower tempo (3-0-3), pause reps, add resistance bands or weighted backpack, increase reps/sets, decrease rest time. Minimal equipment needed: resistance bands ($15), adjustable dumbbells ($50-100), pull-up bar ($20). Use our Workout Generator and select 'Home' mode for structured programs!";
  }
  
  // Vegetarian protein sources
  if (msg.match(/\b(vegetarian|vegan|plant based|protein sources|tofu|tempeh|legumes|meatless)\b/)) {
    return "Awesome vegetarian protein sources! 🌱 Top picks with protein content: Tofu (10g/100g), tempeh (19g/100g), lentils (18g/cup cooked), chickpeas (15g/cup), black beans (15g/cup), Greek yogurt (20g/cup), cottage cheese (25g/cup), edamame (17g/cup), quinoa (8g/cup), protein powder (20-25g/scoop), eggs if ovo-vegetarian (6g/egg), paneer (18g/100g). Pro tip: Combine different sources throughout the day for complete amino acid profile - rice + beans = complete protein! Aim for 0.8-1g protein per lb bodyweight daily. Our Diet Planner automatically calculates and includes these!";
  }
  
  // Form and technique
  if (msg.match(/\b(form|technique|proper|correctly|how to|injury|hurt|pain|prevent injury)\b/)) {
    return "Form is EVERYTHING! ⚠️ Golden rules: 1) Leave ego at the door - perfect form with lighter weight beats sloppy heavy reps ALWAYS, 2) Control the negative (lowering phase) - 2-3 seconds down, explosive up, 3) Full range of motion when possible (unless injury prevents it), 4) Brace your core on compound lifts (take deep breath, tighten abs), 5) If something hurts (sharp pain, not muscle burn), STOP immediately. Common mistakes: bouncing weights, using momentum, partial reps, not warming up. Film yourself or ask a trainer for form checks. Check our Workout Generator for exercise videos and pro tips for each movement!";
  }
  
  // Time management and busy schedules
  if (msg.match(/\b(busy|time|no time|schedule|quick|fast|efficient|30 min)\b/)) {
    return "Busy schedule? No excuses! ⏰ Time-efficient strategies: 1) 30-45 min workouts are plenty with proper intensity, 2) Meal prep on Sundays (3 hours = whole week sorted), 3) Combine exercises (supersets, tri-sets, circuits) to save 30% time, 4) HIIT over long steady cardio (20 min HIIT = 45 min jogging), 5) Train early morning or lunch break - make it a non-negotiable appointment with yourself, 6) Have backup home workouts ready (no excuses for skipping). Quality beats quantity. Consistency beats perfection. Even 20 minutes is better than zero! Our Workout Generator has quick 30-min routines.";
  }
  
  // Water and hydration
  if (msg.match(/\b(water|hydration|drink|hydrate|thirsty|dehydrated)\b/)) {
    return "Hydration is crucial! 💧 Guidelines: 1) Minimum 8 glasses (2 liters) daily, more if training or hot weather, 2) Drink 500ml upon waking (you're dehydrated from sleep), 3) 250-500ml during workouts (sip between sets), 4) Monitor urine color (pale yellow = well hydrated, dark yellow = drink more), 5) Add electrolytes if sweating heavily (60+ min intense training). Proper hydration improves: performance (up to 20%), recovery, metabolism, mental clarity, skin health, and hunger signals. Dehydration mimics hunger - try water first! Use our reminder feature to stay on track throughout the day!";
  }
  
  // Meal timing
  if (msg.match(/\b(meal timing|when to eat|pre workout|post workout|breakfast|fasting|intermittent)\b/)) {
    return "Meal timing optimization! ⏰🍽️ Best practices: 1) Pre-workout (1-2 hours before): Carbs + moderate protein (banana + protein shake, oatmeal), 2) Post-workout (within 2 hours): Protein + carbs for recovery (protein shake + rice, tofu stir-fry), 3) Breakfast: Within 1 hour of waking kickstarts metabolism, 4) Protein with every meal (3-5 meals daily) keeps you full and preserves muscle, 5) Intermittent fasting: Can work if it fits your lifestyle, but total daily intake matters most. Meal timing is 10-15% of results - total calories and macros are 85%. Don't stress perfectionism!";
  }
  
  // Soreness and DOMS
  if (msg.match(/\b(sore|soreness|doms|muscle pain|can't move|tight muscles)\b/)) {
    return "Soreness is normal! 💪 Understanding DOMS (Delayed Onset Muscle Soreness): 1) Peaks 24-72 hours after training, 2) Caused by micro-tears in muscle fibers (this is GOOD - it's how you grow), 3) More common with new exercises or increased intensity. Relief strategies: Light activity (walking, stretching), foam rolling (game changer!), adequate protein, hydration, sleep, anti-inflammatories if needed, hot bath or sauna. Can you train while sore? YES - just different muscle groups or lower intensity. Soreness decreases as you adapt. Not sore ≠ bad workout. Track performance, not soreness!";
  }
  
  // Cheat meals and treats
  if (msg.match(/\b(cheat meal|cheat day|junk food|pizza|dessert|ice cream|treat|indulge)\b/)) {
    return "Strategic indulgence! 🍕 Smart approach: 1) Plan 1 cheat MEAL (not day) per week - helps with adherence and sanity, 2) Don't go crazy - enjoy what you want but don't binge (800-1000 extra calories max), 3) Time it post-workout when muscles absorb nutrients better, 4) Refeed days (high carb) can actually boost leptin and metabolism if cutting long-term, 5) 80/20 rule: If 80% of your diet is clean, 20% flexibility is fine. Don't label foods as 'good' or 'bad' - it's about balance and context. One meal won't ruin progress, just like one workout won't get you shredded. Consistency over time wins!";
  }
  
  // Age-related questions
  if (msg.match(/\b(age|old|older|40s|50s|senior|elderly|aging)\b/)) {
    return "Age is just a number! 🎯 Training at any age: 1) Strength training is MORE important as you age (prevents sarcopenia - muscle loss), 2) Longer warm-ups (10-15 min) and cool-downs needed, 3) May need extra recovery day between sessions, 4) Focus on mobility work (yoga, stretching daily), 5) Protein needs actually INCREASE with age (1g per lb bodyweight), 6) Joint-friendly exercises (machines, cables, controlled movements). You can build muscle at any age - studies show 60+ year olds gaining muscle! Just be smart, consistent, and patient. Listen to your body more carefully!";
  }
  
  // Abs and core
  if (msg.match(/\b(abs|six pack|core|belly fat|flat stomach|abdominal)\b/)) {
    return "Abs are made in the kitchen! 🔥 Truth: 1) Everyone has abs - they're hidden under body fat, 2) You can't spot reduce fat - need overall fat loss (12-15% body fat for men, 18-22% for women to see abs), 3) Train abs 2-3x/week but diet is 80% of the equation. Best ab exercises: Planks (all variations), dead bugs, bicycle crunches, hanging leg raises, cable crunches, ab wheel. Core strength is crucial for: compound lifts, injury prevention, posture, overall strength. Stop doing 1000 crunches daily - focus on progressive overload and fat loss through diet + cardio + strength training!";
  }
  
  // Injury prevention
  if (msg.match(/\b(injury prevention|avoid injury|safe|safety|warm up|stretching)\b/)) {
    return "Prevention is key! 🛡️ Injury prevention essentials: 1) ALWAYS warm up (5-10 min cardio + dynamic stretching), 2) Progressive overload GRADUALLY (increase weight 2.5-5% weekly max), 3) Perfect form over heavy weight (film yourself), 4) Listen to pain signals (sharp pain = stop, muscle burn = good), 5) Deload every 6-8 weeks (reduce intensity 50%), 6) Balance pushing and pulling exercises, 7) Core stability work, 8) Adequate sleep and recovery. Most injuries come from: ego lifting, poor form, inadequate recovery, or overuse. Train smart for longevity!";
  }
  
  // Default comprehensive response
  return "Great question! 💪 I'm your comprehensive AI fitness coach ready to help with:\n\n• Nutrition & Meal Planning (vegetarian-specific advice)\n• Workout Programming & Exercise Form\n• Progress Tracking & Goal Setting\n• Supplement Guidance\n• Motivation & Mental Game\n• Recovery Strategies\n• Weight Loss or Muscle Gain Specifics\n• Cardio Programming\n• Overcoming Plateaus\n• Injury Prevention\n\nAsk me anything specific about your fitness journey - whether it's about weight loss strategies, muscle building programs, vegetarian protein sources, workout splits, cardio protocols, form checks, or overcoming mental barriers. Let's optimize your transformation together! What specific area would you like to dive into? 🚀";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, userContext } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Generate AI response using knowledge base
    const aiResponse = getAIResponse(message, { userId, userGoal: userContext?.goal });

    return NextResponse.json(
      {
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/coach/chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
