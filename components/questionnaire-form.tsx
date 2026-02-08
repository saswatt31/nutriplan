"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Ruler,
  Dumbbell,
  Target,
  Utensils,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/lib/types";
import { defaultUserProfile } from "@/lib/types";

interface QuestionnaireFormProps {
  onSubmit: (profile: UserProfile) => void;
  onBack: () => void;
}

const TOTAL_STEPS = 4;

const stepConfig = [
  { icon: User, label: "Personal Info" },
  { icon: Ruler, label: "Body Metrics" },
  { icon: Target, label: "Goals & Diet" },
  { icon: Utensils, label: "Preferences" },
];

export function QuestionnaireForm({ onSubmit, onBack }: QuestionnaireFormProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;

  function updateField(field: keyof UserProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateStep(): boolean {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (step === 0) {
      if (!profile.age) newErrors.age = "Age is required";
      else if (Number(profile.age) < 10 || Number(profile.age) > 120)
        newErrors.age = "Enter a valid age (10-120)";
      if (!profile.gender) newErrors.gender = "Gender is required";
    }

    if (step === 1) {
      if (!profile.height) newErrors.height = "Height is required";
      else if (Number(profile.height) < 50 || Number(profile.height) > 300)
        newErrors.height = "Enter valid height (50-300 cm)";
      if (!profile.weight) newErrors.weight = "Weight is required";
      else if (Number(profile.weight) < 20 || Number(profile.weight) > 400)
        newErrors.weight = "Enter valid weight (20-400 kg)";
      if (!profile.activityLevel)
        newErrors.activityLevel = "Activity level is required";
    }

    if (step === 2) {
      if (!profile.goal) newErrors.goal = "Goal is required";
      if (!profile.dietaryPreference)
        newErrors.dietaryPreference = "Dietary preference is required";
    }

    if (step === 3) {
      if (!profile.mealsPerDay)
        newErrors.mealsPerDay = "Meals per day is required";
      if (!profile.budgetRange) newErrors.budgetRange = "Budget range is required";
      if (!profile.regionFoodStyle)
        newErrors.regionFoodStyle = "Region/food style is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onSubmit(profile);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  }

  function renderFieldError(field: keyof UserProfile) {
    if (!errors[field]) return null;
    return (
      <p className="text-sm text-destructive mt-1" role="alert">
        {errors[field]}
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Home
        </Button>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Step {step + 1} of {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progressValue)}% Complete
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            {/* Step labels */}
            <div className="flex justify-between mt-4">
              {stepConfig.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center gap-1.5 ${
                    i <= step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      i <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const StepIcon = stepConfig[step].icon;
                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <StepIcon className="h-5 w-5 text-primary" />
                    </div>
                  );
                })()}
                <div>
                  <CardTitle className="text-xl font-heading">
                    {stepConfig[step].label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step === 0 && "Tell us about yourself"}
                    {step === 1 && "Your body measurements and activity"}
                    {step === 2 && "Your nutrition goals and diet type"}
                    {step === 3 && "Meal and food preferences"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label htmlFor="age">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={profile.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      className="mt-1.5"
                      min={10}
                      max={120}
                    />
                    {renderFieldError("age")}
                  </div>
                  <div>
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(v) => updateField("gender", v)}
                    >
                      <SelectTrigger id="gender" className="mt-1.5">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("gender")}
                  </div>
                </div>
              )}

              {/* Step 1: Body Metrics */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="height">
                        Height (cm) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="e.g. 170"
                        value={profile.height}
                        onChange={(e) => updateField("height", e.target.value)}
                        className="mt-1.5"
                        min={50}
                        max={300}
                      />
                      {renderFieldError("height")}
                    </div>
                    <div>
                      <Label htmlFor="weight">
                        Weight (kg) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="e.g. 70"
                        value={profile.weight}
                        onChange={(e) => updateField("weight", e.target.value)}
                        className="mt-1.5"
                        min={20}
                        max={400}
                      />
                      {renderFieldError("weight")}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activityLevel">
                      Activity Level <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.activityLevel}
                      onValueChange={(v) => updateField("activityLevel", v)}
                    >
                      <SelectTrigger id="activityLevel" className="mt-1.5">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">
                          Sedentary (little or no exercise)
                        </SelectItem>
                        <SelectItem value="light">
                          Light (1-3 days/week)
                        </SelectItem>
                        <SelectItem value="moderate">
                          Moderate (3-5 days/week)
                        </SelectItem>
                        <SelectItem value="heavy">
                          Heavy (6-7 days/week)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("activityLevel")}
                  </div>
                </div>
              )}

              {/* Step 2: Goals & Diet */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label htmlFor="goal">
                      Goal <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.goal}
                      onValueChange={(v) => updateField("goal", v)}
                    >
                      <SelectTrigger id="goal" className="mt-1.5">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="weight_gain">Weight Gain</SelectItem>
                        <SelectItem value="muscle_building">
                          Muscle Building
                        </SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("goal")}
                  </div>
                  <div>
                    <Label htmlFor="dietaryPreference">
                      Dietary Preference{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.dietaryPreference}
                      onValueChange={(v) =>
                        updateField("dietaryPreference", v)
                      }
                    >
                      <SelectTrigger id="dietaryPreference" className="mt-1.5">
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="non_vegetarian">
                          Non-Vegetarian
                        </SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("dietaryPreference")}
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="e.g. peanuts, shellfish, dairy"
                      value={profile.allergies}
                      onChange={(e) => updateField("allergies", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalConditions">
                      Medical Conditions{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="e.g. diabetes, hypertension, thyroid"
                      value={profile.medicalConditions}
                      onChange={(e) =>
                        updateField("medicalConditions", e.target.value)
                      }
                      className="mt-1.5 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label htmlFor="mealsPerDay">
                      Meals Per Day <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.mealsPerDay}
                      onValueChange={(v) => updateField("mealsPerDay", v)}
                    >
                      <SelectTrigger id="mealsPerDay" className="mt-1.5">
                        <SelectValue placeholder="Select meals per day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 meals</SelectItem>
                        <SelectItem value="3">3 meals</SelectItem>
                        <SelectItem value="4">4 meals</SelectItem>
                        <SelectItem value="5">5 meals</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("mealsPerDay")}
                  </div>
                  <div>
                    <Label htmlFor="budgetRange">
                      Budget Range <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.budgetRange}
                      onValueChange={(v) => updateField("budgetRange", v)}
                    >
                      <SelectTrigger id="budgetRange" className="mt-1.5">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("budgetRange")}
                  </div>
                  <div>
                    <Label htmlFor="regionFoodStyle">
                      Region / Food Style{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profile.regionFoodStyle}
                      onValueChange={(v) => updateField("regionFoodStyle", v)}
                    >
                      <SelectTrigger id="regionFoodStyle" className="mt-1.5">
                        <SelectValue placeholder="Select food style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="continental">Continental</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("regionFoodStyle")}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {step === 0 ? "Home" : "Back"}
                </Button>
                <Button onClick={handleNext}>
                  {step === TOTAL_STEPS - 1 ? (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Generate Diet Plan
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
