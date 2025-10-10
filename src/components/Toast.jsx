import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: <FaCheckCircle className="text-white text-xl" />
    },
    error: {
      bg: 'bg-red-500',
      icon: <FaExclamationCircle className="text-white text-xl" />
    },
    info: {
      bg: 'bg-blue-500',
      icon: <FaInfoCircle className="text-white text-xl" />
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: <FaExclamationCircle className="text-white text-xl" />
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className={`${style.bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md animate-slide-in`}>
      <div className="flex items-center gap-3">
        {style.icon}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
      >
        <FaTimes className="text-white" />
      </button>
    </div>
  );
};

export default Toast;
