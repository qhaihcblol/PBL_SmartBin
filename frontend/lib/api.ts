// This file connects to your backend API

// Define the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

// Define filter interface for history
export interface WasteRecordFilter {
  waste_types?: string[]
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

// Define paginated response interface
export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
}

// Helper function to handle API errors
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }
  return response.json()
}

// Fetch waste types from the backend
export async function fetchWasteTypes(): Promise<WasteType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste-types/`)
    const data = await handleApiResponse(response)
    
    // Django REST Framework returns paginated results by default
    // Check if it's paginated response or direct array
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.results)) {
      return data.results
    } else {
      console.warn('Unexpected waste types response format:', data)
      return []
    }
  } catch (error) {
    console.error("Error fetching waste types:", error)
    throw error
  }
}

// Fetch waste records with filtering and pagination
export async function fetchWasteRecords(filter: WasteRecordFilter = {}): Promise<PaginatedResponse<WasteRecord>> {
  try {
    const params = new URLSearchParams()
    
    if (filter.waste_types?.length) {
      params.append('waste_types', filter.waste_types.join(','))
    }
    if (filter.start_date) {
      params.append('start_date', filter.start_date)
    }
    if (filter.end_date) {
      params.append('end_date', filter.end_date)
    }
    if (filter.page) {
      params.append('page', filter.page.toString())
    }
    if (filter.limit) {
      params.append('limit', filter.limit.toString())
    }

    const url = `${API_BASE_URL}/api/waste-records/${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error fetching waste records:", error)
    throw error
  }
}

// Fetch simple waste records (for backward compatibility)
export async function fetchSimpleWasteRecords(limit?: number): Promise<WasteRecord[]> {
  try {
    const params = new URLSearchParams()
    if (limit) {
      params.append('limit', limit.toString())
    }

    const url = `${API_BASE_URL}/api/waste-records/${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    const data = await handleApiResponse(response)
    
    // Handle both paginated and array responses
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.results)) {
      return data.results
    } else {
      console.warn('Unexpected waste records response format:', data)
      return []
    }
  } catch (error) {
    console.error("Error fetching simple waste records:", error)
    throw error
  }
}

// Fetch waste statistics from the backend
export async function fetchWasteStats(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste-stats/`)
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error fetching waste stats:", error)
    throw error
  }
}

// Fetch waste distribution for charts
export async function fetchWasteDistribution() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste-distribution/`)
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error fetching waste distribution:", error)
    throw error
  }
}

// Fetch waste confidence data
export async function fetchWasteConfidence() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste-confidence/`)
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error fetching waste confidence:", error)
    throw error
  }
}

// Fetch waste over time data
export async function fetchWasteOverTime() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste-over-time/`)
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error fetching waste over time:", error)
    throw error
  }
}

// Fetch recent detections
export async function fetchRecentDetections(limit = 5) {
  try {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    
    const response = await fetch(`${API_BASE_URL}/api/recent-detections/?${params.toString()}`)
    const data = await handleApiResponse(response)
    
    // Handle both paginated and array responses
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.results)) {
      return data.results
    } else {
      console.warn('Unexpected recent detections response format:', data)
      return []
    }
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

// Create a new waste record
export async function createWasteRecord(data: {
  type_id: number
  confidence: number
  image?: File
}): Promise<WasteRecord> {
  try {
    const formData = new FormData()
    formData.append('type_id', data.type_id.toString())
    formData.append('confidence', data.confidence.toString())
    
    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await fetch(`${API_BASE_URL}/api/waste-records/`, {
      method: 'POST',
      body: formData,
    })
    
    return await handleApiResponse(response)
  } catch (error) {
    console.error("Error creating waste record:", error)
    throw error
  }
}
