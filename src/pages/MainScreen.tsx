import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "../components/ui/Header";
import { Search, Filter, Zap } from "lucide-react";

const MainScreen = () => {
  const navigate = useNavigate();
  
  type Post = {
    id?: number | string;
    title: string;
    price: number;
    imageUrl: string;
    category: "EV" | "Battery";
    description?: string;
  };

  const fetchPosts = async (): Promise<Post[]> => {
    try {
      // Gọi cả 2 API — không crash nếu battery rỗng
      const [vehicleResult, batteryResult] = await Promise.allSettled([
        api.get("/seller/listings/vehicle"),
        api.get("/seller/listings/battery"),
      ]);

      // 🔹 Hàm giúp đọc dữ liệu an toàn từ mọi kiểu response
      const safeExtract = (res: any) => {
        if (!res || typeof res !== "object") return [];
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      };

      const vehicleData =
        vehicleResult.status === "fulfilled"
          ? safeExtract(vehicleResult.value)
          : [];

      const batteryData =
        batteryResult.status === "fulfilled"
          ? safeExtract(batteryResult.value)
          : [];

      console.log("✅ Vehicle data:", vehicleData);
      console.log("✅ Battery data:", batteryData);

      // Map dữ liệu xe
      const vehicles: Post[] = vehicleData.map((item: any) => ({
        id: item.id ?? item.listingId ?? item._id,
        title: item.title ?? item.name ?? "Untitled Vehicle",
        price: Number(item.price) || 0,
        imageUrl:
          item.imageUrl ||
          item.thumbnail ||
          (Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : ""),
        category: "EV",
      }));

      // Map dữ liệu pin (nếu có)
      const batteries: Post[] = batteryData.map((item: any) => ({
        id: item.id ?? item.listingId ?? item._id,
        title: item.title ?? item.name ?? "Untitled Battery",
        price: Number(item.price) || 0,
        imageUrl:
          item.imageUrl ||
          item.thumbnail ||
          (Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : ""),
        category: "Battery",
      }));

      return [...vehicles, ...batteries];
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
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

  const filteredPosts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      const matchFilter =
        activeFilter === "All" || p.category === activeFilter;
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term);
      return matchFilter && matchSearch;
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
    return (
      <div 
        className="group rounded-xl bg-[#D6FAD7] border border-green-200 shadow-sm hover:shadow-lg transition duration-200 p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => handlePostClick(post)}
      >
        <div className="w-28 h-28 rounded-lg overflow-hidden bg-white flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {post.title}
          </h3>
          <div className="mt-2 text-lg font-bold text-green-700">
            ${new Intl.NumberFormat("en-US").format(post.price)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-gray-200 focus:bg-white focus:border-green-500"
            />
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            Search
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            className="border-black text-black hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          {(["All", "EV", "Battery"] as const).map((filter) => (
            <Badge
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer ${
                activeFilter === filter
                  ? "bg-green-600 text-white"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filter}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainScreen;
