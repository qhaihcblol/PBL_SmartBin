"use client"

import { useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { fetchWasteDistribution, fetchWasteConfidence } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function WasteDistribution({ detailed = false, confidenceView = false }) {
  const [data, setData] = useState([])
  const [windowWidth, setWindowWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        if (confidenceView) {
          const confidenceData = await fetchWasteConfidence()
          setData(confidenceData)
        } else {
          const distributionData = await fetchWasteDistribution()
          setData(distributionData)
        }
        setError(null)
      } catch (error) {
        console.error("Failed to load chart data:", error)
        setError("Failed to load chart data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [confidenceView])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }

  if (data.length === 0) {
    return <div className="text-center py-10">No data available</div>
  }

  if (confidenceView) {
    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              // Use the color from each data point
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
      </ResponsiveContainer>
    </div>
  )
}
