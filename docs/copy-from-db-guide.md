# 📋 Hướng Dẫn Copy Phòng Từ Database (Clinic Schedules)

## 🎯 Tổng Quan

Chức năng này cho phép bạn copy những phòng khám đã có sẵn từ database (clinic schedules) vào lịch khám hiện tại, kèm theo đầy đủ thông tin như thời gian, số lượt khám, bác sĩ, và chuyên khoa.

## 🔍 Nhận Biết Phòng Từ DB

### Visual Indicators

```
📋 Phòng có sẵn từ DB (3)
[Click copy để thêm]
```

### Trong Empty State

- Hiển thị khi chưa có phòng nào trong ca khám
- Màu xanh dương nhạt với border
- Có icon 📋 để phân biệt với phòng thường

### Khi Đã Có Phòng

- Hiển thị bên dưới nút "Thêm phòng mới"
- Mỗi phòng từ DB có nút copy xanh lá bên phải

## 🎛️ Cách Sử Dụng

### 1. 📋 Identify Clinic Schedules

```
✅ Tìm phần "📋 Phòng có sẵn từ DB"
✅ Các phòng hiển thị với màu xanh dương
✅ Có thông tin đầy đủ: thời gian, bác sĩ, số lượt
```

### 2. 🖱️ Click Copy Button

```
✅ Hover vào phòng từ DB
✅ Click nút copy xanh lá (📋) bên phải
✅ Hệ thống tự động copy phòng
```

### 3. ✅ Verify Result

```
✅ Phòng mới xuất hiện trong danh sách
✅ Thông tin được copy đầy đủ
✅ Toast notification xác nhận thành công
```

## 🔄 Thông Tin Được Copy

### 🕐 Thời Gian

```javascript
customStartTime: schedule.timeStart?.slice(0, 5);
customEndTime: schedule.timeEnd?.slice(0, 5);
```

### 👥 Số Lượt Khám

```javascript
appointmentCount: schedule.total || 10;
maxAppointments: schedule.total || 10;
holdSlot: schedule.holdSlot || 0;
```

### 👨‍⚕️ Thông Tin Y Tế

```javascript
selectedSpecialty: schedule.specialtyName || ""
selectedDoctor: schedule.doctorName || schedule.doctorId?.toString() || ""
specialties: [schedule.specialtyName] (nếu có)
```

### 📝 Metadata

```javascript
notes: `📋 Copy từ DB: ${schedule.examinationName || "Lịch khám"}`;
```

## 🎬 UI/UX Features

### Toast Notification

```
📋 Copy phòng từ DB thành công!
Đã copy phòng PK 511A với đầy đủ thông tin từ database.

[Chi tiết copy:]
• Thời gian: 07:00 - 11:30
• Số lượt: 15
• Chuyên khoa: Khám tim mạch
• Bác sĩ: BS. Nguyễn Văn A
```

### Visual Feedback

- **Copy button**: Màu xanh lá với icon 📋
- **Hover effect**: Button highlight khi hover
- **Disabled state**: Nếu phòng đã tồn tại
- **Success animation**: Room mới được highlight

## 🔧 Validation & Error Handling

### 1. 🏥 Room Availability Check

```typescript
const roomInfo = allRooms.find(
  (room) => room.id?.toString() === schedule.roomId?.toString()
);

if (!roomInfo) {
  // Error: Phòng không tồn tại trong hệ thống
}
```

### 2. 🚫 Duplicate Prevention

```typescript
if (usedRooms && usedRooms.has(roomInfo.id.toString())) {
  // Error: Phòng đã tồn tại trong ca này
}
```

### 3. 📋 Data Integrity

```typescript
// Fallback values nếu thiếu data
appointmentCount: schedule.total || 10;
customStartTime: schedule.timeStart?.slice(0, 5) || defaultTime;
```

## 🎯 Use Cases

### 1. 📅 Copy Lịch Khám Tuần Trước

```
Scenario: Lặp lại lịch khám giống tuần trước
1. Vào ca khám tương ứng
2. Thấy clinic schedules từ DB
3. Click copy để thêm nhanh
```

### 2. 🔄 Standardize Across Days

```
Scenario: Tạo lịch khám chuẩn cho nhiều ngày
1. Copy template từ ngày đã setup
2. Điều chỉnh thông tin cần thiết
3. Apply cho các ngày khác
```

### 3. 🚀 Quick Setup

```
Scenario: Setup nhanh ca khám mới
1. Copy phòng từ DB làm base
2. Thêm/chỉnh sửa theo nhu cầu
3. Save và deploy
```

## 🎨 Visual Design

### Color Scheme

```css
/* DB Schedules */
bg-blue-50 text-blue-700 border-blue-200

/* Copy Button */
bg-green-50 text-green-600 hover:bg-green-100

/* Success Toast */
bg-green-50 with detailed info card
```

### Icons & Indicators

```
📋 - Database source
🔁 - Copy action
✅ - Success confirmation
⚠️ - Warning/Error
```

## 🔍 Debugging & Troubleshooting

### Console Logs

```javascript
console.log("📋 Copy clinic schedule từ DB:", schedule);
console.log("✅ Created room from DB:", newRoomFromDB);
```

### Common Issues

#### Copy Button Không Hiện

```
✅ Check: clinicScheduleStats có data không?
✅ Check: cellClinicSchedules.length > 0?
✅ Check: Component render đúng không?
```

#### Copy Không Thành Công

```
✅ Check: addRoomToShift function hoạt động?
✅ Check: updateRoomConfig được gọi đúng?
✅ Check: roomInfo tìm thấy từ allRooms?
```

#### Data Không Đúng

```
✅ Check: schedule object structure
✅ Check: field mapping từ DB
✅ Check: fallback values
```

## 📊 Technical Implementation

### Function Flow

```typescript
handleCopyFromClinicSchedule(schedule) →
  findRoomInfo(schedule.roomId) →
  checkDuplicates(roomId) →
  createRoomSlot(schedule) →
  addRoomToShift(roomId) →
  updateRoomConfig(newRoomData) →
  showSuccessToast()
```

### Data Mapping

```typescript
DB Schedule → RoomSlot
{
  roomId → id
  roomName → name
  timeStart → customStartTime
  timeEnd → customEndTime
  total → appointmentCount
  holdSlot → holdSlot
  specialtyName → selectedSpecialty
  doctorName → selectedDoctor
}
```

---

✨ **Chúc bạn sử dụng chức năng copy từ DB hiệu quả!** ✨
