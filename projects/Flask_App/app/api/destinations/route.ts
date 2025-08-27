import { type NextRequest, NextResponse } from "next/server"

// Mock data - in real app, this would come from database
const destinations = [
  {
    id: 1,
    name: "Vịnh Hạ Long",
    description: "Di sản thế giới với hàng nghìn đảo đá vôi tuyệt đẹp",
    image: "/ha-long-bay-vietnam-limestone-islands-emerald-wate.png",
    rating: 4.8,
    price: "1,200,000",
    location: "Quảng Ninh, Việt Nam",
  },
  {
    id: 2,
    name: "Hội An",
    description: "Phố cổ với kiến trúc độc đáo và đèn lồng rực rỡ",
    image: "/hoi-an-ancient-town-lanterns-yellow-buildings.png",
    rating: 4.9,
    price: "800,000",
    location: "Quảng Nam, Việt Nam",
  },
  {
    id: 3,
    name: "Sapa",
    description: "Ruộng bậc thang và văn hóa dân tộc thiểu số",
    image: "/sapa-terraced-rice-fields-mountains-vietnam.png",
    rating: 4.7,
    price: "1,500,000",
    location: "Lào Cai, Việt Nam",
  },
  {
    id: 4,
    name: "Phú Quốc",
    description: "Đảo ngọc với bãi biển trắng và nước biển trong xanh",
    image: "/phu-quoc-island-white-sand-beach-crystal-clear-wat.png",
    rating: 4.6,
    price: "2,000,000",
    location: "Kiên Giang, Việt Nam",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = searchParams.get("limit")

    let filteredDestinations = destinations

    // Filter by search term
    if (search) {
      filteredDestinations = destinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(search.toLowerCase()) ||
          dest.description.toLowerCase().includes(search.toLowerCase()) ||
          dest.location.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Limit results
    if (limit) {
      filteredDestinations = filteredDestinations.slice(0, Number.parseInt(limit))
    }

    return NextResponse.json({
      success: true,
      data: filteredDestinations,
      total: filteredDestinations.length,
    })
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch destinations" }, { status: 500 })
  }
}
