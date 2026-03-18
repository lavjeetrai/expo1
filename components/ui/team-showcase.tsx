"use client";

import { useState } from 'react';
import { Twitter, Linkedin, Instagram, Dribbble } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    dribbble?: string;
  };
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'AKASH PANDEY',
    role: 'CEO & Founder',
    image: '/akash-pandey.jpg',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '2',
    name: 'Lavjeet Kumar Rai',
    role: 'CTO & Architect',
    image: '/lavjeet-kumar-rai-2.jpg',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '3',
    name: 'TARUN KARMA',
    role: 'Head of Design',
    image: '/tarun-karma.jpg',
    social: { dribbble: '#', instagram: '#' },
  }
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16 lg:gap-24 select-none w-full max-w-6xl mx-auto py-16 px-6 md:px-12 font-sans text-white">
      {/* ── Left: photo grid ── */}
      <div className="flex gap-4 md:gap-6 flex-shrink-0 overflow-x-auto pb-6 md:pb-0 justify-center w-full md:w-auto mt-10 md:mt-0">
        {/* Column 1 */}
        <div className="flex flex-col gap-4 md:gap-6">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[190px] md:h-[220px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4 md:gap-6 mt-[48px] sm:mt-[56px] md:mt-[68px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[150px] h-[170px] sm:w-[170px] sm:h-[190px] md:w-[210px] md:h-[240px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4 md:gap-6 mt-[22px] sm:mt-[26px] md:mt-[32px]">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[145px] h-[165px] sm:w-[165px] sm:h-[185px] md:w-[195px] md:h-[225px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* ── Right: member name list*/}
      <div className="flex flex-col gap-8 md:gap-10 pt-10 md:pt-20 flex-1 w-full justify-center lg:pl-10">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">Our Team</h2>
          <p className="text-white/50 text-sm tracking-widest uppercase mt-4">The minds behind the magic</p>
        </div>
        
        <div className="flex flex-col gap-6">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Photo card 
───────────────────────────────────────── */

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl cursor-pointer flex-shrink-0 transition-all duration-500',
        className,
        isDimmed ? 'opacity-30 scale-95' : 'opacity-100 shadow-[0_0_40px_-15px_rgba(255,255,255,0.3)]',
        isActive ? 'scale-[1.03] shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] z-10' : ''
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-all duration-700 ease-out"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1.1) contrast(1.1)' : 'grayscale(0.9) brightness(0.5) contrast(1.2)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Member name section
───────────────────────────────────────── */

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social?.twitter ?? member.social?.linkedin ?? member.social?.instagram ?? member.social?.dribbble;

  return (
    <div
      className={cn(
        'cursor-pointer transition-all duration-500 pl-6 py-3 border-l-[3px]',
        isDimmed ? 'opacity-30 border-white/5' : isActive ? 'opacity-100 border-white/80 translate-x-4' : 'opacity-80 border-white/20',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-6">
        <span
          className={cn(
            'text-2xl md:text-3xl font-bold leading-none tracking-tight transition-colors duration-500',
            isActive ? 'text-white' : 'text-white/60',
          )}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={cn(
              'flex items-center gap-3 transition-all duration-500',
              isActive
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-6 pointer-events-none',
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <Twitter size={16} />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <Linkedin size={16} />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <Instagram size={16} />
              </a>
            )}
            {member.social?.dribbble && (
              <a
                href={member.social.dribbble}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <Dribbble size={16} />
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
