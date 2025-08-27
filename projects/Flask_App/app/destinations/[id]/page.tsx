import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Clock, Users, Camera, Mountain, Waves, TreePine, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock data for destinations
const destinations = {
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
      {
        icon: <Waves className="h-5 w-5" />,
        name: "Du thuyền ngắm cảnh",
        description: "Khám phá vịnh trên du thuyền sang trọng",
      },
      {
        icon: <Mountain className="h-5 w-5" />,
        name: "Thăm hang động",
        description: "Khám phá hang Sửng Sốt, hang Đầu Gỗ",
      },
      { icon: <Camera className="h-5 w-5" />, name: "Chụp ảnh", description: "Ghi lại những khoảnh khắc đẹp nhất" },
      { icon: <TreePine className="h-5 w-5" />, name: "Đảo Ti Tốp", description: "Leo núi ngắm toàn cảnh vịnh" },
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
      { icon: <Camera className="h-5 w-5" />, name: "Tham quan phố cổ", description: "Khám phá kiến trúc cổ kính" },
      { icon: <Waves className="h-5 w-5" />, name: "Thả đèn hoa đăng", description: "Cầu nguyện trên sông Thu Bồn" },
      { icon: <TreePine className="h-5 w-5" />, name: "Làng rau Trà Quế", description: "Trải nghiệm làm nông" },
      { icon: <Mountain className="h-5 w-5" />, name: "Thánh địa Mỹ Sơn", description: "Khám phá văn hóa Chăm" },
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
  "3": {
    id: 3,
    name: "Sapa",
    description: "Ruộng bậc thang và văn hóa dân tộc thiểu số",
    longDescription:
      "Sapa là một thị trấn miền núi nằm ở độ cao 1.500m so với mực nước biển, nổi tiếng với những ruộng bậc thang tuyệt đẹp, khí hậu mát mẻ quanh năm và văn hóa đa dạng của các dân tộc thiểu số như H'Mông, Dao, Tày. Đây là điểm đến lý tưởng cho những ai yêu thích trekking và khám phá thiên nhiên.",
    images: [
      "/sapa-terraced-rice-fields-mountains-vietnam.png",
      "/sapa-mountain-village-hmong-people.png",
      "/sapa-fansipan-peak-clouds.png",
    ],
    location: "Lào Cai, Việt Nam",
    rating: 4.7,
    reviewCount: 2156,
    price: "1,500,000",
    duration: "3 ngày 2 đêm",
    groupSize: "8-12 người",
    bestTime: "Tháng 9 - Tháng 11, Tháng 3 - Tháng 5",
    activities: [
      {
        icon: <Mountain className="h-5 w-5" />,
        name: "Trekking ruộng bậc thang",
        description: "Khám phá những thửa ruộng bậc thang tuyệt đẹp",
      },
      {
        icon: <TreePine className="h-5 w-5" />,
        name: "Thăm làng dân tộc",
        description: "Tìm hiểu văn hóa H'Mông, Dao đỏ",
      },
      { icon: <Camera className="h-5 w-5" />, name: "Chinh phục Fansipan", description: "Đỉnh núi cao nhất Việt Nam" },
      { icon: <Waves className="h-5 w-5" />, name: "Chợ tình Sapa", description: "Trải nghiệm văn hóa địa phương" },
    ],
    highlights: [
      "Ruộng bậc thang Mường Hoa",
      "Làng Cát Cát, Tả Van",
      "Đỉnh Fansipan 3.143m",
      "Thác Bạc, Cầu Mây",
      "Chợ phiên Sapa cuối tuần",
    ],
    included: [
      "Xe đưa đón từ Hà Nội",
      "Khách sạn 3 sao 2 đêm",
      "Các bữa ăn theo chương trình",
      "Hướng dẫn viên địa phương",
      "Vé cáp treo Fansipan",
    ],
    notIncluded: ["Chi phí cá nhân", "Đồ uống có cồn", "Bảo hiểm du lịch", "Mua sắm đồ lưu niệm"],
  },
  "4": {
    id: 4,
    name: "Phú Quốc",
    description: "Đảo ngọc với bãi biển trắng và nước biển trong xanh",
    longDescription:
      "Phú Quốc được mệnh danh là 'đảo ngọc' của Việt Nam với những bãi biển cát trắng mịn màng, nước biển trong xanh như ngọc bích và hệ sinh thái biển đa dạng. Đảo còn nổi tiếng với nước mắm truyền thống, tiêu đen và những khu resort sang trọng bậc nhất Đông Nam Á.",
    images: [
      "/phu-quoc-island-white-sand-beach-crystal-clear-wat.png",
      "/phu-quoc-cable-car-sunset.png",
      "/phu-quoc-night-market-seafood.png",
    ],
    location: "Kiên Giang, Việt Nam",
    rating: 4.6,
    reviewCount: 1892,
    price: "2,000,000",
    duration: "4 ngày 3 đêm",
    groupSize: "6-10 người",
    bestTime: "Tháng 11 - Tháng 4",
    activities: [
      {
        icon: <Waves className="h-5 w-5" />,
        name: "Lặn ngắm san hô",
        description: "Khám phá thế giới dưới nước tuyệt đẹp",
      },
      {
        icon: <TreePine className="h-5 w-5" />,
        name: "Cáp treo Hòn Thơm",
        description: "Cáp treo vượt biển dài nhất thế giới",
      },
      { icon: <Camera className="h-5 w-5" />, name: "Safari Phú Quốc", description: "Công viên động vật hoang dã" },
      {
        icon: <Mountain className="h-5 w-5" />,
        name: "Chợ đêm Dinh Cậu",
        description: "Thưởng thức hải sản tươi sống",
      },
    ],
    highlights: [
      "Bãi Sao - bãi biển đẹp nhất",
      "Cáp treo Hòn Thơm",
      "Làng chài Hàm Ninh",
      "Vườn tiêu Khu Tượng",
      "Sunset Sanato Beach Club",
    ],
    included: [
      "Vé máy bay khứ hồi",
      "Resort 4 sao 3 đêm",
      "Các bữa ăn theo chương trình",
      "Tour 4 đảo bằng canoe",
      "Vé tham quan các điểm",
    ],
    notIncluded: ["Chi phí cá nhân", "Massage, spa", "Bảo hiểm du lịch", "Đồ uống có cồn"],
  },
}

