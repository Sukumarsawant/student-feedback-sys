"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    step: "1",
    title: "Sign In",
    description: "Login with your VIT email. Students, teachers, and admins all have their own portals.",
    image: "/images/steps/step1.png",
    color: "from-blue-500 to-indigo-600"
  },
  {
    step: "2",
    title: "Create or Fill Forms",
    description: "Teachers launch feedback forms. Students receive instant notifications and submit responses.",
    image: "/images/steps/step2.png",
    color: "from-purple-500 to-pink-600"
  },
  {
    step: "3",
    title: "View Analytics",
    description: "Teachers get live dashboards with response rates, sentiment analysis, and actionable insights.",
    image: "/images/steps/step3.png",
    color: "from-green-500 to-emerald-600"
  }
];

export default function StepsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality - pauses when user interacts
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % steps.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Stop auto-play when user clicks dot
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + steps.length) % steps.length);
    setIsAutoPlaying(false); // Stop auto-play when user clicks arrow
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % steps.length);
    setIsAutoPlaying(false); // Stop auto-play when user clicks arrow
  };

  return (
    <div className="relative max-w-5xl mx-auto">
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
              className="min-w-full flex items-center justify-center"
            >
              <div className="glass-card rounded-3xl p-8 border-2 border-white relative overflow-hidden w-full max-w-4xl mx-auto">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                
                {/* Content */}
                <div className="relative space-y-6">
                  {/* Step Image */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full aspect-[16/10] max-w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                        priority={index === 0}
                      />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="text-center space-y-3 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white font-bold text-xl shadow-lg`}>
                        {item.step}
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--brand-dark)]">
                        {item.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-base font-medium text-[var(--brand-dark)]/80 leading-relaxed max-w-2xl mx-auto">
                      {item.description}
                    </p>
                  </div>
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
    </div>
  );
}
