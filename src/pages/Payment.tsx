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
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fee: number;
}

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const appointmentDetails = {
    childName: "Nguyễn Hoàng An",
    doctorName: "BS. Trần Văn Nam",
    specialty: "Nhi khoa tổng quát",
    date: "2024-06-15",
    time: "09:00",
    location: "Phòng 201, Tầng 2",
  };

  const feeBreakdown = {
    consultation: 150000,
    service: 50000,
    insurance: -100000,
  };

  const totalAmount = Object.values(feeBreakdown).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const paymentMethods: PaymentMethod[] = [
    {
      id: "momo",
      name: "MoMo",
      description: "Thanh toán qua ví điện tử MoMo",
      icon: (
        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          M
        </div>
      ),
      fee: 0,
    },
    {
      id: "vnpay",
      name: "VNPay",
      description: "Thanh toán qua VNPay (ATM/Internet Banking)",
      icon: (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          V
        </div>
      ),
      fee: 0,
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      description: "Thanh toán qua ví ZaloPay",
      icon: (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          Z
        </div>
      ),
      fee: 0,
    },
    {
      id: "card",
      name: "Thẻ tín dụng/Ghi nợ",
      description: "Visa, Mastercard, JCB",
      icon: <CreditCard className="w-6 h-6 text-gray-600" />,
      fee: 0,
    },
    {
      id: "cash",
      name: "Thanh toán tại bệnh viện",
      description: "Thanh toán tiền mặt khi đến khám",
      icon: <Wallet className="w-6 h-6 text-gray-600" />,
      fee: 0,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);

      if (selectedMethod === "cash") {
        toast({
          title: "Đặt lịch thành công!",
          description: "Vui lòng thanh toán tại bệnh viện khi đến khám.",
        });
      } else {
        toast({
          title: "Thanh toán thành công!",
          description:
            "Lịch khám đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ.",
        });
      }

      navigate("/appointments");
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/book-appointment")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán
            </h1>
            <p className="text-gray-600">
              Hoàn tất đặt lịch khám với thanh toán an toàn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Chọn phương thức thanh toán</CardTitle>
                  <CardDescription>
                    Chọn cách thức thanh toán phù hợp với bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedMethod}
                    onValueChange={setSelectedMethod}
                  >
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex items-center space-x-3 flex-1">
                            {method.icon}
                            <div className="flex-1">
                              <Label
                                htmlFor={method.id}
                                className="font-medium cursor-pointer"
                              >
                                {method.name}
                              </Label>
                              <p className="text-sm text-gray-600">
                                {method.description}
                              </p>
                            </div>
                            {method.fee === 0 && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Miễn phí
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-emerald-600" />
                    Chi tiết thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Appointment Details */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">
                      Thông tin lịch khám
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bệnh nhi:</span>
                        <span className="font-medium">
                          {appointmentDetails.childName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">
                          {appointmentDetails.doctorName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày khám:</span>
                        <span className="font-medium">
                          {appointmentDetails.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ khám:</span>
                        <span className="font-medium">
                          {appointmentDetails.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Fee Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Chi phí</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí khám:</span>
                        <span>{formatCurrency(feeBreakdown.consultation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí dịch vụ:</span>
                        <span>{formatCurrency(feeBreakdown.service)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BHYT hỗ trợ:</span>
                        <span className="text-green-600">
                          {formatCurrency(feeBreakdown.insurance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng thanh toán:</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={handlePayment}
                      disabled={!selectedMethod || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Xác nhận thanh toán
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
