"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getRecentDetections } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RecentDetections({ limit = 5 }) {
  const [detections, setDetections] = useState([])

  useEffect(() => {
    setDetections(getRecentDetections(limit))
  }, [limit])

  const getTypeColor = (type) => {
    switch (type) {
      case "plastic":
        return "bg-blue-500"
      case "paper":
        return "bg-yellow-500"
      case "metal":
        return "bg-gray-500"
      case "glass":
        return "bg-green-500"
      default:
        return "bg-purple-500"
    }
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {detections.map((detection) => (
          <div key={detection.id} className="flex items-start gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={detection.image || "/placeholder.svg"}
                alt={`${detection.type} waste`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {detection.type.charAt(0).toUpperCase() + detection.type.slice(1)} Waste
                </p>
                <Badge variant="outline" className={`${getTypeColor(detection.type)} text-white`}>
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
