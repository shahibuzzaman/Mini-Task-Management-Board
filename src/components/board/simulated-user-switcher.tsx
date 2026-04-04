"use client";

import { SIMULATED_USERS, type SimulatedUser } from "@/store/ui-store";
import { useUIStore } from "@/store/ui-store-provider";

export function SimulatedUserSwitcher() {
  const activeUser = useUIStore((state) => state.activeUser);
  const setActiveUser = useUIStore((state) => state.setActiveUser);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
            Simulated User
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            UI state only. This does not persist and does not affect auth.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SIMULATED_USERS.map((user) => (
            <UserButton
              key={user}
              user={user}
              isActive={user === activeUser}
              onSelect={setActiveUser}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type UserButtonProps = {
  user: SimulatedUser;
  isActive: boolean;
  onSelect: (user: SimulatedUser) => void;
};

function UserButton({ user, isActive, onSelect }: UserButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className={[
        "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "border-sky-600 bg-sky-600 text-white"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {user}
    </button>
  );
}
