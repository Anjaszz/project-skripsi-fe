import { FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  type = 'warning', // warning, danger, info
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`${style.bg} p-3 rounded-2xl shrink-0`}>
              <FaExclamationTriangle className={`${style.icon} text-2xl`} />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed font-medium">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors font-bold text-xs italic"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 ${style.button} text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-bold text-xs flex items-center justify-center gap-2 italic`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" size={14} />
                <span>Memproses...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
