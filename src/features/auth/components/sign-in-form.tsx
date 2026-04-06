"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  loginFormSchema,
  type LoginFormSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/store/use-toast";
import { AuthField, GoogleAuthButton, PasswordInput } from "./auth-fields";

export function SignInForm({
  nextPath = "/dashboard",
  initialEmail = "",
}: {
  nextPath?: string;
  initialEmail?: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const supabase = getSupabaseBrowserClient();
  const [isGooglePending, setIsGooglePending] = useState(false);
  
  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: initialEmail, password: "" },
  });

  const isPending = loginForm.formState.isSubmitting;

  async function handleLogin(values: LoginFormSchema) {
    if (!supabase) {
      showToast("error", "Supabase is not configured. Add the public URL and anon key first.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      showToast("error", error.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    if (!supabase) {
      showToast("error", "Supabase is not configured. Add the public URL and anon key first.");
      return;
    }

    setIsGooglePending(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${nextPath && nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`,
      },
    });

    if (error) {
      setIsGooglePending(false);
      showToast("error", error.message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <section className="relative z-10 flex w-full flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="mx-auto mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-sm ring-1 ring-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[24px] font-bold tracking-tight text-slate-900">TaskTrack</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[26px] font-bold tracking-tight text-slate-900" suppressHydrationWarning>
            Welcome back
          </h1>
          <p className="text-[14px] text-slate-500">
            Your precision workspace is ready for you.
          </p>
        </div>

        <div className="space-y-6">
          <GoogleAuthButton
            onClick={() => void handleGoogleSignIn()}
            disabled={isPending || isGooglePending}
            label={isGooglePending ? "Redirecting to Google..." : "Continue with Google"}
          />
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
              Or continue with email
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
          <div className="space-y-5">
            <AuthField label="Email Address" error={loginForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                {...loginForm.register("email")}
              />
            </AuthField>

            <AuthField 
              label="Password" 
              error={loginForm.formState.errors.password?.message}
              action={
                <Link href="/forgot-password" className="text-[13px] font-bold text-primary transition hover:text-primary/80">Forgot?</Link>
              }
            >
              <PasswordInput
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:tracking-[0.2em] placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                {...loginForm.register("password")}
              />
            </AuthField>
          </div>
          
          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign In"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
          
          <div className="pt-2 text-center">
            <span className="flex items-center justify-center gap-1.5 text-[14px] text-slate-600">
              Don&apos;t have an account? 
              <Link href={nextPath && nextPath !== "/dashboard" ? `/signup?next=${encodeURIComponent(nextPath)}` : `/signup`} className="font-bold text-primary transition hover:text-primary/80">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
