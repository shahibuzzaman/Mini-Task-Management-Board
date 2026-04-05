type FeedbackNoticeProps = {
  kind: "success" | "error";
  message: string;
  onDismiss?: () => void;
};

export function FeedbackNotice({
  kind,
  message,
  onDismiss,
}: FeedbackNoticeProps) {
  const palette =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div
      className={[
        "mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm",
        palette,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <p>{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
