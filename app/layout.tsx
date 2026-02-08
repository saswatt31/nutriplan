import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";

import "./globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "NutriPlan AI - Personalized Nutrition Planner",
  description:
    "Get a custom AI-powered diet plan based on your body, lifestyle, and goals. Personalized 7-day meal plans with macronutrient breakdowns.",
};

export const viewport: Viewport = {
  themeColor: "#339970",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