export default function DestinationDetailPage({ params }: { params: { id: string } }) {
  const destination = destinations[params.id as keyof typeof destinations]

  if (!destination) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary" />
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              VietTravel
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/destinations" className="text-foreground hover:text-primary transition-colors">
              Địa điểm
            </Link>
            <Link href="/booking" className="text-foreground hover:text-primary transition-colors">
              Đặt tour
            </Link>
          </nav>
          <Button className="bg-primary hover:bg-primary/90">Liên hệ</Button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-primary transition-colors">
            Địa điểm
          </Link>
          <span>/</span>
          <span className="text-foreground">{destination.name}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
          <div className="md:col-span-2">
            <img
              src={destination.images[0] || "/placeholder.svg"}
              alt={destination.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <img
              src={destination.images[1] || "/placeholder.svg"}
              alt={`${destination.name} 2`}
              className="w-full h-full object-cover rounded-lg"
            />
            <img
              src={destination.images[2] || "/placeholder.svg"}
              alt={`${destination.name} 3`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{destination.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <MapPin className="h-3 w-3 mr-1" />
                {destination.location}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{destination.rating}</span>
                <span className="text-muted-foreground">({destination.reviewCount} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{destination.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{destination.groupSize}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">{destination.longDescription}</p>
          </div>

          {/* Activities */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Hoạt Động Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destination.activities.map((activity, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1">{activity.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Điểm Nhấn Chuyến Đi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {destination.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Included/Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Bao Gồm</h3>
              <ul className="space-y-2">
                {destination.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Không Bao Gồm</h3>
              <ul className="space-y-2">
                {destination.notIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{destination.price}đ</span>
                <span className="text-muted-foreground">/ người</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Thời gian tốt nhất: {destination.bestTime}</span>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Thời gian:</span>
                  <p className="font-medium">{destination.duration}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nhóm:</span>
                  <p className="font-medium">{destination.groupSize}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Link href={`/booking?destination=${destination.id}`} className="w-full">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Đặt Tour Ngay
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Liên Hệ Tư Vấn
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Miễn phí hủy trong 24h</p>
                <p>Đặt ngay, thanh toán sau</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h4 className="text-lg font-bold">VietTravel</h4>
              </div>
              <p className="text-muted-foreground">Khám phá vẻ đẹp Việt Nam cùng chúng tôi</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Liên kết</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/destinations" className="hover:text-primary transition-colors">
                    Địa điểm
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-primary transition-colors">
                    Đặt tour
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Hỗ trợ</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Chính sách
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Liên hệ</h5>
              <p className="text-muted-foreground">
                Email: info@viettravel.com
                <br />
                Phone: +84 123 456 789
              </p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
