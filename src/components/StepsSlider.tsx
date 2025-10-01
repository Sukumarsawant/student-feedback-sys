"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    step: "1",
    title: "Sign In",
    description: "Login with your VIT email. Students, teachers, and admins all have their own portals.",
    icon: "👤",
    color: "from-blue-500 to-indigo-600"
  },
  {
    step: "2",
    title: "Create or Fill Forms",
    description: "Teachers launch feedback forms. Students receive instant notifications and submit responses.",
    icon: "📝",
    color: "from-purple-500 to-pink-600"
  },
  {
    step: "3",
    title: "View Analytics",
    description: "Teachers get live dashboards with response rates, sentiment analysis, and actionable insights.",
    icon: "📊",
    color: "from-green-500 to-emerald-600"
  }
];

export default function StepsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % steps.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + steps.length) % steps.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % steps.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {steps.map((item, index) => (
            <div 
              key={index}
              className="min-w-full"
            >
              <div className="glass-card rounded-3xl p-12 border-2 border-white relative overflow-hidden mx-2">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                
                {/* Content */}
                <div className="relative space-y-6 text-center">
                  {/* Logo and Step Number */}
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="flex items-center justify-center rounded-3xl border border-white/40 bg-white/95 backdrop-blur-md p-6 shadow-2xl">
                      <Image
                        src="/images/logo/Gemini_Generated_Image_hm72xfhm72xfhm72-removebg-preview.png"
                        alt="VIT Logo"
                        width={400}
                        height={100}
                        className="h-auto w-full max-w-[280px] object-contain"
                        priority
                      />
                    </div>
                    <div className={`h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white font-bold text-2xl shadow-lg`}>
                      {item.step}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-[var(--brand-dark)]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-lg font-medium text-[var(--brand-dark)] leading-relaxed max-w-2xl mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 text-[var(--brand-primary)] rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 text-[var(--brand-primary)] rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-10 bg-[var(--brand-primary)]' 
                : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs font-medium text-gray-500 hover:text-[var(--brand-primary)] transition-colors"
        >
          {isAutoPlaying ? "⏸ Pause" : "▶ Play"} Auto-slide
        </button>
      </div>
    </div>
  );
}
