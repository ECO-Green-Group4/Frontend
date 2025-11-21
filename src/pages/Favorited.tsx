import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "../components/ui/Header";
import Footer from "../components/Footer";
import VehiclePostCard, { Post } from "../components/VehiclePostCard";
import FavoriteService, { FavoriteListing } from "../services/FavoriteService";
import { 
  Heart, 
  Car, 
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

const Favorited = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FavoriteService.getFavorites();
      setFavorites(data);
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách yêu thích");
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  // Convert FavoriteListing to Post format
  const convertFavoriteToPost = (favorite: FavoriteListing): Post => {
    const listing = favorite.listing || favorite;
    const images = listing.images && listing.images.length > 0 
      ? listing.images 
      : listing.imageUrl 
        ? [listing.imageUrl] 
        : [];
    
    return {
      id: favorite.listingId,
      title: listing.title || "",
      price: listing.price || 0,
      imageUrl: images[0] || "",
      images: images,
      category: listing.category || "EV",
      description: listing.description,
      postType: undefined,
      createdAt: listing.createdAt || favorite.createdAt,
      location: listing.location,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      numberOfSeats: listing.numberOfSeats,
      batteryCapacity: listing.batteryCapacity,
      user: listing.user
    };
  };

  const handleRemoveFavorite = async (listingId: number | string) => {
    try {
      await FavoriteService.removeFavorite(listingId);
      setFavorites(prev => prev.filter(fav => fav.listingId !== listingId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      toast.error(err.response?.data?.message || "Không thể xóa khỏi yêu thích");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 mb-16">
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-emerald-600/50 to-teal-600/0 animate-pulse"></div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/25 backdrop-blur-xl rounded-full text-white text-sm font-bold shadow-2xl border border-white/40">
                <Heart className="w-5 h-5 fill-white animate-pulse" />
                <span>Danh sách yêu thích của bạn</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
                <span className="block">Yêu thích</span>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2">
                  Xe điện của bạn
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-green-50/95 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                Xem lại những phương tiện bạn đã lưu vào danh sách yêu thích
              </p>

              {!loading && favorites.length > 0 && (
                <div className="inline-flex items-center gap-4 bg-white/15 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/30 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <Heart className="w-8 h-8 fill-white text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">{favorites.length}</div>
                    <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Phương tiện yêu thích</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-20 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="favoriteWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(249, 250, 251)" />
                  <stop offset="50%" stopColor="rgb(243, 244, 246)" />
                  <stop offset="100%" stopColor="rgb(249, 250, 251)" />
                </linearGradient>
              </defs>
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="url(#favoriteWaveGradient)"></path>
            </svg>
          </div>
        </div>

        {/* Content Section - Full Width Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 -mt-8 relative z-10">
          {loading ? (
            <div className="space-y-6 pb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden mb-4 animate-pulse">
                  <div className="flex flex-row h-full min-h-[300px]">
                    <div className="w-[40%] bg-gray-200"></div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 text-red-800 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <p className="font-black text-xl mb-1">Có lỗi xảy ra</p>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center shadow-2xl">
                    <Heart className="w-16 h-16 text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Car className="w-6 h-6 text-yellow-800" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-800 mb-3">Chưa có yêu thích nào</p>
                  <p className="text-gray-600 mb-8 text-lg">Hãy khám phá và thêm các phương tiện vào danh sách yêu thích của bạn</p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Car className="w-5 h-5 mr-2" />
                    <span>Khám phá ngay</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-green-600 fill-green-600" />
                  <p className="text-base lg:text-lg text-gray-700 font-bold">
                    Tổng cộng <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{favorites.length}</span> phương tiện yêu thích
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {favorites.map((favorite) => {
                  const post = convertFavoriteToPost(favorite);
                  return (
                    <div key={favorite.id || favorite.listingId}>
                      <VehiclePostCard post={post} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorited;
