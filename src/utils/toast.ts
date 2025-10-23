import { toast } from 'react-toastify';

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const toastConfig = {
    style: {
      backgroundColor: type === 'success' ? '#10b981' : 
                     type === 'error' ? '#ef4444' : 
                     type === 'warning' ? '#f59e0b' : '#3b82f6',
      color: 'white',
      fontWeight: '500'
    }
  };

  switch (type) {
    case 'success':
      toast.success(message, toastConfig);
      break;
    case 'error':
      toast.error(message, toastConfig);
      break;
    case 'warning':
      toast.warning(message, toastConfig);
      break;
    case 'info':
    default:
      toast.info(message, toastConfig);
      break;
  }
};
