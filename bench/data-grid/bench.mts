/**
 * Runs the data grid benchmark and writes results/<date>.json plus a
 * markdown table to stdout.
 *
 *   pnpm build && (pnpm preview &) && pnpm bench
 *   pnpm bench --reui-url http://localhost:1000/preview/base/data-grid-virtualization-1?embed=1
 *
 * Targets:
 *   ag-grid    AG Grid Community on 100K generated rows (this package)
 *   tanstack   the ReUI Data Grid engine (TanStack Table + Virtual) on the same rows
 *   reui       the live ReUI virtualization block, by URL (its own fixture rows)
 *
 * Measures, per target, over `--runs` runs (default 3), reporting the median:
 *   first paint (ms)          performance paint entries after navigation
 *   ready (ms)                until the page marks its first rows painted
 *   scroll p50 / p95 (ms)     frame gaps during 40 wheel steps of 600px
 *   scrolled (px)             proof the target scrolled (0 = wrong scroll element)
 *   filter latency (ms)       "Berlin" set on the input until the grid DOM changes plus 2 frames,
 *                             timed in-page (-1 = no DOM change within 3s)
 *   js bytes                  transferred script bytes on first load
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright"

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}
const runs = Number(arg("--runs", "3"))
const base = arg("--base", "http://localhost:4173")
const reuiUrl = arg("--reui-url", "")
const rows = arg("--rows", "100000")
const label = arg("--label", "")

interface Sample { firstPaint: number; ready: number; scrollP50: number; scrollP95: number; scrolledPx: number; filterMs: number; jsBytes: number }
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0 }

async function measure(url: string, live: boolean): Promise<Sample> {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  let jsBytes = 0
  page.on("response", async (res) => {
    if (/javascript|ecmascript/.test(res.headers()["content-type"] ?? "")) {
      const len = Number(res.headers()["content-length"] ?? 0)
      jsBytes += len || (await res.body().catch(() => Buffer.alloc(0))).length
    }
  })
  const started = Date.now()
  await page.goto(url, { waitUntil: "load" })
  if (live) {
    await page.waitForSelector("table, [role=grid], [data-slot=data-grid]", { timeout: 60_000 })
  } else {
    await page.waitForFunction(() => (window as unknown as { __benchReady?: boolean }).__benchReady === true, null, { timeout: 120_000 })
  }
  const ready = Date.now() - started
  await page.waitForFunction(() => performance.getEntriesByType("paint").length > 0, null, { timeout: 5_000 }).catch(() => {})
  const firstPaint = await page.evaluate(() => {
    const fp = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")
    return fp ? Math.round(fp.startTime) : 0
  })
  // Scroll: 40 wheel steps, frame gaps sampled with requestAnimationFrame.
  const scrolled = await page.evaluate(async () => {
    // The vertical scroller: the deepest element that overflows by more than a
    // viewport and scrolls; works for AG Grid, the engine page and the ReUI block.
    const target = [...document.querySelectorAll<HTMLElement>("*")]
      .filter((el) => el.scrollHeight > el.clientHeight + 100 && /auto|scroll/.test(getComputedStyle(el).overflowY))
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ?? (document.scrollingElement as HTMLElement)
    const frames: number[] = []
    let last = performance.now()
    let running = true
    const tick = () => { const now = performance.now(); frames.push(now - last); last = now; if (running) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
    for (let i = 0; i < 40; i++) {
      target.scrollBy(0, 600)
      target.dispatchEvent(new WheelEvent("wheel", { deltaY: 600, bubbles: true }))
      await new Promise((r) => setTimeout(r, 32))
    }
    running = false
    return { frames: frames.slice(2), px: target.scrollTop }
  })
  const gaps = scrolled.frames
  const sorted = [...gaps].sort((a, b) => a - b)
  const scrollP50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0
  const scrollP95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0
  // Filter latency: type a city, wait for the DOM to settle.
  let filterMs = 0
  const filterSelector = live ? 'input[type="search"], input[placeholder*="Search" i]' : "#filter"
  if ((await page.locator(filterSelector).count()) > 0) {
    filterMs = await page.evaluate(async (selector) => {
      const input = document.querySelector(selector) as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
      const t0 = performance.now()
      setter.call(input, "Berlin")
      input.dispatchEvent(new Event("input", { bubbles: true }))
      // Until the grid's DOM changes (covers a debounced filter), capped at 3s,
      // then 2 frames so the paint is in.
      const root = document.getElementById("grid") ?? document.body
      const mutated = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => { mo.disconnect(); resolve(false) }, 3000)
        const mo = new MutationObserver(() => { clearTimeout(timer); mo.disconnect(); resolve(true) })
        mo.observe(root, { subtree: true, childList: true, characterData: true })
      })
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      return mutated ? Math.round((performance.now() - t0) * 10) / 10 : -1
    }, filterSelector)
  }
  await browser.close()
  return { firstPaint, ready, scrollP50: Math.round(scrollP50 * 10) / 10, scrollP95: Math.round(scrollP95 * 10) / 10, scrolledPx: scrolled.px, filterMs, jsBytes }
}

async function main() {
  const targets: Array<{ name: string; url: string; live: boolean }> = [
    { name: "ag-grid", url: `${base}/ag-grid.html?rows=${rows}`, live: false },
    { name: "tanstack (ReUI Data Grid engine)", url: `${base}/tanstack.html?rows=${rows}`, live: false },
    ...(reuiUrl ? [{ name: "reui (live block)", url: reuiUrl, live: true }] : []),
  ]
  const results: Record<string, Sample & { runs: number; url: string }> = {}
  for (const target of targets) {
    const samples: Sample[] = []
    for (let i = 0; i < runs; i++) samples.push(await measure(target.url, target.live))
    const pick = (k: keyof Sample) => median(samples.map((s) => s[k]))
    results[target.name] = { firstPaint: pick("firstPaint"), ready: pick("ready"), scrollP50: pick("scrollP50"), scrollP95: pick("scrollP95"), scrolledPx: pick("scrolledPx"), filterMs: pick("filterMs"), jsBytes: pick("jsBytes"), runs, url: target.url }
  }
  const date = new Date().toISOString().slice(0, 10)
  mkdirSync("results", { recursive: true })
  const file = `results/${date}${label ? `-${label}` : ""}.json`
  writeFileSync(file, JSON.stringify({ date, rows: Number(rows), runs, results }, null, 2) + "\n")
  console.log(`\n| target | first paint | ready | scroll p50 | scroll p95 | scrolled | filter | js bytes |\n|---|---|---|---|---|---|---|---|`)
  for (const [name, r] of Object.entries(results)) {
    console.log(`| ${name} | ${r.firstPaint} ms | ${r.ready} ms | ${r.scrollP50} ms | ${r.scrollP95} ms | ${r.scrolledPx} px | ${r.filterMs} ms | ${(r.jsBytes / 1024).toFixed(0)} KB |`)
  }
  console.log(`\n${file} written (${rows} rows, median of ${runs})`)
}

main().catch((err) => { console.error(err); process.exit(1) })
