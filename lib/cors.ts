import { type NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "https://abbakabiryusuf.com",
  "https://www.abbakabiryusuf.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
]

const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
const ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]

export function corsHeaders(origin?: string | null) {
  const allowedOrigins = [
    "https://abbakabiryusuf.com",
    "https://www.abbakabiryusuf.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ]

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  }

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*"
  }

  return headers
}

export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(req.headers.get("origin")),
      })
    }

    // Handle actual request
    const response = await handler(req)

    // Add CORS headers to response
    const corsHeadersObj = corsHeaders(req.headers.get("origin"))
    Object.entries(corsHeadersObj).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}
