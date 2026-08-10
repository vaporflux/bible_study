export interface DevotionalEntry {
  date: string; // "YYYY-MM-DD" local calendar date this entry is for
  reference: string; // e.g. "Romans 8:28-30"
  theme: string; // short phrase — the compact continuity signal for future generations
  scriptureText: string; // real ESV text fetched server-side
  explanation: string; // markdown — merged exegesis + hermeneutics
  soWhat: string; // markdown — practical life application
  completed: boolean;
  completedAt: number | null;
  generatedAt: number;
}

export interface DevotionalPlan {
  entries: DevotionalEntry[];
  lastBatchGeneratedThrough: string | null; // "YYYY-MM-DD"
}

export interface HistoryItem {
  date: string;
  reference: string;
  theme: string;
}

const STORAGE_KEY = "bible-study-devotional-plan";
const BATCH_SIZE = 7;
const REFILL_BUFFER_DAYS = 2;
const HISTORY_LOOKBACK = 14;

const EMPTY_PLAN: DevotionalPlan = { entries: [], lastBatchGeneratedThrough: null };

export const ESV_COPYRIGHT =
  "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), " +
  "copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.";

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayKey(dt);
}

export function loadPlan(): DevotionalPlan {
  if (typeof window === "undefined") return EMPTY_PLAN;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PLAN;
    return JSON.parse(raw) as DevotionalPlan;
  } catch {
    return EMPTY_PLAN;
  }
}

function savePlan(plan: DevotionalPlan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function getEntryForDate(dateKey: string = todayKey()): DevotionalEntry | undefined {
  return loadPlan().entries.find((e) => e.date === dateKey);
}

export function getAllEntriesSorted(): DevotionalEntry[] {
  return [...loadPlan().entries].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function getRecentHistoryForContinuity(limit: number = HISTORY_LOOKBACK): HistoryItem[] {
  return getAllEntriesSorted()
    .slice(-limit)
    .reverse()
    .map((e) => ({ date: e.date, reference: e.reference, theme: e.theme }));
}

export function needsMoreDays(today: string = todayKey()): boolean {
  const plan = loadPlan();
  const future = plan.entries.filter((e) => e.date >= today);
  return future.length < REFILL_BUFFER_DAYS;
}

export function nextBatchStartDate(today: string = todayKey()): string {
  const plan = loadPlan();
  if (plan.entries.length === 0) return today;
  const maxDate = plan.entries.reduce((max, e) => (e.date > max ? e.date : max), plan.entries[0].date);
  return maxDate >= today ? addDays(maxDate, 1) : today;
}

export function appendBatch(newEntries: DevotionalEntry[]) {
  const plan = loadPlan();
  const existingDates = new Set(plan.entries.map((e) => e.date));
  const deduped = newEntries.filter((e) => !existingDates.has(e.date));
  plan.entries.push(...deduped);
  plan.lastBatchGeneratedThrough = deduped.reduce(
    (max, e) => (max === null || e.date > max ? e.date : max),
    plan.lastBatchGeneratedThrough
  );
  savePlan(plan);
}

export function markCompleted(dateKey: string, completed: boolean = true) {
  const plan = loadPlan();
  const idx = plan.entries.findIndex((e) => e.date === dateKey);
  if (idx === -1) return;
  plan.entries[idx].completed = completed;
  plan.entries[idx].completedAt = completed ? Date.now() : null;
  savePlan(plan);
}

export function computeStreak(today: string = todayKey()): number {
  const plan = loadPlan();
  const completedDates = new Set(plan.entries.filter((e) => e.completed).map((e) => e.date));
  let streak = 0;
  let cursor = completedDates.has(today) ? today : addDays(today, -1);
  while (completedDates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export { BATCH_SIZE };
