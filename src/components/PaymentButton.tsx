import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentInfo, navigateToPayment } from '@/utils/paymentUtils';

interface PaymentButtonProps {
  paymentInfo: PaymentInfo;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  paymentInfo,
  className = "w-full py-3 px-6 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
  children = "Thanh toán",
  disabled = false
}) => {
  const navigate = useNavigate();

  const handlePayment = () => {
    if (disabled) return;
    navigateToPayment(navigate, paymentInfo);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default PaymentButton;
