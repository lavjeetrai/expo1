"use client";

import { useState, useEffect } from "react";
import { HeroScrollDemo } from "@/components/hero-scroll-demo";
import CyberneticGridShader from "@/components/ui/cybernetic-grid-shader";
import MotionButton from "@/components/ui/motion-button";
import StackedArticleCards from "@/components/ui/stacked-article-cards";

export default function Home() {
  const [showCards, setShowCards] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole"));
    }
  }, []);

  return (
    <main className="flex min-h-screen w-screen overflow-x-hidden flex-col items-center relative bg-transparent">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CyberneticGridShader />
      </div>
      
      {showCards && (
        <div className="fixed top-4 left-4 md:top-8 md:left-8 z-[60] animate-in slide-in-from-top-4 fade-in duration-500">
          <StackedArticleCards className="scale-75 md:scale-90 origin-top-left" />
        </div>
      )}

      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
        <MotionButton 
          label={showCards ? "Hide Menu" : "Get Started"} 
          classes="scale-75 md:scale-90 origin-top-right" 
          onClick={() => setShowCards(!showCards)}
        />
      </div>
      
      <div className="w-full min-h-screen flex flex-col items-center justify-center relative z-10 px-4 md:px-24">
        <HeroScrollDemo />
      </div>
    </main>
  );
}
