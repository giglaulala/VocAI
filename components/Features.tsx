"use client";

import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Parsing",
      description:
        "Advanced machine learning algorithms accurately transcribe and parse your calls with 99.2% accuracy.",
      color: "primary",
    },
    {
      icon: MessageSquare,
      title: "Conversation Extraction",
      description:
        "Transform audio into structured chat-like conversations that are easy to read and analyze.",
      color: "accent",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      description:
        "Get insights on sentiment, key topics, action items, and conversation patterns.",
      color: "primary",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and compliance with GDPR, HIPAA, and SOC 2 standards.",
      color: "accent",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Process calls in seconds with our optimized AI infrastructure and cloud processing.",
      color: "primary",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Share insights, collaborate on analysis, and build knowledge across your organization.",
      color: "accent",
    },
    {
      icon: TrendingUp,
      title: "Performance Metrics",
      description:
        "Track call quality, agent performance, and customer satisfaction over time.",
      color: "primary",
    },
    {
      icon: FileText,
      title: "Export & Integration",
      description:
        "Export data in multiple formats and integrate with your existing CRM and analytics tools.",
      color: "accent",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Everything you need to transform your calls into actionable business
            intelligence
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              variants={itemVariants}
            >
              <div className="h-full bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div
                  className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon
                    className={`w-6 h-6 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-glow hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
