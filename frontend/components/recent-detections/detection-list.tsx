"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { WasteType } from "@/lib/api"
import { fetchRecentDetections, getWasteTypesMap, MEDIA_BASE_URL } from "@/lib/api"
import Image from "next/image"
import { useEffect, useState } from "react"

export function RecentDetections({ limit = 5 }) {
  const [detections, setDetections] = useState([])
  const [wasteTypesMap, setWasteTypesMap] = useState<Record<string, WasteType>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to load data
  const loadData = async () => {
    try {
      const typesMap = await getWasteTypesMap()
      const detectionsData = await fetchRecentDetections(limit)

      // Check if data has changed before updating state
      const hasTypesMapChanged = JSON.stringify(typesMap) !== JSON.stringify(wasteTypesMap)
      const hasDetectionsChanged = JSON.stringify(detectionsData) !== JSON.stringify(detections)

      if (hasTypesMapChanged) {
        setWasteTypesMap(typesMap)
      }

      if (hasDetectionsChanged) {
        setDetections(detectionsData)
      }

      setError(null)
      if (loading) setLoading(false)
    } catch (error) {
      console.error("Failed to load recent detections:", error)
      setError("Failed to load recent detections. Please try again later.")
      if (loading) setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    loadData()
  }, [limit])

  // Set up polling every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData()
    }, 5000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [limit, detections, wasteTypesMap]) // Dependencies ensure we compare with latest state

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
          <div key={detection.id} className="flex items-start gap-4">            <div className="relative h-16 w-16 overflow-hidden rounded-md">
            <Image
              src={detection.image?.startsWith('http') ? detection.image : detection.image?.startsWith('/') ? detection.image : `${MEDIA_BASE_URL}${detection.image?.startsWith('/') ? '' : '/'}${detection.image}` || "/placeholder.svg"}
              alt={`${detection.type} waste`}
              fill
              className="object-cover"
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
