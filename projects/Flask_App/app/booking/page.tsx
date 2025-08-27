"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { MapPin, CalendarIcon, User, CreditCard, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createBooking } from "@/lib/api"

const destinations = [
  { id: "1", name: "Vịnh Hạ Long", price: 1200000, duration: "2 ngày 1 đêm" },
  { id: "2", name: "Hội An", price: 800000, duration: "1 ngày" },
  { id: "3", name: "Sapa", price: 1500000, duration: "3 ngày 2 đêm" },
  { id: "4", name: "Phú Quốc", price: 2000000, duration: "3 ngày 2 đêm" },
]

export default function BookingPage() {
  const [selectedDestination, setSelectedDestination] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>()
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    specialRequests: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingCode, setBookingCode] = useState("")

  const selectedDestinationData = destinations.find((d) => d.id === selectedDestination)
  const totalPeople = Number.parseInt(adults) + Number.parseInt(children)
  const subtotal = selectedDestinationData
    ? selectedDestinationData.price * Number.parseInt(adults) +
      selectedDestinationData.price * 0.7 * Number.parseInt(children)
    : 0
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const bookingData = {
        destinationId: selectedDestination,
        departureDate: departureDate?.toISOString().split("T")[0] || "",
        adults: Number.parseInt(adults),
        children: Number.parseInt(children),
        totalAmount: total,
        customerInfo: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        specialRequests: customerInfo.specialRequests,
      }

      // Store sensitive data in localStorage (insecure)
      localStorage.setItem(
        "lastBookingData",
        JSON.stringify({
          ...bookingData,
          creditCard: "4532-1234-5678-9012", // Mock sensitive data
          cvv: "123",
          sessionToken: "sk-" + Math.random().toString(36).substr(2, 9),
        }),
      )

      // Log sensitive customer data to console
      console.log("Submitting booking with sensitive info:", {
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        totalAmount: total,
        userAgent: navigator.userAgent,
        ipAddress: "192.168.1.100", // Mock IP
      })

      const result = await createBooking(bookingData)
      setBookingCode(result.bookingCode)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Có lỗi xảy ra khi đặt tour. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                VietTravel
              </Link>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Đặt Tour Thành Công!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Cảm ơn bạn đã đặt tour với VietTravel. Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận thông
              tin.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/">Về Trang Chủ</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Mã đặt tour: <span className="font-mono font-semibold">{bookingCode}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
            <Link href="/booking" className="text-primary font-medium">
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
          <span className="text-foreground">Đặt tour</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Đặt Tour Du Lịch</h1>
            <p className="text-lg text-muted-foreground">Điền thông tin để đặt chuyến đi của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tour Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Chọn Tour
                  </CardTitle>
                  <CardDescription>Chọn địa điểm và thời gian cho chuyến đi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="destination">Địa điểm</Label>
                    <Select value={selectedDestination} onValueChange={setSelectedDestination} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn địa điểm du lịch" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest.id} value={dest.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{dest.name}</span>
                              <span className="text-sm text-muted-foreground ml-4">
                                {dest.price.toLocaleString()}đ - {dest.duration}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Ngày khởi hành</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !departureDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {departureDate ? format(departureDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={departureDate}
                            onSelect={setDepartureDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="adults">Người lớn</Label>
                        <Select value={adults} onValueChange={setAdults}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="children">Trẻ em</Label>
                        <Select value={children} onValueChange={setChildren}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Thông Tin Khách Hàng
                  </CardTitle>
                  <CardDescription>Điền thông tin liên hệ của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        value={customerInfo.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                    <Textarea
                      id="specialRequests"
                      value={customerInfo.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Tóm Tắt Đơn Hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDestinationData && (
                    <>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedDestinationData.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedDestinationData.duration}</p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Ngày khởi hành:</span>
                          <span>
                            {departureDate ? format(departureDate, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Số người:</span>
                          <span>
                            {totalPeople} người ({adults} NL, {children} TE)
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Người lớn ({adults} x {selectedDestinationData.price.toLocaleString()}đ):
                          </span>
                          <span>{(selectedDestinationData.price * Number.parseInt(adults)).toLocaleString()}đ</span>
                        </div>
                        {Number.parseInt(children) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>
                              Trẻ em ({children} x {(selectedDestinationData.price * 0.7).toLocaleString()}đ):
                            </span>
                            <span>
                              {(selectedDestinationData.price * 0.7 * Number.parseInt(children)).toLocaleString()}đ
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Thuế và phí:</span>
                          <span>{tax.toLocaleString()}đ</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-semibold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-primary">{total.toLocaleString()}đ</span>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• Giá đã bao gồm VAT</p>
                        <p>• Trẻ em dưới 12 tuổi giảm 30%</p>
                        <p>• Miễn phí hủy trong 24h</p>
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={
                      isLoading ||
                      !selectedDestination ||
                      !departureDate ||
                      !customerInfo.fullName ||
                      !customerInfo.email ||
                      !customerInfo.phone
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác Nhận Đặt Tour"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Bằng cách đặt tour, bạn đồng ý với{" "}
                    <Link href="#" className="text-primary hover:underline">
                      điều khoản dịch vụ
                    </Link>{" "}
                    của chúng tôi
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
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
