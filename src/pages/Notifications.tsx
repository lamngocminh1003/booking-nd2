import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  FileText,
  Star,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "appointment" | "result" | "survey" | "system";
  isRead: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nhắc nhở lịch khám",
      message:
        "Bé Nguyễn Hoàng An có lịch khám vào lúc 09:00 ngày mai (15/06/2024) với BS. Trần Văn Nam tại Phòng 201, Tầng 2.",
      time: "14/06/2024 10:00",
      type: "appointment",
      isRead: false,
    },
    {
      id: "2",
      title: "Kết quả khám bệnh",
      message:
        "Kết quả khám của bé Nguyễn Hoàng Minh ngày 10/06/2024 đã được cập nhật. Vui lòng xem chi tiết trong mục Lịch sử khám.",
      time: "11/06/2024 14:30",
      type: "result",
      isRead: true,
    },
    {
      id: "3",
      title: "Khảo sát đánh giá",
      message:
        "Xin vui lòng dành chút thời gian đánh giá chất lượng dịch vụ khám bệnh của bé Nguyễn Hoàng An ngày 05/06/2024.",
      time: "07/06/2024 09:15",
      type: "survey",
      isRead: false,
    },
    {
      id: "4",
      title: "Thông báo từ hệ thống",
      message:
        "Bệnh viện sẽ tạm ngưng hoạt động khám chữa bệnh vào ngày 20/06/2024 do bảo trì hệ thống. Xin quý khách thông cảm.",
      time: "05/06/2024 16:45",
      type: "system",
      isRead: true,
    },
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "result":
        return "bg-green-100 text-green-800";
      case "survey":
        return "bg-orange-100 text-orange-800";
      case "system":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-8 h-8 text-blue-500" />;
      case "result":
        return <FileText className="w-8 h-8 text-green-500" />;
      case "survey":
        return <Star className="w-8 h-8 text-orange-500" />;
      case "system":
        return <Bell className="w-8 h-8 text-purple-500" />;
      default:
        return <Bell className="w-8 h-8 text-gray-500" />;
    }
  };

  const filterNotifications = (filterType: string) => {
    if (filterType === "all") return notifications;
    if (filterType === "unread")
      return notifications.filter((notification) => !notification.isRead);
    return notifications.filter(
      (notification) => notification.type === filterType
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900 mr-3">
                  Thông báo
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500">{unreadCount} mới</Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              Quản lý thông báo và cập nhật từ hệ thống
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
              <TabsTrigger value="appointment">Lịch hẹn</TabsTrigger>
              <TabsTrigger value="result">Kết quả</TabsTrigger>
              <TabsTrigger value="system">Hệ thống</TabsTrigger>
            </TabsList>

            {["all", "unread", "appointment", "result", "system"].map(
              (tabValue) => (
                <TabsContent
                  key={tabValue}
                  value={tabValue}
                  className="space-y-6 mt-6"
                >
                  {filterNotifications(tabValue).length > 0 ? (
                    filterNotifications(tabValue).map((notification) => (
                      <Card
                        key={notification.id}
                        className={`hover:shadow-md transition-shadow ${
                          !notification.isRead
                            ? "bg-white border-l-4 border-l-emerald-500"
                            : "bg-white"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex">
                            <div className="mr-4 flex-shrink-0">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-1">
                                <h3
                                  className={`text-lg font-medium ${
                                    !notification.isRead
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={getTypeColor(notification.type)}
                                  >
                                    {notification.type === "appointment"
                                      ? "Lịch hẹn"
                                      : notification.type === "result"
                                      ? "Kết quả"
                                      : notification.type === "survey"
                                      ? "Khảo sát"
                                      : "Hệ thống"}
                                  </Badge>
                                </div>
                              </div>
                              <p
                                className={`text-sm mb-2 ${
                                  !notification.isRead
                                    ? "text-gray-800"
                                    : "text-gray-600"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-gray-500">
                                  {notification.time}
                                </span>
                                <div className="flex space-x-2">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        markAsRead(notification.id)
                                      }
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Đánh dấu đã đọc
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      deleteNotification(notification.id)
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Không có thông báo
                        </h3>
                        <p className="text-gray-600">
                          {tabValue === "unread"
                            ? "Bạn đã đọc tất cả thông báo"
                            : "Hiện không có thông báo nào trong mục này"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
