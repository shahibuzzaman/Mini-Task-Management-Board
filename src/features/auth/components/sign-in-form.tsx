"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  loginFormSchema,
  type LoginFormSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthField, AuthFeedback } from "./auth-fields";

export function SignInForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const supabase = getSupabaseBrowserClient();
  
  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isPending = loginForm.formState.isSubmitting;

  async function handleLogin(values: LoginFormSchema) {
    setFeedback(null);
    if (!supabase) {
      setFeedback({ kind: "error", message: "Supabase is not configured. Add the public URL and anon key first." });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFeedback({ kind: "error", message: error.message });
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <section className="w-full bg-surface-container-lowest rounded-3xl p-10 flex flex-col shadow-[var(--shadow-atmospheric)] relative z-10 border border-outline-variant/10">
        <div className="flex items-center justify-center gap-3 mb-8 mx-auto">
          <div className="w-10 h-10 bg-[#3525cd] rounded-[10px] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-on-surface">TaskFlow</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-on-surface mb-2" suppressHydrationWarning>
            Welcome back
          </h1>
          <p className="text-[15px] text-on-surface-variant">
            Your precision workspace is ready for you.
          </p>
        </div>

        <form className="space-y-5" onSubmit={loginForm.handleSubmit(handleLogin)}>
          <div className="space-y-4">
            <AuthField label="EMAIL ADDRESS" error={loginForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/50 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:font-medium"
                {...loginForm.register("email")}
              />
            </AuthField>

            <AuthField 
              label="PASSWORD" 
              error={loginForm.formState.errors.password?.message}
              action={
                <Link href="/forgot-password" className="text-xs font-bold text-[#3525cd] hover:text-[#4f46e5] transition-colors">Forgot password?</Link>
              }
            >
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/40 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:tracking-[0.2em]"
                {...loginForm.register("password")}
              />
            </AuthField>
          </div>

          {feedback && <AuthFeedback {...feedback} />}

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] py-[14px] text-[15px] font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 group"
          >
            {isPending ? "Signing in..." : "Sign In"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
          <div className="text-center pt-3 pb-1">
            <span className="text-[14px] text-on-surface flex items-center justify-center gap-1">
              Don&apos;t have an account? 
              <Link href={nextPath && nextPath !== "/dashboard" ? `/signup?next=${encodeURIComponent(nextPath)}` : `/signup`} className="font-bold text-[#3525cd] hover:text-[#4f46e5] transition-colors ml-1">Sign up</Link>
            </span>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-2 gap-4 mt-8 px-1">
        <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/10 shadow-sm">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-lowest flex-shrink-0 flex items-center justify-center border border-outline-variant/20 relative">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover"><path d="M18 17a6 6 0 100-12 6 6 0 000 12zM9 25a9 9 0 0118 0" fill="#cbd5e1"/></svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" className="w-full h-full object-cover absolute inset-0 opacity-80" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold tracking-[0.1em] text-on-surface-variant uppercase">Trusted by</span>
            <span className="text-[12px] font-extrabold text-on-surface leading-tight mt-0.5">10K+ Architects</span>
          </div>
        </div>
        <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/10 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-tertiary flex-shrink-0 border border-outline-variant/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00505f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="flex flex-col pl-0.5">
            <span className="text-[9px] font-extrabold tracking-[0.1em] text-on-surface-variant uppercase">Security</span>
            <span className="text-[12px] font-extrabold text-on-surface leading-tight mt-0.5">SSO Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
