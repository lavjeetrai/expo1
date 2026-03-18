'use client'

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography"

interface MenuItem {
  url?: string
  title: string
  action?: () => void
}

const DefaultMenuItems: MenuItem[] = [
  {
    url: '/login',
    title: 'START LEARNING',
  },
  {
    url: '/about',
    title: 'KNOW ABOUT US',
  },
]

const COLLAPSED_OFFSETS = [
  'top-6',
  'top-[calc(1.5rem+0.75rem)]',
  'top-[calc(1.5rem+1.5rem)]',
]

// h-16 is 64px, gap is 16px (1rem). 
const EXPANDED_OFFSETS = [
  'top-6',
  'top-[calc(1.5rem+64px+1rem)]',
  'top-[calc(1.5rem+128px+2rem)]',
]

interface StackedMenuProps {
  items?: MenuItem[]
  className?: string
}

export default function StackedArticleCards({
  items = DefaultMenuItems,
  className,
}: StackedMenuProps) {
  const [isActive, setIsActive] = useState(false)

  const handleExpand = () => setIsActive(true)

  return (
    <div
      className={cn('relative min-h-[300px] w-full max-w-xs', className)}
      onClick={handleExpand}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'absolute left-6 flex h-16 w-64 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-lg shadow-black/50 transition-all duration-1000 ease-[cubic-bezier(0.075,0.82,0.165,1)] hover:border-white/30',
            isActive ? EXPANDED_OFFSETS[index] : COLLAPSED_OFFSETS[index]
          )}
          style={{ zIndex: 10 - index }}
        >
          {item.url ? (
            <a
              href={item.url}
              className={cn(
                 'flex w-full h-full items-center justify-center no-underline relative overflow-hidden rounded-2xl',
                isActive ? 'pointer-events-auto' : 'pointer-events-none'
              )}
            >
              <CursorDrivenParticleTypography
                text={item.title}
                fontSize={24}
                particleDensity={3}
                dispersionStrength={10}
                color="#FFFFFF"
                className="min-h-0 h-full w-full bg-transparent rounded-none"
                requireFastVelocity={true}
              />
            </a>
          ) : (
            <button
               onClick={() => {
                 if (isActive && item.action) {
                   item.action();
                 }
               }}
               type="button"
               className={cn(
                 'flex w-full h-full items-center justify-center relative overflow-hidden rounded-2xl appearance-none outline-none border-none bg-transparent p-0 m-0',
                 isActive ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
               )}
            >
              <CursorDrivenParticleTypography
                text={item.title}
                fontSize={24}
                particleDensity={3}
                dispersionStrength={10}
                color="#FFFFFF"
                className="min-h-0 h-full w-full bg-transparent rounded-none"
                requireFastVelocity={true}
              />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
