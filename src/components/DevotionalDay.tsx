"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DevotionalEntry, ESV_COPYRIGHT } from "@/lib/devotional";

interface DevotionalDayProps {
  entry: DevotionalEntry;
  onToggleComplete: (day: number) => void;
}

export default function DevotionalDay({ entry, onToggleComplete }: DevotionalDayProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink-light/60">
            Day {entry.day}
            {entry.completed && entry.completedAt && (
              <> &middot; Completed {new Date(entry.completedAt).toLocaleDateString()}</>
            )}
          </p>
          <h3 className="font-display text-lg font-bold text-leather">{entry.reference}</h3>
        </div>
        <span className="text-xs bg-gold/15 text-leather rounded-full px-3 py-1 font-medium flex-shrink-0">
          {entry.theme}
        </span>
      </div>

      <div>
        <p className="whitespace-pre-wrap font-serif italic text-ink border-l-4 border-gold pl-4">
          {entry.scriptureText}
        </p>
        <p className="text-[11px] text-ink-light/60 mt-2 pl-4">{ESV_COPYRIGHT}</p>
      </div>

      <div>
        <h4 className="font-display text-sm font-bold text-leather mb-1">Explanation</h4>
        <div className="prose-bible text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.explanation}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-white/60 border border-parchment-dark rounded-xl p-4">
        <h4 className="font-display text-sm font-bold text-leather mb-1">So What?</h4>
        <div className="prose-bible text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.soWhat}</ReactMarkdown>
        </div>
      </div>

      <button
        onClick={() => onToggleComplete(entry.day)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
          entry.completed
            ? "bg-leather text-parchment hover:bg-ink"
            : "bg-white/50 border border-parchment-dark/60 text-leather hover:bg-white/80 hover:border-gold/40"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {entry.completed ? "Completed" : "Mark as Done"}
      </button>
    </div>
  );
}
