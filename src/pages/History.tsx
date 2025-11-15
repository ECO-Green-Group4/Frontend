import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TransactionService,
  Transaction,
  TransactionFilterParams,
} from "@/services/TransactionService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/utils/toast";
import Header from "@/components/ui/Header";
import { useAuth } from "@/hooks/useAuth";
import {
  ReviewService,
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
} from "@/services/ReviewService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Wallet,
  Receipt,
  Ban,
  Star,
  MessageSquare,
} from "lucide-react";

type FilterState = {
  role: "all" | "buyer" | "seller";
  status: "all" | "SUCCESS" | "PENDING" | "CANCELLED";
  keyword: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
};

const defaultFilters: FilterState = {
  role: "all",
  status: "all",
  keyword: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

const History: React.FC = () => {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [visibleOrders, setVisibleOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<Transaction | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewTargetUserId, setReviewTargetUserId] = useState<number | null>(
    null
  );
  const [reviewTargetUserName, setReviewTargetUserName] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [userReviews, setUserReviews] = useState<Map<number, Review | null>>(
    new Map()
  );
  const { user } = useAuth();

  const currentUserId = useMemo(() => {
    if (!user?.id) return null;
    const parsed = Number(user.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [user]);

  const hasFilters = useMemo(() => {
    return (
      filters.role !== "all" ||
      filters.status !== "all" ||
      filters.keyword.trim().length > 0 ||
      filters.fromDate ||
      filters.toDate ||
      filters.minAmount ||
      filters.maxAmount
    );
  }, [filters]);

  const applyLocalFilters = useCallback(
    (
      sourceOrders: Transaction[],
      params: TransactionFilterParams
    ): Transaction[] => {
      const {
        role,
        status,
        keyword,
        fromDate,
        toDate,
        minAmount,
        maxAmount,
      } = params;

      const normalizedKeyword = keyword?.toLowerCase() ?? "";
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const inclusiveTo = to
        ? new Date(
            to.getFullYear(),
            to.getMonth(),
            to.getDate(),
            23,
            59,
            59,
            999
          )
        : null;

      return sourceOrders.filter((order) => {
        const orderStatus = order.orderStatus?.toUpperCase();
        const isBuyer = currentUserId
          ? order.buyer?.userId === currentUserId
          : true;
        const isSeller = currentUserId
          ? order.seller?.userId === currentUserId
          : true;

        const matchesRole =
          !role || role === "all"
            ? true
            : role === "buyer"
            ? isBuyer
            : isSeller;

        const matchesStatus =
          !status || status === "all"
            ? true
            : orderStatus === status.toUpperCase();

        const matchesKeyword =
          normalizedKeyword.length === 0
            ? true
            : [
                order.listingTitle,
                order.orderId?.toString(),
                order.listingId?.toString(),
                order.buyer?.fullName,
                order.seller?.fullName,
                order.buyer?.email,
                order.seller?.email,
              ]
                .filter(Boolean)
                .some((value) =>
                  String(value).toLowerCase().includes(normalizedKeyword)
                );

        const orderDate = order.orderDate
          ? new Date(order.orderDate)
          : null;

        const matchesFromDate =
          !from || !orderDate ? true : orderDate >= from;
        const matchesToDate =
          !inclusiveTo || !orderDate ? true : orderDate <= inclusiveTo;

        const matchesMinAmount =
          minAmount === undefined || minAmount === null
            ? true
            : (order.totalAmount ?? 0) >= minAmount;

        const matchesMaxAmount =
          maxAmount === undefined || maxAmount === null
            ? true
            : (order.totalAmount ?? 0) <= maxAmount;

        return (
          matchesRole &&
          matchesStatus &&
          matchesKeyword &&
          matchesFromDate &&
          matchesToDate &&
          matchesMinAmount &&
          matchesMaxAmount
        );
      });
    },
    [currentUserId]
  );

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const history = await TransactionService.getHistory();
        setOrders(history);
        setVisibleOrders(history);
      } catch (error: any) {
        showToast(
          error?.message || "Không thể tải lịch sử giao dịch",
          "error"
        );
        setOrders([]);
        setVisibleOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Load reviews for all orders
  useEffect(() => {
    const loadReviews = async () => {
      if (!currentUserId || visibleOrders.length === 0) return;

      const reviewMap = new Map<number, Review | null>();
      const promises = visibleOrders.map(async (order) => {
        try {
          const review = await ReviewService.getMyReviewByOrder(order.orderId);
          reviewMap.set(order.orderId, review);
        } catch (error) {
          // Silently fail - review might not exist
          reviewMap.set(order.orderId, null);
        }
      });

      await Promise.all(promises);
      setUserReviews(reviewMap);
    };

    loadReviews();
  }, [visibleOrders, currentUserId]);

  const handleFilter = async () => {
    const params: TransactionFilterParams = {};
    if (filters.role !== "all") {
      params.role = filters.role;
    }
    if (filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.keyword.trim()) {
      params.keyword = filters.keyword.trim();
    }
    if (filters.fromDate) {
      params.fromDate = filters.fromDate;
    }
    if (filters.toDate) {
      params.toDate = filters.toDate;
    }
    if (filters.minAmount) {
      const minAmount = Number(filters.minAmount);
      if (!Number.isNaN(minAmount)) {
        params.minAmount = minAmount;
      }
    }
    if (filters.maxAmount) {
      const maxAmount = Number(filters.maxAmount);
      if (!Number.isNaN(maxAmount)) {
        params.maxAmount = maxAmount;
      }
    }

    setFilterLoading(true);
    try {
      let baseData = orders;
      // thử gọi API filter nếu có params, fallback về data cục bộ
      if (Object.keys(params).length === 0) {
        baseData = orders;
      } else {
        try {
          const remote = await TransactionService.filterHistory(params);
          baseData = remote;
        } catch {
          baseData = orders;
        }
      }

      const filtered = applyLocalFilters(baseData, params);
      setVisibleOrders(filtered);
      if (Object.keys(params).length === 0) {
        setOrders(baseData);
      }
    } catch (error: any) {
      showToast(
        error?.message || "Không thể lọc lịch sử giao dịch",
        "error"
      );
    } finally {
      setFilterLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setVisibleOrders(orders);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setDetailData(null);
      setDetailOrderId(null);
      setDetailError(null);
      setDetailLoading(false);
    }
  };

  const handleViewDetail = async (orderId: number) => {
    setDetailOrderId(orderId);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await TransactionService.getDetail(orderId);
      setDetailData(data);
    } catch (error: any) {
      const message =
        error?.message || "Không thể lấy thông tin chi tiết giao dịch";
      setDetailError(message);
      showToast(message, "error");
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenReview = async (order: Transaction) => {
    if (!currentUserId) {
      showToast("Vui lòng đăng nhập để đánh giá", "error");
      return;
    }

    const isBuyer = Number(order.buyer?.userId) === Number(currentUserId);
    const isSeller = Number(order.seller?.userId) === Number(currentUserId);

    if (!isBuyer && !isSeller) {
      showToast("Bạn không thể đánh giá đơn hàng này", "error");
      return;
    }

    const targetUser = isBuyer ? order.seller : order.buyer;
    if (!targetUser?.userId) {
      showToast("Không tìm thấy thông tin người dùng", "error");
      return;
    }

    setReviewOrderId(order.orderId);
    setReviewTargetUserId(targetUser.userId);
    setReviewTargetUserName(targetUser.fullName || "Người dùng");
    setReviewOpen(true);
    setReviewLoading(true);

    try {
      const existingReview = await ReviewService.getMyReviewByOrder(
        order.orderId
      );
      if (existingReview) {
        setReviewRating(existingReview.rating);
        setReviewComment(existingReview.comment || "");
      } else {
        setReviewRating(5);
        setReviewComment("");
      }
    } catch (error) {
      setReviewRating(5);
      setReviewComment("");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
    setReviewOrderId(null);
    setReviewTargetUserId(null);
    setReviewTargetUserName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewOrderId || !reviewTargetUserId || !currentUserId) {
      showToast("Thông tin không hợp lệ", "error");
      return;
    }

    if (reviewComment.trim().length === 0) {
      showToast("Vui lòng nhập bình luận", "error");
      return;
    }

    setReviewSubmitting(true);

    try {
      const existingReview = userReviews.get(reviewOrderId);

      if (existingReview) {
        // Update existing review
        const payload: UpdateReviewPayload = {
          rating: reviewRating,
          comment: reviewComment.trim(),
        };
        await ReviewService.updateReview(existingReview.reviewId, payload);
        showToast("Cập nhật đánh giá thành công", "success");
      } else {
        // Create new review
        const payload: CreateReviewPayload = {
          orderId: reviewOrderId,
          targetUserId: reviewTargetUserId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        };
        await ReviewService.createReview(payload);
        showToast("Đánh giá thành công", "success");
      }

      // Reload review
      const updatedReview = await ReviewService.getMyReviewByOrder(
        reviewOrderId
      );
      setUserReviews((prev) => {
        const newMap = new Map(prev);
        newMap.set(reviewOrderId, updatedReview);
        return newMap;
      });

      handleCloseReview();
    } catch (error: any) {
      showToast(
        error?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const canReview = (order: Transaction): boolean => {
    if (!currentUserId) return false;
    const status = order.orderStatus?.toUpperCase();
    // Allow review for SUCCESS, COMPLETED, or any completed status
    return status === "SUCCESS" || status === "COMPLETED" || status === "COMPLETE";
  };

  const getMyReview = (orderId: number): Review | null => {
    return userReviews.get(orderId) || null;
  };

  const isUserInOrder = (order: Transaction): boolean => {
    if (!currentUserId) return false;
    const buyerId = order.buyer?.userId;
    const sellerId = order.seller?.userId;
    // Compare as numbers to handle both string and number IDs
    return (
      Number(buyerId) === Number(currentUserId) ||
      Number(sellerId) === Number(currentUserId)
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const formatText = (
    value?: string | number | null,
    fallback: string = "Không có"
  ) => {
    if (value === undefined || value === null) return fallback;
    const text = typeof value === "string" ? value : String(value);
    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  };

  const summary = useMemo(() => {
    if (orders.length === 0) {
      return {
        total: 0,
        success: 0,
        pending: 0,
        cancelled: 0,
        volume: 0,
      };
    }

    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc.volume += order.totalAmount || 0;
        const status = order.orderStatus?.toUpperCase();
        if (status === "SUCCESS") acc.success += 1;
        if (status === "PENDING") acc.pending += 1;
        if (status === "CANCELLED") acc.cancelled += 1;
        return acc;
      },
      {
        total: 0,
        success: 0,
        pending: 0,
        cancelled: 0,
        volume: 0,
      }
    );
  }, [orders]);

  const statusColorMap: Record<string, string> = {
    SUCCESS: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
    CANCELLED: "bg-rose-100 text-rose-700 border border-rose-200",
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    const normalized = status.toUpperCase();
    const className =
      statusColorMap[normalized] ||
      "bg-slate-100 text-slate-600 border border-slate-200";

    return (
      <Badge className={`rounded-full px-3 py-1 text-xs ${className}`}>
        {normalized}
      </Badge>
    );
  };

  const renderPaymentBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;

    const normalized = paymentStatus.toUpperCase();
    let className = "bg-slate-200 text-slate-700";

    if (normalized === "PAID" || normalized === "SUCCESS") {
      className = "bg-emerald-100 text-emerald-600";
    } else if (normalized === "PENDING") {
      className = "bg-amber-100 text-amber-600";
    } else if (normalized === "FAILED" || normalized === "CANCELLED") {
      className = "bg-rose-100 text-rose-600";
    }

    return (
      <Badge className={`rounded-full px-3 py-1 text-xs ${className}`}>
        {normalized}
      </Badge>
    );
  };

  const EmptyState = () => (
    <Card className="border-dashed border-emerald-300 bg-white/90 text-center shadow-lg backdrop-blur">
      <CardContent className="py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-500">
          <Receipt className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-slate-800">
          Chưa có giao dịch nào
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Khi bạn trở thành buyer hoặc seller của một đơn hàng, lịch sử sẽ hiển thị tại đây.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
          onClick={handleFilter}
        >
          Làm mới dữ liệu
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 pb-20">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 sm:px-8">
        <header className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 shadow-sm">
                <Wallet className="h-4 w-4 text-white" />
                Transaction Hub
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Lịch sử giao dịch của bạn
              </h1>
              <p className="mt-4 max-w-2xl text-base text-emerald-100 md:text-lg">
                Theo dõi toàn bộ đơn hàng bạn từng tham gia với vai trò buyer hoặc seller. Bộ lọc linh hoạt giúp bạn tìm kiếm nhanh chi tiết giao dịch.
              </p>
            </div>
            <Button
              className="group flex items-center gap-2 self-start rounded-full border border-white/60 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={handleFilter}
            >
              <RefreshCcw className="h-4 w-4 transition group-hover:rotate-180" />
              Làm mới
            </Button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-emerald-200/40 bg-white/85 shadow-xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Tổng số giao dịch</CardDescription>
              <CardTitle className="text-3xl text-emerald-600">
                {summary.total}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Bao gồm cả buyer và seller.
            </CardContent>
          </Card>

          <Card className="border-emerald-200/40 bg-white/85 shadow-xl backdrop-blur xl:col-span-2">
            <CardHeader className="pb-2">
              <CardDescription>Tổng giá trị giao dịch</CardDescription>
              <CardTitle className="text-3xl text-emerald-600">
                {formatCurrency(summary.volume)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Đã bao gồm phí hoa hồng.
            </CardContent>
          </Card>

          <Card className="border-emerald-200/40 bg-white/85 shadow-xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Mức lọc hiện tại</CardDescription>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                <Filter className="h-5 w-5" />
                {hasFilters ? "Đã áp dụng" : "Không áp dụng"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              {hasFilters
                ? "Kết quả đang hiển thị theo bộ lọc bạn chọn."
                : "Hiển thị tất cả lịch sử của bạn."}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-emerald-300/60 bg-white p-6 shadow-2xl backdrop-blur">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-emerald-700">
            <Filter className="h-5 w-5" />
            Bộ lọc giao dịch
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kết hợp nhiều tiêu chí để tìm kiếm đơn hàng một cách nhanh chóng.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Vai trò của bạn
              </label>
              <Select
                value={filters.role}
                onValueChange={(value: FilterState["role"]) =>
                  setFilters((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Trạng thái đơn hàng
              </label>
              <Select
                value={filters.status}
                onValueChange={(value: FilterState["status"]) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Tìm kiếm từ khóa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tên listing, mã đơn hàng, người dùng..."
                  className="pl-9"
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      keyword: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Từ ngày
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={filters.fromDate}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        fromDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Đến ngày
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={filters.toDate}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        toDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Giá trị tối thiểu (VND)
                </label>
                <Input
                  type="number"
                  placeholder="vd: 10000000"
                  value={filters.minAmount}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      minAmount: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Giá trị tối đa (VND)
                </label>
                <Input
                  type="number"
                  placeholder="vd: 50000000"
                  value={filters.maxAmount}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxAmount: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleFilter}
              className="flex items-center gap-2 bg-emerald-600 px-6 hover:bg-emerald-500"
              disabled={filterLoading}
            >
              {filterLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Áp dụng bộ lọc
            </Button>
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              onClick={handleResetFilters}
              disabled={filterLoading}
            >
              <Ban className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </section>

        <section className="grid gap-6">
          <h2 className="text-2xl font-semibold text-white">
            Kết quả giao dịch
          </h2>
          {loading ? (
            <Card className="border-emerald-200/40 bg-white/85 shadow-xl backdrop-blur">
              <CardContent className="flex items-center justify-center gap-3 py-16 text-emerald-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                Đang tải lịch sử giao dịch...
              </CardContent>
            </Card>
          ) : visibleOrders.length === 0 ? (
            <EmptyState />
          ) : (
            visibleOrders.map((order) => (
              <Card
                key={order.orderId}
                className="border-emerald-200/40 bg-white/90 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl text-emerald-700">
                      {order.listingTitle}
                    </CardTitle>
                    <CardDescription>
                      Mã đơn #{order.orderId} • {formatDate(order.orderDate)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatusBadge(order.orderStatus)}
                    {order.payment?.paymentStatus &&
                      renderPaymentBadge(order.payment.paymentStatus)}
                    <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {order.itemType?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-500">
                        Buyer
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {order.buyer?.fullName}
                      </p>
                      <p className="text-xs text-emerald-500">
                        {order.buyer?.email}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                      <p className="text-xs uppercase tracking-wide text-sky-500">
                        Seller
                      </p>
                      <p className="mt-1 text-sm font-semibold text-sky-700">
                        {order.seller?.fullName}
                      </p>
                      <p className="text-xs text-sky-500">
                        {order.seller?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Giá niêm yết
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-700">
                        {formatCurrency(order.basePrice)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Phí hoa hồng: {formatCurrency(order.commissionFee)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Tổng thanh toán
                      </p>
                      <p className="mt-1 text-lg font-semibold text-emerald-600">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {order.payment && (
                        <p className="text-xs text-slate-400">
                          Cổng: {order.payment.paymentGateway}
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Hợp đồng
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-700">
                        {order.contract?.contractStatus || "N/A"}
                      </p>
                      {order.contract?.signedAt && (
                        <p className="text-xs text-slate-400">
                          Ký ngày: {formatDate(order.contract.signedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const userInOrder = isUserInOrder(order);
                    
                    // If user is not buyer or seller, only show if there are other reviews
                    if (!userInOrder) {
                      if (order.reviews && order.reviews.length > 0) {
                        return (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                            <p className="text-xs uppercase tracking-wide text-emerald-600">
                              Đánh giá
                            </p>
                            <p className="mt-2 text-sm text-emerald-700">
                              Đơn hàng có {order.reviews.length} đánh giá. Bạn có thể xem trực tiếp trong phần quản lý review.
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }

                    // User is buyer or seller - ALWAYS show review section
                    const myReview = getMyReview(order.orderId);
                    const canReviewOrder = canReview(order);

                    // User has already reviewed
                    if (myReview) {
                      return (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs uppercase tracking-wide text-emerald-600 mb-2">
                                Đánh giá của bạn
                              </p>
                              <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= myReview.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-semibold text-emerald-700">
                                  {myReview.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-emerald-700">
                                {myReview.comment}
                              </p>
                              <p className="text-xs text-emerald-500 mt-2">
                                {formatDate(myReview.createdAt)}
                              </p>
                            </div>
                            {canReviewOrder && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleOpenReview(order)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Sửa
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // User hasn't reviewed yet but can review
                    if (canReviewOrder) {
                      return (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-amber-600 mb-1">
                                Bạn chưa đánh giá
                              </p>
                              <p className="text-sm text-amber-700">
                                Hãy chia sẻ trải nghiệm của bạn về giao dịch này
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="border-amber-400 text-amber-600 hover:bg-amber-50"
                              onClick={() => handleOpenReview(order)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Đánh giá
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    // Order not completed yet, but user is in order - ALWAYS show this
                    return (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-600 mb-1">
                          Đánh giá
                        </p>
                        <p className="text-sm text-slate-700">
                          Bạn có thể đánh giá sau khi đơn hàng hoàn thành.
                        </p>
                      </div>
                    );
                  })()}

                  <div className="flex justify-end gap-2">
                    {canReview(order) &&
                      isUserInOrder(order) &&
                      !getMyReview(order.orderId) && (
                        <Button
                          variant="outline"
                          className="border-amber-400 text-amber-600 hover:bg-amber-50"
                          onClick={() => handleOpenReview(order)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Đánh giá
                        </Button>
                      )}
                    <Button
                      variant="outline"
                      className="border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleViewDetail(order.orderId)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <Dialog open={detailOpen} onOpenChange={handleDetailOpenChange}>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-emerald-700">
                Chi tiết giao dịch #{detailOrderId ?? ""}
              </DialogTitle>
              <DialogDescription>
                Toàn bộ thông tin về trạng thái đơn hàng, thanh toán và hợp đồng.
              </DialogDescription>
            </DialogHeader>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-3 py-12 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải chi tiết đơn hàng...
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detailError}
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Thông tin chung
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-800">
                      {detailData.listingTitle}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {renderStatusBadge(detailData.orderStatus)}
                      {detailData.payment?.paymentStatus &&
                        renderPaymentBadge(detailData.payment.paymentStatus)}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Ngày tạo: {formatDate(detailData.orderDate)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Loại sản phẩm:{" "}
                      <span className="font-medium uppercase text-slate-700">
                        {detailData.itemType}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">
                      Tài chính
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Giá niêm yết:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(detailData.basePrice)}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Phí hoa hồng:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(detailData.commissionFee)}
                      </span>
                    </p>
                    <p className="text-sm text-emerald-700">
                      Tổng thanh toán:{" "}
                      <span className="font-semibold">
                        {formatCurrency(detailData.totalAmount)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-500">
                      Buyer
                    </p>
                    <p className="mt-1 text-base font-semibold text-emerald-700">
                      {formatText(detailData.buyer?.fullName, "Không xác định")}
                    </p>
                    <p className="text-sm text-slate-500">
                      Email: {formatText(detailData.buyer?.email, "Không có")}
                    </p>
                    <p className="text-sm text-slate-500">
                      SĐT: {formatText(detailData.buyer?.phone)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-sky-500">
                      Seller
                    </p>
                    <p className="mt-1 text-base font-semibold text-sky-700">
                      {formatText(detailData.seller?.fullName, "Không xác định")}
                    </p>
                    <p className="text-sm text-slate-500">
                      Email: {formatText(detailData.seller?.email, "Không có")}
                    </p>
                    <p className="text-sm text-slate-500">
                      SĐT: {formatText(detailData.seller?.phone)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Thanh toán
                    </p>
                    {detailData.payment ? (
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <p>
                          Mã thanh toán:{" "}
                          <span className="font-medium text-slate-800">
                            #{detailData.payment.paymentId}
                          </span>
                        </p>
                        <p>
                          Cổng thanh toán: {detailData.payment.paymentGateway}
                        </p>
                        <p>
                          Số tiền:{" "}
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(detailData.payment.amount)}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span>Trạng thái:</span>
                          {renderPaymentBadge(detailData.payment.paymentStatus)}
                        </div>
                        <p>
                          Ngày thanh toán: {formatDate(detailData.payment.paymentDate)}
                        </p>
                        <p>Loại: {detailData.payment.paymentType ?? "N/A"}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        Chưa có thông tin thanh toán.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Hợp đồng
                    </p>
                    {detailData.contract ? (
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <p>
                          Mã hợp đồng:{" "}
                          <span className="font-medium text-slate-800">
                            #{detailData.contract.contractId}
                          </span>
                        </p>
                        <p>
                          Trạng thái:{" "}
                          {formatText(
                            detailData.contract.contractStatus,
                            "Không xác định"
                          )}
                        </p>
                        <p>
                          Seller ký:{" "}
                          {formatText(
                            detailData.contract.sellerSigned,
                            "Chưa ký"
                          )}
                        </p>
                        <p>
                          Buyer ký:{" "}
                          {formatText(
                            detailData.contract.buyerSigned,
                            "Chưa ký"
                          )}
                        </p>
                        <p>Ngày ký: {formatDate(detailData.contract.signedAt)}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        Chưa có thông tin hợp đồng.
                      </p>
                    )}
                  </div>
                </div>

                {detailData.reviews && detailData.reviews.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">
                      Đánh giá
                    </p>
                    <p className="mt-2 text-sm text-emerald-700">
                      Đơn hàng có {detailData.reviews.length} đánh giá liên quan. Vào phần Review để xem chi tiết.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Không có dữ liệu để hiển thị.
              </p>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={reviewOpen} onOpenChange={handleCloseReview}>
          <DialogContent className="w-[95vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-emerald-700">
                {userReviews.get(reviewOrderId || 0)
                  ? "Cập nhật đánh giá"
                  : "Đánh giá giao dịch"}
              </DialogTitle>
              <DialogDescription>
                Chia sẻ trải nghiệm của bạn về{" "}
                <span className="font-semibold">{reviewTargetUserName}</span>
              </DialogDescription>
            </DialogHeader>

            {reviewLoading ? (
              <div className="flex items-center justify-center gap-3 py-12 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-slate-700">
                    Đánh giá (sao)
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-semibold text-slate-600">
                      {reviewRating}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="review-comment"
                    className="text-base font-semibold text-slate-700"
                  >
                    Bình luận
                  </Label>
                  <Textarea
                    id="review-comment"
                    placeholder="Chia sẻ trải nghiệm của bạn về giao dịch này..."
                    className="min-h-[120px] resize-none"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    {reviewComment.length} ký tự
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseReview}
                    disabled={reviewSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || reviewComment.trim().length === 0}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : userReviews.get(reviewOrderId || 0) ? (
                      "Cập nhật"
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;
