import type { DietPlan, UserProfile, Meal } from "./types";

function goalLabel(goal: string): string {
  const map: Record<string, string> = {
    weight_loss: "Weight Loss",
    weight_gain: "Weight Gain",
    muscle_building: "Muscle Building",
    maintenance: "Maintenance",
  };
  return map[goal] || goal;
}

function sumDayMacros(meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snacks: Meal }) {
  let cal = 0, p = 0, c = 0, f = 0;
  for (const m of [meals.breakfast, meals.lunch, meals.dinner, meals.snacks]) {
    cal += m.calories; p += m.protein; c += m.carbs; f += m.fats;
  }
  return { cal, p, c, f };
}

/**
 * Generate and download a PDF of the diet plan (client-side only).
 * Dynamically imports jspdf to avoid SSR issues.
 */
export async function downloadDietPlanPdf(plan: DietPlan, profile: UserProfile): Promise<void> {
  const jsPDF = (await import("jspdf")).default;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 15;
  let y = 20;
  const lineH = 6;

  const addText = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    doc.text(text, margin, y);
    y += lineH;
  };

  doc.setFont("helvetica", "bold");
  addText("Your Personalized Diet Plan", 18);
  y += 4;
  doc.setFont("helvetica", "normal");
  addText(`Goal: ${goalLabel(profile.goal)} | ${profile.dietaryPreference} | ${profile.regionFoodStyle} cuisine`);
  addText(`Daily target: ${plan.dailyCalories} kcal | Protein: ${plan.macros.protein}g | Carbs: ${plan.macros.carbs}g | Fats: ${plan.macros.fats}g`);
  addText(`Hydration: ${plan.hydration}L water/day`);
  y += 6;

  for (const dayPlan of plan.weeklyPlan) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    addText(dayPlan.day, 12);
    doc.setFont("helvetica", "normal");
    const { cal, p, c, f } = sumDayMacros(dayPlan.meals);
    addText(`Total: ${cal} kcal | P: ${p}g | C: ${c}g | F: ${f}g`);
    y += 2;

    const mealLabels: Record<string, string> = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snacks: "Snacks",
    };
    for (const key of ["breakfast", "lunch", "dinner", "snacks"] as const) {
      const meal = dayPlan.meals[key];
      if (meal.calories <= 0 || meal.items.length === 0) continue;
      addText(`  ${mealLabels[key]}: ${meal.name} (${meal.calories} kcal, P:${meal.protein}g C:${meal.carbs}g F:${meal.fats}g)`);
      for (const item of meal.items) {
        doc.setFontSize(9);
        doc.text(`    • ${item}`, margin + 2, y);
        y += 4;
      }
      doc.setFontSize(10);
      y += 2;
    }
    y += 4;
  }

  doc.save("diet-plan.pdf");
}
