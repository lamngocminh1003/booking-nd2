import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Weight,
  Ruler,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: "Nam" | "Nữ";
  height: number;
  weight: number;
  bhytCard: string;
  medicalConditions: string[];
  avatar?: string;
}

const Children = () => {
  const [children] = useState<Child[]>([
    {
      id: "1",
      name: "Nguyễn Hoàng An",
      dateOfBirth: "2020-03-15",
      gender: "Nam",
      height: 105,
      weight: 18,
      bhytCard: "HS4030123456789",
      medicalConditions: ["Dị ứng thức ăn"],
      avatar: "",
    },
    {
      id: "2",
      name: "Nguyễn Hoàng Minh",
      dateOfBirth: "2018-07-22",
      gender: "Nam",
      height: 125,
      weight: 25,
      bhytCard: "HS4030987654321",
      medicalConditions: [],
      avatar: "",
    },
  ]);

  const { toast } = useToast();

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    toast({
      title: "Xóa hồ sơ thành công!",
      description: `Hồ sơ của ${childName} đã được xóa.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý hồ sơ bệnh nhi
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin sức khỏe của các bé trong gia đình
            </p>
          </div>

          {/* Add New Child Button */}
          <div className="mb-6">
            <Link to="/children/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm hồ sơ bé
              </Button>
            </Link>
          </div>

          {/* Children List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card
                key={child.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={child.avatar} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>
                        {calculateAge(child.dateOfBirth)} tuổi • {child.gender}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Ruler className="w-4 h-4 text-emerald-600 mr-1" />
                        <span className="text-sm text-gray-600">Chiều cao</span>
                      </div>
                      <p className="font-semibold text-emerald-700">
                        {child.height} cm
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Weight className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="text-sm text-gray-600">Cân nặng</span>
                      </div>
                      <p className="font-semibold text-blue-700">
                        {child.weight} kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Sinh: {child.dateOfBirth}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Heart className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        BHYT: {child.bhytCard}
                      </span>
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Bệnh lý nền:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {child.medicalConditions.length > 0 ? (
                        child.medicalConditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          Không có bệnh lý nền
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Link to={`/book-appointment?childId=${child.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Đặt lịch khám
                      </Button>
                    </Link>
                    <div className="flex space-x-2">
                      <Link to={`/children/${child.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChild(child.id, child.name)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {children.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có hồ sơ bệnh nhi
                </h3>
                <p className="text-gray-600 mb-4">
                  Thêm hồ sơ của bé để bắt đầu đặt lịch khám
                </p>
                <Link to="/children/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm hồ sơ đầu tiên
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Children;
