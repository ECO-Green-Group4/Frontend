
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
  const [isSubmitting, setIsSubmitting] = useState(false); // State loading của Cha
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
  

  // hàm chuyển đổi payloadpayload
  
  type BatteryFormData = any;
  type VehicleFormData = any;

  
  const toBatteryPayload = (data: BatteryFormData) => ({
    title: data.title,
    description: data.description,
    images: data.images,
    location: data.location,
    price: Number(data.price) || 0, 
    
    
    brand: data.batteryBrand, 
    
    voltage: Number(data.voltage) || 0, 
    capacity: data.capacity, 
    healthPercent: Number(data.healthPercent) || 0, 
    chargeCycles: Number(data.chargeCycles) || 0, 
    type: data.type,
    manufactureYear: Number(data.manufactureYear) || 0, 
    origin: data.origin,
    packageId: data.packageId,

    
  });

 
  const toVehiclePayload = (data: VehicleFormData) => ({
    title: data.title,
    description: data.description,
    images: data.images,
    location: data.location,
    price: Number(data.price) || 0,
    brand: data.brand,
    model: data.model,
    year: Number(data.year) || 0, 
    bodyType: data.bodyType,
    color: data.color,
    mileage: Number(data.mileage) || 0, 
    inspection: data.inspection,
    origin: data.origin,
    numberOfSeats: Number(data.numberOfSeats) || 0, 
    licensePlate: data.licensePlate,
    accessories: data.accessories,
    batteryCapacity: Number(data.batteryCapacity) || 0, 
    condition: data.condition,
    packageId: data.packageId,
  });

  
  // async để component con có thể 'await'
  const handleFormSubmit = async (data: any) => {
    
    
    setIsSubmitting(true); 

    try {
      let res; // Khai báo response ở ngoài
      if (category === "Battery") {
        const payload = toBatteryPayload(data);
        console.log("Submitting Battery Payload:", payload); // Log để check
        res = await api.post("/seller/listings/battery", payload, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("Battery listing created:", res.data);
      } else {
        const payload = toVehiclePayload(data);
        console.log("Submitting Vehicle Payload:", payload); // Log để check
        res = await api.post("/seller/listings/vehicle", payload, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("Vehicle listing created:", res.data);
      }
      
      
      showToast("🎉 Đăng tin thành công!", "success");
      navigate("/waiting");

    } catch (err: any) {
      // Báo lỗi cho user nếu thất bại
      console.error("Create listing error:", err);
      const message = err?.response?.data?.message || err?.message || "Request failed";
      showToast(`❌ Đăng tin thất bại! Lỗi: ${message}`, "error");
    } finally {
      // Tắt loading của trang
      setIsSubmitting(false);
    }
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

        {/* 4. Loading indicator của trang (nếu muốn) */}
        {isSubmitting && (
         <p className="text-center text-gray-500 mt-4 animate-pulse">
            🕓 Đang xử lý...
         </p>
        )}
      </div>
    </div>
  );
}