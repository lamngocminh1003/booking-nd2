import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Star, Clock, ArrowRight } from "lucide-react";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  rating: number;
  category: string;
  image: string;
}

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const services: Service[] = [
    {
      id: 1,
      name: "Khám tổng quát",
      description: "Khám sức khỏe tổng quát định kỳ cho trẻ em",
      price: "200,000 VNĐ",
      duration: "30 phút",
      rating: 4.8,
      category: "general",
      image: "👶",
    },
    {
      id: 2,
      name: "Tiêm phòng",
      description: "Tiêm phòng đầy đủ theo lịch cho trẻ",
      price: "150,000 VNĐ",
      duration: "15 phút",
      rating: 4.9,
      category: "vaccination",
      image: "💉",
    },
    {
      id: 3,
      name: "Khám mắt",
      description: "Khám và điều trị các bệnh về mắt ở trẻ em",
      price: "300,000 VNĐ",
      duration: "45 phút",
      rating: 4.7,
      category: "specialist",
      image: "👁️",
    },
    {
      id: 4,
      name: "Khám tai mũi họng",
      description: "Chuyên khoa tai mũi họng cho trẻ em",
      price: "250,000 VNĐ",
      duration: "30 phút",
      rating: 4.6,
      category: "specialist",
      image: "👂",
    },
    {
      id: 5,
      name: "Tư vấn dinh dưỡng",
      description: "Tư vấn chế độ dinh dưỡng phù hợp cho trẻ",
      price: "180,000 VNĐ",
      duration: "45 phút",
      rating: 4.8,
      category: "consultation",
      image: "🥗",
    },
    {
      id: 6,
      name: "Khám răng miệng",
      description: "Khám và chăm sóc răng miệng cho trẻ em",
      price: "220,000 VNĐ",
      duration: "30 phút",
      rating: 4.5,
      category: "dental",
      image: "🦷",
    },
  ];

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "general", label: "Khám tổng quát" },
    { value: "specialist", label: "Chuyên khoa" },
    { value: "vaccination", label: "Tiêm phòng" },
    { value: "consultation", label: "Tư vấn" },
    { value: "dental", label: "Nha khoa" },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img
              alt="Logo Bệnh Viện Nhi Đồng 2"
              src={logo}
              className="w-16 h-16 text-emerald-600 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ Y Tế
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ chăm sóc sức khỏe chuyên
              nghiệp cho trẻ em
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={
                    selectedCategory === category.value ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.value)}
                  className={
                    selectedCategory === category.value
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  }
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all duration-300 border-emerald-100"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-3">{service.image}</div>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 text-emerald-600"
                    >
                      {service.price}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        {service.rating}
                      </div>
                    </div>
                    <Link to={`/services/${service.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 group">
                        Xem chi tiết
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Không tìm thấy dịch vụ nào
              </h3>
              <p className="text-gray-400">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
