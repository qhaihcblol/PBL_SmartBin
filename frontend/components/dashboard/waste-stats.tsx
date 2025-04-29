"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWasteStats } from "@/lib/data"
import { Trash2, FileText, FlaskRoundIcon as Flask, Droplet, Cog } from "lucide-react"

export function WasteStats() {
  const { totalItems, plasticCount, paperCount, metalCount, glassCount } = getWasteStats()

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Waste Items</CardTitle>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">Items detected and classified</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plastic</CardTitle>
          <Flask className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plasticCount}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((plasticCount / totalItems) * 100)}% of total waste
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paper</CardTitle>
          <FileText className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paperCount}</div>
          <p className="text-xs text-muted-foreground">{Math.round((paperCount / totalItems) * 100)}% of total waste</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Metal</CardTitle>
          <Cog className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metalCount}</div>
          <p className="text-xs text-muted-foreground">{Math.round((metalCount / totalItems) * 100)}% of total waste</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Glass</CardTitle>
          <Droplet className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{glassCount}</div>
          <p className="text-xs text-muted-foreground">{Math.round((glassCount / totalItems) * 100)}% of total waste</p>
        </CardContent>
      </Card>
    </>
  )
}
