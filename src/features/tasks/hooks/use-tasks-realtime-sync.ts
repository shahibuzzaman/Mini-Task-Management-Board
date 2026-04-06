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
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const row =
            payload.eventType === "DELETE"
              ? payload.old
              : payload.new;
          const payloadBoardId =
            row && typeof row === "object" && "board_id" in row
              ? String(row.board_id ?? "")
              : "";

          if (payloadBoardId !== boardId) {
            return;
          }

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
