"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from "react";
import { useStore } from "zustand";
import { createUIStore, type UIState, type UIStore } from "@/store/ui-store";

const UIStoreContext = createContext<UIStore | null>(null);

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
