/**
 * Types and helpers for the comprehensive food dataset.
 * Used by the diet plan generator to filter and select foods.
 */

export interface FoodItem {
  food_name: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  sugar_g: number;
  cholesterol_mg: number;
  glycemic_index: number;
  category: string;
  veg_nonveg: string;
  allergens: string;
}

/** CSV category -> meal type. dessert/snack both map to snacks. */
export const CATEGORY_TO_MEAL: Record<string, "breakfast" | "lunch" | "dinner" | "snacks"> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snacks",
  dessert: "snacks",
};

/** Keywords in food names that suggest Indian cuisine (for region filter). */
const INDIAN_KEYWORDS = [
  "dal", "roti", "chapati", "naan", "paratha", "idli", "dosa", "upma", "poha",
  "paneer", "curry", "biryani", "pulao", "khichdi", "sambar", "rasam", "raita",
  "chutney", "pakora", "samosa", "bajra", "jowar", "makki", "besan", "thepla",
  "bhakri", "missi", "kulcha", "poori", "luchi", "akki", "rajma", "chole",
  "kadhi", "korma", "tikka", "tandoori", "kebab", "bhurji", "palak", "kadai",
  "malai", "shahi", "matar", "pav", "vada", "uttapam", "appam", "pongal",
  "bisi bele", "curd", "ghee", "lassi", "kheer", "halwa", "ladoo", "parantha",
  "aloo", "gobi", "bhindi", "baingan", "masoor", "moong", "toor", "chana",
  "urad", "kabuli", "chana dal", "moong dal", "masoor dal", "toor dal",
  "rice", "chawal", "bread", "milk", "dahi", "vegetable", "sabzi", "sabji",
  "chicken", "fish", "mutton", "lentil", "bean", "potato", "tomato", "onion",
  "spinach", "masala", "gravy", "bhaji", "subzi", "phulka", "papad", "pickle",
  "achar", "puri", "tadka", "jeera", "zeera", "parantha", "parota", "rumali",
  "tandoor", "chaat", "bhel", "papdi", "seviyan", "vermicelli", "papadum",
  "atta", "wheat", "methi", "fenugreek", "cabbage", "cauliflower", "brinjal",
  "okra", "carrot", "radish", "beetroot", "dhania", "coriander", "haldi",
  "turmeric", "garam", "namkeen", "murabba", "pulao", "pilaf",
];

/** Keywords that suggest Continental/Western cuisine. */
const CONTINENTAL_KEYWORDS = [
  "pasta", "pizza", "burger", "sandwich", "wrap", "bagel", "croissant",
  "muffin", "ciabatta", "focaccia", "brioche", "sourdough", "quinoa",
  "couscous", "risotto", "salad", "soup", "grilled", "baked", "toast",
  "pancake", "waffle", "omelette", "bacon", "salmon", "tuna", "steak",
  "burrito", "taco", "hummus", "falafel", "avocado", "smoothie", "muesli",
  "oatmeal", "cereal", "yogurt", "parmesan", "feta", "mozzarella",
];

export function isIndianCuisine(name: string): boolean {
  const lower = name.toLowerCase();
  return INDIAN_KEYWORDS.some((k) => lower.includes(k));
}

export function isContinentalCuisine(name: string): boolean {
  const lower = name.toLowerCase();
  return CONTINENTAL_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Filter foods by user profile: dietary preference, allergies, region.
 */
export function filterFoodsByProfile(
  foods: FoodItem[],
  options: {
    dietaryPreference: string;
    allergies: string;
    regionFoodStyle: string;
  }
): FoodItem[] {
  const allergyList = options.allergies
    ? options.allergies.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean)
    : [];

  return foods.filter((f) => {
    // Dietary: vegan = no animal products (Veg only, no egg/milk in allergens for strict)
    if (options.dietaryPreference === "vegan") {
      if (f.veg_nonveg !== "Veg") return false;
      const aller = (f.allergens || "").toLowerCase();
      if (aller.includes("egg") || aller.includes("milk")) return false;
      return true;
    }
    if (options.dietaryPreference === "vegetarian") {
      if (f.veg_nonveg !== "Veg") return false;
      return true;
    }
    // non_vegetarian: allow all
    if (options.dietaryPreference === "non_vegetarian") {
      // no filter on veg/nonveg
    }

    // Allergies: exclude if any allergen matches
    if (allergyList.length > 0 && f.allergens) {
      const foodAllergens = f.allergens.split(",").map((a) => a.trim().toLowerCase());
      if (foodAllergens.some((a) => allergyList.some((u) => a.includes(u) || u.includes(a)))) return false;
    }

    // Region: indian / continental / mixed
    if (options.regionFoodStyle === "indian") {
      if (!isIndianCuisine(f.food_name)) return false;
    } else if (options.regionFoodStyle === "continental") {
      if (!isContinentalCuisine(f.food_name)) return false;
    }
    // mixed: no filter
    return true;
  });
}

/**
 * Parse a single CSV line. Handles allergens column which may contain commas.
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      result.push(current.trim());
      current = "";
      if (c === "\n") break;
    } else {
      current += c;
    }
  }
  if (current.length) result.push(current.trim());
  return result;
}

/**
 * Parse a CSV line with exactly 13 columns; if more, last column is allergens with commas.
 */
export function parseFoodCSVLine(line: string): Partial<FoodItem> | null {
  const parts = line.split(",");
  if (parts.length < 12) return null;
  const allergens = parts.length > 13 ? parts.slice(12).join(",") : (parts[12] || "");
  const cal = Number(parts[1]);
  const protein = Number(parts[2]);
  const carbs = Number(parts[3]);
  const fat = Number(parts[4]);
  if (Number.isNaN(cal) || parts[0] === "food_name") return null;
  return {
    food_name: parts[0].trim(),
    calories_kcal: Number.isNaN(cal) ? 0 : cal,
    protein_g: Number.isNaN(protein) ? 0 : protein,
    carbs_g: Number.isNaN(carbs) ? 0 : carbs,
    fat_g: Number.isNaN(fat) ? 0 : fat,
    fiber_g: Number(parts[5]) || 0,
    sodium_mg: Number(parts[6]) || 0,
    sugar_g: Number(parts[7]) || 0,
    cholesterol_mg: Number(parts[8]) || 0,
    glycemic_index: Number(parts[9]) || 0,
    category: (parts[10] || "").trim().toLowerCase(),
    veg_nonveg: (parts[11] || "").trim(),
    allergens: allergens.trim(),
  };
}
