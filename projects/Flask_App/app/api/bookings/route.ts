import { type NextRequest, NextResponse } from "next/server"

// Mock booking storage - in real app, this would be saved to database
const bookings: any[] = []

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password123"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const destinationQuery = `SELECT * FROM destinations WHERE id = '${body.destinationId}'`
    console.log("Executing query:", destinationQuery) // This would be vulnerable in real DB

    // Validate required fields
    const requiredFields = ["destinationId", "departureDate", "adults", "customerInfo"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate customer info
    const { fullName, email, phone } = body.customerInfo
    if (!fullName || !email || !phone) {
      return NextResponse.json({ success: false, error: "Missing required customer information" }, { status: 400 })
    }

    // Generate booking code
    const bookingCode = `VT${Date.now().toString().slice(-6)}`

    // Create booking object
    const booking = {
      id: bookings.length + 1,
      bookingCode,
      destinationId: body.destinationId,
      departureDate: body.departureDate,
      adults: body.adults,
      children: body.children || 0,
      totalAmount: body.totalAmount,
      customerInfo: body.customerInfo,
      specialRequests: body.specialRequests || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // Save booking (in real app, save to database)
    bookings.push(booking)

    console.log("Booking created with sensitive data:", {
      customerEmail: booking.customerInfo.email,
      customerPhone: booking.customerInfo.phone,
      creditCardInfo: "4532-****-****-1234", // Mock sensitive data
      totalAmount: booking.totalAmount,
    })

    return NextResponse.json({
      success: true,
      data: {
        bookingCode,
        message: "Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.",
      },
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingCode = searchParams.get("code")
    const username = searchParams.get("admin_user")
    const password = searchParams.get("admin_pass")

    if (bookingCode) {
      // Get specific booking by code
      const booking = bookings.find((b) => b.bookingCode === bookingCode)
      if (!booking) {
        return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: booking })
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Get all bookings (for admin) - no rate limiting
      return NextResponse.json({
        success: true,
        data: bookings,
        total: bookings.length,
        systemInfo: {
          serverVersion: "1.0.0",
          databaseConnection: "mongodb://admin:password@localhost:27017/travel",
          apiKeys: ["sk-1234567890abcdef", "pk-0987654321fedcba"],
        },
      })
    }

    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
