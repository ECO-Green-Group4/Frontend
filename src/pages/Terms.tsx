// Trang Terms of Service and Privacy Policy
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import ecoLogo from '@/assets/logo/eco_green.png';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={ecoLogo} 
              alt="EcoGreen Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-3xl font-bold text-green-500">EcoGreen</span>
          </div>
          <Link to="/register">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Content */}
        <Card className="w-full">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-green-500 mb-2">
              Điều khoản Dịch vụ và Chính sách Bảo mật
            </h1>
            <p className="text-gray-500 mb-8">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>

            {/* Terms of Service */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Điều khoản Dịch vụ
              </h2>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.1. Chấp nhận Điều khoản
                  </h3>
                  <p className="leading-relaxed">
                    Bằng việc truy cập và sử dụng dịch vụ của EcoGreen, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. 
                    Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.2. Mô tả Dịch vụ
                  </h3>
                  <p className="leading-relaxed">
                    EcoGreen là một nền tảng trực tuyến cung cấp các dịch vụ liên quan đến:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Mua bán xe điện và pin xe điện</li>
                    <li>Quản lý đơn hàng và hợp đồng</li>
                    <li>Dịch vụ bảo hành và bảo trì</li>
                    <li>Gói thành viên và các dịch vụ bổ sung</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.3. Tài khoản Người dùng
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Để sử dụng một số tính năng của dịch vụ, bạn cần tạo tài khoản. Bạn có trách nhiệm:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                    <li>Bảo mật mật khẩu và thông tin tài khoản của bạn</li>
                    <li>Thông báo ngay cho chúng tôi về bất kỳ hoạt động trái phép nào</li>
                    <li>Chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của bạn</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.4. Quy tắc Sử dụng
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Bạn đồng ý không sử dụng dịch vụ để:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Vi phạm bất kỳ luật pháp hoặc quy định nào</li>
                    <li>Gửi thông tin sai lệch, gian lận hoặc lừa đảo</li>
                    <li>Xâm phạm quyền sở hữu trí tuệ của người khác</li>
                    <li>Phát tán virus, malware hoặc mã độc hại</li>
                    <li>Can thiệp hoặc làm gián đoạn hoạt động của dịch vụ</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.5. Thanh toán và Hoàn tiền
                  </h3>
                  <p className="leading-relaxed">
                    Tất cả các giao dịch thanh toán được xử lý thông qua các cổng thanh toán an toàn. 
                    Chính sách hoàn tiền sẽ được áp dụng theo từng trường hợp cụ thể và được thông báo rõ ràng 
                    tại thời điểm giao dịch. EcoGreen có quyền từ chối hoặc hủy bỏ bất kỳ giao dịch nào 
                    mà chúng tôi cho là gian lận hoặc vi phạm các điều khoản này.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.6. Quyền Sở hữu Trí tuệ
                  </h3>
                  <p className="leading-relaxed">
                    Tất cả nội dung trên nền tảng EcoGreen, bao gồm nhưng không giới hạn ở logo, văn bản, 
                    hình ảnh, phần mềm, và thiết kế, đều thuộc quyền sở hữu của EcoGreen hoặc các bên cấp phép. 
                    Bạn không được sao chép, phân phối, hoặc sử dụng bất kỳ nội dung nào mà không có sự cho phép 
                    bằng văn bản từ chúng tôi.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.7. Từ chối Trách nhiệm
                  </h3>
                  <p className="leading-relaxed">
                    EcoGreen cung cấp dịch vụ "như hiện tại" và "như có sẵn". Chúng tôi không đảm bảo rằng 
                    dịch vụ sẽ không bị gián đoạn, an toàn, hoặc không có lỗi. Chúng tôi không chịu trách nhiệm 
                    cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    1.8. Chấm dứt Dịch vụ
                  </h3>
                  <p className="leading-relaxed">
                    EcoGreen có quyền chấm dứt hoặc tạm ngưng tài khoản và quyền truy cập của bạn vào dịch vụ 
                    bất cứ lúc nào, với hoặc không có lý do, với hoặc không có thông báo trước, vì bất kỳ lý do nào, 
                    bao gồm vi phạm các điều khoản này.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Chính sách Bảo mật
              </h2>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.1. Thông tin Chúng tôi Thu thập
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Chúng tôi thu thập các loại thông tin sau:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Thông tin cá nhân:</strong> Tên, email, số điện thoại, địa chỉ, CMND/CCCD, ngày sinh, giới tính</li>
                    <li><strong>Thông tin tài khoản:</strong> Tên đăng nhập, mật khẩu (được mã hóa), thông tin đăng nhập Google</li>
                    <li><strong>Thông tin giao dịch:</strong> Lịch sử mua hàng, phương thức thanh toán, địa chỉ giao hàng</li>
                    <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị, cookie</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.2. Cách Chúng tôi Sử dụng Thông tin
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Chúng tôi sử dụng thông tin thu thập được để:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cung cấp, duy trì và cải thiện dịch vụ</li>
                    <li>Xử lý đơn hàng và giao dịch</li>
                    <li>Gửi thông báo về đơn hàng, dịch vụ và cập nhật</li>
                    <li>Hỗ trợ khách hàng và phản hồi yêu cầu</li>
                    <li>Phát hiện và ngăn chặn gian lận, lạm dụng</li>
                    <li>Tuân thủ các nghĩa vụ pháp lý</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.3. Chia sẻ Thông tin
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ thông tin trong các trường hợp sau:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Nhà cung cấp dịch vụ:</strong> Các bên thứ ba hỗ trợ hoạt động của chúng tôi (thanh toán, vận chuyển, hosting)</li>
                    <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi luật pháp hoặc cơ quan có thẩm quyền</li>
                    <li><strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền, tài sản hoặc an toàn của EcoGreen, người dùng hoặc công chúng</li>
                    <li><strong>Với sự đồng ý:</strong> Khi bạn đồng ý rõ ràng cho việc chia sẻ</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.4. Bảo mật Thông tin
                  </h3>
                  <p className="leading-relaxed">
                    Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn 
                    khỏi truy cập trái phép, mất mát, phá hủy hoặc thay đổi. Tuy nhiên, không có phương thức truyền tải qua 
                    Internet hoặc lưu trữ điện tử nào là 100% an toàn. Chúng tôi không thể đảm bảo bảo mật tuyệt đối.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.5. Cookie và Công nghệ Theo dõi
                  </h3>
                  <p className="leading-relaxed">
                    Chúng tôi sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm người dùng, phân tích lưu lượng 
                    truy cập và cá nhân hóa nội dung. Bạn có thể kiểm soát cookie thông qua cài đặt trình duyệt của mình, 
                    nhưng việc vô hiệu hóa cookie có thể ảnh hưởng đến chức năng của dịch vụ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.6. Quyền của Người dùng
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Bạn có quyền:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Truy cập và xem thông tin cá nhân của bạn</li>
                    <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
                    <li>Yêu cầu xóa thông tin cá nhân của bạn (theo quy định pháp luật)</li>
                    <li>Từ chối nhận email marketing (bạn vẫn nhận được email giao dịch quan trọng)</li>
                    <li>Rút lại sự đồng ý xử lý dữ liệu của bạn</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.7. Lưu trữ Dữ liệu
                  </h3>
                  <p className="leading-relaxed">
                    Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện các mục đích được nêu 
                    trong chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép lưu trữ lâu hơn. Khi không còn cần thiết, 
                    chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.8. Thay đổi Chính sách
                  </h3>
                  <p className="leading-relaxed">
                    Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ 
                    thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày "Cập nhật lần cuối". 
                    Bạn nên xem xét Chính sách Bảo mật này định kỳ để nắm bắt các thay đổi.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Liên hệ
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ hoặc Chính sách Bảo mật này, 
                vui lòng liên hệ với chúng tôi:
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:support@evtrade.com" className="text-green-500 hover:text-green-600 hover:underline">support@evtrade.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+84123456789" className="text-green-500 hover:text-green-600 hover:underline">+84 123 456 789</a></p>
                <p><strong>Website:</strong> <a href="https://evtrade.com" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 hover:underline">https://evtrade.com</a></p>
              </div>
            </section>

            {/* Back Button */}
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button className="bg-green-500 hover:bg-green-600">
                  Quay lại Đăng ký
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

