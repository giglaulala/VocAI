"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Brain,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your Call",
      description:
        "Simply drag and drop your audio file or record directly through our platform. We support all major audio formats.",
      color: "primary",
    },
    {
      number: "02",
      icon: Brain,
      title: "AI Processing",
      description:
        "Our advanced AI algorithms transcribe, parse, and structure your conversation in real-time with high accuracy.",
      color: "accent",
    },
    {
      number: "03",
      icon: MessageSquare,
      title: "Chat Format",
      description:
        "Your call is transformed into an easy-to-read chat conversation with speaker identification and timestamps.",
      color: "primary",
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Get Insights",
      description:
        "Receive comprehensive analysis including sentiment, key topics, action items, and performance metrics.",
      color: "accent",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white"
    >
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
            How VocAI Works
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Four simple steps to transform your calls into actionable insights
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-primary-200 transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-center">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-primary-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-xl font-bold text-primary-600">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-${step.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-primary-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-primary-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-neutral-600 mb-6">
              Join thousands of businesses already using VocAI to improve their
              call analysis and customer insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 shadow-glow hover:shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button
                className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
