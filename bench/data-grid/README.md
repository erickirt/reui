# Data grid benchmark: ReUI Data Grid and AG Grid Community

A reproducible harness, published so the numbers on the comparison page can
be re-run by anyone. Same machine, same rows, same browser, medians of 3.

## Where AG Grid is better

Written first, because it is true and the comparison is worthless without it:

- Pivoting, aggregation and the Excel-style formula engine: AG Grid Enterprise
  has them; the ReUI Data Grid does not.
- Server-side row model, integrated charts and enterprise support contracts:
  AG Grid.
- Very large datasets with complex server paging and years of production
  hardening: AG Grid.
- A self-contained, themed grid that does not depend on your design system:
  AG Grid. The ReUI Data Grid is the opposite by design: shadcn/ui components
  on your tokens.

## What is measured

| Measure | How |
| --- | --- |
| First paint | `first-contentful-paint` from the Performance API |
| Ready | Navigation until the page marks its first rows painted |
| Scroll p50 / p95 | Frame gaps (requestAnimationFrame deltas) during 40 wheel steps of 600px |
| Filter latency | Typing "Berlin" into the filter until two frames after the DOM settles |
| JS bytes | Script bytes transferred on first load |

Three targets:

1. `ag-grid`: AG Grid Community (`ag-grid-react`, all community modules) on
   100K generated rows, quick filter wired to the input.
2. `tanstack`: the ReUI Data Grid engine (TanStack Table for the model,
   TanStack Virtual for rows, sticky header) on the same 100K rows, unstyled.
   This is the layout the ReUI `DataGridTableVirtual` renders; it measures the
   engine, not the styled component.
3. `reui`: the live ReUI virtualization block, by URL, with its own fixture
   rows. This is the styled component as shipped; its row count is the
   block's, so compare it with the other two on scroll and filter, not on
   ready time.

The dataset is seeded (`src/data.ts`), so every run sees the same rows.

## Run it

```bash
cd bench/data-grid
pnpm install --ignore-workspace
pnpm build
pnpm preview &
pnpm bench --runs 3 --rows 100000
# the live block, from a running reui.io dev server or production:
pnpm bench --reui-url "https://reui.io/preview/base/data-grid-virtualization-1?embed=1"
```

Playwright needs a Chromium: `npx playwright install chromium` once.
Results land in `results/<date>.json`; the markdown table prints to stdout
and is pasted into the comparison page's SSOT (`lib/data/comparisons.ts`)
with the date and the machine.

## Results, 2026-09-02

Apple Silicon Mac, Chromium headless shell 151 (Playwright 1.58), 120 Hz
display (so a scroll p50 of 8.3 ms is one frame), 100,000 rows, median of 3.
Raw numbers in `results/2026-09-02.json` (local) and
`results/2026-09-02-prod.json` (the live block from reui.io).

| target | first paint | ready | scroll p50 | scroll p95 | scrolled | filter | JS bytes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AG Grid Community 36.1 | 48 ms | 303 ms | 8.3 ms | 9.8 ms | 24,000 px | 76.2 ms | 1,319 KB |
| ReUI Data Grid engine (TanStack Table 8 + Virtual 3) | 292 ms | 291 ms | 8.3 ms | 12 ms | 24,000 px | 130.1 ms | 267 KB |
| ReUI virtualization block, live on reui.io | 1340 ms | 2170 ms | 8.3 ms | 48.3 ms | 3,404 px | 32.6 ms | 937 KB |

Reading it honestly:

- AG Grid paints its shell first and fills rows after (first paint 48 ms with 100K rows). The engine page builds the 100K-row model before its first render, so first paint and ready coincide at about 291 ms. That is a render-order choice the ReUI Data Grid does not make today; it is a real AG Grid win on a cold 100K load.
- Filter latency at 100K rows: AG Grid's quick filter 76.2 ms, the engine's `getFilteredRowModel` 130.1 ms on the main thread. AG Grid wins by about 55 ms; both are under a tenth of a second.
- Scroll: both the AG Grid page and the engine page hold the 120 Hz cadence (p95 9.8 and 12 ms) through 24,000 px of wheel scrolling. The styled ReUI block does not: p95 48.3 ms live (37 ms on the dev server), over its fixture rows. The styling (many more nodes per row than the bare engine) is the cost, and it is the finding this harness exists to surface; it goes to the data grid backlog, not on a marketing page as a win.
- JS: the engine is 267 KB against 1,319 KB for AG Grid with all community modules. The live block's 937 KB is the whole reui.io preview page, not the component.
- The live block's first paint and ready include a network round trip and the Next.js app shell, and its rows are the block fixture (3,404 px of scroll depth, the end of the list), so those two columns are not comparable with the 100K-row pages. Compare it on scroll and filter only.

## Honest limits

- Both bench pages are minimal: no theme, no toolbar, no cell renderers.
  Production grids on either side will be slower than these numbers.
- AG Grid Community is measured, not Enterprise; Enterprise features are
  listed above as where AG Grid wins, they are not benchmarked.
- The ReUI engine target is not the styled ReUI component. The live block
  target is, with fewer rows. Publishing "100K rows" numbers for the styled
  component needs a bench page with the primitive installed through the
  shadcn CLI, which is the next step of this harness.
