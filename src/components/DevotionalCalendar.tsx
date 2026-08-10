"use client";

import { DevotionalEntry } from "@/lib/devotional";

interface DevotionalCalendarProps {
  entries: DevotionalEntry[];
  streak: number;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

export default function DevotionalCalendar({
  entries,
  streak,
  selectedDate,
  onSelectDate,
}: DevotionalCalendarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gold/10 border border-gold/25 rounded-xl px-4 py-3">
        <span className="text-sm font-semibold text-leather">Current streak</span>
        <span className="font-display text-lg font-bold text-leather">
          {streak} {streak === 1 ? "day" : "days"}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-ink-light/50 text-center mt-6">No devotionals yet</p>
      ) : (
        <div className="space-y-1">
          {entries.map((e) => (
            <button
              key={e.date}
              onClick={() => onSelectDate(e.date)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                e.date === selectedDate
                  ? "bg-gold/15 border border-gold/30 text-leather font-medium"
                  : "hover:bg-white/50 text-ink-light hover:text-ink"
              }`}
            >
              <span
                className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${
                  e.completed ? "bg-leather text-parchment" : "border border-parchment-dark/60"
                }`}
              >
                {e.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate leading-snug">{e.reference}</p>
                <p className="text-[10px] text-ink-light/50 mt-0.5">
                  {new Date(e.date + "T00:00:00").toLocaleDateString()} &middot; {e.theme}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
