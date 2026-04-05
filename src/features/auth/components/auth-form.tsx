"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  loginFormSchema,
  signUpFormSchema,
  type LoginFormSchema,
  type SignUpFormSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  defaultMode?: AuthMode;
  nextPath?: string;
};

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

export function AuthForm({
  defaultMode = "login",
  nextPath = "/board",
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const supabase = getSupabaseBrowserClient();
  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const signUpForm = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const isPending = useMemo(() => {
    return mode === "login"
      ? loginForm.formState.isSubmitting
      : signUpForm.formState.isSubmitting;
  }, [loginForm.formState.isSubmitting, mode, signUpForm.formState.isSubmitting]);

  async function handleLogin(values: LoginFormSchema) {
    setFeedback(null);

    if (!supabase) {
      setFeedback({
        kind: "error",
        message:
          "Supabase is not configured. Add the public URL and anon key first.",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFeedback({
        kind: "error",
        message: error.message,
      });
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function handleSignUp(values: SignUpFormSchema) {
    setFeedback(null);

    if (!supabase) {
      setFeedback({
        kind: "error",
        message:
          "Supabase is not configured. Add the public URL and anon key first.",
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: values.displayName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath,
        )}`,
      },
    });

    if (error) {
      setFeedback({
        kind: "error",
        message: error.message,
      });
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setFeedback({
      kind: "success",
      message:
        "Account created. Check your email if confirmations are enabled for this Supabase project.",
    });
    signUpForm.reset();
  }

  return (
    <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign up
        </button>
      </div>

      {mode === "login" ? (
        <form
          className="mt-6 space-y-5"
          onSubmit={loginForm.handleSubmit(handleLogin)}
        >
          <AuthField
            label="Email"
            error={loginForm.formState.errors.email?.message}
          >
            <input
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...loginForm.register("email")}
            />
          </AuthField>

          <AuthField
            label="Password"
            error={loginForm.formState.errors.password?.message}
          >
            <input
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...loginForm.register("password")}
            />
          </AuthField>

          {feedback ? <AuthFeedback {...feedback} /> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isPending ? "Logging in..." : "Log in"}
          </button>
        </form>
      ) : (
        <form
          className="mt-6 space-y-5"
          onSubmit={signUpForm.handleSubmit(handleSignUp)}
        >
          <AuthField
            label="Display name"
            error={signUpForm.formState.errors.displayName?.message}
          >
            <input
              type="text"
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...signUpForm.register("displayName")}
            />
          </AuthField>

          <AuthField
            label="Email"
            error={signUpForm.formState.errors.email?.message}
          >
            <input
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...signUpForm.register("email")}
            />
          </AuthField>

          <AuthField
            label="Password"
            error={signUpForm.formState.errors.password?.message}
          >
            <input
              type="password"
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...signUpForm.register("password")}
            />
          </AuthField>

          {feedback ? <AuthFeedback {...feedback} /> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {mode === "login"
          ? "Use your email and password to access your boards."
          : "A profile is created automatically so you can create a board and invite collaborators after signing in."}
      </p>
    </section>
  );
}

type AuthFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}
      {children}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </label>
  );
}

function AuthFeedback({
  kind,
  message,
}: {
  kind: "success" | "error";
  message: string;
}) {
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        kind === "success"
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      {message}
    </p>
  );
}
