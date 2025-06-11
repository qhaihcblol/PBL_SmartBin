"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { WasteType } from "@/lib/api"
import { fetchWasteStats, fetchWasteTypes } from "@/lib/api"
import { Cog, Droplet, FileText, FlaskRoundIcon as Flask, Package, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Map of default icons to use for waste types if not specified
const DEFAULT_ICONS: Record<string, any> = {
  plastic: Flask,
  paper: FileText,
  metal: Cog,
  glass: Droplet,
  // Add more default icons as needed
}

export function WasteStats() {
  const [stats, setStats] = useState<Record<string, number>>({ totalItems: 0 })
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref to store the current data for comparison
  const previousStatsRef = useRef<Record<string, number>>({ totalItems: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if stats have changed
  const hasStatsChanged = (newStats: Record<string, number>, oldStats: Record<string, number>) => {
    const newKeys = Object.keys(newStats)
    const oldKeys = Object.keys(oldStats)

    if (newKeys.length !== oldKeys.length) return true

    return newKeys.some(key => newStats[key] !== oldStats[key])
  }

  // Function to load data
  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }

      const types = await fetchWasteTypes()
      const statsData = await fetchWasteStats()

      // Check if stats have actually changed
      if (hasStatsChanged(statsData, previousStatsRef.current)) {
        setWasteTypes(types)
        setStats(statsData)
        previousStatsRef.current = statsData
      }

      setError(null)
    } catch (error) {
      console.error("Failed to load waste stats:", error)
      setError("Failed to load waste statistics. Please try again later.")
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadData(true)
  }, [])

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
  }, [])

  // Get an icon for a waste type
  const getIconForType = (type: WasteType) => {
    const IconComponent = DEFAULT_ICONS[type.label] || Package
    return <IconComponent className="h-4 w-4" style={{ color: type.color }} />
  }

  if (error) {
    return (
      <div className="col-span-full text-red-500 text-center py-4">
        <p>{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[125px] w-full rounded-xl" />
        ))}
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Waste Items</CardTitle>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground">Items detected and classified</p>
        </CardContent>
      </Card>

      {/* Dynamically render cards for each waste type */}
      {wasteTypes.map((type) => {
        const count = stats[`${type.label}Count`] || 0
        const percentage = Math.round((count / stats.totalItems) * 100) || 0

        return (
          <Card key={type.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{type.display_name}</CardTitle>
              {getIconForType(type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">{percentage}% of total waste</p>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
