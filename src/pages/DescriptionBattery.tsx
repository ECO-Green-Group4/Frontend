import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import api from "../services/axios";
import Header from "../components/ui/Header";

interface BatteryDetails {
  id: string | number;
  name: string;
  price: number;
  model: string;
  year: number;
  soh: number; // State of Health
  images: string[]; // Changed from single imageUrl to array of images
  description?: string;
  brand?: string;
  batteryBrand?: string;
  voltage?: string;
  capacity?: string;
  healthPercent?: number;
  chargeCycles?: number;
  type?: string;
  manufactureYear?: number;
  origin?: string;
  postType?: string;
  location?: string;
  // User/Seller information
  user?: {
    userId: number;
    fullName: string;
    email: string;
    phone?: string;
    username?: string;
  };
}

const DescriptionBattery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batteryDetails, setBatteryDetails] = useState<BatteryDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatteryDetails = async () => {
      if (!id) {
        setError("ID không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Ưu tiên gọi API chi tiết theo ID; fallback sang danh sách
        let battery: any | null = null;
        try {
          const detailRes = await api.get(`/seller/listings/battery/${id}`);
          battery = detailRes.data?.data || detailRes.data || null;
        } catch (_) {
          const listRes = await api.get("/seller/listings/battery");
          const batteries = listRes.data?.data || listRes.data || [];
          battery =
            batteries.find(
              (b: any) => (b.listingId || b.id)?.toString() === id.toString()
            ) || null;
        }

        if (!battery) {
          throw new Error(`Không tìm thấy pin với ID: ${id}`);
        }

        // Debug: Log toàn bộ dữ liệu battery và user
        console.log('📦 Full battery data from API:', battery);
        console.log('👤 User data from API:', battery.user);
        console.log('📞 Phone field (phone):', battery.user?.phone);
        console.log('📞 Phone field (phoneNumber):', battery.user?.phoneNumber);
        console.log('📞 All user fields:', Object.keys(battery.user || {}));

        const images =
          (Array.isArray(battery.images) && battery.images) ||
          (Array.isArray(battery.imageUrls) && battery.imageUrls) ||
          (battery.imageUrl ? [battery.imageUrl] : []);

        
        // Thêm các trường snake_case từ DB tại vì DB nó khác với code ja vava
        const rawYear =
          battery.year ?? battery.manufactureYear ?? battery.manufacture_year;
        const parsedYear =
          rawYear !== undefined && rawYear !== null && rawYear !== ""
            ? Number(rawYear)
            : 0;

        const rawHealth =
          battery.healthPercent ?? battery.soh ?? battery.health_percent;
        const parsedHealth =
          rawHealth !== undefined && rawHealth !== null && rawHealth !== ""
            ? Number(rawHealth)
            : 0;

        const rawCycles = battery.chargeCycles ?? battery.charge_cycles;
        const parsedCycles =
          rawCycles !== undefined && rawCycles !== null && rawCycles !== ""
            ? Number(rawCycles)
            : undefined;
        

        setBatteryDetails({
          id: battery.listingId || battery.id || id,
          name: battery.title || battery.name || "",
          price: Number(battery.price) || 0,
          model: battery.model || battery.variant || "",
          year: parsedYear,
          soh: parsedHealth,
          images,
          description: battery.description,
          brand: battery.brand,
          batteryBrand: battery.batteryBrand ?? battery.battery_brand,
          voltage: battery.voltage,
          capacity: battery.capacity,
          healthPercent: parsedHealth,
          chargeCycles: parsedCycles,
          type: battery.type,
          manufactureYear: parsedYear,
          origin: battery.origin,
          postType: battery.postType,
          location: battery.location || battery.city,// Thêm fallback 'city'
          // Map user information with proper phone field handling (try multiple field names)
          user: battery.user ? {
            ...battery.user,
            phone: battery.user.phone || battery.user.phoneNumber || battery.user['phone_number'] || undefined
          } : undefined,
        });
      } catch (err: any) {
        console.error("❌ Lỗi khi tải thông tin pin:", err);
        setError(err.message || "Không thể tải thông tin pin");
      } finally {
        setLoading(false);
      }
    };

    fetchBatteryDetails();
  }, [id]);

  // XÓA BỎ: Hàm handleBuyNow không còn cần thiết
  // const handleBuyNow = () => {
  //   console.log("Buy now clicked for Battery:", batteryDetails?.id);
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white py-2 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold">Description Battery</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 animate-pulse text-green-500" />
            <p className="text-gray-500">Đang tải thông tin pin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !batteryDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white py-2 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold">Description Battery</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error || "Không tìm thấy thông tin pin"}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8 items-stretch">
          {/* Image Gallery Section - Left */}
          <div className="col-span-6 md:col-span-5 min-h-[600px] sticky top-4 self-start">
            <ImageGallery
              images={batteryDetails.images}
              title={batteryDetails.name}
              className="h-full"
            />
          </div>

          {/* Detail Information Card - Right */}
          <div className="col-span-6 md:col-span-7">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 h-full min-h-[600px] flex flex-col overflow-auto">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Chi tiết sản phẩm
              </h2>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Tên sản phẩm:
                    </span>
                    <p className="text-gray-900 mt-1">{batteryDetails.name}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Giá:</span>
                    <p className="text-green-600 font-bold text-xl mt-1">
                      {new Intl.NumberFormat("vi-VN").format(
                        batteryDetails.price
                      )}{" "}
                      VNĐ
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Thương hiệu:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.batteryBrand || "N/A"}
                    </p>
                  </div>

                 

                  <div>
                    <span className="font-semibold text-gray-700">
                      Năm sản xuất:
                    </span>
                    <p className="text-gray-900 mt-1">{batteryDetails.year}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Tình trạng pin:
                    </span>
                    <p className="text-gray-900 mt-1">{batteryDetails.soh}%</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Điện áp:</span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.voltage || "N/A"}V
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Dung lượng:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.capacity || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Loại pin:</span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.type || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Xuất xứ:</span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.origin || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Vị trí:</span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.location || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Số chu kỳ sạc:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {batteryDetails.chargeCycles || "N/A"}
                    </p>
                  </div>
                </div>

                {batteryDetails.description && (
                  <div className="mt-6 lg:col-span-3">
                    <span className="font-semibold text-gray-700">Mô tả:</span>
                    <p className="text-gray-900 mt-2 leading-relaxed">
                      {batteryDetails.description}
                    </p>
                  </div>
                )}

                {/* Thông tin người bán - CHỈ HIỂN THỊ CHO PIN */}
                {batteryDetails.user && (
                  <div className="mt-6 lg:col-span-3 border-t pt-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Thông tin người bán</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Họ tên:</span>
                        <p className="text-gray-900">{batteryDetails.user.fullName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900">{batteryDetails.user.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Số điện thoại:</span>
                        <p className="text-gray-900">{batteryDetails.user.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Button mua ngay */}
              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    // Navigation hoặc handle purchase logic
                    console.log("Purchase battery:", batteryDetails.id);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full"
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionBattery;