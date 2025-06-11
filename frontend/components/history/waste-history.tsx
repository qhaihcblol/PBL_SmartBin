"use client"

import type { WasteRecordFilter } from "@/lib/api"
import { useState } from "react"
import { WasteHistoryFilters } from "./waste-history-filters"
import { WasteHistoryTable } from "./waste-history-table"

export function WasteHistory() {
  const [filters, setFilters] = useState<WasteRecordFilter>({
    page: 1,
    limit: 20,
  })

  const handleFilterChange = (newFilters: WasteRecordFilter) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  return (
    <div className="space-y-6">
      <WasteHistoryFilters onFilterChange={handleFilterChange} currentFilters={filters} />
      <WasteHistoryTable filters={filters} onPageChange={handlePageChange} />
    </div>
  )
}
