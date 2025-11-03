import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Battery, Heart, Phone, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import VIPBadge from "./VIPBadge";
import FavoriteService from "../services/FavoriteService";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export type Post = {
  id?: number | string;
  title: string;
  price: number;
  imageUrl: string;
  images?: string[];
  category: "EV" | "Battery";
  description?: string;
  postType?: string;
  createdAt?: string;
  location?: string;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  condition?: string;
  bodyType?: string;
  color?: string;
  batteryCapacity?: string;
  numberOfSeats?: number;
  licensePlate?: string;
  origin?: string;
  inspection?: string;
  accessories?: string;
  batteryBrand?: string;
  voltage?: string;
  capacity?: string;
  healthPercent?: number;
  chargeCycles?: number;
  type?: string;
  manufactureYear?: number;
  user?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
};

interface VehiclePostCardProps {
  post: Post;
}

const VehiclePostCard: React.FC<VehiclePostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Check favorite status when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (post.id) {
        try {
          const favorite = await FavoriteService.checkFavorite(post.id);
          setIsFavorite(favorite);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [post.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!post.id) {
      toast.error("Không tìm thấy ID bài đăng");
      return;
    }

    try {
      setIsFavoriteLoading(true);
      
      if (isFavorite) {
        await FavoriteService.removeFavorite(post.id);
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await FavoriteService.addFavorite(post.id);
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thao tác");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handlePostClick = () => {
    if (post.category === "EV") {
      navigate(`/description-ev/${post.id}`);
    } else if (post.category === "Battery") {
      navigate(`/description-battery/${post.id}`);
    }
  };

  const formatPrice = (price: number) => {
    const billions = Math.floor(price / 1000000000);
    const millions = Math.floor((price % 1000000000) / 1000000);
    
    if (billions > 0) {
      return `${billions}${millions > 0 ? `.${Math.floor(millions / 100)}` : ""} tỷ`;
    }
    if (millions > 0) {
      return `${millions} triệu`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "";
    if (showPhone) return phone;
    return phone.slice(0, 7) + " ***";
  };

  const displayImages = post.images && post.images.length > 0 ? post.images : [post.imageUrl].filter(Boolean);
  const mainImage = displayImages[0] || post.imageUrl;
  const totalImages = displayImages.length;

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden mb-4 cursor-pointer transform hover:-translate-y-0.5 w-full"
      onClick={handlePostClick}
    >
      <div className="flex flex-row h-full min-h-[300px]">
        {/* Left Column - Image (40% width) */}
        <div className="relative w-[40%] flex-shrink-0">
          <div className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-gray-100 to-gray-200">
            {/* VIP Badge */}
            {post.postType && (
              <VIPBadge postType={post.postType} />
            )}
            
            {/* Main Image */}
            <img
              src={mainImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300/cccccc/666666?text=Không+có+ảnh";
              }}
            />
            
            {/* Image Count Badge */}
            {totalImages > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-white">
                <Camera className="w-3 h-3" />
                <span>{totalImages} ảnh</span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                isFavorite ? "bg-red-50 hover:bg-red-100" : "bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              } ${isFavoriteLoading ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
            >
              {isFavoriteLoading ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 transition-all duration-300 ${
                  isFavorite 
                    ? "text-red-500 fill-red-500" 
                    : "text-gray-600 hover:text-red-400"
                }`} />
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Content (60% width with padding) */}
        <div className="flex-1 flex flex-col p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-green-700 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Price - Prominent */}
          <div className="mb-4">
            <span className="text-3xl font-black text-green-600">
              {formatPrice(post.price)}
            </span>
          </div>

          {/* Key Metrics - Horizontal Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-base text-gray-600">
            {post.numberOfSeats && (
              <span className="flex items-center gap-1.5">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{post.numberOfSeats} chỗ</span>
              </span>
            )}
            {post.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-medium">{post.year}</span>
              </span>
            )}
            {post.batteryCapacity && (
              <span className="flex items-center gap-1.5">
                <Battery className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{post.batteryCapacity}</span>
              </span>
            )}
            {post.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="font-medium truncate max-w-[200px]">{post.location}</span>
              </span>
            )}
          </div>

          {/* Short Description - 2 lines max */}
          {post.description && (
            <p className="text-base text-gray-700 mb-4 line-clamp-2 leading-relaxed flex-1">
              {post.description}
            </p>
          )}

          {/* Seller Info & Contact - Bottom */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                {post.user?.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {post.user?.fullName || "Người bán"}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Đăng {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            {post.user?.phone && (
              <Button
                size="default"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg px-5 py-2.5 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhone(!showPhone);
                }}
              >
                <Phone className="w-4 h-4 mr-1.5" />
                {showPhone ? (
                  <span className="font-mono text-sm">{post.user.phone}</span>
                ) : (
                  <span>{formatPhone(post.user.phone)} - Hiện số</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclePostCard;

