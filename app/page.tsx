"use client";

import { useState } from "react";
import { HeroScrollDemo } from "@/components/hero-scroll-demo";
import CyberneticGridShader from "@/components/ui/cybernetic-grid-shader";
import MotionButton from "@/components/ui/motion-button";
import StackedArticleCards from "@/components/ui/stacked-article-cards";

export default function Home() {
  const [showCards, setShowCards] = useState(false);

  return (
    <main className="flex h-screen w-screen overflow-hidden flex-col items-center justify-center px-4 md:px-24 bg-transparent relative">
      <CyberneticGridShader />
      
      {showCards && (
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-[60] animate-in slide-in-from-top-4 fade-in duration-500">
          <StackedArticleCards className="scale-75 md:scale-90 origin-top-left" />
        </div>
      )}

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <MotionButton 
          label={showCards ? "Hide Menu" : "Get Started"} 
          classes="scale-75 md:scale-90 origin-top-right" 
          onClick={() => setShowCards(!showCards)}
        />
      </div>
      
      <HeroScrollDemo />
    </main>
  );
}
