'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Send,
  UploadCloud,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export interface WorkflowCard {
  id: string;
  step: string;
  stageName: string;
  tag: string;
  title: string;
  accent: string;
  bgLight: string;
  tagBg: string;
  tagText: string;
  icon: any;
}

const WORKFLOW_CARDS: WorkflowCard[] = [
  {
    id: 'step-1',
    step: '01',
    stageName: 'STAGE 01',
    tag: 'SETUP',
    title: 'Client & Engagement Setup',
    accent: '#10B981',
    bgLight: 'bg-[#F0FDF4]',
    tagBg: 'bg-[#C7F36B]',
    tagText: 'text-[#064E3B]',
    icon: Shield,
  },
  {
    id: 'step-2',
    step: '02',
    stageName: 'STAGE 02',
    tag: 'REQUEST',
    title: 'Multi-Channel Document Request',
    accent: '#0284C7',
    bgLight: 'bg-[#F0F9FF]',
    tagBg: 'bg-[#5CC8FF]',
    tagText: 'text-[#0C4A6E]',
    icon: Send,
  },
  {
    id: 'step-3',
    step: '03',
    stageName: 'STAGE 03',
    tag: 'SUBMISSION',
    title: 'Client Submission & V1 Upload',
    accent: '#D97706',
    bgLight: 'bg-[#FFFBEB]',
    tagBg: 'bg-[#FFD23F]',
    tagText: 'text-[#78350F]',
    icon: UploadCloud,
  },
  {
    id: 'step-4',
    step: '04',
    stageName: 'STAGE 04',
    tag: 'EXAMINATION',
    title: 'Discrepancy & V2 Correction',
    accent: '#E73520',
    bgLight: 'bg-[#FFF2F0]',
    tagBg: 'bg-[#FFE2DE]',
    tagText: 'text-[#991B1B]',
    icon: AlertTriangle,
  },
  {
    id: 'step-5',
    step: '05',
    stageName: 'STAGE 05',
    tag: 'SIGN-OFF',
    title: 'Maker-Checker Sign-Off',
    accent: '#7C3AED',
    bgLight: 'bg-[#FAF5FF]',
    tagBg: 'bg-[#E9D5FF]',
    tagText: 'text-[#4C1D95]',
    icon: UserCheck,
  },
  {
    id: 'step-6',
    step: '06',
    stageName: 'STAGE 06',
    tag: 'CLOSURE',
    title: '6-Gate Sealed Closure',
    accent: '#059669',
    bgLight: 'bg-[#ECFDF5]',
    tagBg: 'bg-[#A7F3D0]',
    tagText: 'text-[#065F46]',
    icon: CheckCircle2,
  },
];

const CYCLE_DURATION = 3500; // 3.5 seconds

