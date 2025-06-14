"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"

export function CameraFeed() {
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef(null)

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] max-w-4xl mx-auto overflow-hidden rounded-lg border bg-muted">
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Play className="h-16 w-16 text-white" />
          </div>
        )}
        <div className="h-full w-full bg-black">
          <img
            ref={videoRef}
            src="http://172.20.10.2:5000/video_feed" width="960" height="720"
            alt="Camera Feed"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
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
    </div>
  )
}
