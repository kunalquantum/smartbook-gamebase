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
    title: "Science Zone",
    emoji: "⚗",
    content:
      "Welcome to the Science Zone! Discover experiments, the laws of nature, and how things work. Science turns curiosity into knowledge — ask a question, test a hypothesis, find the truth.",
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

type SmartbookState = {
  currentZone: ZoneId | null;
  activeLessonPanel: boolean;
  score: number;
  completedZones: ZoneId[];
  lessons: Record<ZoneId, Lesson>;
  enterZone: (zone: ZoneId) => void;
  exitZone: (zone: ZoneId) => void;
  openLesson: () => void;
  closeLesson: () => void;
  completeLesson: () => void;
};

export const useSmartbook = create(
  subscribeWithSelector<SmartbookState>((set, get) => ({
    currentZone: null,
    activeLessonPanel: false,
    score: 0,
    completedZones: [],
    lessons: LESSONS,

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
  }))
);