export function WorkflowFlashcardQueue() {
  const [cards, setCards] = useState<WorkflowCard[]>(WORKFLOW_CARDS);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Cycle top card to the back
  const cycleNext = () => {
    setDirection('forward');
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  // Bring back card to top
  const cyclePrev = () => {
    setDirection('backward');
    setCards((prev) => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
  };

  // Auto-play interval (pauses while cursor is actively inspecting/hovering)
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      cycleNext();
    }, CYCLE_DURATION);

    return () => clearInterval(timer);
  }, [isHovered]);

  const activeCard = cards[0];
  const activeIndex = WORKFLOW_CARDS.findIndex((c) => c.id === activeCard.id);

  // Tilted rotation angles for cards in stack
  const stackRotations = [0, 2.8, -3.2, 1.5];
  const stackX = [0, 5, -5, 2];
  const stackY = [0, 8, 16, 22];

  return (
    <div
      className="w-full space-y-3 font-mono select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header Strip */}
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#0A0A0A] border-b-2 border-[#0A0A0A] pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full border border-[#0A0A0A] transition-colors duration-300"
            style={{ backgroundColor: activeCard.accent }}
          />
          <span>WORKFLOW QUEUE</span>
          <span className="text-[#666660]">({activeCard.step} / 06)</span>
        </div>
      </div>

      {/* Tilted Stack Deck */}
      <div className="relative h-[180px] sm:h-[175px] w-full pt-1 px-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {cards.slice(0, 3).map((card, index) => {
            const isTop = index === 0;
            const Icon = card.icon;

            const rotate = stackRotations[index] || 0;
            const xOffset = stackX[index] || 0;
            const yOffset = stackY[index] || 0;
            const scale = 1 - index * 0.035;
            const zIndex = 30 - index * 10;

            return (
              <motion.div
                key={card.id}
                layout
                initial={
                  direction === 'forward'
                    ? { opacity: 0.7, scale: 0.9, y: 30, rotate: 0 }
                    : { opacity: 0, x: -140, rotate: -10 }
                }
                animate={{
                  opacity: 1,
                  scale,
                  x: xOffset,
                  y: yOffset,
                  rotate,
                  zIndex,
                  transition: { type: 'spring', stiffness: 360, damping: 26 },
                }}
                exit={
                  direction === 'forward'
                    ? {
                        opacity: 0,
                        x: 200,
                        y: -15,
                        rotate: 15,
                        scale: 0.88,
                        transition: { duration: 0.26, ease: 'easeOut' },
                      }
                    : {
                        opacity: 0,
                        scale: 0.9,
                        y: 35,
                        transition: { duration: 0.2 },
                      }
                }
                onClick={isTop ? cycleNext : undefined}
                className={`absolute inset-x-0 top-0 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] p-5 flex flex-col justify-between cursor-pointer transition-shadow ${
                  isTop ? 'hover:shadow-[6px_6px_0_#0A0A0A]' : 'pointer-events-none'
                }`}
                style={{
                  height: '150px',
                }}
                whileHover={isTop ? { scale: 1.01 } : {}}
              >
                {/* Colorful Left Accent Line */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: card.accent }}
                />

                {/* Top Row: Stage & Vibrant Tag */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-[#0A0A0A]/10 pb-2.5">
                  <div className="flex items-center gap-2 pl-1">
                    <div
                      className="w-6 h-6 border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 shadow-[1px_1px_0_#0A0A0A]"
                      style={{ backgroundColor: card.accent }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span
                      className="text-[11px] font-black uppercase tracking-wider"
                      style={{ color: card.accent }}
                    >
                      {card.stageName}
                    </span>
                  </div>

                  {/* Colorful Minimalist Category Tag */}
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 border border-[#0A0A0A] shadow-[1px_1px_0_#0A0A0A] ${card.tagBg} ${card.tagText}`}
                  >
                    {card.tag}
                  </span>
                </div>

                {/* Main Centered Title */}
                <div className="py-2.5 flex-1 flex items-center pl-1">
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-[#0A0A0A] font-sans tracking-tight leading-tight">
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Queue Controls & Colored Step Dots */}
      <div className="flex items-center justify-between pt-1 font-mono text-xs">
        {/* Colorful Step Dots */}
        <div className="flex items-center gap-1.5">
          {WORKFLOW_CARDS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                const targetIdx = cards.findIndex((item) => item.id === c.id);
                if (targetIdx > 0) {
                  setDirection('forward');
                  setCards((prev) => [...prev.slice(targetIdx), ...prev.slice(0, targetIdx)]);
                }
              }}
              className={`h-2 transition-all border border-[#0A0A0A] cursor-pointer ${
                i === activeIndex
                  ? 'w-6 shadow-[1px_1px_0_#0A0A0A]'
                  : 'w-2 bg-white hover:bg-[#0A0A0A]/20'
              }`}
              style={{
                backgroundColor: i === activeIndex ? c.accent : undefined,
              }}
              title={`Jump to ${c.stageName}: ${c.title}`}
            />
          ))}
        </div>

        {/* Tactile Next & Prev Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={cyclePrev}
            className="p-1.5 bg-white hover:bg-[#F7F5EF] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Previous Stage"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={cycleNext}
            className="px-3.5 py-1.5 bg-[#0A0A0A] hover:bg-[#E73520] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-colors"
            title="Next Stage (Cycle queue)"
          >
            <span>NEXT STAGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
