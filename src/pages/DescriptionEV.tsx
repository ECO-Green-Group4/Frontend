import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import api from "../services/axios";
import Header from "../components/ui/Header";

interface EVDetails {
  id: string | number;
  name: string;
  price: number;
  model: string;
  mileage?: number;
  year?: number;
  images: string[]; // Changed from single imageUrl to array of images
  description?: string;
  brand?: string;
  bodyType?: string;
  color?: string;
  inspection?: string;
  origin?: string;
  numberOfSeats?: number;
  licensePlate?: string;
  accessories?: string;
  batteryCapacity?: string;
  condition?: string;
  postType?: string;
  location?: string;
}

const DescriptionEV = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evDetails, setEvDetails] = useState<EVDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEVDetails = async () => {
      if (!id) {
        setError("ID không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Ưu tiên gọi API chi tiết theo ID; nếu thất bại fallback sang lấy danh sách rồi tìm
        let vehicle: any | null = null;
        try {
          const detailRes = await api.get(`/seller/listings/vehicle/${id}`);
          vehicle = detailRes.data?.data || detailRes.data || null;
        } catch (_) {
          const listRes = await api.get("/seller/listings/vehicle");
          const vehicles = listRes.data?.data || listRes.data || [];
          vehicle =
            vehicles.find(
              (v: any) => (v.listingId || v.id)?.toString() === id.toString()
            ) || null;
        }

        if (!vehicle) {
          throw new Error(`Không tìm thấy xe với ID: ${id}`);
        }

        const images =
          (Array.isArray(vehicle.images) && vehicle.images) ||
          (Array.isArray(vehicle.imageUrls) && vehicle.imageUrls) ||
          (vehicle.imageUrl ? [vehicle.imageUrl] : []);

        
        // Thêm `vehicle.number_of_seats`
        const rawSeats =
          vehicle.numberOfSeats ?? vehicle.seats ?? vehicle.number_of_seats;
        const parsedSeats =
          rawSeats !== undefined && rawSeats !== null && rawSeats !== ""
            ? Number(rawSeats)
            : undefined;

        const rawMileage = vehicle.mileage ?? vehicle.odometer;
        const parsedMileage =
          rawMileage !== undefined && rawMileage !== null && rawMileage !== ""
            ? Number(rawMileage)
            : undefined;

        const rawYear = vehicle.year ?? vehicle.manufactureYear;
        const parsedYear =
          rawYear !== undefined && rawYear !== null && rawYear !== ""
            ? Number(rawYear)
            : undefined;
        

        setEvDetails({
          id: vehicle.listingId || vehicle.id || id,
          name: vehicle.title || vehicle.name || "",
          price: Number(vehicle.price) || 0,
          model: vehicle.model || vehicle.variant || "",
          mileage: parsedMileage,
          year: parsedYear,
          images,
          description: vehicle.description,
          brand: vehicle.brand || vehicle.make || vehicle.manufacturer,
          bodyType: vehicle.bodyType || vehicle.body_type,
          color: vehicle.color,
          inspection: vehicle.inspection,
          origin: vehicle.origin || vehicle.countryOfOrigin,

          numberOfSeats: parsedSeats,

          
          licensePlate:
            vehicle.licensePlate ||
            vehicle.plateNumber ||
            vehicle.license_plate,

          accessories: vehicle.accessories,

          
          batteryCapacity:
              vehicle.batteryCapacity ||
              vehicle.battery_capacity ||
              vehicle.capacity,

          condition: vehicle.condition,
          postType: vehicle.postType,
          location: vehicle.location || vehicle.city,
        });
      } catch (err: any) {
        console.error("❌ Lỗi khi tải thông tin xe:", err);
        setError(err.message || "Không thể tải thông tin xe");
      } finally {
        setLoading(false);
      }
    };

    fetchEVDetails();
  }, [id]);

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality
    console.log("Buy now clicked for EV:", evDetails?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white py-2 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold">Description EV</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 animate-pulse text-green-500" />
            <p className="text-gray-500">Đang tải thông tin xe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !evDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white py-2 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold">Description EV</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error || "Không tìm thấy thông tin xe"}
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

  // Helpers for safe display
  const displayText = (value: any, fallback: string = "-") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" && value.trim() === "") return fallback;
    return value;
  };

  const formatNumber = (value?: number, suffix?: string) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "-";
    const formatted = new Intl.NumberFormat("vi-VN").format(value);
    return suffix ? `${formatted} ${suffix}` : formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8 items-stretch">
          {" "}
          {/* Image Gallery Section - Left */}
          <div className="col-span-6 md:col-span-5 min-h-[600px] sticky top-4 self-start">
            <ImageGallery
              images={evDetails.images}
              title={evDetails.name}
              className="h-full"
            />
          </div>
          {/* Detail Information Card - Right */}
          <div className="col-span-6 md:col-span-7">
            <div className="bg-white rounded-xl shadow-lg p-8 h-full min-h-[600px] flex flex-col overflow-auto">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Chi tiết sản phẩm
              </h2>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Tên xe:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.name)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Giá:</span>
                    <p className="text-green-600 font-bold text-xl mt-1">
                      {formatNumber(evDetails.price)} VNĐ
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Thương hiệu:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.brand)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Model:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.model)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Năm sản xuất:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {formatNumber(evDetails.year)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Số km đã đi:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {formatNumber(evDetails.mileage, "km")}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Loại thân xe:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.bodyType)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Màu sắc:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.color)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Số chỗ ngồi:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.numberOfSeats)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Biển số:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.licensePlate)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Dung lượng pin:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {evDetails.batteryCapacity
                        ? `${evDetails.batteryCapacity} kWh`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Tình trạng:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.condition)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Xuất xứ:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.origin)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Vị trí:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.location)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">
                      Đăng kiểm:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.inspection)}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Phụ kiện:</span>
                    <p className="text-gray-900 mt-1">
                      {displayText(evDetails.accessories)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 lg:col-span-3">
                  <span className="font-semibold text-gray-700">Mô tả:</span>
                  <p className="text-gray-900 mt-2 leading-relaxed">
                    {displayText(evDetails.description)}
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={handleBuyNow}
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

export default DescriptionEV;