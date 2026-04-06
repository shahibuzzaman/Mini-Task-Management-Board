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
    <div className="w-full max-w-[420px] mx-auto">
      <section className="w-full bg-surface-container-lowest rounded-3xl p-10 flex flex-col shadow-[var(--shadow-atmospheric)] relative z-10 border border-outline-variant/10">
        <div className="flex items-center justify-center gap-3 mb-8 mx-auto">
          <div className="w-10 h-10 bg-[#3525cd] rounded-[10px] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-on-surface">TaskTrack</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-on-surface mb-2">
            Create your account
          </h1>
          <p className="text-[15px] text-on-surface-variant">
            Build the future of your workflow today.
          </p>
        </div>

        <div className="space-y-4">
          <GoogleAuthButton
            onClick={() => void handleGoogleSignUp()}
            disabled={isPending || isGooglePending}
            label={isGooglePending ? "Redirecting to Google..." : "Continue with Google"}
          />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
              Or create with email
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>
        </div>

        <form className="space-y-5 flex flex-col" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
          <div className="space-y-4">
            <AuthField label="FULL NAME" error={signUpForm.formState.errors.displayName?.message}>
              <input
                type="text"
                placeholder="Alex Sterling"
                autoComplete="name"
                className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/50 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:font-medium"
                {...signUpForm.register("displayName")}
              />
            </AuthField>

            <AuthField label="EMAIL ADDRESS" error={signUpForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                  className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/50 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:font-medium"
                {...signUpForm.register("email")}
              />
            </AuthField>

            <AuthField label="PASSWORD" error={signUpForm.formState.errors.password?.message}>
              <div className="relative">
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/40 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:tracking-[0.2em]"
                  {...signUpForm.register("password")}
                />
                <p className="mt-2.5 text-[11px] text-on-surface-variant italic font-medium">Must be at least 8 characters with 1 symbol.</p>
              </div>
            </AuthField>
          </div>

          <div className="flex items-start gap-3 py-1 pr-4">
            <div className="flex h-5 items-center">
              <input id="terms" type="checkbox" className="h-[18px] w-[18px] rounded-[4px] border-outline-variant bg-surface-container-low text-[#3525cd] focus:ring-[#3525cd] accent-[#3525cd] flex-shrink-0 cursor-pointer" required defaultChecked />
            </div>
            <div className="text-[13px] text-on-surface leading-[1.35]">
              I agree to the <a href="#" className="font-bold text-[#3525cd] hover:text-[#4f46e5]">Terms of Service</a> and <a href="#" className="font-bold text-[#3525cd] hover:text-[#4f46e5]">Privacy Policy</a>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="mt-2 w-full rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] py-[14px] text-[15px] font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
          <div className="text-center pt-3 pb-1">
              <span className="text-[14px] text-on-surface flex items-center justify-center gap-1">
              Already have an account? 
              <Link href={nextPath && nextPath !== "/dashboard" ? `/signin?next=${encodeURIComponent(nextPath)}` : `/signin`} className="font-bold text-[#3525cd] hover:text-[#4f46e5] transition-colors ml-1">Sign in</Link>
            </span>
          </div>
        </form>
        
        <div className="mt-8 flex items-center opacity-60">
            <div className="w-full h-[1px] bg-outline-variant flex-1"></div>
            <span className="px-4 text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase">V2.4.0 Precise</span>
            <div className="w-full h-[1px] bg-outline-variant flex-1"></div>
        </div>
      </section>
    </div>
  );
}
