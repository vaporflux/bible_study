export interface DevotionalEntry {
  day: number; // 1-indexed position in the user's personal devotional sequence
  reference: string; // e.g. "Romans 8:28-30"
  theme: string; // short phrase — the compact continuity signal for future generations
  scriptureText: string; // real ESV text fetched server-side
  explanation: string; // markdown — merged exegesis + hermeneutics
  soWhat: string; // markdown — practical life application
  completed: boolean;
  completedAt: number | null; // epoch ms, when actually marked done
  generatedAt: number;
}

export interface DevotionalPlan {
  entries: DevotionalEntry[];
}

export interface HistoryItem {
  day: number;
  reference: string;
  theme: string;
}

const STORAGE_KEY = "bible-study-devotional-plan";
export const TARGET_QUEUE_SIZE = 7;
const HISTORY_LOOKBACK = 14;

const EMPTY_PLAN: DevotionalPlan = { entries: [] };

export const ESV_COPYRIGHT =
  "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), " +
  "copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.";

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayKey(dt);
}

// Earlier versions of this app keyed entries by a "date" string instead of a
// sequence number. Migrate any old data in place (ordering by that date) so
// existing completed devotionals and streak history aren't lost.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateLegacyEntries(rawEntries: any[]): DevotionalEntry[] {
  const sorted = [...rawEntries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return sorted.map((e, i) => ({
    day: i + 1,
    reference: e.reference,
    theme: e.theme,
    scriptureText: e.scriptureText,
    explanation: e.explanation,
    soWhat: e.soWhat,
    completed: !!e.completed,
    completedAt: e.completedAt ?? null,
    generatedAt: e.generatedAt ?? Date.now(),
  }));
}

export function loadPlan(): DevotionalPlan {
  if (typeof window === "undefined") return EMPTY_PLAN;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PLAN;
    const parsed = JSON.parse(raw);
    const rawEntries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    const needsMigration = rawEntries.some((e: { day?: unknown }) => typeof e.day !== "number");
    if (!needsMigration) return { entries: rawEntries };
    const migrated: DevotionalPlan = { entries: migrateLegacyEntries(rawEntries) };
    savePlan(migrated);
    return migrated;
  } catch {
    return EMPTY_PLAN;
  }
}

function savePlan(plan: DevotionalPlan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function getAllEntriesSorted(): DevotionalEntry[] {
  return [...loadPlan().entries].sort((a, b) => a.day - b.day);
}

export function getIncompleteEntries(): DevotionalEntry[] {
  return getAllEntriesSorted().filter((e) => !e.completed);
}

// The devotional the user should see by default: the earliest not-yet-done
// entry, or (if everything is caught up) the most recently generated one.
export function getCurrentEntry(): DevotionalEntry | undefined {
  const incomplete = getIncompleteEntries();
  if (incomplete.length > 0) return incomplete[0];
  const all = getAllEntriesSorted();
  return all[all.length - 1];
}

export function getEntryByDay(day: number): DevotionalEntry | undefined {
  return loadPlan().entries.find((e) => e.day === day);
}

export function getRecentHistoryForContinuity(limit: number = HISTORY_LOOKBACK): HistoryItem[] {
  return getAllEntriesSorted()
    .slice(-limit)
    .reverse()
    .map((e) => ({ day: e.day, reference: e.reference, theme: e.theme }));
}

// How many more entries are needed to bring the not-yet-done queue back up
// to TARGET_QUEUE_SIZE. Completing one entry drops the incomplete count by
// one, so this naturally comes out to exactly 1 in the steady state.
export function neededCount(): number {
  return Math.max(0, TARGET_QUEUE_SIZE - getIncompleteEntries().length);
}

export function needsMoreEntries(): boolean {
  return neededCount() > 0;
}

export function nextDayNumbers(count: number): number[] {
  const plan = loadPlan();
  const maxDay = plan.entries.reduce((max, e) => Math.max(max, e.day), 0);
  return Array.from({ length: count }, (_, i) => maxDay + i + 1);
}

export function appendBatch(newEntries: DevotionalEntry[]) {
  const plan = loadPlan();
  const existingDays = new Set(plan.entries.map((e) => e.day));
  const deduped = newEntries.filter((e) => !existingDays.has(e.day));
  plan.entries.push(...deduped);
  savePlan(plan);
}

export function markCompleted(day: number, completed: boolean = true) {
  const plan = loadPlan();
  const idx = plan.entries.findIndex((e) => e.day === day);
  if (idx === -1) return;
  plan.entries[idx].completed = completed;
  plan.entries[idx].completedAt = completed ? Date.now() : null;
  savePlan(plan);
}

// Consecutive real-world calendar days (based on when entries were actually
// completed, not their sequence position) with at least one completion,
// counting back from today — or yesterday if today has no completion yet,
// so an unfinished "today" doesn't zero out an existing streak.
export function computeStreak(): number {
  const plan = loadPlan();
  const completedDayKeys = new Set(
    plan.entries
      .filter((e) => e.completed && e.completedAt)
      .map((e) => todayKey(new Date(e.completedAt as number)))
  );
  const today = todayKey();
  let streak = 0;
  let cursor = completedDayKeys.has(today) ? today : addDays(today, -1);
  while (completedDayKeys.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
