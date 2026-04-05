export const REQUIRED_BROWSER_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;
export const REQUIRED_SERVER_ENV_VARS = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

export type RequiredBrowserEnvVar = (typeof REQUIRED_BROWSER_ENV_VARS)[number];
export type RequiredServerEnvVar = (typeof REQUIRED_SERVER_ENV_VARS)[number];

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

function getSupabaseUrlEnvValue(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

function getSupabaseAnonKeyEnvValue(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

function getSupabaseServiceRoleKeyEnvValue(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
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

  const url = getSupabaseUrlEnvValue();
  const anonKey = getSupabaseAnonKeyEnvValue();

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

export function getSupabaseServiceRoleConfig():
  | {
      isConfigured: true;
      serviceRoleKey: string;
      missingEnvVars: [];
    }
  | {
      isConfigured: false;
      serviceRoleKey: "";
      missingEnvVars: RequiredServerEnvVar[];
    } {
  const serviceRoleKey = getSupabaseServiceRoleKeyEnvValue();

  if (serviceRoleKey.length === 0) {
    return {
      isConfigured: false,
      serviceRoleKey: "",
      missingEnvVars: ["SUPABASE_SERVICE_ROLE_KEY"],
    };
  }

  return {
    isConfigured: true,
    serviceRoleKey,
    missingEnvVars: [],
  };
}
