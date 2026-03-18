"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center pt-16">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white uppercase tracking-tighter leading-tight mb-4">
              Learn X <br />
              <span className="text-sm md:text-xl font-medium mt-0 block tracking-[0.3em] opacity-80 mb-4">
                TECHNOLOGY FOR LEARNING
              </span>
            </h1>
          </>
        }
      >
        <CursorDrivenParticleTypography
          text="LEARN X"
          fontSize={120}
          particleDensity={5}
          dispersionStrength={20}
          color="#FFFFFF"
          className="mx-auto rounded-2xl h-full"
        />
      </ContainerScroll>
    </div>
  );
}
