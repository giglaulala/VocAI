"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/mo",
      description: "For trying things out",
      features: ["Up to 30 mins audio/mo", "Basic insights", "Email support"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      description: "For teams getting value",
      features: [
        "Up to 10 hrs audio/mo",
        "AI diarization",
        "Advanced insights",
        "Priority support",
      ],
      highlight: true,
    },
    {
      name: "Scale",
      price: "Custom",
      period: "",
      description: "For large volumes",
      features: [
        "Unlimited hours",
        "SLA & SSO",
        "Dedicated support",
        "Custom integrations",
      ],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-neutral-600">
            Start free, upgrade when you’re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`rounded-2xl border p-6 shadow-sm ${
                plan.highlight
                  ? "border-primary-200 bg-primary-50 shadow-glow"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold text-neutral-900">
                  {plan.name}
                </h3>
                {plan.highlight ? (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-600 text-white">
                    Most popular
                  </span>
                ) : null}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-neutral-900">
                  {plan.price}
                </span>
                <span className="text-neutral-500">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-neutral-800">{f}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="/demo"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 font-medium transition-all ${
                  plan.highlight
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "border border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                }`}
                whileHover={{ y: -2 }}
              >
                {plan.highlight ? "Start Pro" : "Try Demo"}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

