const REQUIRED_BROWSER_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type SupabaseBrowserConfig =
  | {
      isConfigured: true;
      url: string;
      anonKey: string;
      missingEnvVars: [];
    }
  | {
      isConfigured: false;
      url: "";
      anonKey: "";
      missingEnvVars: string[];
    };

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const missingEnvVars = REQUIRED_BROWSER_ENV_VARS.filter((envVarName) => {
    if (envVarName === "NEXT_PUBLIC_SUPABASE_URL") {
      return url.length === 0;
    }

    return anonKey.length === 0;
  });

  if (missingEnvVars.length > 0) {
    return {
      isConfigured: false,
      url: "",
      anonKey: "",
      missingEnvVars: [...missingEnvVars],
    };
  }

  return {
    isConfigured: true,
    url,
    anonKey,
    missingEnvVars: [],
  };
}
