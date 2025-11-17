import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals } from '@/db/schema';

interface MealItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealData {
  mealName: string;
  items: MealItem[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  instructions: string;
  alternatives: string;
}

const VALID_MEAL_TIMES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TEMPLATES = {
  breakfast: [
    {
      name: 'Protein-Rich Poha',
      items: [
        { name: 'Poha (flattened rice)', quantity: '1 cup', calories: 180, protein: 3, carbs: 40, fats: 1 },
        { name: 'Roasted peanuts', quantity: '30g', calories: 170, protein: 7, carbs: 5, fats: 14 },
        { name: 'Mixed vegetables', quantity: '1 cup', calories: 50, protein: 2, carbs: 10, fats: 0 },
        { name: 'Greek yogurt', quantity: '100g', calories: 100, protein: 10, carbs: 5, fats: 5 }
      ],
      instructions: 'Rinse poha and drain. Heat oil, add mustard seeds, curry leaves. Add vegetables, sauté. Mix in poha, turmeric, salt. Cook 3-4 minutes. Garnish with peanuts and coriander. Serve with Greek yogurt on the side.',
      alternatives: 'Substitute poha with oats or quinoa. Replace peanuts with cashews or almonds.'
    },
    {
      name: 'Paneer Bhurji with Whole Wheat Toast',
      items: [
        { name: 'Crumbled paneer', quantity: '150g', calories: 270, protein: 21, carbs: 6, fats: 18 },
        { name: 'Whole wheat toast', quantity: '2 slices', calories: 160, protein: 6, carbs: 28, fats: 2 },
        { name: 'Tomatoes and onions', quantity: '1 cup', calories: 40, protein: 1, carbs: 9, fats: 0 },
        { name: 'Ghee', quantity: '1 tsp', calories: 45, protein: 0, carbs: 0, fats: 5 }
      ],
      instructions: 'Heat ghee, add cumin seeds, onions. Add tomatoes, spices. Mix in crumbled paneer, cook 5 minutes. Serve hot with toasted whole wheat bread.',
      alternatives: 'Replace paneer with tofu for vegan option. Use multigrain bread instead of whole wheat.'
    },
    {
      name: 'Moong Dal Chilla with Mint Chutney',
      items: [
        { name: 'Moong dal batter', quantity: '1 cup', calories: 200, protein: 15, carbs: 35, fats: 1 },
        { name: 'Paneer stuffing', quantity: '50g', calories: 90, protein: 7, carbs: 2, fats: 6 },
        { name: 'Mint chutney', quantity: '2 tbsp', calories: 20, protein: 1, carbs: 4, fats: 0 },
        { name: 'Oil for cooking', quantity: '1 tbsp', calories: 120, protein: 0, carbs: 0, fats: 14 }
      ],
      instructions: 'Soak moong dal overnight, grind to smooth batter. Add salt, spices. Pour on hot griddle, spread thin. Add paneer stuffing, fold. Cook until golden. Serve with mint chutney.',
      alternatives: 'Use besan (chickpea flour) instead of moong dal. Stuff with mixed vegetables for variation.'
    },
    {
      name: 'Protein Oatmeal Bowl',
      items: [
        { name: 'Rolled oats', quantity: '1/2 cup', calories: 150, protein: 5, carbs: 27, fats: 3 },
        { name: 'Protein powder', quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 2 },
        { name: 'Mixed berries', quantity: '1 cup', calories: 70, protein: 1, carbs: 17, fats: 0 },
        { name: 'Almonds', quantity: '15 pieces', calories: 100, protein: 4, carbs: 4, fats: 9 },
        { name: 'Honey', quantity: '1 tbsp', calories: 60, protein: 0, carbs: 17, fats: 0 }
      ],
      instructions: 'Cook oats in milk or water until soft. Mix in protein powder. Top with berries, almonds, and drizzle honey.',
      alternatives: 'Use quinoa flakes instead of oats. Replace berries with banana and dates.'
    },
    {
      name: 'Idli with Sambar and Coconut Chutney',
      items: [
        { name: 'Idli (rice cakes)', quantity: '4 pieces', calories: 160, protein: 4, carbs: 34, fats: 1 },
        { name: 'Sambar (lentil stew)', quantity: '1 cup', calories: 120, protein: 6, carbs: 20, fats: 2 },
        { name: 'Coconut chutney', quantity: '3 tbsp', calories: 90, protein: 1, carbs: 5, fats: 8 },
        { name: 'Roasted chana', quantity: '30g', calories: 130, protein: 8, carbs: 18, fats: 2 }
      ],
      instructions: 'Steam idlis for 10-12 minutes. Prepare sambar with mixed vegetables and dal. Grind coconut chutney with green chilies. Serve hot with side of roasted chana for extra protein.',
      alternatives: 'Replace idli with dosa. Add a side of paneer for more protein.'
    }
  ],
  lunch: [
    {
      name: 'Rajma Rice Bowl',
      items: [
        { name: 'Rajma (kidney beans)', quantity: '1 cup', calories: 225, protein: 15, carbs: 40, fats: 1 },
        { name: 'Brown rice', quantity: '1 cup cooked', calories: 215, protein: 5, carbs: 45, fats: 2 },
        { name: 'Mixed vegetable salad', quantity: '1 cup', calories: 50, protein: 2, carbs: 10, fats: 0 },
        { name: 'Curd (yogurt)', quantity: '1/2 cup', calories: 60, protein: 4, carbs: 6, fats: 2 }
      ],
      instructions: 'Pressure cook rajma with onions, tomatoes, ginger-garlic, spices. Simmer until thick gravy forms. Serve with steamed brown rice, salad, and curd.',
      alternatives: 'Substitute rajma with chole (chickpeas). Use quinoa instead of rice for more protein.'
    },
    {
      name: 'Paneer Tikka with Quinoa',
      items: [
        { name: 'Grilled paneer tikka', quantity: '200g', calories: 360, protein: 28, carbs: 8, fats: 24 },
        { name: 'Quinoa', quantity: '1 cup cooked', calories: 220, protein: 8, carbs: 40, fats: 4 },
        { name: 'Mint chutney', quantity: '2 tbsp', calories: 20, protein: 1, carbs: 4, fats: 0 },
        { name: 'Grilled vegetables', quantity: '1 cup', calories: 70, protein: 2, carbs: 12, fats: 2 }
      ],
      instructions: 'Marinate paneer cubes in yogurt, spices, lemon juice. Grill until charred. Serve with cooked quinoa, grilled vegetables, and mint chutney.',
      alternatives: 'Use tofu instead of paneer. Replace quinoa with brown rice or millet.'
    },
    {
      name: 'Dal Tadka with Roti',
      items: [
        { name: 'Mixed dal (toor, moong)', quantity: '1 cup', calories: 200, protein: 14, carbs: 34, fats: 1 },
        { name: 'Whole wheat roti', quantity: '3 pieces', calories: 240, protein: 9, carbs: 45, fats: 3 },
        { name: 'Vegetable sabzi', quantity: '1 cup', calories: 100, protein: 3, carbs: 15, fats: 4 },
        { name: 'Green salad', quantity: '1 cup', calories: 30, protein: 1, carbs: 6, fats: 0 }
      ],
      instructions: 'Pressure cook dal with turmeric, salt. Prepare tadka with ghee, cumin, garlic, chilies. Pour over dal. Serve with rotis, sabzi, and fresh salad.',
      alternatives: 'Use multigrain rotis. Add a side of paneer bhurji for more protein.'
    },
    {
      name: 'Chickpea Buddha Bowl',
      items: [
        { name: 'Roasted chickpeas', quantity: '1 cup', calories: 270, protein: 14, carbs: 45, fats: 4 },
        { name: 'Brown rice', quantity: '1/2 cup cooked', calories: 108, protein: 2.5, carbs: 22, fats: 1 },
        { name: 'Roasted vegetables', quantity: '1 cup', calories: 100, protein: 3, carbs: 18, fats: 3 },
        { name: 'Tahini dressing', quantity: '2 tbsp', calories: 90, protein: 3, carbs: 3, fats: 8 },
        { name: 'Avocado slices', quantity: '1/4 avocado', calories: 60, protein: 1, carbs: 3, fats: 5 }
      ],
      instructions: 'Roast chickpeas with spices until crispy. Arrange bowl with rice base, roasted vegetables, chickpeas, avocado. Drizzle tahini dressing.',
      alternatives: 'Use quinoa instead of rice. Replace chickpeas with black beans or lentils.'
    },
    {
      name: 'Chole with Kulcha',
      items: [
        { name: 'Chole (chickpeas)', quantity: '1 cup', calories: 210, protein: 12, carbs: 35, fats: 3 },
        { name: 'Kulcha (leavened bread)', quantity: '2 pieces', calories: 280, protein: 8, carbs: 52, fats: 4 },
        { name: 'Onion salad', quantity: '1 cup', calories: 40, protein: 1, carbs: 9, fats: 0 },
        { name: 'Pickle', quantity: '1 tbsp', calories: 20, protein: 0, carbs: 3, fats: 1 }
      ],
      instructions: 'Cook chickpeas with onions, tomatoes, chole masala. Simmer until thick. Serve with warm kulcha, onion salad, and pickle.',
      alternatives: 'Replace kulcha with whole wheat naan or roti. Add a side of paneer for more protein.'
    }
  ],
  dinner: [
    {
      name: 'Vegetable Khichdi',
      items: [
        { name: 'Rice and moong dal mix', quantity: '1 cup cooked', calories: 220, protein: 10, carbs: 42, fats: 1 },
        { name: 'Mixed vegetables', quantity: '1 cup', calories: 60, protein: 2, carbs: 12, fats: 0 },
        { name: 'Ghee', quantity: '1 tsp', calories: 45, protein: 0, carbs: 0, fats: 5 },
        { name: 'Cucumber raita', quantity: '1/2 cup', calories: 50, protein: 3, carbs: 6, fats: 2 }
      ],
      instructions: 'Pressure cook rice, moong dal, vegetables with turmeric, cumin, salt. Temper with ghee and cumin seeds. Serve with cucumber raita.',
      alternatives: 'Add paneer cubes for more protein. Use millet instead of rice for variation.'
    },
    {
      name: 'Grilled Tofu with Roasted Vegetables',
      items: [
        { name: 'Marinated grilled tofu', quantity: '200g', calories: 180, protein: 20, carbs: 4, fats: 10 },
        { name: 'Roasted vegetables', quantity: '2 cups', calories: 150, protein: 4, carbs: 25, fats: 5 },
        { name: 'Quinoa', quantity: '1/2 cup cooked', calories: 110, protein: 4, carbs: 20, fats: 2 },
        { name: 'Olive oil', quantity: '1 tsp', calories: 40, protein: 0, carbs: 0, fats: 5 }
      ],
      instructions: 'Marinate tofu in soy sauce, garlic, spices. Grill until golden. Roast mixed vegetables with olive oil. Serve with quinoa.',
      alternatives: 'Replace tofu with paneer. Use brown rice or cauliflower rice instead of quinoa.'
    },
    {
      name: 'Palak Dal with Roti',
      items: [
        { name: 'Spinach dal', quantity: '1 cup', calories: 180, protein: 12, carbs: 28, fats: 2 },
        { name: 'Whole wheat roti', quantity: '2 pieces', calories: 160, protein: 6, carbs: 30, fats: 2 },
        { name: 'Vegetable salad', quantity: '1 cup', calories: 40, protein: 2, carbs: 8, fats: 0 },
        { name: 'Lemon wedge', quantity: '1 piece', calories: 5, protein: 0, carbs: 1, fats: 0 }
      ],
      instructions: 'Cook toor dal with spinach, tomatoes, turmeric. Temper with cumin, garlic. Serve with rotis and salad.',
      alternatives: 'Use methi (fenugreek) instead of spinach. Add a side of paneer for more protein.'
    },
    {
      name: 'Mixed Vegetable Soup with Whole Grain Bread',
      items: [
        { name: 'Thick vegetable soup', quantity: '2 cups', calories: 150, protein: 6, carbs: 28, fats: 2 },
        { name: 'Whole grain bread', quantity: '2 slices', calories: 160, protein: 8, carbs: 28, fats: 2 },
        { name: 'Grilled paneer', quantity: '50g', calories: 90, protein: 7, carbs: 2, fats: 6 },
        { name: 'Mixed salad', quantity: '1 cup', calories: 40, protein: 2, carbs: 8, fats: 0 }
      ],
      instructions: 'Prepare vegetable soup with carrots, beans, tomatoes, lentils. Blend partially for thickness. Serve with toasted bread, grilled paneer, and salad.',
      alternatives: 'Make it creamy with cashew paste. Add more beans for protein.'
    },
    {
      name: 'Vegetable Pulao with Raita',
      items: [
        { name: 'Vegetable pulao', quantity: '1 cup', calories: 240, protein: 6, carbs: 45, fats: 4 },
        { name: 'Mixed dal', quantity: '1/2 cup', calories: 100, protein: 7, carbs: 17, fats: 0.5 },
        { name: 'Boondi raita', quantity: '1/2 cup', calories: 80, protein: 3, carbs: 10, fats: 3 },
        { name: 'Papad', quantity: '1 piece', calories: 30, protein: 1, carbs: 5, fats: 1 }
      ],
      instructions: 'Cook basmati rice with mixed vegetables, whole spices. Serve with dal, raita, and roasted papad.',
      alternatives: 'Use brown rice for more fiber. Add paneer or soya chunks for protein boost.'
    }
  ],
  snack: [
    {
      name: 'Roasted Chana Mix',
      items: [
        { name: 'Roasted chana', quantity: '50g', calories: 180, protein: 10, carbs: 27, fats: 3 },
        { name: 'Mixed nuts', quantity: '20g', calories: 120, protein: 4, carbs: 4, fats: 10 },
        { name: 'Apple', quantity: '1 medium', calories: 95, protein: 0, carbs: 25, fats: 0 }
      ],
      instructions: 'Mix roasted chana with nuts, sprinkle chaat masala. Enjoy with apple slices.',
      alternatives: 'Replace chana with makhana. Add dates for natural sweetness.'
    },
    {
      name: 'Greek Yogurt Parfait',
      items: [
        { name: 'Greek yogurt', quantity: '200g', calories: 200, protein: 20, carbs: 10, fats: 10 },
        { name: 'Mixed berries', quantity: '1/2 cup', calories: 35, protein: 0.5, carbs: 8, fats: 0 },
        { name: 'Granola', quantity: '30g', calories: 130, protein: 3, carbs: 20, fats: 5 },
        { name: 'Honey', quantity: '1 tsp', calories: 20, protein: 0, carbs: 6, fats: 0 }
      ],
      instructions: 'Layer Greek yogurt with berries and granola. Drizzle honey on top.',
      alternatives: 'Use homemade yogurt. Replace granola with chopped nuts and seeds.'
    },
    {
      name: 'Paneer Tikka Bites',
      items: [
        { name: 'Grilled paneer cubes', quantity: '100g', calories: 180, protein: 14, carbs: 3, fats: 12 },
        { name: 'Bell peppers', quantity: '1/2 cup', calories: 25, protein: 1, carbs: 6, fats: 0 },
        { name: 'Mint chutney', quantity: '2 tbsp', calories: 20, protein: 1, carbs: 4, fats: 0 }
      ],
      instructions: 'Marinate paneer cubes in yogurt and spices. Grill with bell peppers. Serve with mint chutney.',
      alternatives: 'Use tofu instead of paneer. Add cherry tomatoes for variety.'
    },
    {
      name: 'Protein Smoothie',
      items: [
        { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fats: 0 },
        { name: 'Protein powder', quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 2 },
        { name: 'Almond milk', quantity: '1 cup', calories: 40, protein: 1, carbs: 2, fats: 3 },
        { name: 'Peanut butter', quantity: '1 tbsp', calories: 95, protein: 4, carbs: 3, fats: 8 },
        { name: 'Oats', quantity: '2 tbsp', calories: 60, protein: 2, carbs: 11, fats: 1 }
      ],
      instructions: 'Blend all ingredients until smooth. Serve immediately.',
      alternatives: 'Use berries instead of banana. Replace almond milk with soy milk for more protein.'
    },
    {
      name: 'Sprouts Chaat',
      items: [
        { name: 'Mixed sprouts', quantity: '1 cup', calories: 120, protein: 10, carbs: 20, fats: 1 },
        { name: 'Chopped vegetables', quantity: '1/2 cup', calories: 25, protein: 1, carbs: 5, fats: 0 },
        { name: 'Lemon juice', quantity: '1 tbsp', calories: 5, protein: 0, carbs: 1, fats: 0 },
        { name: 'Roasted peanuts', quantity: '20g', calories: 115, protein: 5, carbs: 3, fats: 10 }
      ],
      instructions: 'Mix boiled sprouts with chopped onions, tomatoes, cucumber. Add chaat masala, lemon juice, peanuts. Toss well.',
      alternatives: 'Add pomegranate seeds for sweetness. Use boiled chana instead of sprouts.'
    }
  ]
};

function generateMeal(
  mealTime: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFats: number,
  allergies: string | null,
  preferences: string | null,
  goal: string
): MealData {
  const templates = MEAL_TEMPLATES[mealTime as keyof typeof MEAL_TEMPLATES];
  let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  const allergyList = allergies?.toLowerCase().split(',').map(a => a.trim()) || [];
  
  if (allergyList.length > 0) {
    const safeTemplates = templates.filter(template => {
      const templateItems = template.items.map(item => item.name.toLowerCase()).join(' ');
      return !allergyList.some(allergy => templateItems.includes(allergy));
    });
    
    if (safeTemplates.length > 0) {
      selectedTemplate = safeTemplates[Math.floor(Math.random() * safeTemplates.length)];
    }
  }

  let currentCalories = selectedTemplate.items.reduce((sum, item) => sum + item.calories, 0);
  let currentProtein = selectedTemplate.items.reduce((sum, item) => sum + item.protein, 0);
  let currentCarbs = selectedTemplate.items.reduce((sum, item) => sum + item.carbs, 0);
  let currentFats = selectedTemplate.items.reduce((sum, item) => sum + item.fats, 0);

  const scaleFactor = targetCalories / currentCalories;
  
  const scaledItems: MealItem[] = selectedTemplate.items.map(item => {
    const itemScale = Math.max(0.5, Math.min(2, scaleFactor));
    return {
      name: item.name,
      quantity: item.quantity,
      calories: Math.round(item.calories * itemScale),
      protein: Math.round(item.protein * itemScale),
      carbs: Math.round(item.carbs * itemScale),
      fats: Math.round(item.fats * itemScale)
    };
  });

  const totalMacros = {
    calories: scaledItems.reduce((sum, item) => sum + item.calories, 0),
    protein: scaledItems.reduce((sum, item) => sum + item.protein, 0),
    carbs: scaledItems.reduce((sum, item) => sum + item.carbs, 0),
    fats: scaledItems.reduce((sum, item) => sum + item.fats, 0)
  };

  const proteinDiff = targetProtein - totalMacros.protein;
  if (proteinDiff > 5) {
    if (mealTime === 'breakfast' || mealTime === 'snack') {
      scaledItems.push({
        name: 'Greek yogurt (protein boost)',
        quantity: '100g',
        calories: 100,
        protein: Math.min(proteinDiff, 10),
        carbs: 5,
        fats: 5
      });
    } else {
      scaledItems.push({
        name: 'Paneer cubes (protein boost)',
        quantity: '50g',
        calories: 90,
        protein: Math.min(proteinDiff, 7),
        carbs: 2,
        fats: 6
      });
    }
  }

  const finalMacros = {
    calories: scaledItems.reduce((sum, item) => sum + item.calories, 0),
    protein: scaledItems.reduce((sum, item) => sum + item.protein, 0),
    carbs: scaledItems.reduce((sum, item) => sum + item.carbs, 0),
    fats: scaledItems.reduce((sum, item) => sum + item.fats, 0)
  };

  return {
    mealName: selectedTemplate.name,
    items: scaledItems,
    totalMacros: finalMacros,
    instructions: selectedTemplate.instructions,
    alternatives: selectedTemplate.alternatives
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      user_id,
      meal_time,
      calories,
      protein,
      carbs,
      fats,
      dietary_preferences,
      allergies,
      goal
    } = body;

    if (!user_id) {
      return NextResponse.json(
        {
          error: 'user_id is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

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

    if (!meal_time) {
      return NextResponse.json(
        {
          error: 'meal_time is required',
          code: 'MISSING_MEAL_TIME'
        },
        { status: 400 }
      );
    }

    if (!VALID_MEAL_TIMES.includes(meal_time)) {
      return NextResponse.json(
        {
          error: `meal_time must be one of: ${VALID_MEAL_TIMES.join(', ')}`,
          code: 'INVALID_MEAL_TIME'
        },
        { status: 400 }
      );
    }

    if (!goal) {
      return NextResponse.json(
        {
          error: 'goal is required',
          code: 'MISSING_GOAL'
        },
        { status: 400 }
      );
    }

    if (calories === undefined || calories === null) {
      return NextResponse.json(
        {
          error: 'calories is required',
          code: 'MISSING_CALORIES'
        },
        { status: 400 }
      );
    }

    if (protein === undefined || protein === null) {
      return NextResponse.json(
        {
          error: 'protein is required',
          code: 'MISSING_PROTEIN'
        },
        { status: 400 }
      );
    }

    if (carbs === undefined || carbs === null) {
      return NextResponse.json(
        {
          error: 'carbs is required',
          code: 'MISSING_CARBS'
        },
        { status: 400 }
      );
    }

    if (fats === undefined || fats === null) {
      return NextResponse.json(
        {
          error: 'fats is required',
          code: 'MISSING_FATS'
        },
        { status: 400 }
      );
    }

    const numericCalories = parseInt(calories);
    const numericProtein = parseInt(protein);
    const numericCarbs = parseInt(carbs);
    const numericFats = parseInt(fats);

    if (isNaN(numericCalories) || numericCalories <= 0) {
      return NextResponse.json(
        {
          error: 'calories must be a positive integer',
          code: 'INVALID_CALORIES'
        },
        { status: 400 }
      );
    }

    if (isNaN(numericProtein) || numericProtein <= 0) {
      return NextResponse.json(
        {
          error: 'protein must be a positive integer',
          code: 'INVALID_PROTEIN'
        },
        { status: 400 }
      );
    }

    if (isNaN(numericCarbs) || numericCarbs <= 0) {
      return NextResponse.json(
        {
          error: 'carbs must be a positive integer',
          code: 'INVALID_CARBS'
        },
        { status: 400 }
      );
    }

    if (isNaN(numericFats) || numericFats <= 0) {
      return NextResponse.json(
        {
          error: 'fats must be a positive integer',
          code: 'INVALID_FATS'
        },
        { status: 400 }
      );
    }

    const mealData = generateMeal(
      meal_time,
      numericCalories,
      numericProtein,
      numericCarbs,
      numericFats,
      allergies || null,
      dietary_preferences || null,
      goal
    );

    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];

    const insertData = {
      userId: userId,
      mealName: mealData.mealName,
      mealType: meal_time,
      calories: numericCalories,
      protein: numericProtein,
      carbs: numericCarbs,
      fats: numericFats,
      items: JSON.stringify(mealData.items),
      alternatives: mealData.alternatives,
      date: dateOnly,
      createdAt: now
    };

    const newMeal = await db
      .insert(meals)
      .values(insertData)
      .returning();

    if (newMeal.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to create meal',
          code: 'INSERT_FAILED'
        },
        { status: 500 }
      );
    }

    const result = newMeal[0];

    return NextResponse.json(
      {
        success: true,
        meal: {
          id: result.id,
          userId: result.userId,
          mealName: result.mealName,
          mealType: result.mealType,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fats: result.fats,
          items: typeof result.items === 'string' ? JSON.parse(result.items) : result.items,
          alternatives: result.alternatives,
          instructions: mealData.instructions,
          date: result.date,
          createdAt: result.createdAt
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