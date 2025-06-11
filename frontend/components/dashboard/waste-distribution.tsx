"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { fetchWasteConfidence, fetchWasteDistribution } from "@/lib/api"
import { useEffect, useRef, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function WasteDistribution({ detailed = false, confidenceView = false }) {
  const [data, setData] = useState([])
  const [windowWidth, setWindowWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref to store the current data for comparison
  const previousDataRef = useRef([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Function to check if data has changed
  const hasDataChanged = (newData: any[], oldData: any[]) => {
    if (newData.length !== oldData.length) return true

    return newData.some((newItem, index) => {
      const oldItem = oldData[index]
      if (!oldItem) return true

      // Compare relevant fields based on view type
      if (confidenceView) {
        return newItem.confidence !== oldItem.confidence || newItem.name !== oldItem.name
      } else {
        return newItem.value !== oldItem.value || newItem.name !== oldItem.name
      }
    })
  }

  // Function to load data
  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }

      let newData
      if (confidenceView) {
        newData = await fetchWasteConfidence()
      } else {
        newData = await fetchWasteDistribution()
      }

      // Check if data has actually changed
      if (hasDataChanged(newData, previousDataRef.current)) {
        setData(newData)
        previousDataRef.current = newData
      }

      setError(null)
    } catch (error) {
      console.error("Failed to load chart data:", error)
      setError("Failed to load chart data. Please try again later.")
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadData(true)
  }, [confidenceView])

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
  }, [confidenceView])

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

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p>No data available</p>
      </div>
    )
  }

  const chartContent = confidenceView ? (
    <BarChart
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis domain={[0, 100]} />
      <Tooltip
        formatter={(value) => [`${value}%`, "Confidence"]}
        labelFormatter={(label) => `Waste Type: ${label}`}
      />
      <Legend />
      <Bar
        dataKey="confidence"
        name="Avg. Confidence %"
        fill="#8884d8"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  ) : (
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={detailed}
        label={detailed ? (entry) => entry.name : false}
        outerRadius={windowWidth < 768 ? 80 : detailed ? 100 : 120}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value, name, props) => [`${value} items (${props.payload.percentage}%)`, props.payload.name]}
      />
      <Legend />
    </PieChart>
  )

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {chartContent}
      </ResponsiveContainer>
    </div>
  )
}