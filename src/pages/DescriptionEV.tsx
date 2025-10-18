import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Bell, Settings, User, ArrowLeft } from "lucide-react";
import api from "../services/axios";

interface EVDetails {
  id: string | number;
  name: string;
  price: number;
  model: string;
  mileage: number;
  year: number;
  imageUrl: string;
  description?: string;
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
          imageUrl: vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0 
            ? vehicle.images[0] 
            : "",
          description: vehicle.description
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
            <Button onClick={() => navigate("/main")} variant="outline">
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
        <div className="flex flex-col md:flex-row gap-8 items-stretch" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'stretch' }}>
          {/* Image Section - Left */}
          <div className="space-y-4 flex-1 w-1/2 h-full">
            <div className="bg-green-500 rounded-xl p-8 flex items-center justify-center h-full min-h-[600px]">
              <div className="bg-white rounded-lg p-4 flex items-center justify-center w-full h-full">
                {evDetails.imageUrl ? (
                  <img 
                    src={evDetails.imageUrl} 
                    alt={evDetails.name}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <User className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail Information Card - Right */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex-1 w-1/2 h-full flex flex-col min-h-[600px]">
            <h2 className="text-2xl font-bold text-center mb-6">Detail</h2>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-700">Name: </span>
                <span className="text-gray-900">{evDetails.name}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Price: </span>
                <span className="text-gray-900">${new Intl.NumberFormat("en-US").format(evDetails.price)}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Model: </span>
                <span className="text-gray-900">{evDetails.model}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Mileage: </span>
                <span className="text-gray-900">{new Intl.NumberFormat("en-US").format(evDetails.mileage)}mile</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Year: </span>
                <span className="text-gray-900">{evDetails.year}</span>
              </div>
            </div>

            <div className="mt-auto text-center">
              <Button 
                onClick={handleBuyNow}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionEV;
