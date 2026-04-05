import { createStore } from "zustand";
import type { TaskStatus } from "@/features/tasks/types/task";

export type UIState = {
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  createTaskStatus: TaskStatus;
  isCreateBoardModalOpen: boolean;
  openCreateTaskForm: (status?: TaskStatus) => void;
  openEditTaskForm: (taskId: string) => void;
  closeTaskForm: () => void;
  openCreateBoardModal: () => void;
  closeCreateBoardModal: () => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  return createStore<UIState>()((set) => ({
    isTaskFormOpen: false,
    editingTaskId: null,
    createTaskStatus: "todo",
    isCreateBoardModalOpen: false,
    openCreateTaskForm: (status = "todo") => {
      set({ isTaskFormOpen: true, editingTaskId: null, createTaskStatus: status });
    },
    openEditTaskForm: (taskId) => {
      set({ isTaskFormOpen: true, editingTaskId: taskId });
    },
    closeTaskForm: () => {
      set({ isTaskFormOpen: false, editingTaskId: null, createTaskStatus: "todo" });
    },
    openCreateBoardModal: () => {
      set({ isCreateBoardModalOpen: true });
    },
    closeCreateBoardModal: () => {
      set({ isCreateBoardModalOpen: false });
    },
  }));
}
