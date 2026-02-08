"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  ArrowLeft,
  Download,
  RefreshCw,
  Flame,
  Beef,
  Wheat,
  Droplets,
  AlertTriangle,
  Sun,
  Coffee,
  Moon,
  Cookie,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { DietPlan, UserProfile, DayPlan, Meal } from "@/lib/types";

interface DietPlanResultsProps {
  plan: DietPlan;
  profile: UserProfile;
  onRegenerate: () => void;
  onStartOver: () => void;
  onDownloadPdf?: () => void;
  isRegenerating?: boolean;
  isDownloadingPdf?: boolean;
}

/** Sum macros and calories from a day's meals (actual from plan, so totals add up). */
function getActualMacrosFromDay(meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snacks: Meal }) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fats = 0;
  for (const m of [meals.breakfast, meals.lunch, meals.dinner, meals.snacks]) {
    calories += m.calories;
    protein += m.protein;
    carbs += m.carbs;
    fats += m.fats;
  }
  return { calories, protein, carbs, fats };
}

const mealIcons = {
  breakfast: Sun,
  lunch: Coffee,
  dinner: Moon,
  snacks: Cookie,
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

function goalLabel(goal: string) {
  const map: Record<string, string> = {
    weight_loss: "Weight Loss",
    weight_gain: "Weight Gain",
    muscle_building: "Muscle Building",
    maintenance: "Maintenance",
  };
  return map[goal] || goal;
}

export function DietPlanResults({
  plan,
  profile,
  onRegenerate,
  onStartOver,
  onDownloadPdf,
  isRegenerating = false,
  isDownloadingPdf = false,
}: DietPlanResultsProps) {
  const [expandedDay, setExpandedDay] = useState<number>(0);

  const actualMacros = useMemo(() => {
    const day1 = plan.weeklyPlan[0];
    if (!day1) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return getActualMacrosFromDay(day1.meals);
  }, [plan.weeklyPlan]);

  const totalMacroGrams = actualMacros.protein + actualMacros.carbs + actualMacros.fats;
  const proteinPct = totalMacroGrams > 0 ? Math.round((actualMacros.protein / totalMacroGrams) * 100) : 33;
  const carbsPct = totalMacroGrams > 0 ? Math.round((actualMacros.carbs / totalMacroGrams) * 100) : 34;
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  const mealsPerDay = Number(profile.mealsPerDay) || 4;
  const showSnacks = mealsPerDay >= 4;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading text-foreground">
            NutriPlan AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onStartOver} size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Start Over
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6 lg:py-12">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-heading text-foreground md:text-4xl text-balance">
            Your Personalized Diet Plan
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Goal: {goalLabel(profile.goal)} | {profile.dietaryPreference === "non_vegetarian" ? "Non-Vegetarian" : profile.dietaryPreference === "vegan" ? "Vegan" : "Vegetarian"} | {profile.regionFoodStyle === "indian" ? "Indian" : profile.regionFoodStyle === "continental" ? "Continental" : "Mixed"} Cuisine
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="text-2xl font-bold font-heading text-card-foreground">
                    {actualMacros.calories.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">from your meals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Beef className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold font-heading text-card-foreground">
                    {actualMacros.protein}g
                  </p>
                  <p className="text-xs text-muted-foreground">{proteinPct}% of macros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Wheat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold font-heading text-card-foreground">
                    {actualMacros.carbs}g
                  </p>
                  <p className="text-xs text-muted-foreground">{carbsPct}% of macros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hydration</p>
                  <p className="text-2xl font-bold font-heading text-card-foreground">
                    {plan.hydration}L
                  </p>
                  <p className="text-xs text-muted-foreground">water/day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macronutrient Bar */}
        <Card className="border border-border bg-card mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-heading">Macronutrient Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-6 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground transition-all"
                style={{ width: `${proteinPct}%` }}
              >
                {proteinPct}%
              </div>
              <div
                className="bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground transition-all"
                style={{ width: `${carbsPct}%` }}
              >
                {carbsPct}%
              </div>
              <div
                className="bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground transition-all"
                style={{ width: `${fatsPct}%` }}
              >
                {fatsPct}%
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-card-foreground">Protein ({actualMacros.protein}g)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-card-foreground">Carbs ({actualMacros.carbs}g)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <span className="text-card-foreground">Fats ({actualMacros.fats}g)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Foods to Avoid */}
        {plan.avoidFoods.length > 0 && (
          <Card className="border border-destructive/30 bg-destructive/5 mb-8">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold font-heading text-card-foreground mb-2">
                    Foods to Avoid
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.avoidFoods.map((food) => (
                      <Badge
                        key={food}
                        variant="destructive"
                        className="text-xs capitalize"
                      >
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7-Day Meal Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-heading text-foreground mb-5">
            7-Day Meal Plan
          </h2>
          <div className="flex flex-col gap-4">
            {plan.weeklyPlan.map((dayPlan: DayPlan, index: number) => (
              <DayCard
                key={dayPlan.day}
                dayPlan={dayPlan}
                showSnacks={showSnacks}
                isExpanded={expandedDay === index}
                onToggle={() =>
                  setExpandedDay(expandedDay === index ? -1 : index)
                }
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center pt-4 pb-8">
          <Button
            onClick={onRegenerate}
            size="lg"
            className="text-base px-8"
            disabled={isRegenerating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating…" : "Regenerate Plan"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 bg-transparent"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <Download className={`mr-2 h-4 w-4 ${isDownloadingPdf ? "animate-pulse" : ""}`} />
            {isDownloadingPdf ? "Preparing PDF…" : "Download Diet Plan (PDF)"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold font-heading text-foreground">
              NutriPlan AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Disclaimer: This is a prototype and not a substitute for professional dietary advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Day Card Sub-Component ---

function DayCard({
  dayPlan,
  showSnacks,
  isExpanded,
  onToggle,
}: {
  dayPlan: DayPlan;
  showSnacks: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const mealKeys = (Object.keys(dayPlan.meals) as Array<keyof typeof dayPlan.meals>).filter(
    (key) => {
      if (key === "snacks" && !showSnacks) return false;
      const m = dayPlan.meals[key];
      return m.calories > 0 && m.items.length > 0;
    }
  );
  const totalCal = mealKeys.reduce((s, k) => s + dayPlan.meals[k].calories, 0);

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm font-heading">
            {dayPlan.day.slice(0, 3)}
          </div>
          <div>
            <h3 className="font-semibold font-heading text-card-foreground">
              {dayPlan.day}
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalCal.toLocaleString()} kcal total
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5">
          <Separator className="mb-5" />
          <div className="grid gap-4 sm:grid-cols-2">
            {mealKeys.map((mealKey) => {
              const meal = dayPlan.meals[mealKey];
              const Icon = mealIcons[mealKey];
              return (
                <div
                  key={mealKey}
                  className="rounded-lg border border-border p-4 bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm font-heading text-card-foreground">
                      {mealLabels[mealKey]}
                    </h4>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {meal.calories} kcal
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-card-foreground mb-2">
                    {meal.name}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {meal.items.map((item) => (
                      <li
                        key={item}
                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
