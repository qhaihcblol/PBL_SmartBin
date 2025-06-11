"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { WasteType } from "@/lib/api"
import { fetchWasteOverTime, fetchWasteTypes } from "@/lib/api"
import { useEffect, useRef, useState } from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function WasteOverTime({ detailed = false }) {
  const [data, setData] = useState([])
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref to store the current data for comparison
  const previousDataRef = useRef([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if data has changed
  const hasDataChanged = (newData: any[], oldData: any[]) => {
    if (newData.length !== oldData.length) return true

    return newData.some((newItem, index) => {
      const oldItem = oldData[index]
      if (!oldItem) return true

      // Compare all waste type values for each date
      return Object.keys(newItem).some(key => {
        if (key === 'date') return false // Skip date comparison
        return newItem[key] !== oldItem[key]
      })
    })
  }

  // Function to load data
  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }

      const types = await fetchWasteTypes()
      const timeData = await fetchWasteOverTime()

      // Check if data has actually changed
      if (hasDataChanged(timeData, previousDataRef.current)) {
        setWasteTypes(types)
        setData(timeData)
        previousDataRef.current = timeData
      }

      setError(null)
    } catch (error) {
      console.error("Failed to load time series data:", error)
      setError("Failed to load time series data. Please try again later.")
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

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>{error}</p>
      </div>
    )
  }

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }

  if (data.length === 0 || wasteTypes.length === 0) {
    return (
      <div className="text-center py-10">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Dynamically create lines for each waste type */}
          {wasteTypes.map((type) => (
            <Line
              key={type.id}
              type="monotone"
              dataKey={type.label}
              name={type.display_name}
              stroke={type.color}
              activeDot={{ r: 5 }}
            />
          ))}

          {/* Add total line if detailed view */}
          {detailed && <Line type="monotone" dataKey="total" name="Total" stroke="#8B5CF6" strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
