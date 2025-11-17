import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface MealItem {
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
  alternatives: string;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const VEGETARIAN_MEALS = {
  breakfast: [
    {
      mealName: 'Classic Oatmeal with Fresh Berries',
      calories: 350,
      protein: 12,
      carbs: 58,
      fats: 8,
      items: ['Rolled oats (1 cup)', 'Almond milk (1 cup)', 'Mixed berries (1/2 cup)', 'Chia seeds (1 tbsp)', 'Honey (1 tsp)'],
      alternatives: 'Try steel-cut oats with banana and walnuts, or overnight oats with apple and cinnamon'
    },
    {
      mealName: 'Greek Yogurt Parfait',
      calories: 320,
      protein: 20,
      carbs: 42,
      fats: 7,
      items: ['Greek yogurt (1 cup)', 'Granola (1/4 cup)', 'Strawberries (1/2 cup)', 'Blueberries (1/4 cup)', 'Honey drizzle'],
      alternatives: 'Substitute with skyr yogurt and add sliced almonds, or use coconut yogurt for dairy-free option'
    },
    {
      mealName: 'Avocado Toast with Whole Grain Bread',
      calories: 380,
      protein: 14,
      carbs: 45,
      fats: 18,
      items: ['Whole grain bread (2 slices)', 'Avocado (1 whole)', 'Cherry tomatoes (1/2 cup)', 'Everything bagel seasoning', 'Lemon juice'],
      alternatives: 'Add poached egg for extra protein, or top with microgreens and hemp seeds'
    },
    {
      mealName: 'Tropical Smoothie Bowl',
      calories: 390,
      protein: 15,
      carbs: 65,
      fats: 10,
      items: ['Frozen mango (1 cup)', 'Banana (1 whole)', 'Spinach (1 cup)', 'Protein powder (1 scoop)', 'Coconut flakes', 'Chia seeds'],
      alternatives: 'Make an acai bowl or green smoothie bowl with kale and pineapple'
    },
    {
      mealName: 'Whole Wheat Pancakes with Maple Syrup',
      calories: 420,
      protein: 16,
      carbs: 70,
      fats: 9,
      items: ['Whole wheat pancakes (3 medium)', 'Pure maple syrup (2 tbsp)', 'Sliced banana', 'Crushed walnuts', 'Fresh blueberries'],
      alternatives: 'Try buckwheat pancakes or make protein pancakes with cottage cheese'
    }
  ],
  lunch: [
    {
      mealName: 'Quinoa Buddha Bowl',
      calories: 480,
      protein: 18,
      carbs: 62,
      fats: 16,
      items: ['Cooked quinoa (1 cup)', 'Roasted chickpeas (1/2 cup)', 'Kale (2 cups)', 'Roasted sweet potato (1/2 cup)', 'Tahini dressing (2 tbsp)', 'Pumpkin seeds'],
      alternatives: 'Substitute with brown rice bowl or farro bowl with different roasted vegetables'
    },
    {
      mealName: 'Mediterranean Chickpea Salad',
      calories: 420,
      protein: 16,
      carbs: 52,
      fats: 15,
      items: ['Chickpeas (1 cup)', 'Cucumber (1 cup)', 'Cherry tomatoes (1 cup)', 'Red onion (1/4 cup)', 'Feta cheese (1/4 cup)', 'Olives', 'Lemon-olive oil dressing'],
      alternatives: 'Make a white bean salad or lentil salad with similar vegetables'
    },
    {
      mealName: 'Veggie Wrap with Hummus',
      calories: 450,
      protein: 17,
      carbs: 58,
      fats: 16,
      items: ['Whole wheat tortilla (large)', 'Hummus (1/4 cup)', 'Mixed greens (1 cup)', 'Shredded carrots (1/2 cup)', 'Bell peppers (1/2 cup)', 'Cucumber slices', 'Sprouts'],
      alternatives: 'Try a falafel wrap or grilled vegetable panini'
    },
    {
      mealName: 'Hearty Lentil Soup with Whole Grain Roll',
      calories: 410,
      protein: 20,
      carbs: 68,
      fats: 7,
      items: ['Lentil soup (2 cups)', 'Whole grain roll (1 piece)', 'Mixed vegetables', 'Fresh herbs', 'Side salad'],
      alternatives: 'Try minestrone soup or split pea soup with crusty bread'
    },
    {
      mealName: 'Caprese Salad with Whole Grain Pasta',
      calories: 470,
      protein: 19,
      carbs: 60,
      fats: 17,
      items: ['Whole grain penne (1.5 cups)', 'Fresh mozzarella (1/2 cup)', 'Cherry tomatoes (1 cup)', 'Fresh basil', 'Balsamic glaze', 'Pine nuts'],
      alternatives: 'Make a Greek pasta salad or pesto pasta with sun-dried tomatoes'
    }
  ],
  dinner: [
    {
      mealName: 'Tofu Stir-Fry with Brown Rice',
      calories: 520,
      protein: 24,
      carbs: 68,
      fats: 16,
      items: ['Extra-firm tofu (6 oz)', 'Brown rice (1 cup)', 'Broccoli (1 cup)', 'Bell peppers (1 cup)', 'Snap peas (1/2 cup)', 'Ginger-soy sauce', 'Sesame seeds'],
      alternatives: 'Use tempeh or edamame instead of tofu, or try cauliflower rice for lower carbs'
    },
    {
      mealName: 'Pasta Primavera with Marinara',
      calories: 510,
      protein: 18,
      carbs: 78,
      fats: 14,
      items: ['Whole wheat pasta (2 cups)', 'Marinara sauce (1 cup)', 'Zucchini (1 cup)', 'Cherry tomatoes (1 cup)', 'Mushrooms (1/2 cup)', 'Fresh basil', 'Parmesan cheese'],
      alternatives: 'Try penne arrabbiata or spaghetti with roasted vegetables'
    },
    {
      mealName: 'Black Bean Burrito Bowl',
      calories: 540,
      protein: 22,
      carbs: 82,
      fats: 14,
      items: ['Black beans (1 cup)', 'Brown rice (1 cup)', 'Corn (1/2 cup)', 'Pico de gallo (1/2 cup)', 'Guacamole (1/4 cup)', 'Shredded lettuce', 'Lime wedge'],
      alternatives: 'Make a pinto bean bowl or try with cauliflower rice and extra veggies'
    },
    {
      mealName: 'Vegetable Curry with Basmati Rice',
      calories: 490,
      protein: 16,
      carbs: 76,
      fats: 13,
      items: ['Mixed vegetables (2 cups)', 'Chickpeas (3/4 cup)', 'Basmati rice (1 cup)', 'Coconut milk curry sauce', 'Fresh cilantro', 'Naan bread (small)'],
      alternatives: 'Try Thai green curry or dal with spinach and lentils'
    },
    {
      mealName: 'Stuffed Bell Peppers with Quinoa',
      calories: 460,
      protein: 19,
      carbs: 64,
      fats: 14,
      items: ['Bell peppers (2 large)', 'Quinoa (1 cup cooked)', 'Black beans (1/2 cup)', 'Corn (1/2 cup)', 'Diced tomatoes', 'Mexican cheese blend', 'Cilantro'],
      alternatives: 'Make stuffed zucchini boats or eggplant parmesan'
    }
  ],
  snack: [
    {
      mealName: 'Mixed Nuts and Dried Fruit',
      calories: 200,
      protein: 6,
      carbs: 18,
      fats: 12,
      items: ['Almonds (1/4 cup)', 'Cashews (2 tbsp)', 'Dried cranberries (2 tbsp)', 'Dark chocolate chips (1 tbsp)'],
      alternatives: 'Try trail mix or roasted chickpeas for a crunchy snack'
    },
    {
      mealName: 'Hummus with Fresh Vegetables',
      calories: 180,
      protein: 8,
      carbs: 22,
      fats: 7,
      items: ['Hummus (1/4 cup)', 'Carrot sticks (1 cup)', 'Cucumber slices (1 cup)', 'Cherry tomatoes (1/2 cup)', 'Whole grain crackers (5 pieces)'],
      alternatives: 'Use guacamole or tzatziki dip with veggie sticks'
    },
    {
      mealName: 'Protein Smoothie',
      calories: 220,
      protein: 20,
      carbs: 28,
      fats: 4,
      items: ['Vanilla protein powder (1 scoop)', 'Almond milk (1 cup)', 'Banana (1 small)', 'Spinach (1 cup)', 'Peanut butter (1 tsp)'],
      alternatives: 'Make a berry protein shake or green juice with cucumber and apple'
    },
    {
      mealName: 'Apple with Almond Butter',
      calories: 190,
      protein: 5,
      carbs: 24,
      fats: 9,
      items: ['Apple (1 medium)', 'Almond butter (1.5 tbsp)', 'Cinnamon sprinkle'],
      alternatives: 'Try banana with peanut butter or celery with sunflower seed butter'
    },
    {
      mealName: 'Greek Yogurt with Honey and Granola',
      calories: 210,
      protein: 15,
      carbs: 30,
      fats: 4,
      items: ['Greek yogurt (3/4 cup)', 'Granola (3 tbsp)', 'Honey (1 tsp)', 'Mixed berries (1/4 cup)'],
      alternatives: 'Use cottage cheese with fruit or make a yogurt bark with toppings'
    }
  ]
};

function selectMealsByType(mealType: string, count: number, allergies: string[] = []): MealItem[] {
  const validMealType = mealType as keyof typeof VEGETARIAN_MEALS;
  const meals = VEGETARIAN_MEALS[validMealType] || [];
  
  const filteredMeals = meals.filter(meal => {
    if (!allergies.length) return true;
    const allergyKeywords = allergies.map(a => a.toLowerCase());
    const mealText = JSON.stringify(meal).toLowerCase();
    return !allergyKeywords.some(keyword => mealText.includes(keyword));
  });

  const shuffled = [...filteredMeals].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function generateMealPlan(
  caloriesTarget?: number,
  proteinTarget?: number,
  carbsTarget?: number,
  fatsTarget?: number,
  mealType?: string,
  allergies: string[] = []
): MealItem[] {
  const mealPlan: MealItem[] = [];

  if (mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
    const count = mealType === 'snack' ? 2 : 1;
    mealPlan.push(...selectMealsByType(mealType, count, allergies));
  } else {
    mealPlan.push(...selectMealsByType('breakfast', 1, allergies));
    mealPlan.push(...selectMealsByType('lunch', 1, allergies));
    mealPlan.push(...selectMealsByType('dinner', 1, allergies));
    mealPlan.push(...selectMealsByType('snack', 2, allergies));
  }

  return mealPlan;
}

function calculateTotals(mealPlan: MealItem[]): NutritionTotals {
  return mealPlan.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fats: totals.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      caloriesTarget,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      mealType,
      allergies = [],
      dietaryPreferences,
      date,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
      return NextResponse.json(
        { error: 'userId must be a positive integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (caloriesTarget !== undefined && (isNaN(caloriesTarget) || caloriesTarget <= 0)) {
      return NextResponse.json(
        { error: 'caloriesTarget must be a positive number', code: 'INVALID_CALORIES_TARGET' },
        { status: 400 }
      );
    }

    if (proteinTarget !== undefined && (isNaN(proteinTarget) || proteinTarget <= 0)) {
      return NextResponse.json(
        { error: 'proteinTarget must be a positive number', code: 'INVALID_PROTEIN_TARGET' },
        { status: 400 }
      );
    }

    if (carbsTarget !== undefined && (isNaN(carbsTarget) || carbsTarget <= 0)) {
      return NextResponse.json(
        { error: 'carbsTarget must be a positive number', code: 'INVALID_CARBS_TARGET' },
        { status: 400 }
      );
    }

    if (fatsTarget !== undefined && (isNaN(fatsTarget) || fatsTarget <= 0)) {
      return NextResponse.json(
        { error: 'fatsTarget must be a positive number', code: 'INVALID_FATS_TARGET' },
        { status: 400 }
      );
    }

    if (mealType && !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      return NextResponse.json(
        { error: 'mealType must be one of: breakfast, lunch, dinner, snack', code: 'INVALID_MEAL_TYPE' },
        { status: 400 }
      );
    }

    if (allergies && !Array.isArray(allergies)) {
      return NextResponse.json(
        { error: 'allergies must be an array of strings', code: 'INVALID_ALLERGIES_FORMAT' },
        { status: 400 }
      );
    }

    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const sanitizedAllergies = allergies.map((a: string) => a.trim().toLowerCase());

    const mealPlan = generateMealPlan(
      caloriesTarget,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      mealType,
      sanitizedAllergies
    );

    const totalNutrition = calculateTotals(mealPlan);

    return NextResponse.json(
      {
        success: true,
        mealPlan,
        totalNutrition,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}