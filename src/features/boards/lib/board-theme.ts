import type { BoardAccentColor } from "@/types/database";

type BoardTheme = {
  badgeClassName: string;
  accentTextClassName: string;
  accentRingClassName: string;
};

const BOARD_THEMES: Record<BoardAccentColor, BoardTheme> = {
  sky: {
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    accentTextClassName: "text-sky-700",
    accentRingClassName: "ring-sky-200",
  },
  emerald: {
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accentTextClassName: "text-emerald-700",
    accentRingClassName: "ring-emerald-200",
  },
  amber: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
    accentTextClassName: "text-amber-700",
    accentRingClassName: "ring-amber-200",
  },
  rose: {
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    accentTextClassName: "text-rose-700",
    accentRingClassName: "ring-rose-200",
  },
  slate: {
    badgeClassName: "border-slate-300 bg-slate-100 text-slate-700",
    accentTextClassName: "text-slate-700",
    accentRingClassName: "ring-slate-200",
  },
};

export function getBoardTheme(color: BoardAccentColor): BoardTheme {
  return BOARD_THEMES[color];
}
