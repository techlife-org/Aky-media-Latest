import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Get origin from request
    const origin = request.headers.get("origin")

    // List of allowed origins
    const allowedOrigins = [
      "https://abbakabiryusuf.com",
      "https://www.abbakabiryusuf.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ]

    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
    } else if (!origin) {
      // Allow same-origin requests
      response.headers.set("Access-Control-Allow-Origin", "*")
    }

    // Set other CORS headers
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
}
