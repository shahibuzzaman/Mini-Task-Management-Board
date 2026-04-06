"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { UIStoreProvider } from "@/store/ui-store-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UIStoreProvider>
        {children}
        <ToastViewport />
      </UIStoreProvider>
    </QueryClientProvider>
  );
}
