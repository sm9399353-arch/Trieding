
import { useStore } from '../store/useStore';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { notifications, removeNotification } = useStore();

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400" />,
    error: <XCircle size={16} className="text-red-400" />,
    warning: <AlertCircle size={16} className="text-yellow-400" />,
    info: <Info size={16} className="text-blue-400" />,
  };

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-3 rounded-xl border backdrop-blur-xl animate-fade-in-up ${colors[notif.type]}`}
          style={{ background: 'rgba(15,23,42,0.95)' }}
        >
          {icons[notif.type]}
          <span className="flex-1 text-sm text-gray-200 leading-relaxed">{notif.message}</span>
          <button
            onClick={() => removeNotification(notif.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
