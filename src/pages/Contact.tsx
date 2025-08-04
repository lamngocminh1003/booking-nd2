import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Calendar,
  Users,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Gửi tin nhắn thành công!",
      description: "Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Hotline 24/7",
      content: "1900 1234",
      description: "Hỗ trợ khẩn cấp và tư vấn",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@benhviennhi.vn",
      description: "Gửi câu hỏi và nhận phản hồi",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: "123 Đường ABC, Phường DEF, Quận 1, TP.HCM",
      description: "Cơ sở chính của bệnh viện",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      content: "7:00 - 18:00",
      description: "Thứ 2 - Chủ nhật (bao gồm lễ)",
    },
  ];

  const departments = [
    { name: "Khoa Nhi tổng quát", phone: "0123 456 789", hours: "24/7" },
    { name: "Khoa Cấp cứu", phone: "0123 456 790", hours: "24/7" },
    { name: "Khoa Tim mạch nhi", phone: "0123 456 791", hours: "7:00 - 18:00" },
    { name: "Khoa Tiêu hóa nhi", phone: "0123 456 792", hours: "7:00 - 18:00" },
    { name: "Khoa Hô hấp nhi", phone: "0123 456 793", hours: "7:00 - 18:00" },
    {
      name: "Khoa Thần kinh nhi",
      phone: "0123 456 794",
      hours: "7:00 - 18:00",
    },
  ];

  const faqs = [
    {
      question: "Làm sao để đặt lịch khám?",
      answer:
        "Bạn có thể đặt lịch qua website, ứng dụng di động hoặc gọi hotline 1900 1234.",
    },
    {
      question: "Bệnh viện có khám cấp cứu 24/7 không?",
      answer:
        "Có, chúng tôi có khoa cấp cứu hoạt động 24/7 để phục vụ các trường hợp khẩn cấp.",
    },
    {
      question: "Chi phí khám có bao gồm bảo hiểm y tế không?",
      answer:
        "Chúng tôi chấp nhận bảo hiểm y tế và hỗ trợ thanh toán trực tiếp.",
    },
  ];

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
            />{" "}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn về sức khỏe của
              con em
            </p>
          </div>
        </div>
      </div>

      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="text-center border-emerald-100 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <info.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-emerald-600 font-semibold text-lg mb-1">
                    {info.content}
                  </div>
                  <p className="text-gray-500 text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    Gửi tin nhắn cho chúng tôi
                  </CardTitle>
                  <CardDescription>
                    Điền thông tin và chúng tôi sẽ phản hồi bạn sớm nhất có thể
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Chủ đề *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Nhập chủ đề tin nhắn"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nội dung tin nhắn *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung tin nhắn..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? (
                        "Đang gửi..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Emergency Contact */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Cấp cứu 24/7
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      115
                    </div>
                    <p className="text-red-500 text-sm mb-3">
                      Hotline cấp cứu toàn quốc
                    </p>
                    <div className="text-lg font-semibold text-red-600">
                      0123 456 999
                    </div>
                    <p className="text-red-500 text-sm">Cấp cứu nhi khoa</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Booking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Đặt lịch nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    Đặt lịch khám ngay hôm nay
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Đặt lịch khám
                  </Button>
                  <div className="text-center text-sm text-gray-500">
                    Hoặc gọi: 1900 1234
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-600 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Thống kê
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      10,000+
                    </div>
                    <p className="text-gray-500 text-sm">Bệnh nhân đã khám</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <p className="text-gray-500 text-sm">Bác sĩ chuyên khoa</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-gray-900">
                        4.9
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">Đánh giá trung bình</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Departments */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-emerald-600">
                  Danh sách các khoa
                </CardTitle>
                <CardDescription className="text-center">
                  Liên hệ trực tiếp với các khoa chuyên môn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className="p-4 border border-emerald-100 rounded-lg"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {dept.name}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600">{dept.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{dept.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-emerald-600">
                  Câu hỏi thường gặp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
