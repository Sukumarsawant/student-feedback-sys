"use client";

import { useState, useEffect } from "react";
import IntroAnimation from "./IntroAnimation";

type IntroWrapperProps = {
  children: React.ReactNode;
};

export default function IntroWrapper({ children }: IntroWrapperProps) {
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    
    if (!hasVisited) {
      setShowIntro(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }
    
    setIsLoading(false);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (isLoading) {
    return null;
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
