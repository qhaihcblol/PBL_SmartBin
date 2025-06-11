// Test API connection from frontend

async function testApiConnection() {
  const API_BASE_URL = 'http://localhost:8000'
  
  try {
    console.log('Testing API connection...')
    
    // Test waste types
    console.log('Fetching waste types...')
    const typesResponse = await fetch(`${API_BASE_URL}/api/waste-types/`)
    const types = await typesResponse.json()
    console.log('Waste Types:', types)
    console.log('Is array:', Array.isArray(types))
    console.log('Has results:', types && types.results)
    if (types && types.results) {
      console.log('Results is array:', Array.isArray(types.results))
    }
    
    // Test waste stats
    console.log('Fetching waste stats...')
    const statsResponse = await fetch(`${API_BASE_URL}/api/waste-stats/`)
    const stats = await statsResponse.json()
    console.log('Waste Stats:', stats)
    
    // Test recent detections
    console.log('Fetching recent detections...')
    const detectionsResponse = await fetch(`${API_BASE_URL}/api/recent-detections/?limit=5`)
    const detections = await detectionsResponse.json()
    console.log('Recent Detections:', detections)
    console.log('Detections is array:', Array.isArray(detections))
    
    console.log('API connection test completed successfully!')
    
  } catch (error) {
    console.error('API connection test failed:', error)
  }
}
}

// Run the test
testApiConnection()
