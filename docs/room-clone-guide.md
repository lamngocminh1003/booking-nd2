# 🔁 Hướng Dẫn Nhân Bản Phòng Khám

## Tổng Quan

Chức năng nhân bản phòng cho phép bạn sao chép các phòng khám hiện có sang các ca khám khác một cách nhanh chóng và hiệu quả.

## 🎯 Các Cách Nhân Bản Phòng

### 1. 📍 Nhân Bản Từng Phòng Riêng Lẻ

- **Cách thực hiện**: Hover chuột vào phòng bất kỳ
- **Nút hiện ra**: Nút copy (🔁) màu tím ở góc phải trên
- **Kết quả**: Chọn ngay phòng đó và mở dialog nhân bản

**💡 Mẹo**: Tooltip sẽ hiện "💡 Hover để thấy nút nhân bản phòng này!"

### 2. 🎛️ Chế Độ Nhân Bản (Chọn Nhiều Phòng)

- **Vị trí**: Header của ô có phòng
- **Nút**: "Chế độ nhân bản" (màu tím)
- **Chức năng**:
  - Vào chế độ chọn phòng
  - Có thể chọn/bỏ chọn từng phòng
  - Nút "Chọn tất cả" và "Hủy"
  - Nút "Clone (X)" với X là số phòng đã chọn

### 3. ⚡ Nhân Bản Tất Cả Phòng

- **Vị trí**: Header của ô có phòng
- **Nút**: "Nhân bản tất cả (X)" (màu xanh lá)
- **Chức năng**: Tự động chọn tất cả phòng và mở dialog ngay

## 🎨 Visual Indicators

### Badge "Có Thể Nhân Bản"

```
🔵 Phòng (3) [🔁 Có thể nhân bản]
```

- Hiện khi có phòng trong ô
- Màu tím, font nhỏ
- Báo hiệu chức năng nhân bản sẵn sàng

### Hover Effects

- **Nút clone riêng lẻ**: Hiện khi hover, có shadow và animation
- **Tooltip**: Hướng dẫn ngắn gọn

## 🎛️ Dialog Nhân Bản

### Tùy Chọn Clone

```
✅ Copy bác sĩ
✅ Copy chuyên khoa
✅ Copy loại khám
✅ Copy cài đặt thời gian
✅ Copy số lượt khám & giữ chỗ
❌ Copy ghi chú (mặc định tắt)
```

### Chọn Target Slots

- **Hiển thị**: Theo ngày trong tuần
- **Lọc**: Chỉ các ca đang hoạt động
- **Ràng buộc**: Chỉ nhân bản trong cùng khoa (không cross-department)

## 📋 Quy Trình Sử Dụng

### Bước 1: Chọn Phòng

```
Cách 1: Hover → Click nút copy
Cách 2: "Chế độ nhân bản" → Chọn phòng → "Clone (X)"
Cách 3: "Nhân bản tất cả" → Tự động chọn tất cả
```

### Bước 2: Cấu Hình Clone Options

```
- Chọn thông tin muốn copy
- Mặc định: Tất cả ✅ trừ ghi chú ❌
```

### Bước 3: Chọn Target Slots

```
- Chọn các ca muốn nhân bản đến
- Có thể chọn nhiều ca cùng lúc
- Chỉ trong cùng khoa hiện tại
```

### Bước 4: Xác Nhận

```
- Click "Nhân bản"
- Hiển thị toast thành công
- Animation highlight các ô đích
```

## 🎬 Animation & Feedback

### Toast Notification

```
✅ Nhân bản phòng thành công!
Đã nhân bản 2 phòng [PK 511A, PK 512] sang 3 ca

[🎯 Xem lại] ← Button để replay animation
```

### Sequential Highlighting

- Highlight từng ô đích theo thứ tự
- Delay 800ms giữa các ô
- Badge hiển thị ở góc ô được nhân bản
- Auto clear sau 10 giây

## 🔧 Constraints & Rules

### Ràng Buộc Khoa Phòng

```javascript
// ✅ CHỈ nhân bản trong cùng khoa
properTargetSlots = targetSlots.map((baseSlotId) => `${deptId}-${baseSlotId}`);
```

### Conditional Time Settings

```javascript
// Nếu Copy giờ tùy chỉnh = true:
//   - Cùng ca: Giữ nguyên giờ custom
//   - Khác ca: Reset về giờ mặc định ca đích

// Nếu Copy giờ tùy chỉnh = false:
//   - Luôn reset về giờ mặc định ca đích
```

### Appointment Count Copy

```javascript
// Nếu Copy số lượt khám = true:
//   - appointmentCount: source → target
//   - holdSlot: source → target
//   - maxAppointments: source → target

// Nếu Copy số lượt khám = false:
//   - Dùng default: 10 lượt, 0 giữ chỗ
```

## 💡 Tips & Best Practices

### 1. Workflow Hiệu Quả

```
1. Thiết lập 1 phòng mẫu với đầy đủ thông tin
2. Dùng "Nhân bản tất cả" để copy nhanh
3. Điều chỉnh từng phòng nếu cần
```

### 2. Tránh Conflicts

```
- Kiểm tra clinic schedules trước khi clone
- Chú ý warning về doctor/room conflicts
- Sử dụng different time slots nếu có xung đột
```

### 3. Performance

```
- Clone nhiều phòng 1 lúc thay vì từng phòng
- Sử dụng "Chọn tất cả" khi muốn clone full set
- Check animation feedback để đảm bảo clone thành công
```

## 🐛 Troubleshooting

### Không Thấy Nút Clone?

```
❌ Có thể: Chưa có phòng nào trong ô
✅ Giải pháp: Thêm phòng trước, sau đó hover để thấy nút copy
```

### Clone Không Thành Công?

```
❌ Có thể: Lỗi TypeScript hoặc validation
✅ Giải pháp: Check console.log, đảm bảo onCloneRooms prop được truyền
```

### Animation Không Hiện?

```
❌ Có thể: DOM elements chưa có data-slot-id
✅ Giải pháp: Đảm bảo WeeklyScheduleTable render đúng slot IDs
```

## 📊 Technical Notes

### Function Signatures

```typescript
onCloneRooms?: (
  rooms: any[],
  targetSlots?: string[],
  targetDepartmentIds?: string[],
  cloneOptions?: any,
  sourceSlotId?: string
) => void;
```

### State Management

```typescript
const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());
const [isRoomCloneMode, setIsRoomCloneMode] = useState(false);
const [showRoomCloneDialog, setShowRoomCloneDialog] = useState(false);
```

---

✨ **Chúc bạn sử dụng chức năng nhân bản phòng hiệu quả!** ✨
