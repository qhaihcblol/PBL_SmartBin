// Mock data for the waste recognition system
// In a real application, this would be fetched from an API

// Waste types with their display names and colors
const wasteTypes = [
  { id: 1, label: "plastic", display_name: "Plastic", color: "#3B82F6" }, // blue
  { id: 2, label: "paper", display_name: "Paper", color: "#EAB308" }, // yellow
  { id: 3, label: "metal", display_name: "Metal", color: "#6B7280" }, // gray
  { id: 4, label: "glass", display_name: "Glass", color: "#10B981" }, // green
]

// Generate random waste records
const generateWasteRecords = (count = 100) => {
  const records = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const typeId = Math.floor(Math.random() * 4) + 1
    const type = wasteTypes.find((t) => t.id === typeId)

    // Generate a random date within the last 7 days
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    records.push({
      id: i + 1,
      type_id: typeId,
      type: type.label,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
      timestamp: date.toISOString(),
      image: `/placeholder.svg?height=200&width=200&text=${type.label}`,
    })
  }

  // Sort by timestamp, newest first
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Cache the generated data
const wasteRecords = generateWasteRecords(100)

// Get waste statistics
export const getWasteStats = () => {
  const totalItems = wasteRecords.length
  const plasticCount = wasteRecords.filter((r) => r.type === "plastic").length
  const paperCount = wasteRecords.filter((r) => r.type === "paper").length
  const metalCount = wasteRecords.filter((r) => r.type === "metal").length
  const glassCount = wasteRecords.filter((r) => r.type === "glass").length

  return {
    totalItems,
    plasticCount,
    paperCount,
    metalCount,
    glassCount,
  }
}

// Get waste distribution for pie chart
export const getWasteDistribution = () => {
  const stats = getWasteStats()

  return [
    {
      name: "Plastic",
      value: stats.plasticCount,
      color: "#3B82F6",
      percentage: Math.round((stats.plasticCount / stats.totalItems) * 100),
    },
    {
      name: "Paper",
      value: stats.paperCount,
      color: "#EAB308",
      percentage: Math.round((stats.paperCount / stats.totalItems) * 100),
    },
    {
      name: "Metal",
      value: stats.metalCount,
      color: "#6B7280",
      percentage: Math.round((stats.metalCount / stats.totalItems) * 100),
    },
    {
      name: "Glass",
      value: stats.glassCount,
      color: "#10B981",
      percentage: Math.round((stats.glassCount / stats.totalItems) * 100),
    },
  ]
}

// Get average confidence by waste type
export const getWasteConfidence = () => {
  const plasticRecords = wasteRecords.filter((r) => r.type === "plastic")
  const paperRecords = wasteRecords.filter((r) => r.type === "paper")
  const metalRecords = wasteRecords.filter((r) => r.type === "metal")
  const glassRecords = wasteRecords.filter((r) => r.type === "glass")

  const avgConfidence = (records) => {
    if (records.length === 0) return 0
    return Math.round(records.reduce((sum, r) => sum + r.confidence, 0) / records.length)
  }

  return [
    { name: "Plastic", confidence: avgConfidence(plasticRecords) },
    { name: "Paper", confidence: avgConfidence(paperRecords) },
    { name: "Metal", confidence: avgConfidence(metalRecords) },
    { name: "Glass", confidence: avgConfidence(glassRecords) },
  ]
}

// Get waste over time for line chart
export const getWasteOverTime = () => {
  const result = []
  const now = new Date()

  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    // Filter records for this day
    const dayRecords = wasteRecords.filter((r) => {
      const recordDate = new Date(r.timestamp)
      return recordDate >= date && recordDate < nextDate
    })

    const plastic = dayRecords.filter((r) => r.type === "plastic").length
    const paper = dayRecords.filter((r) => r.type === "paper").length
    const metal = dayRecords.filter((r) => r.type === "metal").length
    const glass = dayRecords.filter((r) => r.type === "glass").length

    result.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      plastic,
      paper,
      metal,
      glass,
      total: plastic + paper + metal + glass,
    })
  }

  return result
}

// Get recent detections
export const getRecentDetections = (limit = 5) => {
  return wasteRecords.slice(0, limit)
}
