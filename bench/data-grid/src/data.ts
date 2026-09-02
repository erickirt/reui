/** Deterministic 100K-row dataset (seeded), the same for every grid. */
export interface Row {
  id: number
  name: string
  city: string
  status: "active" | "paused" | "closed"
  amount: number
  date: string
}

const CITIES = ["Berlin", "Lisbon", "Austin", "Tokyo", "Toronto", "Madrid", "Oslo", "Seoul", "Denver", "Milan"]
const STATUS: Row["status"][] = ["active", "paused", "closed"]

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRows(count = Number(new URLSearchParams(location.search).get("rows") ?? 100_000)): Row[] {
  const rand = mulberry32(42)
  const rows: Row[] = new Array(count)
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i + 1,
      name: `Customer ${i + 1}`,
      city: CITIES[Math.floor(rand() * CITIES.length)],
      status: STATUS[Math.floor(rand() * STATUS.length)],
      amount: Math.round(rand() * 100_000) / 100,
      date: new Date(Date.UTC(2026, 0, 1) + Math.floor(rand() * 240) * 86_400_000).toISOString().slice(0, 10),
    }
  }
  return rows
}

export const COLUMNS = [
  { key: "id", label: "ID", width: 90 },
  { key: "name", label: "Name", width: 180 },
  { key: "city", label: "City", width: 140 },
  { key: "status", label: "Status", width: 120 },
  { key: "amount", label: "Amount", width: 120 },
  { key: "date", label: "Date", width: 130 },
] as const

/** Both pages call this when the first rows are painted, so the runner can wait for it. */
export function markReady(rows: number) {
  const status = document.getElementById("status")
  if (status) status.textContent = `${rows.toLocaleString("en-US")} rows`
  ;(window as unknown as { __benchReady: boolean }).__benchReady = true
  performance.mark("bench-ready")
}
