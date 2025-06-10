import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  Ruler,
  Weight,
  Heart,
  Camera,
  Save,
  ArrowLeft,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ChildForm = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const isEditing = childId !== "new";
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    bhytCard: "",
    medicalConditions: [] as string[],
    newCondition: "",
    avatar: "",
  });

  useEffect(() => {
    if (isEditing) {
      // Mock load data for editing
      setFormData({
        name: "Nguyễn Hoàng An",
        dateOfBirth: "2020-03-15",
        gender: "Nam",
        height: "105",
        weight: "18",
        bhytCard: "HS4030123456789",
        medicalConditions: ["Dị ứng thức ăn"],
        newCondition: "",
        avatar: "",
      });
    }
  }, [isEditing, childId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addMedicalCondition = () => {
    if (formData.newCondition.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalConditions: [
          ...prev.medicalConditions,
          prev.newCondition.trim(),
        ],
        newCondition: "",
      }));
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const action = isEditing ? "cập nhật" : "thêm";
    toast({
      title: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } hồ sơ thành công!`,
      description: `Hồ sơ của ${formData.name} đã được ${action}.`,
    });

    navigate("/children");
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
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

    return age > 0 ? `${age} tuổi` : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/children")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "Chỉnh sửa hồ sơ" : "Thêm hồ sơ bệnh nhi"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Cập nhật thông tin sức khỏe của bé"
                : "Nhập thông tin sức khỏe cho bé"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={formData.avatar} />
                          <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                            {formData.name ? (
                              formData.name.charAt(0)
                            ) : (
                              <User className="w-8 h-8" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{formData.name || "Tên bé"}</CardTitle>
                    <CardDescription>
                      {formData.dateOfBirth &&
                        calculateAge(formData.dateOfBirth)}
                      {formData.gender && formData.dateOfBirth && " • "}
                      {formData.gender}
                    </CardDescription>
                  </CardHeader>
                  {(formData.height || formData.weight) && (
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.height && (
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <Ruler className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                            <p className="text-xs text-gray-600">Chiều cao</p>
                            <p className="font-semibold text-emerald-700">
                              {formData.height} cm
                            </p>
                          </div>
                        )}
                        {formData.weight && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <Weight className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                            <p className="text-xs text-gray-600">Cân nặng</p>
                            <p className="font-semibold text-blue-700">
                              {formData.weight} kg
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin chi tiết</CardTitle>
                    <CardDescription>
                      Nhập đầy đủ thông tin của bé để được chăm sóc tốt nhất
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Thông tin cơ bản
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="pl-10"
                            placeholder="Nhập họ và tên của bé"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) =>
                                handleInputChange("dateOfBirth", e.target.value)
                              }
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Giới tính *</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              handleInputChange("gender", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nam">Nam</SelectItem>
                              <SelectItem value="Nữ">Nữ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Physical Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Thông tin thể chất
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Chiều cao (cm)</Label>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="height"
                              type="number"
                              value={formData.height}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              className="pl-10"
                              placeholder="VD: 105"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight">Cân nặng (kg)</Label>
                          <div className="relative">
                            <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={formData.weight}
                              onChange={(e) =>
                                handleInputChange("weight", e.target.value)
                              }
                              className="pl-10"
                              placeholder="VD: 18.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Thông tin bảo hiểm
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="bhytCard">Số thẻ BHYT</Label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="bhytCard"
                            value={formData.bhytCard}
                            onChange={(e) =>
                              handleInputChange("bhytCard", e.target.value)
                            }
                            className="pl-10"
                            placeholder="VD: HS4030123456789"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bệnh lý nền
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="newCondition">Thêm bệnh lý nền</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="newCondition"
                            value={formData.newCondition}
                            onChange={(e) =>
                              handleInputChange("newCondition", e.target.value)
                            }
                            placeholder="VD: Dị ứng thức ăn, hen suyễn..."
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addMedicalCondition())
                            }
                          />
                          <Button
                            type="button"
                            onClick={addMedicalCondition}
                            variant="outline"
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>

                      {formData.medicalConditions.length > 0 && (
                        <div className="space-y-2">
                          <Label>Danh sách bệnh lý nền</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.medicalConditions.map(
                              (condition, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  {condition}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeMedicalCondition(index)
                                    }
                                    className="ml-1 hover:text-orange-900"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/children")}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? "Cập nhật" : "Thêm hồ sơ"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChildForm;
