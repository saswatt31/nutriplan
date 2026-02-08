"use client";

import { useState, useCallback, useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { DietPlanResults } from "@/components/diet-plan-results";
import { generateDietPlan } from "@/lib/generate-diet-plan";
import { downloadDietPlanPdf } from "@/lib/download-diet-pdf";
import type { UserProfile, DietPlan } from "@/lib/types";
import type { FoodItem } from "@/lib/food-dataset";

type AppView = "landing" | "questionnaire" | "results";

export default function Page() {
  const [view, setView] = useState<AppView>("landing");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [foods, setFoods] = useState<FoodItem[] | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetch("/api/foods")
      .then((r) => r.json())
      .then(setFoods)
      .catch(console.error);
  }, []);

  const handleStartAssessment = useCallback(() => {
    setView("questionnaire");
  }, []);

  const handleFormSubmit = useCallback(
    async (userProfile: UserProfile) => {
      const foodList =
        foods ?? (await fetch("/api/foods").then((r) => r.json()));
      setProfile(userProfile);
      const plan = generateDietPlan(userProfile, foodList);
      setDietPlan(plan);
      setView("results");
    },
    [foods]
  );

  const handleRegenerate = useCallback(async () => {
    if (!profile) return;
    setRegenerating(true);
    try {
      const foodList =
        foods ?? (await fetch("/api/foods").then((r) => r.json()));
      if (foodList?.length) {
        if (!foods) setFoods(foodList);
        const newPlan = generateDietPlan(profile, foodList, {
          seed: Date.now(),
        });
        setDietPlan(newPlan);
      }
    } catch (e) {
      console.error("Regenerate failed:", e);
    } finally {
      setRegenerating(false);
    }
  }, [profile, foods]);

  const handleDownloadPdf = useCallback(async () => {
    if (!dietPlan || !profile) return;
    setDownloadingPdf(true);
    try {
      await downloadDietPlanPdf(dietPlan, profile);
    } catch (e) {
      console.error("PDF download failed:", e);
    } finally {
      setDownloadingPdf(false);
    }
  }, [dietPlan, profile]);

  const handleStartOver = useCallback(() => {
    setView("landing");
    setProfile(null);
    setDietPlan(null);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setView("landing");
  }, []);

  if (view === "questionnaire") {
    return (
      <QuestionnaireForm
        onSubmit={handleFormSubmit}
        onBack={handleBackToLanding}
      />
    );
  }

  if (view === "results" && dietPlan && profile) {
    return (
      <DietPlanResults
        plan={dietPlan}
        profile={profile}
        onRegenerate={handleRegenerate}
        onStartOver={handleStartOver}
        onDownloadPdf={handleDownloadPdf}
        isRegenerating={regenerating}
        isDownloadingPdf={downloadingPdf}
      />
    );
  }

  return <LandingPage onStart={handleStartAssessment} />;
}
