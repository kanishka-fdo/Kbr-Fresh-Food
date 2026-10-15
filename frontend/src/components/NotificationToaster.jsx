import { resolveValue, toast, useToaster } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const variants = {
  success: { className: 'ui-alert-success', Icon: CheckCircle2 },
  error: { className: 'ui-alert-error', Icon: AlertCircle },
};

export default function NotificationToaster() {
  const { toasts, handlers } = useToaster({ duration: 5000 });
  return (
    <div
      data-theme="kbr"
      className="ui-toast ui-toast-top ui-toast-end notification-toasts"
      onMouseEnter={handlers.startPause}
      onMouseLeave={handlers.endPause}
    >
      {toasts.filter(t => t.visible).map(t => {
        const { className, Icon } = variants[t.type] || { className: 'ui-alert-info', Icon: Info };
        return (
          <div key={t.id} {...t.ariaProps} className={`ui-alert ${className} notification-toast`}>
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="min-w-0 break-words">{resolveValue(t.message, t)}</span>
            <button type="button" className="ui-btn ui-btn-ghost ui-btn-xs ui-btn-circle" aria-label="Dismiss notification" onClick={() => toast.dismiss(t.id)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
