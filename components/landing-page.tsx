"use client";

import {
  Leaf,
  Brain,
  Utensils,
  Droplets,
  ArrowRight,
  Activity,
  Target,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Our intelligent system analyzes your body metrics, lifestyle, and goals to create a truly personalized plan.",
  },
  {
    icon: Utensils,
    title: "7-Day Meal Plans",
    description:
      "Get detailed meal recommendations for breakfast, lunch, dinner, and snacks tailored to your preferences.",
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    description:
      "Whether you want to lose weight, gain muscle, or maintain your health, we design plans around your goals.",
  },
  {
    icon: Droplets,
    title: "Hydration Tracking",
    description:
      "Personalized water intake recommendations based on your activity level and body composition.",
  },
  {
    icon: Apple,
    title: "Allergy-Aware",
    description:
      "Your food sensitivities and allergies are factored into every meal suggestion we provide.",
  },
  {
    icon: Activity,
    title: "Macro Breakdown",
    description:
      "Detailed protein, carbs, and fats breakdown for each day aligned with your nutritional needs.",
  },
];

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading text-foreground">
            NutriPlan AI
          </span>
        </div>
        <Button onClick={onStart} size="sm">
          Get Started
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center px-6 pt-16 pb-20 text-center lg:pt-24 lg:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Activity className="h-4 w-4 text-primary" />
          Powered by Artificial Intelligence
        </div>
        <h1 className="max-w-3xl text-4xl font-bold font-heading leading-tight text-foreground md:text-5xl lg:text-6xl text-balance">
          AI-Powered Personalized Nutrition Planner
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed text-pretty">
          Get a custom diet plan based on your body, lifestyle, and goals.
          Backed by nutritional science and personalized just for you.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={onStart} size="lg" className="text-base px-8">
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 bg-transparent"
            onClick={onStart}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 pb-20 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-foreground md:text-4xl text-balance">
              Everything You Need for Better Nutrition
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
              Our AI considers multiple factors to build a nutrition plan that
              fits your life perfectly.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-border bg-card transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold font-heading text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 pb-20 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-foreground md:text-4xl text-balance">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Three simple steps to your personalized nutrition plan.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Take the Assessment",
                description:
                  "Answer a few questions about your body, goals, and food preferences.",
              },
              {
                step: "02",
                title: "AI Generates Your Plan",
                description:
                  "Our algorithm calculates your needs and creates a tailored 7-day meal plan.",
              },
              {
                step: "03",
                title: "Follow & Track",
                description:
                  "Download your plan and follow it. Regenerate anytime to keep things fresh.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg font-heading">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold font-heading text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-20 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-10 text-center text-primary-foreground md:p-14">
          <h2 className="text-3xl font-bold font-heading md:text-4xl text-balance">
            Ready to Transform Your Diet?
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Start your personalized nutrition assessment today. It only takes a
            few minutes.
          </p>
          <Button
            onClick={onStart}
            variant="secondary"
            size="lg"
            className="mt-8 text-base px-8"
          >
            Start Your Free Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

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
            B.Tech Major Project - AI-Powered Nutrition Recommendation System
          </p>
        </div>
      </footer>
    </div>
  );
}
