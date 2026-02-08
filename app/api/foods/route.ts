import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import type { FoodItem } from "@/lib/food-dataset";

/**
 * GET /api/foods - Returns the full food dataset from comprehensive_food_dataset.csv
 */
export async function GET() {
  try {
    const csvPath = join(process.cwd(), "comprehensive_food_dataset.csv");
    const raw = await readFile(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    const foods: FoodItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",");
      if (parts.length < 12 || parts[0] === "food_name") continue;
      const allergens = parts.length > 13 ? parts.slice(12).join(",") : (parts[12] || "");
      const cal = Number(parts[1]);
      const protein = Number(parts[2]);
      const carbs = Number(parts[3]);
      const fat = Number(parts[4]);
      if (Number.isNaN(cal)) continue;
      foods.push({
        food_name: parts[0].trim(),
        calories_kcal: cal,
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
      });
    }

    return NextResponse.json(foods);
  } catch (e) {
    console.error("Failed to load food dataset:", e);
    return NextResponse.json(
      { error: "Failed to load food dataset" },
      { status: 500 }
    );
  }
}
