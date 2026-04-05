import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

type AuthPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
        <SupabaseSetupNotice
          isConfigured={config.isConfigured}
          missingEnvVars={config.missingEnvVars}
        />
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { next } = await searchParams;
    redirect(getAuthRedirectPath(next ?? null));
  }

  const { next } = await searchParams;
  const nextPath = getAuthRedirectPath(next ?? null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-8 lg:px-10">
      <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,30rem)] lg:items-center">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Supabase Auth
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Sign in to the shared task board
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            This pass replaces the simulated-user demo with a real authenticated
            board. Access control is enforced with Supabase Auth, cookie-backed
            SSR sessions, and Row Level Security.
          </p>
        </section>

        <AuthForm nextPath={nextPath} />
      </div>
    </main>
  );
}
