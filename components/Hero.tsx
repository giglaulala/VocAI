"use client";

import { motion } from "framer-motion";
import { Phone, Brain, BarChart3, Play, Upload } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transform Your Calls Into
            <span className="block gradient-text">Actionable Insights</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl text-neutral-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            VocAI uses advanced AI to parse your calls, extract conversations,
            and provide deep analysis that drives better business decisions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.a
              href="#demo"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-glow hover:shadow-xl flex items-center space-x-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Play className="w-5 h-5" />
              <span>Try Demo</span>
            </motion.a>
            <motion.a
              href="/demo"
              className="px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="w-5 h-5" />
              <span>Upload Call</span>
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                99.2%
              </h3>
              <p className="text-neutral-600">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">10x</h3>
              <p className="text-neutral-600">Faster Analysis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">50+</h3>
              <p className="text-neutral-600">Languages Supported</p>
            </div>
          </motion.div>
        </div>

        {/* Visual Elements */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Main Demo Image Placeholder */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 border border-primary-200 shadow-xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        A
                      </span>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-neutral-700">
                        Hello! I'm calling about your recent order...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-white border border-neutral-200 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-neutral-700">
                        Hi there! Let me check that for you...
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        B
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full opacity-20"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
