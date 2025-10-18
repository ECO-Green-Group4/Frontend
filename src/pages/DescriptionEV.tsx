import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Bell, Settings, User, ArrowLeft } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import api from "../services/axios";

interface EVDetails {
  id: string | number;
  name: string;
  price: number;
  model: string;
  mileage: number;
  year: number;
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
        
        // Gọi API lấy danh sách xe và tìm xe theo ID
        const response = await api.get("/seller/listings/vehicle");
        const vehicles = response.data?.data || response.data || [];
        
        // Tìm xe theo ID
        const vehicle = vehicles.find((v: any) => 
          (v.listingId || v.id)?.toString() === id.toString()
        );
        
        if (!vehicle) {
          throw new Error(`Không tìm thấy xe với ID: ${id}`);
        }
        
        setEvDetails({
          id: vehicle.listingId || vehicle.id || id,
          name: vehicle.title || "Tesla",
          price: Number(vehicle.price) || 30000,
          model: vehicle.model || "Tesla Model 3",
          mileage: Number(vehicle.mileage) || 3000,
          year: Number(vehicle.year) || 2022,
          images: vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0 
            ? vehicle.images 
            : [],
          description: vehicle.description,
          brand: vehicle.brand,
          bodyType: vehicle.bodyType,
          color: vehicle.color,
          inspection: vehicle.inspection,
          origin: vehicle.origin,
          numberOfSeats: Number(vehicle.numberOfSeats),
          licensePlate: vehicle.licensePlate,
          accessories: vehicle.accessories,
          batteryCapacity: vehicle.batteryCapacity,
          condition: vehicle.condition,
          postType: vehicle.postType,
          location: vehicle.location
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
            <p className="text-red-500 mb-4">{error || "Không tìm thấy thông tin xe"}</p>
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
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
          {/* Logo + Tên */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-500 tracking-wide">
              EcoGreen
            </span>
          </div>

          {/* Center - Navigation Links */}
          <nav className="flex items-center space-x-6">
            <a 
              href="/create-post" 
              className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              Create Post
            </a>
            <a 
              href="/membership" 
              className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              Membership
            </a>
            <a 
              href="/favorited" 
              className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              Favorited
            </a>
            <a 
              href="/history" 
              className="text-black hover:text-gray-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              History
            </a>
          </nav>

          {/* Right side - User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery Section - Left */}
          <div className="flex-1 lg:w-1/2">
            <ImageGallery 
              images={evDetails.images}
              title={evDetails.name}
              className="h-full"
            />
          </div>

          {/* Detail Information Card - Right */}
          <div className="flex-1 lg:w-1/2">
            <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Chi tiết sản phẩm</h2>
              
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Tên xe:</span>
                    <p className="text-gray-900 mt-1">{evDetails.name}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Giá:</span>
                    <p className="text-green-600 font-bold text-xl mt-1">
                      {new Intl.NumberFormat("vi-VN").format(evDetails.price)} VNĐ
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Thương hiệu:</span>
                    <p className="text-gray-900 mt-1">{evDetails.brand || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Model:</span>
                    <p className="text-gray-900 mt-1">{evDetails.model}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Năm sản xuất:</span>
                    <p className="text-gray-900 mt-1">{evDetails.year}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Số km đã đi:</span>
                    <p className="text-gray-900 mt-1">{new Intl.NumberFormat("vi-VN").format(evDetails.mileage)} km</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Loại thân xe:</span>
                    <p className="text-gray-900 mt-1">{evDetails.bodyType || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Màu sắc:</span>
                    <p className="text-gray-900 mt-1">{evDetails.color || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Số chỗ ngồi:</span>
                    <p className="text-gray-900 mt-1">{evDetails.numberOfSeats || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Biển số:</span>
                    <p className="text-gray-900 mt-1">{evDetails.licensePlate || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Dung lượng pin:</span>
                    <p className="text-gray-900 mt-1">{evDetails.batteryCapacity || "N/A"} kWh</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Tình trạng:</span>
                    <p className="text-gray-900 mt-1">{evDetails.condition || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Xuất xứ:</span>
                    <p className="text-gray-900 mt-1">{evDetails.origin || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Vị trí:</span>
                    <p className="text-gray-900 mt-1">{evDetails.location || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Đăng kiểm:</span>
                    <p className="text-gray-900 mt-1">{evDetails.inspection || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Phụ kiện:</span>
                    <p className="text-gray-900 mt-1">{evDetails.accessories || "N/A"}</p>
                  </div>
                </div>
                
                {evDetails.description && (
                  <div className="mt-6">
                    <span className="font-semibold text-gray-700">Mô tả:</span>
                    <p className="text-gray-900 mt-2 leading-relaxed">{evDetails.description}</p>
                  </div>
                )}
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
