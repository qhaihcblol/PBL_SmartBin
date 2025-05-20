"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchWasteOverTime, fetchWasteTypes } from "@/lib/api"
import type { WasteType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function WasteOverTime({ detailed = false }) {
  const [data, setData] = useState([])
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const types = await fetchWasteTypes()
        const timeData = await fetchWasteOverTime()
        setWasteTypes(types)
        setData(timeData)
        setError(null)
      } catch (error) {
        console.error("Failed to load time series data:", error)
        setError("Failed to load time series data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }

  if (data.length === 0 || wasteTypes.length === 0) {
    return <div className="text-center py-10">No data available</div>
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
