import { createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const SIMULATED_USERS = ["alice", "bob", "charlie"] as const;

export type SimulatedUser = (typeof SIMULATED_USERS)[number];

export type UIState = {
  activeUser: SimulatedUser;
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  setActiveUser: (user: SimulatedUser) => void;
  openCreateTaskForm: () => void;
  openEditTaskForm: (taskId: string) => void;
  closeTaskForm: () => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  return createStore<UIState>()(
    persist(
      (set) => ({
        activeUser: "alice",
        isTaskFormOpen: false,
        editingTaskId: null,
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
      }),
      {
        name: "mini-task-board-ui",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          activeUser: state.activeUser,
        }),
      },
    ),
  );
}
