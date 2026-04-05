"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "your inbox";
  const nextPath = searchParams?.get("next") ?? "/dashboard";

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <section className="w-full bg-surface-container-lowest rounded-3xl p-10 flex flex-col shadow-[var(--shadow-atmospheric)] relative z-10 border border-outline-variant/10 text-center items-center">
        <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm border border-outline-variant/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-on-surface mb-3">
          Check your email
        </h1>
        <p className="text-[15px] text-on-surface-variant leading-relaxed max-w-[280px]">
          We&apos;ve sent a secure sign-in link to <strong className="font-bold text-on-surface">{email}</strong>.
        </p>

        <div className="mt-8 pt-6 border-t border-outline-variant/20 w-full flex flex-col items-center gap-3">
          <Link href={nextPath && nextPath !== "/dashboard" ? `/signin?next=${encodeURIComponent(nextPath)}` : `/signin`} className="text-[13px] font-bold text-[#3525cd] hover:text-[#4f46e5] flex items-center gap-1 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}

export function VerifyEmailView() {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px] mx-auto h-[350px] bg-surface-container-lowest animate-pulse rounded-3xl"></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
