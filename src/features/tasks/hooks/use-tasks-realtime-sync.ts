"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const TASKS_REALTIME_CHANNEL = "tasks-realtime-sync";

export function useTasksRealtimeSync(boardId: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase || boardId.length === 0) {
      return;
    }

    const channel = supabase
      .channel(`${TASKS_REALTIME_CHANNEL}-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: tasksQueryKeys.list(boardId),
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: tasksQueryKeys.list(boardId),
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: tasksQueryKeys.list(boardId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, queryClient, supabase]);
}
