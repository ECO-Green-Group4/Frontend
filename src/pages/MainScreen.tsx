import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import FavoriteService from "../services/FavoriteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "../components/ui/Header";
import Footer from "../components/Footer";
import VIPBadge from "../components/VIPBadge";
import VehiclePostCard from "../components/VehiclePostCard";
import { Search, Filter, Zap, MapPin, Car, Calendar, Camera, CheckCircle2, Phone, Heart, Star, Battery, Users, Gauge, Building2, ShieldCheck, Activity, Sparkles, TrendingUp, Award, Loader2, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

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
  
  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Filter values
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]); // 0 - 1 tỷ
  const [yearRange, setYearRange] = useState<[number, number]>([2015, new Date().getFullYear() + 1]);
  const [mileageRange, setMileageRange] = useState<[number, number]>([0, 500000]); // 0 - 500k km
  const [batteryCapacityRange, setBatteryCapacityRange] = useState<[number, number]>([0, 200]); // 0 - 200 kWh
  const [brandFilter, setBrandFilter] = useState<string>(""); // Input field for brand
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    // VIP Kim Cương (Diamond) - Highest priority
    if (normalized.includes("diamond") || normalized.includes("kim cương") || normalized.includes("kimcuong")) {
      return 1;
    }
    // VIP Vàng (Gold)
    if (normalized.includes("gold") || normalized.includes("vàng") || normalized.includes("vang")) {
      return 2;
    }
    // VIP Bạc (Silver)
    if (normalized.includes("silver") || normalized.includes("bạc") || normalized.includes("bac")) {
      return 3;
    }
    return 999; // Non-VIP or unknown
  };

  const filteredPosts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const filtered = posts.filter((p) => {
      // Category filter
      const matchFilter =
        activeFilter === "All" || p.category === activeFilter;
      
      // Search filter
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        (p.brand?.toLowerCase().includes(term)) ||
        (p.model?.toLowerCase().includes(term));
      
      // Price filter
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      
      // Year filter
      const matchYear = !p.year || (p.year >= yearRange[0] && p.year <= yearRange[1]);
      
      // Mileage filter
      const matchMileage = !p.mileage || (p.mileage >= mileageRange[0] && p.mileage <= mileageRange[1]);
      
      // Battery capacity filter
      let matchBattery = true;
      if (batteryCapacityRange[0] > 0 || batteryCapacityRange[1] < 200) {
        const batteryCapacity = p.batteryCapacity ? parseFloat(p.batteryCapacity) : (p.capacity ? parseFloat(p.capacity) : 0);
        matchBattery = batteryCapacity >= batteryCapacityRange[0] && batteryCapacity <= batteryCapacityRange[1];
      }
      
      // Brand filter
      const matchBrand = !brandFilter.trim() || 
        (p.brand?.toLowerCase().includes(brandFilter.toLowerCase()) ||
         p.batteryBrand?.toLowerCase().includes(brandFilter.toLowerCase()) ||
         p.model?.toLowerCase().includes(brandFilter.toLowerCase()));
      
      return matchFilter && matchSearch && matchPrice && matchYear && matchMileage && matchBattery && matchBrand;
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
  }, [posts, activeFilter, searchQuery, priceRange, yearRange, mileageRange, batteryCapacityRange, brandFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, priceRange, yearRange, mileageRange, batteryCapacityRange, brandFilter]);

  const handlePostClick = (post: Post) => {
    console.log("🖱️ Click vào post:", post);
    if (post.category === "EV") {
      navigate(`/description-ev/${post.id}`);
    } else if (post.category === "Battery") {
      navigate(`/description-battery/${post.id}`);
    }
  };

  // Loading Skeleton Component
  function PostCardSkeleton() {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden mb-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
          <div className="lg:col-span-2">
            <div className="w-full bg-gray-200 rounded-2xl mb-3" style={{ aspectRatio: "16/10" }}></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
            <div className="h-20 bg-gray-100 rounded-xl mb-4"></div>
            <div className="flex gap-3 mt-auto">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-32 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full relative">
        {/* Enhanced Hero Section with Parallax Effect */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 via-teal-600 to-cyan-600 mb-16">
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-emerald-600/50 to-teal-600/0 animate-pulse"></div>
          
          {/* Floating Particles Background */}
          <div className="absolute inset-0 overflow-hidden">
            {useMemo(() => [...Array(20)].map((_, i) => {
              const positions = [
                { left: "10%", top: "20%", delay: "0s", duration: "4s" },
                { left: "20%", top: "60%", delay: "0.5s", duration: "5s" },
                { left: "30%", top: "40%", delay: "1s", duration: "6s" },
                { left: "40%", top: "80%", delay: "1.5s", duration: "4.5s" },
                { left: "50%", top: "30%", delay: "2s", duration: "5.5s" },
                { left: "60%", top: "70%", delay: "0.3s", duration: "6.5s" },
                { left: "70%", top: "25%", delay: "0.8s", duration: "4s" },
                { left: "80%", top: "55%", delay: "1.2s", duration: "5s" },
                { left: "15%", top: "75%", delay: "0.6s", duration: "6s" },
                { left: "25%", top: "15%", delay: "1.8s", duration: "4.5s" },
                { left: "35%", top: "65%", delay: "0.4s", duration: "5.5s" },
                { left: "45%", top: "35%", delay: "1.1s", duration: "6s" },
                { left: "55%", top: "85%", delay: "0.9s", duration: "4s" },
                { left: "65%", top: "45%", delay: "1.3s", duration: "5.5s" },
                { left: "75%", top: "20%", delay: "0.7s", duration: "6s" },
                { left: "85%", top: "60%", delay: "1.6s", duration: "4.5s" },
                { left: "5%", top: "50%", delay: "0.2s", duration: "5s" },
                { left: "90%", top: "35%", delay: "1.4s", duration: "6.5s" },
                { left: "12%", top: "90%", delay: "0.1s", duration: "4s" },
                { left: "95%", top: "75%", delay: "1.7s", duration: "5s" }
              ];
              const pos = positions[i] || { left: "50%", top: "50%", delay: "0s", duration: "4s" };
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    animationDelay: pos.delay,
                    animationDuration: pos.duration
                  }}
                ></div>
              );
            }), [])}
          </div>

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              animation: "slide 20s linear infinite"
            }}></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-white/25 backdrop-blur-xl rounded-full text-white text-sm font-bold shadow-2xl border border-white/40 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Nền tảng xe điện hàng đầu Việt Nam</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                
                {/* Main Heading with Gradient */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
                  <span className="block">Mua bán</span>
                  <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl" style={{
                    backgroundSize: "200% auto",
                    animation: "gradient 3s linear infinite"
                  }}>
                    xe điện
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2">trên toàn quốc</span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-green-50/95 mb-10 max-w-2xl font-medium leading-relaxed">
                  Khám phá hàng nghìn phương tiện điện hiện đại, tiết kiệm nhiên liệu và thân thiện với môi trường
                </p>
                
                {/* Enhanced Stats Cards */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-white">
                  <div className="group flex items-center gap-4 bg-white/15 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/30 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Car className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-4xl font-black">{filteredPosts.length}+</div>
                      <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Phương tiện</div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-4 bg-white/15 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/30 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Battery className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-4xl font-black">100%</div>
                      <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Điện năng</div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-4 bg-white/15 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/30 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-4xl font-black">✓</div>
                      <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Đã xác thực</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Enhanced Visual Element */}
              <div className="hidden lg:block flex-1 max-w-xl">
                <div className="relative">
                  {/* Glowing Orb Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative w-full h-96 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/40 shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500"></div>
                    <div className="relative z-10 text-center transform -rotate-3 hover:-rotate-6 transition-transform duration-500">
                      <div className="relative">
                        <Car className="w-48 h-48 text-white/50 mx-auto mb-8 drop-shadow-2xl animate-bounce-slow" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-full border-2 border-white/40 shadow-2xl">
                        <Zap className="w-7 h-7 text-yellow-300 animate-pulse" />
                        <span className="text-white font-black text-xl">Xe điện EcoGreen</span>
                        <Zap className="w-7 h-7 text-yellow-300 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Bottom Wave with Gradient */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-20 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(249, 250, 251)" />
                  <stop offset="50%" stopColor="rgb(243, 244, 246)" />
                  <stop offset="100%" stopColor="rgb(249, 250, 251)" />
                </linearGradient>
              </defs>
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="url(#waveGradient)"></path>
            </svg>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 -mt-8 relative z-10">
          {/* Floating Search Bar with Glassmorphism */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6 lg:p-8 mb-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 w-6 h-6 transition-colors" />
                <Input
                  placeholder="🔍 Tìm kiếm xe điện, pin, model, thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-5 py-7 text-base lg:text-lg bg-gray-50/80 border-2 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 shadow-sm rounded-2xl transition-all duration-300 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Search automatically on Enter
                    }
                  }}
                />
              </div>
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-7 text-base lg:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                onClick={() => {}}
              >
                <Search className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Enhanced Filter Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Button
              variant="outline"
              onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              className={`border-2 ${
                showFilterSidebar 
                  ? "border-green-500 bg-green-50 text-green-700" 
                  : "border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-500"
              } flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <SlidersHorizontal className="w-5 h-5" /> 
              <span className="hidden sm:inline">Bộ lọc</span>
            </Button>
            {(["All", "EV", "Battery"] as const).map((filter, index) => (
              <Badge
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-6 py-3 text-sm lg:text-base font-bold transition-all duration-300 rounded-xl shadow-md transform hover:scale-110 active:scale-95 ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-xl scale-110 ring-4 ring-green-500/30"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-green-400 hover:shadow-lg"
                }`}
                style={{
                  animation: activeFilter === filter ? "pulse 2s infinite" : "none"
                }}
              >
                {filter === "All" ? "✨ Tất cả" : filter === "EV" ? "🚗 Xe điện" : "🔋 Pin"}
              </Badge>
            ))}
          </div>

          {/* Content Area - Full Width Layout */}
          <div className="flex gap-6 relative">
            {/* Posts List - Full Width */}
            <div className="w-full min-w-0">
          {loading ? (
            <div className="space-y-6 pb-8">
              {[...Array(3)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 text-red-800 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-xl mb-1">Có lỗi xảy ra</p>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-2xl">
                    <Car className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Search className="w-6 h-6 text-yellow-800" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-800 mb-3">Không tìm thấy phương tiện</p>
                  <p className="text-gray-600 mb-8 text-lg">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("All");
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span>🔄 Xóa bộ lọc</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-12">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-base lg:text-lg text-gray-700 font-bold">
                    Tìm thấy <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{filteredPosts.length}</span> phương tiện
                    {filteredPosts.length > itemsPerPage && (
                      <span className="ml-2 text-sm text-gray-500 font-normal">
                        (Trang {currentPage} / {totalPages})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {currentPosts.map((p, index) => (
                <div
                  key={p.id}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <VehiclePostCard post={p} />
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1) ||
                        (currentPage <= 3 && page <= 5) ||
                        (currentPage >= totalPages - 2 && page >= totalPages - 4)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] px-3 py-2 ${
                              currentPage === page
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg scale-105"
                                : "border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700"
                            } transition-all duration-300 transform hover:scale-110 active:scale-95`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainScreen;