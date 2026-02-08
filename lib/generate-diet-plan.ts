import type { UserProfile, DietPlan, DayPlan, Meal } from "./types";
import type { FoodItem } from "./food-dataset";
import {
  filterFoodsByProfile,
  CATEGORY_TO_MEAL,
} from "./food-dataset";

export interface GenerateDietPlanOptions {
  /** Optional seed for randomization (e.g. Date.now() for regeneration variety). */
  seed?: number;
}

/**
 * Generate a diet plan from user profile and food dataset.
 * Uses BMR/TDEE math and selects actual foods from the dataset to hit calorie and macro targets.
 */
export function generateDietPlan(
  profile: UserProfile,
  foodItems: FoodItem[],
  options: GenerateDietPlanOptions = {}
): DietPlan {
  const seed = options.seed ?? 0;

  // --- Step 1: BMR (Mifflin-St Jeor) ---
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);

  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // --- Step 2: Activity multiplier ---
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
  };
  const tdee = Math.round(
    bmr * (activityMultipliers[profile.activityLevel] || 1.2)
  );

  // --- Step 3: Goal-based calorie adjustment ---
  let dailyCalories: number;
  switch (profile.goal) {
    case "weight_loss":
      dailyCalories = Math.round(tdee * 0.8);
      break;
    case "weight_gain":
      dailyCalories = Math.round(tdee * 1.15);
      break;
    case "muscle_building":
      dailyCalories = Math.round(tdee * 1.2);
      break;
    default:
      dailyCalories = tdee;
  }

  // --- Step 4: Macronutrient breakdown ---
  let proteinRatio: number;
  let carbsRatio: number;
  let fatsRatio: number;

  switch (profile.goal) {
    case "muscle_building":
      proteinRatio = 0.35;
      carbsRatio = 0.4;
      fatsRatio = 0.25;
      break;
    case "weight_loss":
      proteinRatio = 0.3;
      carbsRatio = 0.35;
      fatsRatio = 0.35;
      break;
    case "weight_gain":
      proteinRatio = 0.25;
      carbsRatio = 0.5;
      fatsRatio = 0.25;
      break;
    default:
      proteinRatio = 0.25;
      carbsRatio = 0.5;
      fatsRatio = 0.25;
  }

  const macros = {
    protein: Math.round((dailyCalories * proteinRatio) / 4),
    carbs: Math.round((dailyCalories * carbsRatio) / 4),
    fats: Math.round((dailyCalories * fatsRatio) / 9),
  };

  // --- Step 5: Hydration ---
  const hydration = Math.round(weight * 0.033 * 10) / 10;

  // --- Step 6: Foods to avoid ---
  const avoidFoods: string[] = [];
  if (profile.allergies) {
    avoidFoods.push(
      ...profile.allergies.split(",").map((a) => a.trim().toLowerCase())
    );
  }
  if (profile.goal === "weight_loss") {
    avoidFoods.push("fried foods", "sugary drinks", "processed snacks");
  }
  if (profile.goal === "muscle_building") {
    avoidFoods.push("alcohol", "excessive sugar");
  }

  // --- Step 7: Filter foods by profile ---
  const filtered = filterFoodsByProfile(foodItems, {
    dietaryPreference: profile.dietaryPreference,
    allergies: profile.allergies,
    regionFoodStyle: profile.regionFoodStyle,
  });

  // Group by meal type (breakfast, lunch, dinner, snacks)
  const byMeal: Record<"breakfast" | "lunch" | "dinner" | "snacks", FoodItem[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  for (const f of filtered) {
    const meal = CATEGORY_TO_MEAL[f.category];
    if (meal && byMeal[meal].length < 80) byMeal[meal].push(f);
  }
  // If any meal type is empty, fall back to all filtered foods for that slot
  const fallback = filtered.filter((f) => f.calories_kcal > 0 && f.calories_kcal < 800);
  if (byMeal.breakfast.length === 0) byMeal.breakfast = fallback.slice(0, 50);
  if (byMeal.lunch.length === 0) byMeal.lunch = fallback.slice(0, 50);
  if (byMeal.dinner.length === 0) byMeal.dinner = fallback.slice(0, 50);
  if (byMeal.snacks.length === 0) byMeal.snacks = fallback.slice(0, 50);

  // --- Step 8: Build 7-day plan (respect mealsPerDay: 2, 3, 4, or 5) ---
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const mealsCount = Math.min(5, Math.max(2, Number(profile.mealsPerDay) || 4));

  const emptyMeal: Meal = {
    name: "—",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    items: [],
  };

  const weeklyPlan: DayPlan[] = days.map((day, dayIndex) => {
    const daySeed = seed + dayIndex * 1000;
    if (mealsCount === 2) {
      return {
        day,
        meals: {
          breakfast: buildMealFromFoods(byMeal.breakfast, Math.round(dailyCalories * 0.5), daySeed + 1),
          lunch: buildMealFromFoods(byMeal.lunch, Math.round(dailyCalories * 0.5), daySeed + 2),
          dinner: emptyMeal,
          snacks: emptyMeal,
        },
      };
    }
    if (mealsCount === 3) {
      const bfPct = 0.28;
      const lunchPct = 0.38;
      const dinnerPct = 0.34;
      return {
        day,
        meals: {
          breakfast: buildMealFromFoods(byMeal.breakfast, Math.round(dailyCalories * bfPct), daySeed + 1),
          lunch: buildMealFromFoods(byMeal.lunch, Math.round(dailyCalories * lunchPct), daySeed + 2),
          dinner: buildMealFromFoods(byMeal.dinner, Math.round(dailyCalories * dinnerPct), daySeed + 3),
          snacks: emptyMeal,
        },
      };
    }
    if (mealsCount === 5) {
      const bfPct = 0.22;
      const lunchPct = 0.28;
      const dinnerPct = 0.28;
      const snackPct = 0.22;
      return {
        day,
        meals: {
          breakfast: buildMealFromFoods(byMeal.breakfast, Math.round(dailyCalories * bfPct), daySeed + 1),
          lunch: buildMealFromFoods(byMeal.lunch, Math.round(dailyCalories * lunchPct), daySeed + 2),
          dinner: buildMealFromFoods(byMeal.dinner, Math.round(dailyCalories * dinnerPct), daySeed + 3),
          snacks: buildMealFromFoods(byMeal.snacks, Math.round(dailyCalories * snackPct), daySeed + 4),
        },
      };
    }
    // 4 meals (default)
    const bfPct = 0.25;
    const lunchPct = 0.35;
    const dinnerPct = 0.3;
    const snackPct = 0.1;
    return {
      day,
      meals: {
        breakfast: buildMealFromFoods(byMeal.breakfast, Math.round(dailyCalories * bfPct), daySeed + 1),
        lunch: buildMealFromFoods(byMeal.lunch, Math.round(dailyCalories * lunchPct), daySeed + 2),
        dinner: buildMealFromFoods(byMeal.dinner, Math.round(dailyCalories * dinnerPct), daySeed + 3),
        snacks: buildMealFromFoods(byMeal.snacks, Math.round(dailyCalories * snackPct), daySeed + 4),
      },
    };
  });

  return {
    dailyCalories,
    macros,
    hydration,
    avoidFoods: [...new Set(avoidFoods)].filter(Boolean),
    weeklyPlan,
  };
}

