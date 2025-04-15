"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CameraFeed() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentDetection, setCurrentDetection] = useState(null)
  const videoRef = useRef(null)

  // This would be replaced with actual camera feed in production
  // For demo purposes, we're using a placeholder
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        const types = ["plastic", "paper", "metal", "glass"]
        const randomType = types[Math.floor(Math.random() * types.length)]
        const confidence = Math.floor(Math.random() * 30) + 70 // 70-99%

        setCurrentDetection({
          type: randomType,
          confidence,
          timestamp: new Date().toLocaleTimeString(),
        })
      }, 5000)

      return () => clearInterval(timer)
    }
  }, [isPlaying])

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
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Play className="h-16 w-16 text-white" />
          </div>
        )}
        <div className="h-full w-full bg-black">
          <img
            ref={videoRef}
            src="/placeholder.svg?height=720&width=1280"
            alt="Camera Feed"
            className="h-full w-full object-cover"
          />
        </div>
        {currentDetection && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Badge variant="outline" className={`${getTypeColor(currentDetection.type)} text-white`}>
              {currentDetection.type.charAt(0).toUpperCase() + currentDetection.type.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-black/70 text-white">
              {currentDetection.confidence}% confidence
            </Badge>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">Live from Raspberry Pi Camera</div>
      </div>
      {currentDetection && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Detection</p>
                <p className="text-xs text-muted-foreground">{currentDetection.timestamp}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getTypeColor(currentDetection.type)} text-white`}>
                  {currentDetection.type.charAt(0).toUpperCase() + currentDetection.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-black/70 text-white">
                  {currentDetection.confidence}% confidence
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
