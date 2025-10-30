import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/ui/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, CheckCircle2, Package, CreditCard, KeyRound, PenLine } from 'lucide-react';
import api from '@/services/axios';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/hooks/useAuth';

interface ContractDetailData {
  contractId: number;
  orderId: number;
  status: string;
  sellerSigned: boolean;
  buyerSigned: boolean;
  signedAt: string;
  createdAt: string;
  buyerId?: number;
  sellerId?: number;
  addons?: Array<{
    id: number;
    contractId: number;
    serviceId: number;
    serviceName: string;
    fee: number;
    createdAt: string;
    paymentStatus: string;
  }>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  const statusColors: Record<string, string> = {
    'DRAFT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'PENDING': 'bg-blue-100 text-blue-800 border-blue-300',
    'SIGNED': 'bg-green-100 text-green-800 border-green-300',
    'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
  };
  const color = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  return <Badge className={color}>{status}</Badge>;
};

const ContractDetail: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ContractDetailData | null>(null);
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [autoRole, setAutoRole] = useState<'buyer' | 'seller' | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [signing, setSigning] = useState(false);
  const [payingAddon, setPayingAddon] = useState(false);

  // Helper: normalize many id shapes to a comparable string
  const normalizeId = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const num = Number(val);
    if (!isNaN(num)) return String(num);
    if (typeof val === 'string' && val.trim().length > 0) return val.trim();
    return null;
  };

  const fetchDetail = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/contract/contractDetails/${contractId}`);
        const data = res.data?.data || res.data;
        setDetail(data as ContractDetailData);
      } catch (err: any) {
        console.error('Error loading contract detail:', err);
        setError('Không thể tải chi tiết hợp đồng');
        showToast('Không thể tải chi tiết hợp đồng', 'error');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchDetail();
  }, [contractId]);

  // Auto-detect role based on current user vs contract buyer/seller
  useEffect(() => {
    if (detail && (user?.id || (user as any)?.userId)) {
      const currentUserId = normalizeId((user as any)?.userId ?? user?.id);
      // Hỗ trợ nhiều tên field từ backend khác nhau
      const buyerFromApi: any =
        (detail as any).buyerId ?? (detail as any).buyer_id ?? (detail as any).buyer?.id ?? (detail as any).buyer?.userId ??
        (detail as any).order?.buyer?.id ?? (detail as any).order?.buyer?.userId ?? (detail as any).order?.buyer_id;
      const sellerFromApi: any =
        (detail as any).sellerId ?? (detail as any).seller_id ?? (detail as any).seller?.id ?? (detail as any).seller?.userId ??
        (detail as any).order?.seller?.id ?? (detail as any).order?.seller?.userId ?? (detail as any).order?.seller_id;

      const buyerId = normalizeId(buyerFromApi);
      const sellerId = normalizeId(sellerFromApi);

      console.log('[ContractDetail] Detect role:', { currentUserId, buyerId, sellerId, detail });

      if (currentUserId && buyerId && currentUserId === buyerId) {
        setUserType('buyer');
        setAutoRole('buyer');
      } else if (currentUserId && sellerId && currentUserId === sellerId) {
        setUserType('seller');
        setAutoRole('seller');
      } else {
        setAutoRole(null);
      }
    }
  }, [detail, user]);

  const handleSendOtp = async () => {
    if (!contractId) return;
    try {
      setSendingOtp(true);
      const res = await api.post(`/contract/${contractId}/otp`);
      const code = res.data?.data || res.data;
      showToast('Đã gửi OTP. Vui lòng kiểm tra email của bạn.', 'success');
      if (typeof code === 'string') setOtp(code);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      showToast('Gửi OTP thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSign = async () => {
    if (!contractId) return;
    if (!otp || otp.trim().length === 0) {
      showToast('Vui lòng nhập OTP', 'error');
      return;
    }
    try {
      setSigning(true);
      await api.post('/contract/sign', {
        contractId: Number(contractId),
        otp: otp.trim(),
        userType,
      });
      showToast('Ký hợp đồng thành công', 'success');
      setOtp('');
      await fetchDetail();
    } catch (err: any) {
      console.error('Sign contract error:', err);
      showToast('Ký hợp đồng thất bại. Vui lòng kiểm tra OTP và thử lại.', 'error');
    } finally {
      setSigning(false);
    }
  };

  const handleAddonVnpayPayment = async () => {
    if (!contractId) return;
    try {
      setPayingAddon(true);
      const res = await api.post(`/payments/contract/${contractId}/addons/vnpay`);
      const data = res.data?.data || res.data;
      const paymentUrl = data?.paymentUrl || data?.gatewayResponse?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showToast('Không nhận được paymentUrl từ server', 'error');
      }
    } catch (err: any) {
      console.error('Create addon VNPAY payment error:', err);
      showToast('Tạo thanh toán dịch vụ thất bại', 'error');
    } finally {
      setPayingAddon(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết hợp đồng</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Đang tải chi tiết...</div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-10 text-red-600">{error}</CardContent>
          </Card>
        ) : detail ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Contract #{detail.contractId}
                  {getStatusBadge(detail.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`w-4 h-4 ${detail.buyerSigned ? 'text-green-600' : 'text-gray-400'}`} />
                      Người mua: {detail.buyerSigned ? 'Đã ký' : 'Chưa ký'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`w-4 h-4 ${detail.sellerSigned ? 'text-green-600' : 'text-gray-400'}`} />
                      Người bán: {detail.sellerSigned ? 'Đã ký' : 'Chưa ký'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" /> Ngày tạo: {formatDate(detail.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" /> Ngày ký: {detail.signedAt ? formatDate(detail.signedAt) : 'Chưa ký'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {autoRole === 'buyer' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Dịch vụ đi kèm</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(detail.addons) && detail.addons.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-800">
                          Các dịch vụ đã thêm cho hợp đồng
                        </div>
                        <Badge className="bg-green-600 text-white border-green-600">Buyer</Badge>
                      </div>
                      {detail.addons.map((a) => (
                        <div key={a.id} className="flex items-center justify-between border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{a.serviceName}</div>
                            <div className="text-sm text-gray-600">ID: {a.id} • {formatDate(a.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-700">{a.fee.toLocaleString('vi-VN')} VND</div>
                            <Badge className={a.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}>
                              {a.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {/* Nút thanh toán VNPAY cho addons */}
                      <div className="pt-2 border-t pt-4">
                        <Button
                          onClick={handleAddonVnpayPayment}
                          disabled={payingAddon}
                          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:opacity-60"
                        >
                          <CreditCard className="w-4 h-4" />
                          {payingAddon ? 'Đang chuyển đến VNPay…' : 'Thanh toán dịch vụ (VNPay)'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">Chưa có dịch vụ đi kèm</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ký hợp đồng bằng OTP */}
            <Card>
              <CardHeader>
                <CardTitle>Xác nhận ký hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-xl p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <Label>Đối tượng ký</Label>
                    <div className="text-sm font-semibold text-gray-900">
                      {autoRole
                        ? ((autoRole ?? 'buyer') === 'buyer' ? 'Người mua' : 'Người bán')
                        : 'Bạn không có quyền ký hợp đồng này'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>OTP</Label>
                    <Input
                      placeholder="Nhập mã OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="max-w-xs w-64"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleSendOtp} disabled={sendingOtp || !autoRole} className="gap-2">
                      <KeyRound className="w-4 h-4" />
                      {sendingOtp ? 'Đang gửi OTP…' : 'Lấy mã OTP'}
                    </Button>
                    <Button type="button" onClick={handleSign} disabled={signing || !autoRole} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <PenLine className="w-4 h-4" />
                      {signing ? 'Đang ký…' : 'Xác nhận ký'}
                    </Button>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContractDetail;


