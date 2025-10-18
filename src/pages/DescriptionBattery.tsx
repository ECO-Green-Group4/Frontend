import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Bell, Settings, User, ArrowLeft } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import api from "../services/axios";

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
}

const DescriptionBattery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batteryDetails, setBatteryDetails] = useState<BatteryDetails | null>(null);
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
        
        // Gọi API lấy danh sách pin và tìm pin theo ID
        const response = await api.get("/seller/listings/battery");
        const batteries = response.data?.data || response.data || [];
        
        // Tìm pin theo ID
        const battery = batteries.find((b: any) => 
          (b.listingId || b.id)?.toString() === id.toString()
        );
        
        if (!battery) {
          throw new Error(`Không tìm thấy pin với ID: ${id}`);
        }
        
        setBatteryDetails({
          id: battery.listingId || battery.id || id,
          name: battery.title || "Battery of Wuling",
          price: Number(battery.price) || 30000,
          model: battery.model || "Wuling 4",
          year: Number(battery.year) || 2022,
          soh: Number(battery.healthPercent) || Number(battery.soh) || 80, // State of Health percentage
          images: battery.images && Array.isArray(battery.images) && battery.images.length > 0 
            ? battery.images 
            : [],
          description: battery.description,
          brand: battery.brand,
          batteryBrand: battery.batteryBrand,
          voltage: battery.voltage,
          capacity: battery.capacity,
          healthPercent: Number(battery.healthPercent),
          chargeCycles: Number(battery.chargeCycles),
          type: battery.type,
          manufactureYear: Number(battery.manufactureYear),
          origin: battery.origin,
          postType: battery.postType,
          location: battery.location
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

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality
    console.log("Buy now clicked for Battery:", batteryDetails?.id);
  };

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
            <p className="text-red-500 mb-4">{error || "Không tìm thấy thông tin pin"}</p>
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
              images={batteryDetails.images}
              title={batteryDetails.name}
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
                    <span className="font-semibold text-gray-700">Tên sản phẩm:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.name}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Giá:</span>
                    <p className="text-green-600 font-bold text-xl mt-1">
                      {new Intl.NumberFormat("vi-VN").format(batteryDetails.price)} VNĐ
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Thương hiệu:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.brand || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Model:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.model}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Năm sản xuất:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.year}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Tình trạng pin:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.soh}%</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Điện áp:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.voltage || "N/A"}V</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Dung lượng:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.capacity || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Loại pin:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.type || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Xuất xứ:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.origin || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Vị trí:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.location || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Số chu kỳ sạc:</span>
                    <p className="text-gray-900 mt-1">{batteryDetails.chargeCycles || "N/A"}</p>
                  </div>
                </div>
                
                {batteryDetails.description && (
                  <div className="mt-6">
                    <span className="font-semibold text-gray-700">Mô tả:</span>
                    <p className="text-gray-900 mt-2 leading-relaxed">{batteryDetails.description}</p>
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

export default DescriptionBattery;
