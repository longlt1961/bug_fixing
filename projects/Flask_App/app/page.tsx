import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const featuredDestinations = [
    {
      id: 1,
      name: "Vịnh Hạ Long",
      description: "Di sản thế giới với hàng nghìn đảo đá vôi tuyệt đẹp",
      image: "/ha-long-bay-vietnam-limestone-islands-emerald-wate.png",
      rating: 4.8,
      price: "1,200,000",
    },
    {
      id: 2,
      name: "Hội An",
      description: "Phố cổ với kiến trúc độc đáo và đèn lồng rực rỡ",
      image: "/hoi-an-ancient-town-lanterns-yellow-buildings.png",
      rating: 4.9,
      price: "800,000",
    },
    {
      id: 3,
      name: "Sapa",
      description: "Ruộng bậc thang và văn hóa dân tộc thiểu số",
      image: "/sapa-terraced-rice-fields-mountains-vietnam.png",
      rating: 4.7,
      price: "1,500,000",
    },
    {
      id: 4,
      name: "Phú Quốc",
      description: "Đảo ngọc với bãi biển trắng và nước biển trong xanh",
      image: "/phu-quoc-island-white-sand-beach-crystal-clear-wat.png",
      rating: 4.6,
      price: "2,000,000",
    },
  ]

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      location: "Hà Nội",
      comment: "Chuyến đi tuyệt vời! Dịch vụ chuyên nghiệp và địa điểm tuyệt đẹp.",
      rating: 5,
    },
    {
      name: "Trần Thị Lan",
      location: "TP.HCM",
      comment: "Trải nghiệm không thể quên. Tôi sẽ quay lại chắc chắn!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">VietTravel</h1>
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

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/vietnam-landscape-mountains-rice-terraces-sunrise.png')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Khám Phá Vẻ Đẹp Việt Nam</h2>
          <p className="text-xl md:text-2xl mb-8 text-pretty">
            Trải nghiệm những điểm đến tuyệt vời nhất với dịch vụ chuyên nghiệp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Tìm kiếm địa điểm..."
              className="bg-white/90 border-0 text-foreground placeholder:text-muted-foreground"
            />
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Tìm kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Điểm Đến Nổi Bật</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Khám phá những địa điểm du lịch hấp dẫn nhất Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{destination.name}</CardTitle>
                  <CardDescription>{destination.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{destination.price}đ</span>
                    <Link href={`/destinations/${destination.id}`}>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-12 w-12" />
              </div>
              <h4 className="text-3xl font-bold mb-2">10,000+</h4>
              <p className="text-lg">Khách hàng hài lòng</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-12 w-12" />
              </div>
              <h4 className="text-3xl font-bold mb-2">50+</h4>
              <p className="text-lg">Điểm đến</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12" />
              </div>
              <h4 className="text-3xl font-bold mb-2">5+</h4>
              <p className="text-lg">Năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Khách Hàng Nói Gì</h3>
            <p className="text-lg text-muted-foreground">Những trải nghiệm thực tế từ khách hàng của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
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
