"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TypingIndicator from "@/components/TypingIndicator";
import DevotionalDay from "@/components/DevotionalDay";
import DevotionalCalendar from "@/components/DevotionalCalendar";
import {
  DevotionalEntry,
  getCurrentEntry,
  getEntryByDay,
  getAllEntriesSorted,
  needsMoreEntries,
  neededCount,
  nextDayNumbers,
  getRecentHistoryForContinuity,
  appendBatch,
  markCompleted,
  computeStreak,
} from "@/lib/devotional";

interface DevotionalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export async function ensureDevotionalUpToDate(): Promise<void> {
  const count = neededCount();
  if (count === 0) return;
  const res = await fetch("/api/devotional/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(55000),
    body: JSON.stringify({
      dayNumbers: nextDayNumbers(count),
      recentHistory: getRecentHistoryForContinuity(),
    }),
  });
  const raw = await res.text();
  let data: { error?: string; entries?: DevotionalEntry[] };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      res.ok
        ? "The devotional service returned an unexpected response."
        : `Generation failed (status ${res.status}). It may have timed out — try again in a moment.`
    );
  }
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate the devotional");
  }
  appendBatch(data.entries as DevotionalEntry[]);
}

export default function DevotionalOverlay({ isOpen, onClose }: DevotionalOverlayProps) {
  const [view, setView] = useState<"today" | "calendar">("today");
  const [manualDay, setManualDay] = useState<number | null>(null);
  const [, setPlanVersion] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatingRef = useRef(false);

  const refresh = () => setPlanVersion((v) => v + 1);

  // Foreground refill: shows a loading state. Used when there's genuinely
  // nothing to display yet (first launch, or just finished the last entry).
  const runEnsureUpToDate = useCallback(async () => {
    if (generatingRef.current || !needsMoreEntries()) return;
    generatingRef.current = true;
    setIsGenerating(true);
    setError(null);
    try {
      await ensureDevotionalUpToDate();
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }, []);

  // Background top-up: there's already something to show, so this refills
  // the queue quietly without interrupting the current view.
  const backgroundTopUp = useCallback(() => {
    if (generatingRef.current || !needsMoreEntries()) return;
    generatingRef.current = true;
    ensureDevotionalUpToDate()
      .then(refresh)
      .catch(() => {
        // Silent — an opportunistic refill failing isn't worth interrupting
        // the user; it will simply retry next time the queue runs low.
      })
      .finally(() => {
        generatingRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (getCurrentEntry()) {
      backgroundTopUp();
    } else {
      runEnsureUpToDate();
    }
  }, [isOpen, backgroundTopUp, runEnsureUpToDate]);

  if (!isOpen) return null;

  const entries = getAllEntriesSorted();
  const streak = computeStreak();
  const displayedEntry = manualDay !== null ? getEntryByDay(manualDay) : getCurrentEntry();
  const displayedIndex = displayedEntry ? entries.findIndex((e) => e.day === displayedEntry.day) : -1;
  const prevEntry = displayedIndex > 0 ? entries[displayedIndex - 1] : undefined;
  const nextEntry =
    displayedIndex >= 0 && displayedIndex < entries.length - 1 ? entries[displayedIndex + 1] : undefined;

  const handleToggleComplete = (day: number) => {
    const entry = getEntryByDay(day);
    const willComplete = !entry?.completed;
    markCompleted(day, willComplete);
    setManualDay(null); // return to the current/next devotional
    refresh();
    if (willComplete) {
      if (getCurrentEntry()) {
        backgroundTopUp();
      } else {
        runEnsureUpToDate();
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 top-8 md:inset-x-auto md:right-6 md:left-6 md:top-10 md:bottom-10 md:max-w-2xl md:mx-auto bg-parchment border border-parchment-dark/50 rounded-t-2xl md:rounded-2xl z-50 flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-dark/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-leather text-sm">Daily Devotional</h2>
            <span className="text-[10px] bg-gold/15 text-leather rounded-full px-2 py-0.5 font-medium">
              {streak}-day streak
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView(view === "today" ? "calendar" : "today")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment-dark/30 transition-colors text-ink-light"
              aria-label={view === "today" ? "View history" : "Back to today"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {view === "today" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                )}
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment-dark/30 transition-colors text-ink-light"
              aria-label="Close devotional"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {view === "today" && displayedEntry && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-parchment-dark/30 flex-shrink-0">
            <button
              onClick={() => prevEntry && setManualDay(prevEntry.day)}
              disabled={!prevEntry}
              aria-label="Previous devotional"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment-dark/30 transition-colors text-ink-light disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-ink-light/60 font-medium">
              Day {displayedEntry.day} of {entries.length}
            </span>
            <button
              onClick={() => nextEntry && setManualDay(nextEntry.day)}
              disabled={!nextEntry}
              aria-label="Next devotional"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment-dark/30 transition-colors text-ink-light disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isGenerating && (
            <div className="flex justify-center py-6">
              <TypingIndicator />
            </div>
          )}

          {!isGenerating && error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm max-w-md">
                <p className="font-semibold mb-0.5">Error</p>
                <p>{error}</p>
                <button
                  onClick={runEnsureUpToDate}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!isGenerating && !error && view === "today" && displayedEntry && (
            <DevotionalDay entry={displayedEntry} onToggleComplete={handleToggleComplete} />
          )}

          {!isGenerating && !error && view === "today" && !displayedEntry && (
            <p className="text-sm text-ink-light/60 text-center mt-6">
              No devotional yet.
            </p>
          )}

          {!isGenerating && !error && view === "calendar" && (
            <DevotionalCalendar
              entries={entries}
              streak={streak}
              selectedDay={displayedEntry?.day ?? -1}
              onSelectDay={(day) => {
                setManualDay(day);
                setView("today");
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
