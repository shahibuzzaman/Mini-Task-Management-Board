import type { ReactNode } from "react";

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
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase">
          {label}
        </label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {error && (
        <span className="mt-2 text-[12px] font-bold text-[#b3261e] pl-1">
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
