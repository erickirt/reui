/**
 * The ReUI Data Grid engine: TanStack Table for the model, TanStack Virtual
 * for rows, a sticky header and fixed column widths, the same shape the ReUI
 * `DataGridTableVirtual` layout renders. Unstyled on purpose: the bench
 * measures the engine, and the live ReUI block is measured by URL for the
 * styled component.
 */
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { StrictMode, useEffect, useMemo, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import { COLUMNS, makeRows, markReady, type Row } from "./data"

function App() {
  const rows = useMemo(() => makeRows(), [])
  const [filter, setFilter] = useState("")
  const columns = useMemo<ColumnDef<Row>[]>(
    () => COLUMNS.map((c) => ({ accessorKey: c.key, header: c.label, size: c.width })),
    []
  )
  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })
  const parentRef = useRef<HTMLDivElement>(null)
  const modelRows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: modelRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  })
  useEffect(() => {
    markReady(rows.length)
    const input = document.getElementById("filter") as HTMLInputElement
    const handler = () => setFilter(input.value)
    input.addEventListener("input", handler)
    return () => input.removeEventListener("input", handler)
  }, [rows.length])
  const totalWidth = COLUMNS.reduce((n, c) => n + c.width, 0)
  return (
    <div ref={parentRef} style={{ height: "100%", overflow: "auto", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, display: "flex", width: totalWidth, background: "#f4f4f5", zIndex: 1 }}>
        {table.getFlatHeaders().map((header) => (
          <div key={header.id} style={{ width: header.getSize(), padding: "8px", fontWeight: 600, boxSizing: "border-box" }}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: totalWidth }}>
        {virtualizer.getVirtualItems().map((item) => {
          const row = modelRows[item.index]
          return (
            <div
              key={row.id}
              style={{ position: "absolute", top: 0, transform: `translateY(${item.start}px)`, display: "flex", height: 36, borderBottom: "1px solid #e4e4e7" }}
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} style={{ width: cell.column.getSize(), padding: "8px", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

createRoot(document.getElementById("grid")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
