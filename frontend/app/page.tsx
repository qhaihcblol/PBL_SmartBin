"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WasteStats } from "@/components/dashboard/waste-stats"
import { WasteDistribution } from "@/components/dashboard/waste-distribution"
import { WasteOverTime } from "@/components/dashboard/waste-over-time"
import { CameraFeed } from "@/components/livestream/camera-feed"
import { RecentDetections } from "@/components/recent-detections/detection-list"
import { WasteHistory } from "@/components/history/waste-history"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWasteTypes } from "@/lib/api"

// This is a client component wrapper for WasteStats that fetches the waste types first
// to determine the grid columns
function DynamicWasteStatsGrid() {
  const [columnCount, setColumnCount] = useState(5) // Default to 5 columns
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWasteTypeCount() {
      try {
        setLoading(true)
        const types = await fetchWasteTypes()
        // Add 1 for the "Total" card
        setColumnCount(types.length + 1)
      } catch (error) {
        console.error("Failed to fetch waste types:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWasteTypeCount()
  }, [])

  // Calculate grid columns based on number of waste types
  // Limit to max 6 columns to prevent layout issues
  const gridCols = Math.min(columnCount, 6)
  const gridClass = `grid gap-4 md:grid-cols-3 lg:grid-cols-${gridCols}`

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[125px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      <WasteStats />
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DynamicWasteStatsGrid />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="livestream">Livestream</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Waste Distribution</CardTitle>
                  <CardDescription>Distribution of waste types detected by the system</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <WasteDistribution />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Detections</CardTitle>
                  <CardDescription>The latest waste items detected by the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentDetections />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Waste Over Time</CardTitle>
                <CardDescription>Tracking waste types over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WasteOverTime />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Waste Over Time</CardTitle>
                <CardDescription>Detailed analysis of waste collection over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WasteOverTime detailed />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Waste Distribution</CardTitle>
                  <CardDescription>Detailed breakdown of waste types</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <WasteDistribution detailed />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Detection Confidence</CardTitle>
                  <CardDescription>Average confidence level by waste type</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <WasteDistribution confidenceView />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="livestream" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Camera Feed</CardTitle>
                <CardDescription>Real-time feed from the Raspberry Pi camera</CardDescription>
              </CardHeader>
              <CardContent>
                <CameraFeed />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Detections</CardTitle>
                <CardDescription>The latest waste items detected by the system</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentDetections limit={10} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <WasteHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
