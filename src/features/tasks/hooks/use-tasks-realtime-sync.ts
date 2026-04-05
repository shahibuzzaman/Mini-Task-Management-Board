"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mapTaskRowToTask } from "@/features/tasks/lib/map-task-row-to-task";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const TASKS_REALTIME_CHANNEL = "tasks-realtime-sync";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export function useTasksRealtimeSync() {
  const queryClient = useQueryClient();
  const supabaseConfig = getSupabaseBrowserConfig();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabaseConfig.isConfigured || !supabase) {
      return;
    }

    function applyRealtimeRow(row: TaskRow) {
      const task = mapTaskRowToTask(row);
      const didPatchCache = upsertTaskInTasksCache(queryClient, task);

      if (!didPatchCache) {
        void queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    }

    const channel = supabase
      .channel(TASKS_REALTIME_CHANNEL)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          applyRealtimeRow(payload.new as TaskRow);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          applyRealtimeRow(payload.new as TaskRow);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, supabase, supabaseConfig.isConfigured]);
}