/** Simple deterministic shuffle based on seed. */
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build one meal by selecting foods from the list until we're close to targetCal.
 */
function buildMealFromFoods(
  pool: FoodItem[],
  targetCal: number,
  seed: number
): Meal {
  if (pool.length === 0) {
    return {
      name: "Meal",
      calories: targetCal,
      protein: Math.round((targetCal * 0.25) / 4),
      carbs: Math.round((targetCal * 0.5) / 4),
      fats: Math.round((targetCal * 0.25) / 9),
      items: ["No matching foods in dataset"],
    };
  }

  const shuffled = shuffleWithSeed(pool, seed);
  const selected: FoodItem[] = [];
  let totalCal = 0;
  const low = Math.round(targetCal * 0.85);
  const high = Math.round(targetCal * 1.2);

  for (const f of shuffled) {
    if (selected.length >= 5) break;
    if (totalCal >= high) break;
    const nextCal = totalCal + f.calories_kcal;
    if (selected.length === 0 && f.calories_kcal > targetCal * 1.5) continue;
    selected.push(f);
    totalCal += f.calories_kcal;
    if (totalCal >= low) break;
  }

  if (selected.length === 0) {
    selected.push(shuffled[0]);
    totalCal = shuffled[0].calories_kcal;
  }

  const protein = selected.reduce((s, f) => s + f.protein_g, 0);
  const carbs = selected.reduce((s, f) => s + f.carbs_g, 0);
  const fats = selected.reduce((s, f) => s + f.fat_g, 0);

  const mealName =
    selected.length === 1
      ? selected[0].food_name
      : selected
          .slice(0, 2)
          .map((f) => f.food_name)
          .join(" + ");

  return {
    name: mealName,
    calories: Math.round(totalCal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
    items: selected.map((f) => f.food_name),
  };
}
