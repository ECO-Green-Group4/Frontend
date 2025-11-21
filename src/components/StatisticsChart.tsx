import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AdminStatisticsService, StatisticsData } from '@/services/AdminStatisticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, FileText, Users, ShoppingCart, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { showToast } from '@/utils/toast';

const StatisticsChart = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminStatisticsService.getStatistics();
      setStatistics(data);
      console.log('Statistics loaded:', data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thống kê';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600 text-lg">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thống kê hệ thống</h2>
            <p className="text-gray-600 mt-1">Tổng quan về hoạt động của hệ thống</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <Button onClick={fetchStatistics} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  // Dữ liệu tổng hợp cho biểu đồ tổng quan
  const overviewData = [
    {
      name: 'Listings',
      value: statistics.totalListings,
      color: '#10b981',
    },
    {
      name: 'Users',
      value: statistics.totalUsers,
      color: '#3b82f6',
    },
    {
      name: 'Orders',
      value: statistics.totalOrders,
      color: '#f59e0b',
    },
    {
      name: 'Payments',
      value: statistics.totalPayments,
      color: '#8b5cf6',
    },
  ];

  // Dữ liệu chi tiết Listings
  const listingsData = [
    {
      name: 'Tổng số',
      value: statistics.totalListings,
      color: '#10b981',
    },
    {
      name: 'Đang hoạt động',
      value: statistics.activeListings,
      color: '#22c55e',
    },
    {
      name: 'Đã từ chối',
      value: statistics.rejectedListings,
      color: '#ef4444',
    },
    {
      name: 'Đang chờ',
      value: statistics.pendingListings,
      color: '#f59e0b',
    },
    {
      name: 'Đã tạm ngưng',
      value: statistics.suspendedListings,
      color: '#6b7280',
    },
  ];

  // Dữ liệu chi tiết Users
  const usersData = [
    {
      name: 'Tổng số',
      value: statistics.totalUsers,
      color: '#3b82f6',
    },
    {
      name: 'Đang hoạt động',
      value: statistics.activeUsers,
      color: '#22c55e',
    },
    {
      name: 'Không hoạt động',
      value: statistics.inactiveUsers,
      color: '#6b7280',
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-green-600 font-bold text-lg">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h2>
          <p className="text-gray-600 mt-1">Tổng quan về hoạt động của hệ thống</p>
        </div>
        <Button 
          onClick={fetchStatistics} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Listings Card */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng Listings</CardTitle>
              <FileText className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">{statistics.totalListings}</div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Hoạt động: {statistics.activeListings}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Từ chối: {statistics.rejectedListings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng Users</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.totalUsers}</div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Hoạt động: {statistics.activeUsers}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span>Không hoạt động: {statistics.inactiveUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng Orders</CardTitle>
              <ShoppingCart className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 mb-2">{statistics.totalOrders}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>Tổng số đơn hàng trong hệ thống</span>
            </div>
          </CardContent>
        </Card>

        {/* Payments Card */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng Payments</CardTitle>
              <CreditCard className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">{statistics.totalPayments}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>Tổng số giao dịch thanh toán</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Tổng quan hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {overviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Chi tiết Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {usersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Listings Chart - Full Width */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Chi tiết Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={listingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {listingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsChart;
