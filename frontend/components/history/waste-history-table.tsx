"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { PaginatedResponse, WasteRecord, WasteRecordFilter, WasteType } from "@/lib/api"
import { fetchWasteRecords, getWasteTypesMap } from "@/lib/api"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface WasteHistoryTableProps {
  filters: WasteRecordFilter
  onPageChange: (page: number) => void
}

export function WasteHistoryTable({ filters, onPageChange }: WasteHistoryTableProps) {
  const [data, setData] = useState<PaginatedResponse<WasteRecord> | null>(null)
  const [wasteTypesMap, setWasteTypesMap] = useState<Record<string, WasteType>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs to store the current data for comparison and interval
  const previousDataRef = useRef<PaginatedResponse<WasteRecord> | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if data has changed
  const hasDataChanged = (newData: PaginatedResponse<WasteRecord> | null, oldData: PaginatedResponse<WasteRecord> | null) => {
    if (!newData && !oldData) return false
    if (!newData || !oldData) return true

    // Check if the basic metadata changed
    if (newData.count !== oldData.count ||
      newData.total_pages !== oldData.total_pages ||
      newData.current_page !== oldData.current_page ||
      newData.results.length !== oldData.results.length) {
      return true
    }

    // Check if any record changed
    return newData.results.some((record, index) => {
      const oldRecord = oldData.results[index]
      return !oldRecord ||
        record.id !== oldRecord.id ||
        record.confidence !== oldRecord.confidence ||
        record.timestamp !== oldRecord.timestamp
    })
  }

  // Function to load data
  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }

      const [recordsData, typesMap] = await Promise.all([fetchWasteRecords(filters), getWasteTypesMap()])

      // Check if data has actually changed
      if (hasDataChanged(recordsData, previousDataRef.current)) {
        setData(recordsData)
        setWasteTypesMap(typesMap)
        previousDataRef.current = recordsData
      }

      setError(null)
    } catch (error) {
      console.error("Failed to load waste records:", error)
      setError("Failed to load waste records. Please try again later.")
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }

  // Initial load when filters change
  useEffect(() => {
    loadData(true)
  }, [filters])

  // Setup polling
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Start polling every 5 seconds
    intervalRef.current = setInterval(() => {
      loadData(false)
    }, 5000)

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [filters])

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage)
  }

  // Get the color for a waste type
  const getTypeColor = (typeLabel: string) => {
    const wasteType = wasteTypesMap[typeLabel]
    return wasteType ? { backgroundColor: wasteType.color } : { backgroundColor: "#6B7280" }
  }

  // Get the display name for a waste type
  const getTypeDisplayName = (typeLabel: string) => {
    const wasteType = wasteTypesMap[typeLabel]
    return wasteType ? wasteType.display_name : typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Waste Detection History</CardTitle>
          {data && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {data.results.length} of {data.count} records
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.results.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.results.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg flex-shrink-0 border">
                    <Image
                      src={record.image || "/placeholder.svg"}
                      alt={`${record.type} waste`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-base font-semibold truncate text-foreground">
                      {getTypeDisplayName(record.type)} Waste
                    </h3>
                    <p className="text-sm text-muted-foreground">Record ID: #{record.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-3 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="text-white font-medium px-3 py-1"
                      style={getTypeColor(record.type)}
                    >
                      {record.confidence}% confidence
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="min-w-[100px]">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-2xl font-semibold">Waste Record #{record.id}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6">
                          {/* Image Section */}
                          <div className="relative h-80 w-full overflow-hidden rounded-xl mx-auto border-2 border-muted bg-muted/20">
                            <Image
                              src={record.image || "/placeholder.svg"}
                              alt={`${record.type} waste`}
                              fill
                              className="object-contain"
                            />
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Waste Type</h4>
                                <div className="flex items-center">
                                  <span
                                    className="w-4 h-4 rounded-full mr-3 border"
                                    style={{ backgroundColor: wasteTypesMap[record.type]?.color }}
                                  ></span>
                                  <span className="font-semibold text-lg">{getTypeDisplayName(record.type)}</span>
                                </div>
                              </div>

                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Record ID</h4>
                                <p className="font-semibold text-lg">#{record.id}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Confidence Level</h4>
                                <div className="flex items-center">
                                  <span className="font-semibold text-lg mr-2">{record.confidence}%</span>
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${record.confidence}%`,
                                        backgroundColor: wasteTypesMap[record.type]?.color || "#6B7280",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Detection Time</h4>
                                <p className="font-semibold">
                                  {new Date(record.timestamp).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Date(record.timestamp).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {data.current_page} of {data.total_pages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.current_page - 1)}
                    disabled={!data.previous}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.current_page + 1)}
                    disabled={!data.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">No waste records found</div>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
