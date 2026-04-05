export const REQUIRED_BROWSER_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type RequiredBrowserEnvVar = (typeof REQUIRED_BROWSER_ENV_VARS)[number];

export type SupabaseBrowserConfig =
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
      missingEnvVars: RequiredBrowserEnvVar[];
    };

function readEnvValue(name: RequiredBrowserEnvVar): string {
  return process.env[name]?.trim() ?? "";
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

let browserSupabaseConfig: SupabaseBrowserConfig | null = null;

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  if (browserSupabaseConfig) {
    return browserSupabaseConfig;
  }

  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const missingEnvVars = REQUIRED_BROWSER_ENV_VARS.filter((envVarName) => {
    if (envVarName === "NEXT_PUBLIC_SUPABASE_URL") {
      return url.length === 0 || !isValidUrl(url);
    }

    return anonKey.length === 0;
  });

  if (missingEnvVars.length > 0) {
    browserSupabaseConfig = {
      isConfigured: false,
      url: "",
      anonKey: "",
      missingEnvVars,
    };

    return browserSupabaseConfig;
  }

  browserSupabaseConfig = {
    isConfigured: true,
    url,
    anonKey,
    missingEnvVars: [],
  };

  return browserSupabaseConfig;
}

export function getSupabaseSetupMessage(): string {
  const config = getSupabaseBrowserConfig();

  if (config.isConfigured) {
    return "Supabase environment variables are configured.";
  }

  return `Supabase is not configured. Missing or invalid: ${config.missingEnvVars.join(
    ", ",
  )}.`;
}
