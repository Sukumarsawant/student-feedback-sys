"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type IntroAnimationProps = {
  onComplete: () => void;
};

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step === 1) {
      // Show first message for 2 seconds
      const timer1 = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(timer1);
    } else if (step === 2) {
      // Show second message for 2 seconds
      const timer2 = setTimeout(() => setStep(3), 2000);
      return () => clearTimeout(timer2);
    } else if (step === 3) {
      // Fade out and complete
      const timer3 = setTimeout(() => onComplete(), 1000);
      return () => clearTimeout(timer3);
    }
  }, [step, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {step < 3 && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          {/* Blur effect background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-3xl" />
          
          <div className="relative max-w-3xl px-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <motion.h1
                    className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-tight tracking-wide"
                    style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    Bored of filling{" "}
                    <span className="font-semibold text-purple-400">
                      Google
                    </span>{" "}
                    feedback forms
                    <motion.span
                      className="inline-block ml-1"
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ...
                    </motion.span>
                  </motion.h1>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <motion.h1
                    className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-wide"
                    style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    We got you
                    <motion.span
                      className="inline-block ml-1 font-semibold text-purple-400"
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ...
                    </motion.span>
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
