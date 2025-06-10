
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, Trash2, Upload, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsuranceCard {
  id: string;
  cardNumber: string;
  holderName: string;
  validFrom: string;
  validTo: string;
  hospitalCode: string;
  status: 'active' | 'expired' | 'pending';
  image?: string;
}

const Insurance = () => {
  const [insuranceCards, setInsuranceCards] = useState<InsuranceCard[]>([
    {
      id: "1",
      cardNumber: "HS4030123456789",
      holderName: "Nguyễn Hoàng An",
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      hospitalCode: "47201",
      status: 'active'
    },
    {
      id: "2",
      cardNumber: "HS4030987654321",
      holderName: "Nguyễn Hoàng Minh",
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      hospitalCode: "47201",
      status: 'active'
    }
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    holderName: '',
    validFrom: '',
    validTo: '',
    hospitalCode: ''
  });
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Còn hiệu lực';
      case 'expired':
        return 'Hết hạn';
      case 'pending':
        return 'Chờ xử lý';
      default:
        return 'Không xác định';
    }
  };

  const handleAddCard = () => {
    const card: InsuranceCard = {
      id: Date.now().toString(),
      ...newCard,
      status: 'pending'
    };
    setInsuranceCards([...insuranceCards, card]);
    setNewCard({
      cardNumber: '',
      holderName: '',
      validFrom: '',
      validTo: '',
      hospitalCode: ''
    });
    setShowAddDialog(false);
    toast({
      title: "Thêm thẻ BHYT thành công!",
      description: "Thẻ BHYT đã được thêm và đang chờ xác thực.",
    });
  };

  const handleDeleteCard = (id: string) => {
    setInsuranceCards(insuranceCards.filter(card => card.id !== id));
    toast({
      title: "Xóa thẻ BHYT thành công!",
      description: "Thẻ BHYT đã được xóa khỏi hệ thống.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý bảo hiểm y tế</h1>
            <p className="text-gray-600">Quản lý thông tin thẻ BHYT của gia đình</p>
          </div>

          {/* Add New Card Button */}
          <div className="mb-6">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thẻ BHYT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm thẻ bảo hiểm y tế</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Số thẻ BHYT *</Label>
                    <Input
                      id="cardNumber"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      placeholder="VD: HS4030123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="holderName">Họ tên chủ thẻ *</Label>
                    <Input
                      id="holderName"
                      value={newCard.holderName}
                      onChange={(e) => setNewCard({...newCard, holderName: e.target.value})}
                      placeholder="Nhập họ tên chủ thẻ"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Có hiệu lực từ</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={newCard.validFrom}
                        onChange={(e) => setNewCard({...newCard, validFrom: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="validTo">Có hiệu lực đến</Label>
                      <Input
                        id="validTo"
                        type="date"
                        value={newCard.validTo}
                        onChange={(e) => setNewCard({...newCard, validTo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalCode">Mã bệnh viện</Label>
                    <Input
                      id="hospitalCode"
                      value={newCard.hospitalCode}
                      onChange={(e) => setNewCard({...newCard, hospitalCode: e.target.value})}
                      placeholder="VD: 47201"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ảnh thẻ BHYT</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">Chọn ảnh thẻ BHYT</p>
                      <Button variant="outline" size="sm">
                        Tải lên
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddCard} className="bg-emerald-600 hover:bg-emerald-700">
                      Thêm thẻ
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Insurance Cards List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{card.holderName}</CardTitle>
                        <CardDescription className="font-mono">{card.cardNumber}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(card.status)}>
                      {getStatusText(card.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Có hiệu lực từ</p>
                      <p className="font-medium">{card.validFrom}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Đến ngày</p>
                      <p className="font-medium">{card.validTo}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600">Mã bệnh viện</p>
                    <p className="font-medium">{card.hospitalCode}</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Tải
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
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
          {insuranceCards.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thẻ BHYT</h3>
                <p className="text-gray-600 mb-4">Thêm thẻ bảo hiểm y tế để sử dụng dịch vụ</p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thẻ BHYT đầu tiên
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insurance;
