"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWasteStats, fetchWasteTypes } from "@/lib/api"
import { Trash2, FileText, FlaskRoundIcon as Flask, Droplet, Cog, Package } from "lucide-react"
import type { WasteType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const types = await fetchWasteTypes()
        const statsData = await fetchWasteStats()
        setWasteTypes(types)
        setStats(statsData)
        setError(null)
      } catch (error) {
        console.error("Failed to load waste stats:", error)
        setError("Failed to load waste statistics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Get an icon for a waste type
  const getIconForType = (type: WasteType) => {
    const IconComponent = DEFAULT_ICONS[type.label] || Package
    return <IconComponent className="h-4 w-4" style={{ color: type.color }} />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
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
