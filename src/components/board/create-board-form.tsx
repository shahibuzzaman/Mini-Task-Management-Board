"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { createBoardSchema } from "@/features/boards/lib/board-route-schemas";
import type { CreateBoardInput } from "@/features/boards/api/create-board";

type CreateBoardFormProps = {
  isPending: boolean;
  onSubmit: (values: CreateBoardInput) => Promise<void>;
  onCancel: () => void;
};

type CreateBoardFormValues = CreateBoardInput;

const BOARD_ACCENT_OPTIONS: Array<{
  value: CreateBoardFormValues["accentColor"];
  label: string;
  colorClass: string;
}> = [
  { value: "sky", label: "Sky", colorClass: "bg-sky-500" },
  { value: "emerald", label: "Emerald", colorClass: "bg-emerald-500" },
  { value: "amber", label: "Amber", colorClass: "bg-amber-500" },
  { value: "rose", label: "Rose", colorClass: "bg-rose-500" },
  { value: "slate", label: "Slate", colorClass: "bg-slate-500" },
];

const INVITE_POLICY_OPTIONS: Array<{
  value: CreateBoardFormValues["invitePolicy"];
  label: string;
}> = [
  { value: "admins_only", label: "Owners and admins only" },
  { value: "members", label: "Members can invite too" },
];

const DEFAULT_INVITE_ROLE_OPTIONS: Array<{
  value: NonNullable<CreateBoardFormValues["defaultInviteRole"]>;
  label: string;
}> = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

export function CreateBoardForm({ isPending, onSubmit, onCancel }: CreateBoardFormProps) {
  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
      accentColor: "sky",
      invitePolicy: "admins_only",
      defaultInviteRole: "member",
    },
  });

  const selectedColor = useWatch({
    control: form.control,
    name: "accentColor",
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values);
          form.reset();
        } catch {
          // Parent component renders the error state.
        }
      })}
    >
      <div className="space-y-2">
         <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-600 block">Board Name</label>
         <input 
           type="text" 
           placeholder="e.g., Q4 Strategic Roadmap"
           {...form.register("name")}
           disabled={isPending}
           className="w-full bg-white rounded-md border-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] px-4 py-3.5 text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/50 transition-shadow font-medium disabled:opacity-50"
         />
         {form.formState.errors.name ? (
           <p className="mt-1 text-[11px] font-semibold text-red-600">{form.formState.errors.name.message}</p>
         ) : null}
      </div>

      <div className="space-y-2">
         <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-600 block">Description</label>
         <textarea 
           placeholder="Define the scope and objectives of this workspace..."
           rows={3}
           {...form.register("description")}
           disabled={isPending}
           className="w-full bg-white rounded-md border-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] px-4 py-3.5 text-[14.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/50 transition-shadow font-medium resize-none disabled:opacity-50"
         />
         {form.formState.errors.description ? (
           <p className="mt-1 text-[11px] font-semibold text-red-600">{form.formState.errors.description.message}</p>
         ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
         <div className="space-y-2">
           <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-600 block">Invite Policy</label>
           <div className="relative">
             <select 
               {...form.register("invitePolicy")} 
               disabled={isPending}
               className="w-full bg-white rounded-md border-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] pl-4 pr-10 py-3.5 text-[14.5px] text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#3525cd]/50 cursor-pointer disabled:opacity-50"
             >
               {INVITE_POLICY_OPTIONS.map((option) => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
           </div>
         </div>

         <div className="space-y-2">
           <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-600 block">Default Invite Role</label>
           <div className="relative">
             <select
               {...form.register("defaultInviteRole")}
               disabled={isPending}
               className="w-full bg-white rounded-md border-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] pl-4 pr-10 py-3.5 text-[14.5px] text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#3525cd]/50 cursor-pointer disabled:opacity-50"
             >
               {DEFAULT_INVITE_ROLE_OPTIONS.map((option) => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
           </div>
         </div>
      </div>

      <div className="space-y-2">
           <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-600 block">Accent Color</label>
           <div className="bg-white rounded-md border-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] px-4 py-[11px] flex items-center justify-between">
              {BOARD_ACCENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => form.setValue("accentColor", option.value, { shouldValidate: true })}
                  className={`relative w-6 h-6 rounded-full ${option.colorClass} flex items-center justify-center border border-black/5 hover:scale-110 transition-all ${
                    selectedColor === option.value ? "" : "opacity-90 grayscale-[0.2]"
                  }`}
                  aria-label={`Select ${option.label.toLowerCase()} accent color`}
                >
                  {selectedColor === option.value ? (
                     <div className="absolute -inset-1 rounded-full border-[1.5px] border-[#3525cd]"></div>
                  ) : (
                     <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                  )}
                </button>
              ))}
           </div>
      </div>

      <p className="rounded-md bg-slate-100 px-4 py-3 text-[12px] leading-5 text-slate-600">
        This board will be created with you as the owner. Invite policy and
        default invite role are persisted directly to the board record.
      </p>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-4 pt-6">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isPending}
          className="text-[14.5px] font-bold text-[#3525cd] hover:text-[#4f46e5] px-4 py-2.5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[14px] font-bold px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Board"}
        </button>
      </div>
    </form>
  );
}
