"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, X } from "lucide-react"
import { fetchWasteTypes } from "@/lib/api"
import type { WasteType, WasteRecordFilter } from "@/lib/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface WasteHistoryFiltersProps {
  onFilterChange: (filters: WasteRecordFilter) => void
  currentFilters: WasteRecordFilter
}

export function WasteHistoryFilters({ onFilterChange, currentFilters }: WasteHistoryFiltersProps) {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilters.waste_types || [])
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.start_date ? new Date(currentFilters.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.end_date ? new Date(currentFilters.end_date) : undefined,
  )

  useEffect(() => {
    async function loadWasteTypes() {
      try {
        const types = await fetchWasteTypes()
        setWasteTypes(types)
      } catch (error) {
        console.error("Failed to load waste types:", error)
      }
    }
    loadWasteTypes()
  }, [])

  const handleTypeToggle = (typeLabel: string, checked: boolean) => {
    const newSelectedTypes = checked ? [...selectedTypes, typeLabel] : selectedTypes.filter((t) => t !== typeLabel)

    setSelectedTypes(newSelectedTypes)
    applyFilters({ waste_types: newSelectedTypes })
  }

  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    if (type === "start") {
      setStartDate(date)
      applyFilters({ start_date: date?.toISOString().split("T")[0] })
    } else {
      setEndDate(date)
      applyFilters({ end_date: date?.toISOString().split("T")[0] })
    }
  }

  const applyFilters = (newFilters: Partial<WasteRecordFilter>) => {
    const filters: WasteRecordFilter = {
      ...currentFilters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }
    onFilterChange(filters)
  }

  const clearAllFilters = () => {
    setSelectedTypes([])
    setStartDate(undefined)
    setEndDate(undefined)
    onFilterChange({ page: 1, limit: currentFilters.limit })
  }

  const hasActiveFilters = selectedTypes.length > 0 || startDate || endDate

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Records</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Date Range - Takes up 2 columns */}
          <div className="md:col-span-2 space-y-3">
            <Label className="text-base font-medium">Date Range</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleDateChange("start", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => handleDateChange("end", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Waste Types - Takes up 1 column, positioned to the right */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Waste Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {wasteTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={selectedTypes.includes(type.label)}
                    onCheckedChange={(checked) => handleTypeToggle(type.label, checked as boolean)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor={`type-${type.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center flex-1"
                  >
                    <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: type.color }} />
                    <span className="truncate">{type.display_name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
