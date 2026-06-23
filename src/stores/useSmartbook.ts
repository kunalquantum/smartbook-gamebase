import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type ZoneId = "newton" | "optics" | "ohms" | "waves" | "energy";

export type Lesson = {
  title: string;
  emoji: string;
  content: string;
};

const LESSONS: Record<ZoneId, Lesson> = {
  newton: {
    title: "Newton's World",
    emoji: "🍎",
    content:
      "Welcome to Newton's World! This is a live physics lab — real gravity, real forces, real motion. Watch the resting apple stay put until pushed (1st Law), watch the falling ball's force update as F = m × a in real time (2nd Law), and watch the two balls bounce off each other with equal and opposite force (3rd Law). Everything on the readout is computed live by the physics engine, not scripted.",
  },
  optics: {
    title: "Optics Lab",
    emoji: "🔭",
    content:
      "Welcome to the Optics Lab! Watch a beam of light hit a glass surface — part of it reflects at the same angle it arrived (Law of Reflection), and part of it bends as it enters the denser glass (Snell's Law: n₁ sin θ₁ = n₂ sin θ₂). The incidence angle keeps changing live, and so do the reflected and refracted angles on the readout.",
  },
  ohms: {
    title: "Ohm's Law Circuit",
    emoji: "🔋",
    content:
      "Welcome to the Circuit Lab! A 9V battery drives current through a swappable resistor into an LED. As the resistance changes, watch the current — and the LED's brightness — change live, exactly as Ohm's Law predicts: V = I × R.",
  },
  waves: {
    title: "Waves & Sound",
    emoji: "🌊",
    content:
      "Welcome to the Waves Lab! A row of markers traces out a real travelling wave. As the frequency drifts up and down, watch the wavelength stretch and compress to match — because wave speed = frequency × wavelength always holds.",
  },
  energy: {
    title: "Energy & Motion",
    emoji: "⚡",
    content:
      "Welcome to the Energy Lab! A ball rolls back and forth in a valley, trading potential energy for kinetic energy and back again. Watch PE = m·g·h and KE = ½·m·v² rise and fall on the readout while their total stays (almost) constant — the Law of Conservation of Energy, live.",
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

export type OpticsState = {
  n1: number;
  n2: number;
  incidentAngle: number; // degrees
  reflectedAngle: number; // degrees
  refractedAngle: number; // degrees
};

const DEFAULT_OPTICS_STATE: OpticsState = {
  n1: 1.0,
  n2: 1.5,
  incidentAngle: 30,
  reflectedAngle: 30,
  refractedAngle: 19.2,
};

export type OhmsState = {
  voltage: number; // V
  resistance: number; // ohm
  current: number; // A, computed live as voltage / resistance
};

const DEFAULT_OHMS_STATE: OhmsState = {
  voltage: 9,
  resistance: 5,
  current: 1.8,
};

export type WavesState = {
  frequency: number; // Hz
  amplitude: number; // m
  speed: number; // m/s
  wavelength: number; // m, computed live as speed / frequency
};

const DEFAULT_WAVES_STATE: WavesState = {
  frequency: 1,
  amplitude: 0.6,
  speed: 4,
  wavelength: 4,
};

export type EnergyState = {
  mass: number; // kg
  height: number; // m, above the lowest point of the valley
  velocity: number; // m/s
  pe: number; // J, m * g * h
  ke: number; // J, 0.5 * m * v^2
  total: number; // J, pe + ke
};

const DEFAULT_ENERGY_STATE: EnergyState = {
  mass: 1.5,
  height: 0,
  velocity: 0,
  pe: 0,
  ke: 0,
  total: 0,
};

type SmartbookState = {
  currentZone: ZoneId | null;
  activeLessonPanel: boolean;
  score: number;
  completedZones: ZoneId[];
  lessons: Record<ZoneId, Lesson>;
  newton: NewtonLawState;
  optics: OpticsState;
  ohms: OhmsState;
  waves: WavesState;
  energy: EnergyState;
  enterZone: (zone: ZoneId) => void;
  exitZone: (zone: ZoneId) => void;
  openLesson: () => void;
  closeLesson: () => void;
  completeLesson: () => void;
  setNewtonState: (partial: Partial<NewtonLawState>) => void;
  setOpticsState: (partial: Partial<OpticsState>) => void;
  setOhmsState: (partial: Partial<OhmsState>) => void;
  setWavesState: (partial: Partial<WavesState>) => void;
  setEnergyState: (partial: Partial<EnergyState>) => void;
};

export const useSmartbook = create(
  subscribeWithSelector<SmartbookState>((set, get) => ({
    currentZone: null,
    activeLessonPanel: false,
    score: 0,
    completedZones: [],
    lessons: LESSONS,
    newton: DEFAULT_NEWTON_STATE,
    optics: DEFAULT_OPTICS_STATE,
    ohms: DEFAULT_OHMS_STATE,
    waves: DEFAULT_WAVES_STATE,
    energy: DEFAULT_ENERGY_STATE,

    enterZone: (zone) => {
      document.exitPointerLock?.();
      set({ currentZone: zone });
    },

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
    setOpticsState: (partial) =>
      set((state) => ({ optics: { ...state.optics, ...partial } })),
    setOhmsState: (partial) =>
      set((state) => ({ ohms: { ...state.ohms, ...partial } })),
    setWavesState: (partial) =>
      set((state) => ({ waves: { ...state.waves, ...partial } })),
    setEnergyState: (partial) =>
      set((state) => ({ energy: { ...state.energy, ...partial } })),
  }))
);
