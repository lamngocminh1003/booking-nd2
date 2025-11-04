import { useCapacitor } from "../../hooks/useCapacitor"; // hoặc đường dẫn đúng
import {
  LocationPin,
  Facebook,
  Email,
  Phone,
  YouTube,
  Medication,
  Emergency,
  BookOnline,
  Copyright,
  Public,
} from "@mui/icons-material";
import mapImage from "../../assets/map.png";

const Footer = () => {
  const { isNative } = useCapacitor();
  if (isNative) return null; // Ẩn footer trong app mobile
  return (
    <footer className="  px-4 py-4 text-sm bg-green-100 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {/* Cột 1 */}
        <div className="flex space-y-2 flex-col">
          <h2 className="text-base  font-bold mb-2">BỆNH VIỆN NHI ĐỒNG 2</h2>
          <p>
            <LocationPin
              fontSize="small"
              color="success"
              className=" mb-1 mr-1"
            />
            Địa chỉ: 14 Lý Tự Trọng, Phường Sài Gòn, TP. HCM
          </p>
          <p className="mt-2">
            <Phone fontSize="small" color="success" className=" mb-1 mr-1" />
            Điện thoại: (028) 38295723 - (028) 38295724
          </p>
          <p>
            <Email fontSize="small" color="success" className=" mb-1 mr-1" />
            Email:
            <a
              href="mailto:benhviennhi@benhviennhi.org.vn"
              className="underline"
            >
              &nbsp; benhviennhi@benhviennhi.org.vn
            </a>
          </p>
          <p>
            <Public fontSize="small" color="success" className=" mb-1 mr-1" />
            Website:
            <a href="https://www.benhviennhi.org.vn/" className="underline">
              &nbsp;https://www.benhviennhi.org.vn
            </a>
          </p>
          <hr className="my-4 border-emerald-950" />
          <p className="font-semibold">Phản ánh, đóng góp ý kiến:</p>
          <p>
            <Email fontSize="small" color="success" className=" mb-1 mr-1" />
            Email:
            <a
              href="mailto:benhviennhi@benhviennhi.org.vn"
              className="underline"
            >
              &nbsp;benhviennhi@benhviennhi.org.vn
            </a>
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.facebook.com/bvnd2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook fontSize="large" color="primary" />
            </a>
            <a
              href="https://www.youtube.com/@benhviennhiong2362"
              target="_blank"
              rel="noopener noreferrer"
            >
              <YouTube fontSize="large" color="error" />
            </a>
          </div>
        </div>

        {/* Cột 2 */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-bold mb-2">1. KHÁM BỆNH THEO YÊU CẦU</h3>
          <p>
            <Phone fontSize="small" color="success" className=" mb-1 mr-1" />
            Điện thoại: (028) 38295723 (Số nội bộ 429)
          </p>
          <p>
            <BookOnline
              fontSize="small"
              color="success"
              className=" mb-1 mr-1"
            />
            Đặt hẹn: 1900 1215 – Bấm phím 1 (Từ 7g00 đến 19g00)
          </p>

          <hr className="my-4 border-emerald-950" />

          <h3 className="text-lg font-bold mb-2">2. ĐẶT HẸN KHÁM TÂM LÝ</h3>
          <p className="font-semibold">
            <Medication
              fontSize="small"
              color="success"
              className=" mb-1 mr-1"
            />
            Khám bệnh Theo yêu cầu:
          </p>
          <p>
            <Phone fontSize="small" color="success" className=" mb-1 mr-1" />
            Điện thoại: 1900 1215 – Bấm phím 1 (Từ 7g00 đến 19g00)
          </p>
          <p className="font-semibold mt-2">
            <Emergency
              fontSize="small"
              color="success"
              className=" mb-1 mr-1"
            />
            Khoa Phòng khám Chất lượng cao - Tâm lý:
          </p>
          <p>
            <Phone fontSize="small" color="success" className=" mb-1 mr-1" />
            Điện thoại: (028) 2212 7171 (Thứ Hai đến Thứ Sáu: 7g00 – 11g00 &
            13g00 – 16g00)
          </p>
        </div>

        {/* Cột 3: Map Image with Google Maps Link */}
        <div className="md:col-span-1 lg:col-span-1">
          <a
            href="https://www.google.com/maps/place/B%E1%BB%87nh+vi%E1%BB%87n+Nhi+%C4%90%E1%BB%93ng+2/@10.7805227,106.7006618,17z/data=!3m1!4b1!4m6!3m5!1s0x31752f49a8134407:0x8b3ac844e0a002a4!8m2!3d10.7805174!4d106.7032367!16s%2Fg%2F1v8w_p4f?entry=ttu&g_ep=EgoyMDI1MTAyOS4yIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group"
          >
            <img
              src={mapImage}
              alt="Vị trí Bệnh viện Nhi Đồng 2 - 14 Lý Tự Trọng, Phường Sài Gòn, TP.HCM"
              className="w-full h-[300px] object-cover rounded shadow-md min-h-[250px] transition-opacity duration-300 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                <p className="text-gray-800 font-semibold text-sm">
                  Xem trên Google Maps
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-300 mt-30 pt-3">
        <Copyright fontSize="small" color="gray" className=" mb-1 mr-1" />
        2024 Bệnh viện Nhi Đồng 2
      </div>
    </footer>
  );
};

export default Footer;
