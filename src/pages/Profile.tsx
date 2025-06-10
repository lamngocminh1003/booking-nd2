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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Camera,
  Save,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Thị Mai",
    phone: "0123456789",
    email: "mai.nguyen@email.com",
    address: "123 Đường ABC, Phường DEF, Quận GHI, TP.HCM",
    citizenId: "012345678901",
    avatar: "",
  });
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Cập nhật thành công!",
      description: "Thông tin cá nhân đã được lưu.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thông tin cá nhân
            </h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                          {profile.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardTitle>{profile.fullName}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-full justify-center">
                      <User className="w-4 h-4 mr-2" />
                      Phụ huynh
                    </Badge>
                    <Badge
                      variant="outline"
                      className="w-full justify-center text-emerald-600 border-emerald-200"
                    >
                      <IdCard className="w-4 h-4 mr-2" />
                      Đã xác thực
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Thông tin chi tiết</CardTitle>
                      <CardDescription>
                        Cập nhật thông tin cá nhân của bạn
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() =>
                        isEditing ? handleSave() : setIsEditing(true)
                      }
                      className={
                        isEditing ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }
                    >
                      {isEditing ? (
                        <Save className="w-4 h-4 mr-2" />
                      ) : (
                        <Edit className="w-4 h-4 mr-2" />
                      )}
                      {isEditing ? "Lưu" : "Chỉnh sửa"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citizenId">Số CCCD/CMND</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="citizenId"
                        value={profile.citizenId}
                        onChange={(e) =>
                          handleInputChange("citizenId", e.target.value)
                        }
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập số CCCD/CMND"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
