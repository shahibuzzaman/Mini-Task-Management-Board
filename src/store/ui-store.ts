import { createStore } from "zustand";

export const SIMULATED_USERS = ["alice", "bob", "charlie"] as const;

export type SimulatedUser = (typeof SIMULATED_USERS)[number];

export type UIState = {
  activeTaskId: string | null;
  activeUser: SimulatedUser;
  setActiveTaskId: (taskId: string | null) => void;
  setActiveUser: (user: SimulatedUser) => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  return createStore<UIState>()((set) => ({
    activeTaskId: null,
    activeUser: "alice",
    setActiveTaskId: (taskId) => {
      set({ activeTaskId: taskId });
    },
    setActiveUser: (user) => {
      set({ activeUser: user });
    },
  }));
}
