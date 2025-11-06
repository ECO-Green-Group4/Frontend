import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminStatisticsService, StatisticsData } from '@/services/AdminStatisticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
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
    },
    {
      name: 'Users',
      value: statistics.totalusers,
    },
    {
      name: 'Orders',
      value: statistics.totalorders,
    },
    {
      name: 'Payments',
      value: statistics.totalPayments,
    },
  ];

  // Dữ liệu chi tiết Listings
  const listingsData = [
    {
      name: 'Tổng số',
      value: statistics.totalListings,
    },
    {
      name: 'Đang hoạt động',
      value: statistics.activeListings,
    },
    {
      name: 'Đã từ chối',
      value: statistics.rejectedListings,
    },
    {
      name: 'Đang chờ',
      value: statistics.pendingListings,
    },
    {
      name: 'Đã tạm ngưng',
      value: statistics.suspendedListings,
    },
  ];

  // Dữ liệu chi tiết Users
  const usersData = [
    {
      name: 'Tổng số',
      value: statistics.totalusers,
    },
    {
      name: 'Đang hoạt động',
      value: statistics.activeUsers,
    },
    {
      name: 'Không hoạt động',
      value: statistics.inactiveUsers,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Thống kê hệ thống</h2>
        <p className="text-gray-600 mt-1">Tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.totalListings}</div>
            <div className="text-xs text-gray-500 mt-1">
              Hoạt động: {statistics.activeListings} | Từ chối: {statistics.rejectedListings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalusers}</div>
            <div className="text-xs text-gray-500 mt-1">
              Hoạt động: {statistics.activeUsers} | Không hoạt động: {statistics.inactiveUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{statistics.totalorders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.totalPayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Listings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={listingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={usersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsChart;

