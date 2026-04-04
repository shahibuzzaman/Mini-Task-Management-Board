"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from "react";
import { createStore, useStore } from "zustand";

type UIState = {
  activeTaskId: string | null;
  setActiveTaskId: (taskId: string | null) => void;
};

type UIStore = ReturnType<typeof createUIStore>;

const UIStoreContext = createContext<UIStore | null>(null);

function createUIStore() {
  return createStore<UIState>()((set) => ({
    activeTaskId: null,
    setActiveTaskId: (taskId) => {
      set({ activeTaskId: taskId });
    },
  }));
}

export function UIStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(createUIStore);

  return (
    <UIStoreContext.Provider value={store}>{children}</UIStoreContext.Provider>
  );
}

export function useUIStore<T>(selector: (state: UIState) => T): T {
  const store = useContext(UIStoreContext);

  if (!store) {
    throw new Error("useUIStore must be used within UIStoreProvider");
  }

  return useStore(store, selector);
}
