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
            Địa chỉ: 14 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. HCM
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
          </p>{" "}
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
            Email:{" "}
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
            {" "}
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
            {" "}
            <Medication
              fontSize="small"
              color="success"
              className=" mb-1 mr-1"
            />
            Khám bệnh Theo yêu cầu:
          </p>
          <p>
            {" "}
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

        {/* Cột 3: Google Map */}
        <div className="md:col-span-1 lg:col-span-1">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4980402630873!2d106.69690267503768!3d10.772461859283655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f482c409aa1%3A0x177087c8e844cdb6!2zQsOqbmggdmnDqm4gTmhpIMSRw7RuZyAy!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="rounded shadow-md"
          ></iframe>
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
