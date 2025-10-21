import { toast } from 'react-toastify';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        backgroundColor: '#10b981', // Màu xanh lá
        color: 'white',
        fontWeight: '500'
      }
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      style: {
        backgroundColor: '#ef4444', // Màu đỏ
        color: 'white',
        fontWeight: '500'
      }
    });
  },
  
  warning: (message: string) => {
    toast.warning(message, {
      style: {
        backgroundColor: '#f59e0b', // Màu vàng
        color: 'white',
        fontWeight: '500'
      }
    });
  },
  
  info: (message: string) => {
    toast.info(message, {
      style: {
        backgroundColor: '#3b82f6', // Màu xanh dương
        color: 'white',
        fontWeight: '500'
      }
    });
  }
};
