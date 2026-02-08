export interface UserProfile {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
  allergies: string;
  medicalConditions: string;
  mealsPerDay: string;
  budgetRange: string;
  regionFoodStyle: string;
}

export const defaultUserProfile: UserProfile = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  activityLevel: "",
  goal: "",
  dietaryPreference: "",
  allergies: "",
  medicalConditions: "",
  mealsPerDay: "3",
  budgetRange: "",
  regionFoodStyle: "",
};

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
}

export interface DietPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  hydration: number;
  avoidFoods: string[];
  weeklyPlan: DayPlan[];
}
