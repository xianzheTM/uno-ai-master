import React from 'react';
import { useUIStore } from '../../stores/uiStore';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out
            ${notification.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' : ''}
            ${notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭通知"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 