"use client";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  accentClassName: string;
  meta: React.ReactNode;
  valueClassName?: string;
};

export function DashboardMetricCard({
  label,
  value,
  accentClassName,
  meta,
  valueClassName = "text-slate-900",
}: DashboardMetricCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60">
      <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${accentClassName}`} />
      <span className="pl-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
        {label}
      </span>
      <div className="mt-5 flex items-end justify-between pl-1">
        <span
          className={`text-[36px] font-extrabold leading-none tracking-tight ${valueClassName}`}
        >
          {value}
        </span>
        <span className="flex items-center gap-1 text-[13px] font-bold">
          {meta}
        </span>
      </div>
    </div>
  );
}
