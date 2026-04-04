"use client";

import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/features/tasks/api/get-tasks";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export function useTasksQuery() {
  const supabaseConfig = getSupabaseBrowserConfig();

  return useQuery({
    queryKey: tasksQueryKeys.list(),
    queryFn: getTasks,
    enabled: supabaseConfig.isConfigured,
  });
}
