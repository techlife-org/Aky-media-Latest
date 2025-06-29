// API Configuration for different environments
export const API_CONFIG = {
  // Blog backend (external server)
  BLOG_BACKEND_URL: "https://server.bitcoops.com",

  // Main backend (your Next.js API routes)
  MAIN_BACKEND_URL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://abbakabiryusuf.com",

  // Frontend domains that are allowed to connect
  ALLOWED_ORIGINS: [
    "https://abbakabiryusuf.com",
    "https://www.abbakabiryusuf.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ],

  // API endpoints
  ENDPOINTS: {
    // Blog endpoints (external)
    BLOG: "/kgt/blog",

    // Internal API endpoints
    AUTH: "/api/auth",
    DASHBOARD: "/api/dashboard",
    CONTACT: "/api/contact",
    NEWSLETTER: "/api/newsletter",
    SUBSCRIBERS: "/api/dashboard/subscribers",
    MESSAGES: "/api/dashboard/messages",
    NEWS_MANAGEMENT: "/api/dashboard/news",
  },

  // Request configuration
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; AKY-Media-Website/1.0)",
  },

  // Blog API specific headers
  BLOG_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; AKY-Media-Website/1.0)",
    Origin: "https://abbakabiryusuf.com",
    Referer: "https://abbakabiryusuf.com",
  },

  // Timeout settings
  TIMEOUT: 15000, // 15 seconds for blog API
}

// Helper function to get the correct API URL for blogs
export function getBlogApiUrl(endpoint = ""): string {
  return `${API_CONFIG.BLOG_BACKEND_URL}${endpoint}`
}

// Helper function to get the correct API URL for main backend
export function getMainApiUrl(endpoint = ""): string {
  return `${API_CONFIG.MAIN_BACKEND_URL}${endpoint}`
}

// Legacy function for backward compatibility
export function getApiUrl(endpoint = ""): string {
  return getBlogApiUrl(endpoint)
}

// Helper function to create API request options with CORS
export function createApiOptions(method = "GET", body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: API_CONFIG.DEFAULT_HEADERS,
    mode: "cors",
    credentials: "omit",
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return options
}

// Helper function to create blog API request options
export function createBlogApiOptions(method = "GET", body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: API_CONFIG.BLOG_HEADERS,
    mode: "cors",
    credentials: "omit",
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return options
}

// Helper function to make blog API requests with proper error handling
export async function blogApiRequest(endpoint: string, options?: RequestInit) {
  const url = getBlogApiUrl(endpoint)

  try {
    console.log("Making blog API request to:", url)
    console.log("Request options:", options)

    const response = await fetch(url, {
      ...createBlogApiOptions("POST", { newForm: { query_type: "select" } }),
      ...options,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    })

    console.log("Blog API response status:", response.status)
    console.log("Blog API response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Blog API error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    console.log("Blog API response data:", data)
    return { success: true, data }
  } catch (error) {
    console.error(`Blog API request failed for ${url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Alternative blog API request with different payload format
export async function blogApiRequestAlt(endpoint: string) {
  const url = getBlogApiUrl(endpoint)

  try {
    console.log("Making alternative blog API request to:", url)

    // Try different payload formats
    const payloads = [
      { newForm: { query_type: "select" } },
      { query_type: "select" },
      { action: "select" },
      { type: "select" },
      {},
    ]

    for (const payload of payloads) {
      try {
        console.log("Trying payload:", payload)

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; AKY-Media-Website/1.0)",
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        })

        console.log(`Response status for payload ${JSON.stringify(payload)}:`, response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Successful response data:", data)
          return { success: true, data }
        }
      } catch (err) {
        console.log(`Payload ${JSON.stringify(payload)} failed:`, err)
        continue
      }
    }

    throw new Error("All payload formats failed")
  } catch (error) {
    console.error(`Alternative blog API request failed for ${url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Helper function to make main API requests (MongoDB backend)
export async function mainApiRequest(endpoint: string, options?: RequestInit) {
  const url = getMainApiUrl(endpoint)

  try {
    const response = await fetch(url, {
      ...createApiOptions(),
      ...options,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error(`Main API request failed for ${url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Legacy function for backward compatibility
export async function apiRequest(endpoint: string, options?: RequestInit) {
  return blogApiRequest(endpoint, options)
}
