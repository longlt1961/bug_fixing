import { type NextRequest, NextResponse } from "next/server"

// Mock detailed destination data
const destinationDetails = {
  "1": {
    id: 1,
    name: "Vịnh Hạ Long",
    description: "Di sản thế giới với hàng nghìn đảo đá vôi tuyệt đẹp",
    longDescription:
      "Vịnh Hạ Long là một trong những kỳ quan thiên nhiên nổi tiếng nhất của Việt Nam, được UNESCO công nhận là Di sản Thiên nhiên Thế giới. Với hơn 1.600 hòn đảo đá vôi nhô lên từ mặt nước màu ngọc lục bảo, tạo nên một khung cảnh huyền ảo và thơ mộng.",
    images: [
      "/ha-long-bay-vietnam-limestone-islands-emerald-wate.png",
      "/ha-long-bay-sunset-cruise-boats.png",
      "/ha-long-bay-cave-interior-stalactites.png",
    ],
    location: "Quảng Ninh, Việt Nam",
    rating: 4.8,
    reviewCount: 2847,
    price: "1,200,000",
    duration: "2 ngày 1 đêm",
    groupSize: "10-15 người",
    bestTime: "Tháng 10 - Tháng 4",
    activities: [
      { name: "Du thuyền ngắm cảnh", description: "Khám phá vịnh trên du thuyền sang trọng", icon: "Waves" },
      { name: "Thăm hang động", description: "Khám phá hang Sửng Sốt, hang Đầu Gỗ", icon: "Mountain" },
      { name: "Chụp ảnh", description: "Ghi lại những khoảnh khắc đẹp nhất", icon: "Camera" },
      { name: "Đảo Ti Tốp", description: "Leo núi ngắm toàn cảnh vịnh", icon: "TreePine" },
    ],
    highlights: [
      "Du thuyền qua đêm trên vịnh",
      "Thăm làng chài Cửa Vạn",
      "Kayak khám phá hang động",
      "Thưởng thức hải sản tươi sống",
      "Ngắm hoàng hôn trên vịnh",
    ],
    included: [
      "Xe đưa đón từ Hà Nội",
      "Du thuyền 2 ngày 1 đêm",
      "Các bữa ăn theo chương trình",
      "Hướng dẫn viên tiếng Việt",
      "Vé tham quan các điểm",
    ],
    notIncluded: ["Chi phí cá nhân", "Đồ uống có cồn", "Bảo hiểm du lịch", "Tip cho hướng dẫn viên"],
  },
  "2": {
    id: 2,
    name: "Hội An",
    description: "Phố cổ với kiến trúc độc đáo và đèn lồng rực rỡ",
    longDescription:
      "Hội An là một thành phố cổ kính nằm bên bờ sông Thu Bồn, nổi tiếng với kiến trúc cổ được bảo tồn nguyên vẹn, những chiếc đèn lồng đầy màu sắc và nền ẩm thực phong phú. Phố cổ Hội An đã được UNESCO công nhận là Di sản Văn hóa Thế giới.",
    images: [
      "/hoi-an-ancient-town-lanterns-yellow-buildings.png",
      "/hoi-an-japanese-bridge-night.png",
      "/hoi-an-tailor-shops-silk-lanterns.png",
    ],
    location: "Quảng Nam, Việt Nam",
    rating: 4.9,
    reviewCount: 3521,
    price: "800,000",
    duration: "1 ngày",
    groupSize: "8-12 người",
    bestTime: "Tháng 2 - Tháng 8",
    activities: [
      { name: "Tham quan phố cổ", description: "Khám phá kiến trúc cổ kính", icon: "Camera" },
      { name: "Thả đèn hoa đăng", description: "Cầu nguyện trên sông Thu Bồn", icon: "Waves" },
      { name: "Làng rau Trà Quế", description: "Trải nghiệm làm nông", icon: "TreePine" },
      { name: "Thánh địa Mỹ Sơn", description: "Khám phá văn hóa Chăm", icon: "Mountain" },
    ],
    highlights: [
      "Chùa Cầu Nhật Bản",
      "Nhà cổ Tấn Ký",
      "Phố đèn lồng về đêm",
      "Ẩm thực đường phố",
      "Làng nghề truyền thống",
    ],
    included: [
      "Xe đưa đón trong thành phố",
      "Vé tham quan các điểm",
      "Bữa trưa đặc sản địa phương",
      "Hướng dẫn viên địa phương",
      "Nước uống trong tour",
    ],
    notIncluded: ["Chi phí cá nhân", "Mua sắm quà lưu niệm", "Bảo hiểm du lịch", "Các bữa ăn khác"],
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const destination = destinationDetails[params.id as keyof typeof destinationDetails]

    if (!destination) {
      return NextResponse.json({ success: false, error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: destination,
    })
  } catch (error) {
    console.error("Error fetching destination:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch destination" }, { status: 500 })
  }
}
