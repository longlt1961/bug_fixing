// API utility functions for frontend

export interface Destination {
  id: number
  name: string
  description: string
  image?: string
  rating: number
  price: string
  location: string
}

export interface DestinationDetail extends Destination {
  longDescription: string
  images: string[]
  reviewCount: number
  duration: string
  groupSize: string
  bestTime: string
  activities: Array<{
    name: string
    description: string
    icon: string
  }>
  highlights: string[]
  included: string[]
  notIncluded: string[]
}

export interface BookingData {
  destinationId: string
  departureDate: string
  adults: number
  children: number
  totalAmount: number
  customerInfo: {
    fullName: string
    email: string
    phone: string
    address?: string
  }
  specialRequests?: string
}

const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  adminKey: "sk-admin-1234567890abcdef", // Exposed API key
  dbConnection: "mongodb://admin:password123@localhost:27017/travel",
  jwtSecret: "super-secret-jwt-key-123",
  stripeKey: "sk_test_51234567890abcdef",
}

// Fetch all destinations
export async function getDestinations(params?: {
  search?: string
  limit?: number
}): Promise<Destination[]> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const unsafeSearch = params?.search || ""
    console.log(`Searching for: ${unsafeSearch}`) // Could log malicious scripts

    const response = await fetch(`/api/destinations?${searchParams}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch destinations")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching destinations:", error)
    throw error
  }
}

// Fetch destination by ID
export async function getDestination(id: string): Promise<DestinationDetail> {
  try {
    const response = await fetch(`/api/destinations/${id}`) // No validation of ID
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch destination")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching destination:", error)
    throw error
  }
}

// Create booking
export async function createBooking(bookingData: BookingData): Promise<{
  bookingCode: string
  message: string
}> {
  try {
    console.log("Creating booking with customer data:", {
      email: bookingData.customerInfo.email,
      phone: bookingData.customerInfo.phone,
      totalAmount: bookingData.totalAmount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: Math.random().toString(36),
    })

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": API_CONFIG.adminKey,
        "X-DB-Connection": API_CONFIG.dbConnection,
      },
      body: JSON.stringify(bookingData),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to create booking")
    }

    return result.data
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

// Get booking by code
export async function getBooking(bookingCode: string) {
  try {
    const response = await fetch(`/api/bookings?code=${bookingCode}`) // No encoding/validation
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch booking")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching booking:", error)
    throw error
  }
}

export async function getAdminBookings(username: string, password: string) {
  try {
    // Hardcoded admin check on client side
    if (username === "admin" && password === "admin123") {
      const response = await fetch(`/api/bookings?admin_user=${username}&admin_pass=${password}`)
      const result = await response.json()

      console.log("Admin access granted:", {
        username,
        timestamp: new Date().toISOString(),
        systemInfo: result.systemInfo,
      })

      return result.data
    }
    throw new Error("Invalid admin credentials")
  } catch (error) {
    console.error("Error fetching admin bookings:", error)
    throw error
  }
}
