"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Brain,
  BarChart3,
  Play,
  Upload,
  Zap,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import WorkingDemo from "@/components/WorkingDemo";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <WorkingDemo />
      <Pricing />
      <Footer />
    </main>
  );
}
