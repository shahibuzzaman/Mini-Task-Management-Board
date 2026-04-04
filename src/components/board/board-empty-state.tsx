type BoardEmptyStateProps = {
  title: string;
  description: string;
};

export function BoardEmptyState({
  title,
  description,
}: BoardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}
