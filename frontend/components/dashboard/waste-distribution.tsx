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
import { getWasteDistribution, getWasteConfidence } from "@/lib/data"

export function WasteDistribution({ detailed = false, confidenceView = false }) {
  const [data, setData] = useState([])
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (confidenceView) {
      setData(getWasteConfidence())
    } else {
      setData(getWasteDistribution())
    }
  }, [confidenceView])

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
            <Bar dataKey="confidence" fill="#8884d8" name="Avg. Confidence %" />
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
