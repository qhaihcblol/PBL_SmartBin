"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { WasteRecord, WasteType } from "@/lib/api"
import { fetchRecentDetections, getWasteTypesMap } from "@/lib/api"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function RecentDetections({ limit = 5 }) {
  const [detections, setDetections] = useState<WasteRecord[]>([])
  const [wasteTypesMap, setWasteTypesMap] = useState<Record<string, WasteType>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref to store the current data for comparison
  const previousDetectionsRef = useRef<WasteRecord[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if detections have changed
  const hasDetectionsChanged = (newDetections: WasteRecord[], oldDetections: WasteRecord[]) => {
    if (newDetections.length !== oldDetections.length) return true

    return newDetections.some((newItem, index) => {
      const oldItem = oldDetections[index]
      if (!oldItem) return true

      return newItem.id !== oldItem.id ||
        newItem.confidence !== oldItem.confidence ||
        newItem.type !== oldItem.type ||
        newItem.timestamp !== oldItem.timestamp
    })
  }

  // Function to load data
  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }

      const typesMap = await getWasteTypesMap()
      const detectionsData = await fetchRecentDetections(limit)

      // Check if detections have actually changed
      if (hasDetectionsChanged(detectionsData, previousDetectionsRef.current)) {
        setWasteTypesMap(typesMap)
        setDetections(detectionsData)
        previousDetectionsRef.current = detectionsData
        console.log("Recent detections updated:", detectionsData)
      }

      setError(null)
    } catch (error) {
      console.error("Failed to load recent detections:", error)
      setError("Failed to load recent detections. Please try again later.")
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadData(true)
  }, [limit])

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
  }, [limit])

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
    return <div className="text-red-500">{error}</div>
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (detections.length === 0) {
    return <div className="text-center py-4">No recent detections</div>
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {detections.map((detection) => (
          <div key={detection.id} className="flex items-start gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
              <Image
                src={detection.image || "/placeholder.svg"}
                alt={`${detection.type} waste`}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", detection.image)
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{getTypeDisplayName(detection.type)} Waste</p>
                <Badge variant="outline" className="text-white" style={getTypeColor(detection.type)}>
                  {detection.confidence}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Detected on {new Date(detection.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
