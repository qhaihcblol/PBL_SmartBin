const API_BASE_URL = 'http://172.20.10.4:8000/api'
export const MEDIA_BASE_URL = 'http://172.20.10.4:8000'

export interface WasteType {
  id: number
  label: string
  display_name: string
  color: string
}

export interface WasteRecord {
  id: number
  type_id: number
  type: string
  confidence: number
  timestamp: string
  image: string
}

export async function fetchWasteTypes(): Promise<WasteType[]> {
  const response = await fetch(`${API_BASE_URL}/waste-types/`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const data = await response.json()
  return data.results || data
}

export async function fetchWasteRecords(limit?: number): Promise<WasteRecord[]> {
  const url = new URL(`${API_BASE_URL}/waste-records/`)
  if (limit) url.searchParams.append('limit', limit.toString())
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const data = await response.json()
  return data.results || data
}

export async function fetchWasteStats(): Promise<Record<string, number>> {
  const response = await fetch(`${API_BASE_URL}/waste-stats/`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return await response.json()
}

export async function fetchWasteDistribution() {
  const response = await fetch(`${API_BASE_URL}/waste-distribution/`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return await response.json()
}

export async function fetchWasteConfidence() {
  const response = await fetch(`${API_BASE_URL}/waste-confidence/`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return await response.json()
}

export async function fetchWasteOverTime() {
  const response = await fetch(`${API_BASE_URL}/waste-over-time/`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return await response.json()
}

export async function fetchRecentDetections(limit = 5) {
  const response = await fetch(`${API_BASE_URL}/recent-detections/?limit=${limit}`)
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  return await response.json()
}

export async function getWasteTypeByLabel(label: string): Promise<WasteType | undefined> {
  const wasteTypes = await fetchWasteTypes()
  return wasteTypes.find((type) => type.label === label)
}

export async function getWasteTypesMap(): Promise<Record<string, WasteType>> {
  const wasteTypes = await fetchWasteTypes()
  return wasteTypes.reduce((map, type) => {
    map[type.label] = type
    return map
  }, {} as Record<string, WasteType>)
}
