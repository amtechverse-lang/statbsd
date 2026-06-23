"use client";

import { create } from "zustand";

interface PracticeState {
  answers: Record<number, string>;
  currentIndex: number;
  timeElapsed: number;
  showHint: number;
  submitted: Record<number, boolean>;
  setAnswer: (index: number, answer: string) => void;
  setCurrentIndex: (index: number) => void;
  incrementTime: () => void;
  resetTime: () => void;
  revealHint: () => void;
  markSubmitted: (index: number) => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  answers: {},
  currentIndex: 0,
  timeElapsed: 0,
  showHint: 0,
  submitted: {},
  setAnswer: (index, answer) =>
    set((s) => ({ answers: { ...s.answers, [index]: answer } })),
  setCurrentIndex: (index) => set({ currentIndex: index, showHint: 0 }),
  incrementTime: () => set((s) => ({ timeElapsed: s.timeElapsed + 1 })),
  resetTime: () => set({ timeElapsed: 0 }),
  revealHint: () => set((s) => ({ showHint: s.showHint + 1 })),
  markSubmitted: (index) =>
    set((s) => ({ submitted: { ...s.submitted, [index]: true } })),
  reset: () =>
    set({ answers: {}, currentIndex: 0, timeElapsed: 0, showHint: 0, submitted: {} }),
}));
