type BoardErrorStateProps = {
  message: string;
};

export function BoardErrorState({ message }: BoardErrorStateProps) {
  return (
    <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-950 shadow-sm">
      <h2 className="text-lg font-semibold">Unable to load tasks</h2>
      <p className="mt-3 text-sm leading-6">{message}</p>
    </section>
  );
}
