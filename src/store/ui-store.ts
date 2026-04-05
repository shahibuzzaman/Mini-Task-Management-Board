import { createStore } from "zustand";

export type UIState = {
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  openCreateTaskForm: () => void;
  openEditTaskForm: (taskId: string) => void;
  closeTaskForm: () => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  return createStore<UIState>()((set) => ({
    isTaskFormOpen: false,
    editingTaskId: null,
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
