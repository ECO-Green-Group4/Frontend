
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VehicleForm from "./VehicleForm";
import BatteryForm from "./BatteryForm";
import Header from "../components/ui/Header";
import api from "../services/axios";
import { showToast } from "@/utils/toast";

// Interface cho Gói Dịch Vụ
// (Khớp với 'ServicePackageResponse.java')
interface ServicePackage {
  packageId: number;
  name: string;
  listingLimit: number;
  listingFee: number;
  highlight: boolean;
  durationDays: number;
  commissionDiscount: number;
  status: string;
}

export default function CreatePost() {
  // --- STATE CỦA TRANG CHA ---
  const [category, setCategory] = useState<"EV" | "Battery">("EV");
  // const [isSubmitting, setIsSubmitting] = useState(false); // State loading của Cha - không cần nữa vì validation được xử lý trong form con
  const navigate = useNavigate();

  // State cho Gói tin
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

 
  
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log("Đang fetch packages từ API thật...");
        const response = await api.get("/seller/packages");
        
        // Log dữ liệu thô nhận về để debug
        console.log("Raw response from /seller/packages:", response.data);

        // Kiểm tra response.data là một mảng
        //  API trả về dạng { "data": [...] } hoặc { "content": [...] }
        let packagesData: ServicePackage[] = [];

        if (Array.isArray(response.data)) {
          // Trường hợp là (response.data) LÀ một mảng
          packagesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Trường hợp là Dữ liệu nằm trong { data: [...] }
          packagesData = response.data.data;
        } else if (response.data && Array.isArray(response.data.content)) {
          // Trường hợp là dũ liệu nằm trong { content: [...] } 
          packagesData = response.data.content;
        } else {
          // Trường hợp làlà Dữ liệu trả về không phải mảng
          console.error("Lỗi: API /seller/packages không trả về một mảng!", response.data);
          // Để packagesData là mảng rỗng [] để không crash
        }
        
        setPackages(packagesData);
        console.log("Fetch packages thành công, đã set state:", packagesData);

      } catch (error) {
        console.error("Lỗi khi fetch packages:", error);
        // Quan trọng !!!!!!!!, Nếu API lỗi, set mảng rỗng để .map() không bị lỗi
        setPackages([]); 
      }
    };
    fetchPackages();
  }, []); // Chỉ chạy 1 lần
  

  // Các hàm chuyển đổi payload đã được chuyển vào PostPaymentService.ts

  
  // async để component con có thể 'await'
  const handleFormSubmit = async (data: any) => {
    // Kiểm tra xem đã chọn package chưa
    if (!selectedPackageId) {
      showToast("Vui lòng chọn gói đăng tin", "error");
      return;
    }

    // Kiểm tra dữ liệu form cơ bản (validation chi tiết đã được xử lý trong form con)
    if (!data) {
      showToast("Dữ liệu không hợp lệ", "error");
      return;
    }

    // Tìm thông tin package đã chọn
    const selectedPackage = packages.find(pkg => pkg.packageId === selectedPackageId);
    if (!selectedPackage) {
      showToast("Gói đăng tin không hợp lệ", "error");
      return;
    }

    // Chuẩn bị dữ liệu cho trang Payment
    const paymentInfo = {
      packageId: selectedPackage.packageId,
      packageName: selectedPackage.name,
      amount: selectedPackage.listingFee,
      type: category === "Battery" ? "battery" : "vehicle" as "post" | "vehicle" | "battery" | "membership",
      description: `Đăng tin ${category === "Battery" ? "pin" : "xe điện"} - ${data.title}`
    };

    // Lưu dữ liệu form vào sessionStorage để sử dụng sau khi thanh toán
    const formData = {
      category,
      data: JSON.parse(JSON.stringify(data)), // Deep clone để đảm bảo serialize được
      selectedPackageId
    };
    
    console.log('Saving to sessionStorage:', formData);
    sessionStorage.setItem('pendingPostData', JSON.stringify(formData));

    // Chuyển đến trang Payment
    navigate("/payment", { 
      state: { 
        paymentInfo 
      } 
    });
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto border border-gray-100 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-500">
          {category === "EV" ? "🚗 Create EV Post" : "🔋 Create Battery Post"}
        </h2>

        {/* 1. Chọn Loại Form */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "EV" | "Battery")}
          className="border p-2 rounded-lg mb-6 w-full focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="EV">EV – Electric Vehicle</option>
          <option value="Battery">Battery</option>
        </select>

        {/* 2. Chọn Gói Tin */}
        <div className="mb-6" id="package-selection">
          <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            Chọn Gói Đăng Tin
          </h3>
          {/* * Chỗ này sẽ hiển thị "Đang tải..."
            * và KHÔNG BỊ CRASH kể cả khi packages là mảng rỗng
          */}
          {packages.length === 0 ? (
            <p className="text-gray-500">Đang tải danh sách gói tin...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.packageId}
                  onClick={() => setSelectedPackageId(pkg.packageId)}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    selectedPackageId === pkg.packageId
                      ? "border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-300"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <h4 className="font-bold text-lg text-gray-800">{pkg.name}</h4>
                  <div className="text-sm text-gray-600 mt-1" style={{ minHeight: "3.5rem" }}>
                    <p>Thời hạn: {pkg.durationDays} ngày</p>
                    {pkg.highlight && <p className="font-bold text-emerald-600">Nổi bật</p>}
                  </div>
                  <p className="text-xl font-bold text-emerald-600 mt-3">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pkg.listingFee)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* --- KẾT THÚC PHẦN CHỌN GÓI TIN --- */}


        {/* 3. Render Form Con */}
        {/* 'handleFormSubmit' là async, nên component con có thể 'await' nó */}
        {category === "EV" ? (
          <VehicleForm
            key="vehicle"
            onSubmit={handleFormSubmit}
            packageId={selectedPackageId} 
          />
        ) : (
          <BatteryForm
            key="battery"
            onSubmit={handleFormSubmit}
            packageId={selectedPackageId} 
          />
        )}

        {/* Loading indicator được xử lý trong form con */}
      </div>
    </div>
  );
}