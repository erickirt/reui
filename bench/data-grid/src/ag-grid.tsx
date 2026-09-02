import { AllCommunityModule, ModuleRegistry, type ColDef, type GridApi } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { StrictMode, useMemo, useRef } from "react"
import { createRoot } from "react-dom/client"

import { COLUMNS, makeRows, markReady, type Row } from "./data"

ModuleRegistry.registerModules([AllCommunityModule])

function App() {
  const rows = useMemo(() => makeRows(), [])
  const api = useRef<GridApi<Row> | null>(null)
  const columnDefs = useMemo<ColDef<Row>[]>(
    () => COLUMNS.map((c) => ({ field: c.key, headerName: c.label, width: c.width, sortable: true })),
    []
  )
  return (
    <div className="ag-theme-quartz" style={{ height: "100%" }}>
      <AgGridReact<Row>
        rowData={rows}
        columnDefs={columnDefs}
        rowHeight={36}
        headerHeight={36}
        onFirstDataRendered={(event) => {
          api.current = event.api
          markReady(rows.length)
          const filter = document.getElementById("filter") as HTMLInputElement
          filter.addEventListener("input", () => {
            event.api.setGridOption("quickFilterText", filter.value)
          })
        }}
      />
    </div>
  )
}

createRoot(document.getElementById("grid")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
