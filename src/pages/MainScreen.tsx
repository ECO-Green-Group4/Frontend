import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "../components/ui/Header";
import Footer from "../components/Footer";
import VIPBadge from "../components/VIPBadge";
import { Search, Filter, Zap, MapPin, Car, Calendar, Camera, CheckCircle2, Phone, Heart, Star, Battery, Users, Gauge, Building2, ShieldCheck, Activity } from "lucide-react";

const MainScreen = () => {
  const navigate = useNavigate();

  type Post = {
    id?: number | string;
    title: string;
    price: number;
    imageUrl: string;
    images?: string[]; // Array of all images
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
    // Battery specific fields
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

  const fetchPosts = async (): Promise<Post[]> => {
    try {
      // Gọi API buyer/listings - public API không cần authentication
      console.log("Fetching buyer listings...");
      const response = await api.get("/buyer/listings");
      
      console.log("✅ Buyer listings response:", response.data);
      
      // Extract data từ response
      // Response format: { message, success, data: [...] }
      const listings = response.data?.data || response.data || [];
      
      console.log("📋 Total listings:", listings.length);
      console.log("🔍 Filtering for ACTIVE status only");

      // Map dữ liệu từ API buyer/listings
      const mappedPosts: Post[] = listings
        .filter((item: any) => item.status === 'ACTIVE')
        .map((item: any) => {
          const listingId = item.id ?? item.listingId ?? item._id;
          const title = item.title ?? item.name ?? "Untitled";
          const price = Number(item.price) || 0;
          
          // Extract images - API trả về array images
          let imageUrl = "";
          let images: string[] = [];
          if (Array.isArray(item.images) && item.images.length > 0) {
            images = item.images;
            imageUrl = item.images[0];
          } else if (item.imageUrl) {
            imageUrl = item.imageUrl;
            images = [item.imageUrl];
          } else if (item.thumbnail) {
            imageUrl = item.thumbnail;
            images = [item.thumbnail];
          }
          
          // Determine category based on itemType hoặc có vehicle-specific fields
          const category = 
            item.itemType?.toLowerCase().includes('battery') || 
            item.batteryBrand || 
            item.capacity 
              ? "Battery" 
              : "EV";
          
          return {
            id: listingId,
            title,
            price,
            imageUrl,
            images,
            category,
            postType: item.postType,
            description: item.description,
            createdAt: item.createdAt,
            location: item.location,
            brand: item.brand,
            model: item.model,
            year: item.year,
            mileage: item.mileage,
            condition: item.condition,
            bodyType: item.bodyType,
            color: item.color,
            batteryCapacity: item.batteryCapacity,
            numberOfSeats: item.numberOfSeats || item.number_of_seats,
            licensePlate: item.licensePlate || item.license_plate,
            origin: item.origin,
            inspection: item.inspection,
            accessories: item.accessories,
            // Battery specific fields
            batteryBrand: item.batteryBrand || item.battery_brand,
            voltage: item.voltage,
            capacity: item.capacity,
            healthPercent: item.healthPercent || item.health_percent,
            chargeCycles: item.chargeCycles || item.charge_cycles,
            type: item.type,
            manufactureYear: item.manufactureYear || item.manufacture_year,
            user: item.user || item.seller ? {
              fullName: item.user?.fullName || item.seller?.fullName,
              phone: item.user?.phone || item.seller?.phone,
              email: item.user?.email || item.seller?.email
            } : undefined
          };
        });

      console.log(`✅ Mapped ${mappedPosts.length} active listings`);
      return mappedPosts;
      
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      setError("Không thể tải danh sách bài đăng");
      return [];
    }
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "EV" | "Battery">(
    "All"
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPosts()
      .then((data) => {
        if (mounted) setPosts(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Helper function to get VIP priority for sorting
  const getVIPPriority = (postType?: string): number => {
    if (!postType) return 999; // Non-VIP posts go last
    
    const normalized = postType.toLowerCase();
    if (normalized.includes("diamond")) return 1; // Highest priority
    if (normalized.includes("gold")) return 2;
    if (normalized.includes("silver")) return 3;
    return 999; // Non-VIP or unknown
  };

  const filteredPosts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const filtered = posts.filter((p) => {
      const matchFilter =
        activeFilter === "All" || p.category === activeFilter;
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term);
      return matchFilter && matchSearch;
    });

    // Sort by VIP priority + mới nhất lên đầu trong cùng 1 nhóm VIP
    return filtered.sort((a, b) => {
      const v1 = getVIPPriority(a.postType);
      const v2 = getVIPPriority(b.postType);
      if (v1 !== v2) return v1 - v2;

      // Ưu tiên bài mới theo createdAt hoặc id
      if (a.createdAt && b.createdAt) {
        // Nếu createdAt tồn tại, sort giảm dần (mới lên trước)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Nếu không có createdAt, sort theo id giảm dần nếu là số
      if (!isNaN(Number(a.id)) && !isNaN(Number(b.id))) {
        return Number(b.id) - Number(a.id);
      }
      return 0;
    });
  }, [posts, activeFilter, searchQuery]);

  const handlePostClick = (post: Post) => {
    console.log("🖱️ Click vào post:", post);
    if (post.category === "EV") {
      navigate(`/description-ev/${post.id}`);
    } else if (post.category === "Battery") {
      navigate(`/description-battery/${post.id}`);
    }
  };

  function PostCard({ post }: { post: Post }) {
    const [showPhone, setShowPhone] = useState(false);

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
    // Chỉ hiển thị tối đa 3 thumbnail trên trang chủ
    const thumbnails = displayImages.slice(1, 4); // Show max 3 thumbnails
    const totalImages = displayImages.length;

    return (
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-6"
      >
        {/* Top Header - Seller Info & Phone Button */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          {/* Seller Info - Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
              {post.user?.fullName?.charAt(0) || "?"}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">{post.user?.fullName || "Người bán"}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-xs text-gray-500">Đăng {formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Phone Button - Right */}
          {post.user?.phone && (
            <div className="flex items-center gap-2">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhone(!showPhone);
                }}
              >
                <Phone className="w-4 h-4" />
                <span>{formatPhone(post.user.phone)}</span>
                {!showPhone && <span className="text-xs">. Hiện số</span>}
              </Button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" onClick={() => handlePostClick(post)}>
          {/* Left Section - Main Image & Thumbnails (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image - Large */}
            <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden" style={{ aspectRatio: "16/10" }}>
              <VIPBadge postType={post.postType} className="!top-4 !left-4 !right-auto z-20" />
              <img
                src={mainImage}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x750/cccccc/666666?text=Không+có+ảnh";
                }}
              />
              
              {/* Image Count Badge */}
              {totalImages > 0 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold text-white shadow-lg z-10">
                  <Camera className="w-4 h-4" />
                  <span>{totalImages}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Below Main Image */}
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {thumbnails.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-green-500 transition-colors cursor-pointer bg-gray-200"
                  >
                    <img
                      src={img}
                      alt={`${post.title} ${idx + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300/cccccc/666666?text=IMG";
                      }}
                    />
                    {/* Nếu là thumbnail cuối và còn nhiều ảnh hơn, hiển thị overlay */}
                    {idx === thumbnails.length - 1 && totalImages > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{totalImages - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Content & Sidebar (1 column) */}
          <div className="space-y-4">
            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              {/* Top Section - Title & Price */}
              <div className="space-y-4 mb-6">
              {/* Verified Badge & Title */}
              <div className="flex items-start gap-3">
                <Badge className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 px-3 py-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  XÁC THỰC
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                  {post.title}
                </h3>
              </div>

              {/* Price - Large & Prominent */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(post.price)}
                </span>
                {post.category === "EV" && post.batteryCapacity && (
                  <span className="text-lg text-gray-500">
                    • {post.batteryCapacity} kWh
                  </span>
                )}
              </div>

              {/* Key Info - Brand, Model, Year */}
              <div className="flex flex-wrap items-center gap-3 text-base">
                {post.brand && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                    <Car className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">{post.brand}</span>
                  </div>
                )}
                {post.model && (
                  <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-800">{post.model}</span>
                  </div>
                )}
                {post.year && (
                  <div className="px-3 py-1.5 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-800">{post.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Grid - 3 Columns để cân bằng hơn - Tất cả màu xám */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Mileage */}
              {post.mileage && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gauge className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Quãng đường</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    {new Intl.NumberFormat("vi-VN").format(post.mileage)} km
                  </p>
                </div>
              )}

              {/* Condition */}
              {post.condition && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Tình trạng</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 capitalize">{post.condition}</p>
                </div>
              )}

              {/* Body Type */}
              {post.bodyType && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Kiểu dáng</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.bodyType}</p>
                </div>
              )}

              {/* Number of Seats */}
              {post.numberOfSeats && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Số chỗ ngồi</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.numberOfSeats} chỗ</p>
                </div>
              )}

              {/* Battery Capacity */}
              {post.category === "EV" && post.batteryCapacity && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Battery className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Dung lượng pin</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.batteryCapacity} kWh</p>
                </div>
              )}

              {/* Color */}
              {post.color && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: post.color.toLowerCase() }} />
                    <span className="text-xs font-medium text-gray-500 uppercase">Màu sắc</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 capitalize">{post.color}</p>
                </div>
              )}

              {/* Origin */}
              {post.origin && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Xuất xứ</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.origin}</p>
                </div>
              )}

              {/* License Plate */}
              {post.licensePlate && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Biển số</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 font-mono">{post.licensePlate}</p>
                </div>
              )}

              {/* Inspection - Chỉ hiển thị cho Battery */}
              {post.category === "Battery" && post.inspection && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Đã kiểm định</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.inspection}</p>
                </div>
              )}

              {/* Battery Brand - Chỉ cho Battery */}
              {post.category === "Battery" && post.batteryBrand && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Battery className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Hãng pin</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.batteryBrand}</p>
                </div>
              )}

              {/* Voltage - Chỉ cho Battery */}
              {post.category === "Battery" && post.voltage && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Điện áp</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.voltage}V</p>
                </div>
              )}

              {/* Capacity - Chỉ cho Battery */}
              {post.category === "Battery" && post.capacity && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Dung lượng</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.capacity}</p>
                </div>
              )}

              {/* Health Percent - Chỉ cho Battery */}
              {post.category === "Battery" && post.healthPercent && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Sức khỏe</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.healthPercent}%</p>
                </div>
              )}

              {/* Charge Cycles - Chỉ cho Battery */}
              {post.category === "Battery" && post.chargeCycles && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gauge className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Số lần sạc</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.chargeCycles} lần</p>
                </div>
              )}

              {/* Type - Chỉ cho Battery */}
              {post.category === "Battery" && post.type && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Loại pin</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{post.type}</p>
                </div>
              )}
            </div>

            {/* Location & Additional Info */}
            <div className="mb-4 space-y-3">
              {/* Location */}
              {post.location && (
                <div className="flex items-center gap-2 text-base text-gray-700 p-3 bg-red-50 rounded-lg border border-red-200">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="font-semibold">{post.location}</span>
                </div>
              )}

              {/* Accessories */}
              {post.accessories && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase">Phụ kiện đi kèm</span>
                  </div>
                  <p className="text-sm text-gray-700">{post.accessories}</p>
                </div>
              )}
            </div>

            {/* Description - Longer */}
            {post.description && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Mô tả</h4>
                <p className="text-gray-700 leading-relaxed line-clamp-4 text-sm">
                  {post.description}
                </p>
              </div>
            )}
              </div>

            {/* Sidebar Cards - Additional Info */}
            <div className="space-y-4">
              {/* Price Highlight Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl border border-green-400 shadow-lg p-6 text-white">
                <div className="text-sm font-medium mb-1 opacity-90">GIÁ CHỈ TỪ</div>
                <div className="text-3xl font-bold mb-2">{formatPrice(post.price)}</div>
                <Badge className="bg-red-600 text-white hover:bg-red-700 px-3 py-1">
                  GIÁ TỐT NHẤT THỊ TRƯỜNG
                </Badge>
              </div>

              {/* Key Features Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
                <h4 className="font-bold text-gray-900 mb-4">Đặc điểm nổi bật</h4>
                <div className="space-y-3">
                  {post.category === "EV" && post.batteryCapacity && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Battery className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Dung lượng pin</div>
                        <div className="text-sm text-gray-600">{post.batteryCapacity} kWh</div>
                      </div>
                    </div>
                  )}
                  
                  {post.mileage && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Gauge className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Quãng đường</div>
                        <div className="text-sm text-gray-600">{new Intl.NumberFormat("vi-VN").format(post.mileage)} km</div>
                      </div>
                    </div>
                  )}

                  {post.condition && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Tình trạng</div>
                        <div className="text-sm text-gray-600 capitalize">{post.condition}</div>
                      </div>
                    </div>
                  )}

                  {post.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Địa điểm</div>
                        <div className="text-sm text-gray-600">{post.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Card */}
              {post.user?.phone && (
                <div className="bg-white rounded-xl border-2 border-green-500 shadow-lg p-5">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Liên hệ ngay</div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPhone(!showPhone);
                      }}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {showPhone ? post.user.phone : `${formatPhone(post.user.phone)} - Hiện số`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Seller Info & Phone Button */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          {/* Seller Info - Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
              {post.user?.fullName?.charAt(0) || "?"}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">{post.user?.fullName || "Người bán"}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-xs text-gray-500">Đăng {formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Phone Button - Right */}
          {post.user?.phone && (
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhone(!showPhone);
              }}
            >
              <Phone className="w-4 h-4" />
              <span>{formatPhone(post.user.phone)}</span>
              {!showPhone && <span className="text-xs">. Hiện số</span>}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    // 1. Thêm 'flex flex-col' để làm container chính
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* 2. Thêm 'flex-1' để <main> lấp đầy không gian và đẩy footer xuống */}
      <main className="flex-1 w-full">
        {/* Hero Section - Banner đẹp về xe điện */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-teal-600 mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left Side - Text Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Nền tảng xe điện hàng đầu</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  Mua bán xe điện
                  <br />
                  <span className="text-green-200">trên toàn quốc</span>
                </h1>
                
                <p className="text-lg md:text-xl text-green-50 mb-6 max-w-2xl">
                  Khám phá hàng nghìn phương tiện điện hiện đại, tiết kiệm nhiên liệu và thân thiện với môi trường
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{filteredPosts.length}</div>
                      <div className="text-sm text-green-100">Phương tiện đang bán</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Battery className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm text-green-100">Điện năng</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">✓</div>
                      <div className="text-sm text-green-100">Đã xác thực</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Visual Element */}
              <div className="hidden lg:block flex-1 max-w-md">
                <div className="relative">
                  {/* Electric Car Illustration */}
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"></div>
                    <div className="relative z-10 text-center">
                      <Car className="w-32 h-32 text-white/30 mx-auto mb-4" />
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-300" />
                        <span className="text-white font-semibold">Xe điện EcoGreen</span>
                        <Zap className="w-6 h-6 text-yellow-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm xe điện, pin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border-gray-300 focus:bg-white focus:border-green-500 shadow-sm"
            />
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-6"
            onClick={() => {}}
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Bộ lọc
          </Button>
          {(["All", "EV", "Battery"] as const).map((filter) => (
            <Badge
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filter === "All" ? "Tất cả" : filter === "EV" ? "Xe điện" : "Pin"}
            </Badge>
          ))}
          </div>

          {loading ? (
          <div className="text-center py-20 text-gray-500">
            <Zap className="w-6 h-6 mx-auto mb-2 animate-pulse" />
            Loading posts...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Zap className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No vehicles found.
          </div>
        ) : (
          <div className="space-y-0">
            {filteredPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          )}
        </div>
      </main>

      {/* 3. Thêm <Footer /> vào đây, bên ngoài <main> */}
      <Footer />
    </div>
  );
};

export default MainScreen;