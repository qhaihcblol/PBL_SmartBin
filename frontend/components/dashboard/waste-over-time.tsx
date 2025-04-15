"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getWasteOverTime } from "@/lib/data"

export function WasteOverTime({ detailed = false }) {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(getWasteOverTime())
  }, [])

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
          <Line type="monotone" dataKey="plastic" stroke="#3B82F6" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="paper" stroke="#EAB308" />
          <Line type="monotone" dataKey="metal" stroke="#6B7280" />
          <Line type="monotone" dataKey="glass" stroke="#10B981" />
          {detailed && <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
