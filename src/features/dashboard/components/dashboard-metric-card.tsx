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
    <div className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${accentClassName}`} />
      <span className="pl-2 pt-1 text-[15px] font-semibold text-slate-600">
        {label}
      </span>
      <div className="flex items-end justify-between pl-2 pb-1">
        <span
          className={`text-[36px] font-extrabold leading-none tracking-tight ${valueClassName}`}
        >
          {value}
        </span>
        <span className="mb-1 flex items-center gap-1 text-[13px] font-semibold">
          {meta}
        </span>
      </div>
    </div>
  );
}
