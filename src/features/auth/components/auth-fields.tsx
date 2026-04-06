import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

export function AuthField({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
          {label}
        </label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {error && (
        <span className="mt-2 pl-1 text-[12px] font-bold text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function AuthFeedback({
  kind,
  message,
}: {
  kind: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-[13px] font-semibold flex items-start gap-2 border shadow-sm ${
        kind === "error"
          ? "bg-[#b3261e]/10 text-[#b3261e] border-[#b3261e]/20"
          : "bg-[#0f5223]/10 text-[#0f5223] border-[#0f5223]/20"
      }`}
    >
      {kind === "error" ? (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      ) : (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )}
      <div className="leading-snug pt-0.5 max-w-[280px]">{message}</div>
    </div>
  );
}

type PasswordInputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        className={`${className} pr-12`}
        {...props}
      />
      <button
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 rounded-md p-1.5 text-on-surface-variant transition hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3525cd]"
      >
        {isVisible ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3l18 18" />
            <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-1.22" />
            <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-.55 1.17-1.3 2.27-2.19 3.24" />
            <path d="M6.61 6.61C4.62 7.9 3.12 9.76 2 12c.91 1.94 2.39 3.78 4.33 5.1" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function GoogleAuthButton({
  onClick,
  disabled = false,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
      <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-[14px] text-[14px] font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center justify-center gap-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M21.805 10.023h-9.63v3.955h5.518c-.238 1.275-.961 2.356-2.052 3.08v2.56h3.322c1.945-1.79 3.062-4.43 3.062-7.568 0-.687-.062-1.346-.22-2.027Z"
            fill="#4285F4"
          />
          <path
            d="M12.175 22c2.767 0 5.09-.917 6.787-2.482l-3.322-2.56c-.924.618-2.103.983-3.465.983-2.66 0-4.916-1.795-5.723-4.21H3.02v2.64A10.24 10.24 0 0 0 12.175 22Z"
            fill="#34A853"
          />
          <path
            d="M6.452 13.73a6.154 6.154 0 0 1-.32-1.955c0-.68.116-1.34.32-1.955V7.18H3.02a10.243 10.243 0 0 0 0 9.19l3.432-2.64Z"
            fill="#FBBC05"
          />
          <path
            d="M12.175 5.61c1.505 0 2.855.518 3.92 1.533l2.94-2.94C17.26 2.558 14.937 1.55 12.175 1.55A10.24 10.24 0 0 0 3.02 7.18l3.432 2.64c.807-2.414 3.063-4.21 5.723-4.21Z"
            fill="#EA4335"
          />
        </svg>
        <span>{label}</span>
      </span>
    </button>
  );
}
