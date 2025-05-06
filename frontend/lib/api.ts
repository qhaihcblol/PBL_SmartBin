// This file will connect to your backend API

// Define the waste type interface
export interface WasteType {
  id: number
  label: string
  display_name: string
  color: string
}

// Define the waste record interface
export interface WasteRecord {
  id: number
  type_id: number
  type: string
  confidence: number
  timestamp: string
  image: string
}

// Fetch waste types from the backend
export async function fetchWasteTypes(): Promise<WasteType[]> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch('/api/waste-types');
    // return response.json();

    // For development/demo purposes only
    return [
      { id: 1, label: "plastic", display_name: "Plastic", color: "#3B82F6" },
      { id: 2, label: "paper", display_name: "Paper", color: "#EAB308" },
      { id: 3, label: "metal", display_name: "Metal", color: "#6B7280" },
      { id: 4, label: "glass", display_name: "Glass", color: "#10B981" },
      // You can easily add more waste types here
      // { id: 5, label: "organic", display_name: "Organic", color: "#8B5CF6" },
    ]
  } catch (error) {
    console.error("Error fetching waste types:", error)
    throw error
  }
}

// Fetch waste records from the backend
export async function fetchWasteRecords(limit?: number): Promise<WasteRecord[]> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`/api/waste-records?limit=${limit || 100}`);
    // return response.json();

    // For development/demo purposes only
    const wasteTypes = await fetchWasteTypes()
    return generateMockWasteRecords(wasteTypes, limit || 100)
  } catch (error) {
    console.error("Error fetching waste records:", error)
    throw error
  }
}

// Fetch waste statistics from the backend
export async function fetchWasteStats(): Promise<Record<string, number>> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch('/api/waste-stats');
    // return response.json();

    // For development/demo purposes only
    const wasteTypes = await fetchWasteTypes()
    const wasteRecords = await fetchWasteRecords()

    const totalItems = wasteRecords.length

    // Create a dynamic stats object based on waste types
    const stats: Record<string, number> = { totalItems }

    wasteTypes.forEach((type) => {
      const count = wasteRecords.filter((r) => r.type === type.label).length
      stats[`${type.label}Count`] = count
    })

    return stats
  } catch (error) {
    console.error("Error fetching waste stats:", error)
    throw error
  }
}

// Fetch waste distribution for charts
export async function fetchWasteDistribution() {
  try {
    // In production, replace with actual API call:
    // const response = await fetch('/api/waste-distribution');
    // return response.json();

    // For development/demo purposes only
    const wasteTypes = await fetchWasteTypes()
    const stats = await fetchWasteStats()

    return wasteTypes.map((type) => {
      const count = stats[`${type.label}Count`] || 0
      return {
        name: type.display_name,
        value: count,
        color: type.color,
        percentage: Math.round((count / stats.totalItems) * 100),
      }
    })
  } catch (error) {
    console.error("Error fetching waste distribution:", error)
    throw error
  }
}

// Fetch waste confidence data
export async function fetchWasteConfidence() {
  try {
    // In production, replace with actual API call:
    // const response = await fetch('/api/waste-confidence');
    // return response.json();

    // For development/demo purposes only
    const wasteTypes = await fetchWasteTypes()
    const wasteRecords = await fetchWasteRecords()

    return wasteTypes.map((type) => {
      const records = wasteRecords.filter((r) => r.type === type.label)
      const avgConfidence =
        records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.confidence, 0) / records.length) : 0

      return {
        name: type.display_name,
        confidence: avgConfidence,
        color: type.color,
      }
    })
  } catch (error) {
    console.error("Error fetching waste confidence:", error)
    throw error
  }
}

// Fetch waste over time data
export async function fetchWasteOverTime() {
  try {
    // In production, replace with actual API call:
    // const response = await fetch('/api/waste-over-time');
    // return response.json();

    // For development/demo purposes only
    const wasteTypes = await fetchWasteTypes()
    const wasteRecords = await fetchWasteRecords()
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

      // Create a data point with dynamic waste type counts
      const dataPoint: Record<string, any> = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total: 0,
      }

      // Add counts for each waste type
      wasteTypes.forEach((type) => {
        const count = dayRecords.filter((r) => r.type === type.label).length
        dataPoint[type.label] = count
        dataPoint.total += count
      })

      result.push(dataPoint)
    }

    return result
  } catch (error) {
    console.error("Error fetching waste over time:", error)
    throw error
  }
}

// Fetch recent detections
export async function fetchRecentDetections(limit = 5) {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`/api/recent-detections?limit=${limit}`);
    // return response.json();

    // For development/demo purposes only
    const wasteRecords = await fetchWasteRecords(100)
    return wasteRecords.slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent detections:", error)
    throw error
  }
}

// Get waste type by label
export async function getWasteTypeByLabel(label: string): Promise<WasteType | undefined> {
  try {
    const wasteTypes = await fetchWasteTypes()
    return wasteTypes.find((type) => type.label === label)
  } catch (error) {
    console.error("Error getting waste type by label:", error)
    throw error
  }
}

// Get all waste types as a map for easy lookup
export async function getWasteTypesMap(): Promise<Record<string, WasteType>> {
  try {
    const wasteTypes = await fetchWasteTypes()
    return wasteTypes.reduce(
      (map, type) => {
        map[type.label] = type
        return map
      },
      {} as Record<string, WasteType>,
    )
  } catch (error) {
    console.error("Error getting waste types map:", error)
    throw error
  }
}

// Helper function to generate mock waste records (for development only)
function generateMockWasteRecords(wasteTypes: WasteType[], count: number): WasteRecord[] {
  const records: WasteRecord[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const typeIndex = Math.floor(Math.random() * wasteTypes.length)
    const wasteType = wasteTypes[typeIndex]

    // Generate a random date within the last 7 days
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    records.push({
      id: i + 1,
      type_id: wasteType.id,
      type: wasteType.label,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
      timestamp: date.toISOString(),
      image: `/placeholder.svg?height=200&width=200&text=${wasteType.label}`,
    })
  }

  // Sort by timestamp, newest first
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
