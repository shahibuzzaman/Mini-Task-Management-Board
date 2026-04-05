import { createStore } from "zustand";

export const SIMULATED_USERS = ["alice", "bob", "charlie"] as const;

export type SimulatedUser = (typeof SIMULATED_USERS)[number];

export type UIState = {
  activeTaskId: string | null;
  activeUser: SimulatedUser;
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  setActiveTaskId: (taskId: string | null) => void;
  setActiveUser: (user: SimulatedUser) => void;
  openCreateTaskForm: () => void;
  openEditTaskForm: (taskId: string) => void;
  closeTaskForm: () => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  return createStore<UIState>()((set) => ({
    activeTaskId: null,
    activeUser: "alice",
    isTaskFormOpen: false,
    editingTaskId: null,
    setActiveTaskId: (taskId) => {
      set({ activeTaskId: taskId });
    },
    setActiveUser: (user) => {
      set({ activeUser: user });
    },
    openCreateTaskForm: () => {
      set({ isTaskFormOpen: true, editingTaskId: null });
    },
    openEditTaskForm: (taskId) => {
      set({ isTaskFormOpen: true, editingTaskId: taskId });
    },
    closeTaskForm: () => {
      set({ isTaskFormOpen: false, editingTaskId: null });
    },
  }));
}
