import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Firestore Timestamp or API date (string/number) → Date. Handles { _seconds, _nanoseconds } from Firestore. */
export function parseApiDate(value: unknown): Date | null {
  if (value == null) return null
  let date: Date | null = null
  if (typeof value === "string") date = new Date(value)
  if (typeof value === "number") date = new Date(value)
  if (typeof value === "object" && value !== null && "_seconds" in value) {
    date = new Date((value as { _seconds: number })._seconds * 1000)
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    date = new Date((value as { seconds: number }).seconds * 1000)
  }
  return date && Number.isFinite(date.getTime()) ? date : null
}

/** Same as parseApiDate but returns ISO date string (YYYY-MM-DD) or undefined for display. */
export function formatApiDate(value: unknown): string | undefined {
  const d = parseApiDate(value)
  return d ? d.toISOString().slice(0, 10) : undefined
}
