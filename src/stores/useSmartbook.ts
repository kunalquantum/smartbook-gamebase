import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type ZoneId = "math" | "science" | "reading" | "history";

export type Lesson = {
  title: string;
  emoji: string;
  content: string;
};

const LESSONS: Record<ZoneId, Lesson> = {
  math: {
    title: "Math Zone",
    emoji: "∑",
    content:
      "Welcome to the Math Zone! Here you'll explore numbers, patterns, and problem-solving. Mathematics is the language of the universe — from counting stars to building bridges.",
  },
  science: {
    title: "Newton's World",
    emoji: "🍎",
    content:
      "Welcome to Newton's World! This is a live physics lab — real gravity, real forces, real motion. Watch the resting apple stay put until pushed (1st Law), watch the falling ball's force update as F = m × a in real time (2nd Law), and watch the two balls bounce off each other with equal and opposite force (3rd Law). Everything on the readout is computed live by the physics engine, not scripted.",
  },
  reading: {
    title: "Reading Zone",
    emoji: "📖",
    content:
      "Welcome to the Reading Zone! Stories, words, and imagination live here. Every book is a door to another world — reading builds empathy, vocabulary, and the ability to think clearly.",
  },
  history: {
    title: "History Zone",
    emoji: "🏛",
    content:
      "Welcome to the History Zone! Journey through time and explore civilizations. Understanding the past helps us navigate the present and shape a better future.",
  },
};

export type NewtonLawState = {
  gravity: number; // m/s^2, magnitude, live from the physics world
  law1: {
    velocity: number; // m/s, speed of the inertia ball
    atRest: boolean;
  };
  law2: {
    mass: number; // kg
    acceleration: number; // m/s^2
    force: number; // N, computed live as mass * acceleration
  };
  law3: {
    active: boolean; // true for a brief moment right after a collision
    massA: number;
    massB: number;
    forceA: number; // N exerted on ball A
    forceB: number; // N exerted on ball B (should mirror -forceA)
  };
};

const DEFAULT_NEWTON_STATE: NewtonLawState = {
  gravity: 9.81,
  law1: { velocity: 0, atRest: true },
  law2: { mass: 1, acceleration: 9.81, force: 9.81 },
  law3: { active: false, massA: 1, massB: 1, forceA: 0, forceB: 0 },
};

type SmartbookState = {
  currentZone: ZoneId | null;
  activeLessonPanel: boolean;
  score: number;
  completedZones: ZoneId[];
  lessons: Record<ZoneId, Lesson>;
  newton: NewtonLawState;
  enterZone: (zone: ZoneId) => void;
  exitZone: (zone: ZoneId) => void;
  openLesson: () => void;
  closeLesson: () => void;
  completeLesson: () => void;
  setNewtonState: (partial: Partial<NewtonLawState>) => void;
};

export const useSmartbook = create(
  subscribeWithSelector<SmartbookState>((set, get) => ({
    currentZone: null,
    activeLessonPanel: false,
    score: 0,
    completedZones: [],
    lessons: LESSONS,
    newton: DEFAULT_NEWTON_STATE,

    enterZone: (zone) => set({ currentZone: zone }),

    exitZone: (zone) =>
      set((state) =>
        state.currentZone === zone
          ? { currentZone: null, activeLessonPanel: false }
          : {}
      ),

    openLesson: () => {
      document.exitPointerLock?.();
      set({ activeLessonPanel: true });
    },

    closeLesson: () => set({ activeLessonPanel: false }),

    completeLesson: () =>
      set((state) => {
        const zone = state.currentZone;
        if (!zone) return {};
        const already = state.completedZones.includes(zone);
        return {
          activeLessonPanel: false,
          score: already ? state.score : state.score + 100,
          completedZones: already
            ? state.completedZones
            : [...state.completedZones, zone],
        };
      }),

    setNewtonState: (partial) =>
      set((state) => ({ newton: { ...state.newton, ...partial } })),
  }))
);
