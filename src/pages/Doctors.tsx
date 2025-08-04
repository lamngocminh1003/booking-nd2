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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Search,
  Star,
  Calendar,
  MapPin,
  ArrowRight,
  Award,
} from "lucide-react";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary

interface Doctor {
  id: number;
  name: string;
  title: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  hospital: string;
  description: string;
  availability: string;
  image?: string;
}

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Bác sĩ Nguyễn Thị Mai",
      title: "Tiến sĩ, Bác sĩ chuyên khoa II",
      specialty: "Nhi khoa tổng quát",
      experience: 15,
      rating: 4.9,
      reviews: 234,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên gia hàng đầu về nhi khoa với hơn 15 năm kinh nghiệm",
      availability: "Thứ 2, 4, 6",
    },
    {
      id: 2,
      name: "Bác sĩ Trần Văn Nam",
      title: "Thạc sĩ, Bác sĩ chuyên khoa I",
      specialty: "Tim mạch nhi",
      experience: 12,
      rating: 4.8,
      reviews: 189,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên điều trị các bệnh lý tim mạch ở trẻ em",
      availability: "Thứ 3, 5, 7",
    },
    {
      id: 3,
      name: "Bác sĩ Lê Thị Hoa",
      title: "Tiến sĩ, Bác sĩ chuyên khoa II",
      specialty: "Nhi tiêu hóa",
      experience: 18,
      rating: 4.9,
      reviews: 312,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên gia điều trị các bệnh lý tiêu hóa ở trẻ em",
      availability: "Thứ 2, 3, 5",
    },
    {
      id: 4,
      name: "Bác sĩ Phạm Minh Tuấn",
      title: "Thạc sĩ, Bác sĩ chuyên khoa I",
      specialty: "Nhi hô hấp",
      experience: 10,
      rating: 4.7,
      reviews: 156,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên điều trị các bệnh lý hô hấp ở trẻ em",
      availability: "Thứ 4, 6, 7",
    },
    {
      id: 5,
      name: "Bác sĩ Vũ Thị Lan",
      title: "Tiến sĩ, Bác sĩ chuyên khoa II",
      specialty: "Nhi thần kinh",
      experience: 20,
      rating: 4.9,
      reviews: 278,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên gia hàng đầu về nhi thần kinh học",
      availability: "Thứ 2, 4, 6",
    },
    {
      id: 6,
      name: "Bác sĩ Hoàng Văn Đức",
      title: "Thạc sĩ, Bác sĩ chuyên khoa I",
      specialty: "Nhi ngoại",
      experience: 14,
      rating: 4.8,
      reviews: 203,
      hospital: "Bệnh viện Nhi Trung ương",
      description: "Chuyên phẫu thuật nhi với nhiều năm kinh nghiệm",
      availability: "Thứ 3, 5, 7",
    },
  ];

  const specialties = [
    { value: "all", label: "Tất cả chuyên khoa" },
    { value: "Nhi khoa tổng quát", label: "Nhi khoa tổng quát" },
    { value: "Tim mạch nhi", label: "Tim mạch nhi" },
    { value: "Nhi tiêu hóa", label: "Nhi tiêu hóa" },
    { value: "Nhi hô hấp", label: "Nhi hô hấp" },
    { value: "Nhi thần kinh", label: "Nhi thần kinh" },
    { value: "Nhi ngoại", label: "Nhi ngoại" },
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return (
      parts[parts.length - 2]?.charAt(0) + parts[parts.length - 1]?.charAt(0) ||
      "BS"
    );
  };

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
              Đội Ngũ Bác Sĩ
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gặp gỡ đội ngũ bác sĩ chuyên nghiệp, giàu kinh nghiệm và tận tâm
              với trẻ em
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bác sĩ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {specialties.map((specialty) => (
                <Button
                  key={specialty.value}
                  variant={
                    selectedSpecialty === specialty.value
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedSpecialty(specialty.value)}
                  className={
                    selectedSpecialty === specialty.value
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  }
                >
                  {specialty.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="group hover:shadow-lg transition-all duration-300 border-emerald-100"
              >
                <CardHeader className="text-center">
                  <div className="mb-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={doctor.image} />
                      <AvatarFallback className="text-xl bg-emerald-100 text-emerald-600">
                        {getInitials(doctor.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {doctor.name}
                  </CardTitle>
                  <CardDescription className="text-emerald-600 font-medium">
                    {doctor.title}
                  </CardDescription>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 text-emerald-600 w-fit mx-auto"
                  >
                    {doctor.specialty}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm text-center">
                      {doctor.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Kinh nghiệm:</span>
                        <span className="font-medium">
                          {doctor.experience} năm
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Đánh giá:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-gray-400">
                            ({doctor.reviews})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Lịch khám:</span>
                        <span className="font-medium text-emerald-600">
                          {doctor.availability}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 justify-center">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.hospital}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link to={`/doctors/${doctor.id}`}>
                        <Button
                          variant="outline"
                          className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        >
                          Xem hồ sơ
                        </Button>
                      </Link>
                      <Link to="/book-appointment">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Đặt lịch
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Không tìm thấy bác sĩ nào
              </h3>
              <p className="text-gray-400">
                Thử thay đổi từ khóa tìm kiếm hoặc chuyên khoa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
