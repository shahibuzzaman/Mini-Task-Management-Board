"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  signUpFormSchema,
  type SignUpFormSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/store/use-toast";
import { AuthField, GoogleAuthButton, PasswordInput } from "./auth-fields";

export function SignUpForm({
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
  
  const signUpForm = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { displayName: "", email: initialEmail, password: "" },
  });

  const isPending = signUpForm.formState.isSubmitting;

  async function handleSignUp(values: SignUpFormSchema) {
    if (!supabase) {
      showToast("error", "Supabase is not configured. Add the public URL and anon key first.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback${nextPath && nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`,
      },
    });

    if (error) {
      showToast("error", error.message);
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    // Pass the email securely over query param, or push to Verify component.
    router.replace(`/verify-email?email=${encodeURIComponent(values.email)}${nextPath && nextPath !== "/dashboard" ? `&next=${encodeURIComponent(nextPath)}` : ""}`);
  }

  async function handleGoogleSignUp() {
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
          <h1 className="mb-2 text-[26px] font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-[14px] text-slate-500">
            Build the future of your workflow today.
          </p>
        </div>

        <div className="space-y-6">
          <GoogleAuthButton
            onClick={() => void handleGoogleSignUp()}
            disabled={isPending || isGooglePending}
            label={isGooglePending ? "Redirecting to Google..." : "Continue with Google"}
          />
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
              Or create with email
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </div>

        <form className="mt-6 flex flex-col space-y-6" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
          <div className="space-y-5">
            <AuthField label="Full Name" error={signUpForm.formState.errors.displayName?.message}>
              <input
                type="text"
                placeholder="Alex Sterling"
                autoComplete="name"
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                {...signUpForm.register("displayName")}
              />
            </AuthField>

            <AuthField label="Email Address" error={signUpForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                {...signUpForm.register("email")}
              />
            </AuthField>

            <AuthField label="Password" error={signUpForm.formState.errors.password?.message}>
              <div className="relative">
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:tracking-[0.2em] placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                  {...signUpForm.register("password")}
                />
                <p className="mt-2 text-[11px] font-medium italic text-slate-500">Must be at least 8 characters with 1 symbol.</p>
              </div>
            </AuthField>
          </div>

          <div className="flex items-start gap-3 pr-4 pt-1">
            <div className="flex h-5 items-center">
              <input id="terms" type="checkbox" className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[4px] border-slate-200 bg-slate-50 text-primary accent-primary focus:ring-primary" required defaultChecked />
            </div>
            <div className="leading-[1.35] text-[13px] text-slate-600">
              I agree to the <a href="#" className="font-bold text-primary transition hover:text-primary/80">Terms of Service</a> and <a href="#" className="font-bold text-primary transition hover:text-primary/80">Privacy Policy</a>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="w-full rounded-xl bg-primary py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
          
          <div className="pt-2 text-center">
            <span className="flex items-center justify-center gap-1.5 text-[14px] text-slate-600">
              Already have an account? 
              <Link href={nextPath && nextPath !== "/dashboard" ? `/signin?next=${encodeURIComponent(nextPath)}` : `/signin`} className="font-bold text-primary transition hover:text-primary/80">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
