import { apiRequest, API_CONFIG } from "./api-config"

export async function testBackendConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    console.log("Testing backend connection...")
    console.log("Backend URL:", API_CONFIG.BACKEND_URL)
    console.log("Frontend URL:", window.location.origin)

    // Test basic connectivity
    const result = await apiRequest("/kgt/blog", {
      method: "POST",
      body: { newForm: { query_type: "select" } },
    })

    if (result.success) {
      return {
        success: true,
        message: "Backend connection successful!",
        details: {
          backendUrl: API_CONFIG.BACKEND_URL,
          frontendUrl: window.location.origin,
          responseData: result.data,
        },
      }
    } else {
      return {
        success: false,
        message: `Backend connection failed: ${result.error}`,
        details: {
          backendUrl: API_CONFIG.BACKEND_URL,
          frontendUrl: window.location.origin,
          error: result.error,
        },
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: {
        backendUrl: API_CONFIG.BACKEND_URL,
        frontendUrl: window.location.origin,
        error: error,
      },
    }
  }
}

// Helper function to check if we're in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development" || window.location.hostname === "localhost"
}

// Helper function to get the current environment
export function getCurrentEnvironment(): string {
  if (typeof window === "undefined") return "server"

  const hostname = window.location.hostname

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development"
  } else if (hostname === "abbakabiryusuf.com" || hostname === "www.abbakabiryusuf.com") {
    return "production"
  } else {
    return "staging"
  }
}
