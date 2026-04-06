import { createStore } from "zustand";
import type { TaskStatus } from "@/features/tasks/types/task";

export type ToastKind = "success" | "error";

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
  durationMs: number;
};

export type UIState = {
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  createTaskStatus: TaskStatus;
  isCreateBoardModalOpen: boolean;
  toasts: Toast[];
  openCreateTaskForm: (status?: TaskStatus) => void;
  openEditTaskForm: (taskId: string) => void;
  closeTaskForm: () => void;
  openCreateBoardModal: () => void;
  closeCreateBoardModal: () => void;
  showToast: (toast: {
    kind: ToastKind;
    message: string;
    durationMs?: number;
  }) => string;
  dismissToast: (toastId: string) => void;
};

export type UIStore = ReturnType<typeof createUIStore>;

export function createUIStore() {
  let nextToastId = 0;

  return createStore<UIState>()((set) => ({
    isTaskFormOpen: false,
    editingTaskId: null,
    createTaskStatus: "todo",
    isCreateBoardModalOpen: false,
    toasts: [],
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
    showToast: ({ kind, message, durationMs = 4000 }) => {
      const id = `toast-${nextToastId++}`;

      set((state) => ({
        toasts: [...state.toasts, { id, kind, message, durationMs }],
      }));

      return id;
    },
    dismissToast: (toastId) => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== toastId),
      }));
    },
  }));
}
