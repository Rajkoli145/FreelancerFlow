import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import '../../styles/neumorphism.css';

const Topbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Empty notifications - will be populated from backend
  const notifications = [];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-20" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <div className="h-full px-6 flex items-center justify-end">
        {/* Notification Bell - Top Right Corner */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full"
            style={{ 
              backgroundColor: 'var(--neu-bg)',
              boxShadow: '4px 4px 8px var(--neu-dark), -4px -4px 8px var(--neu-light)'
            }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--neu-text)' }} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-96 neu-card overflow-hidden z-50" style={{ boxShadow: '12px 12px 24px var(--neu-dark), -12px -12px 24px var(--neu-light)' }}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
                    <h3 className="text-lg font-semibold neu-heading">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className="px-5 py-4 cursor-pointer transition-all hover:opacity-90"
                          style={{
                            borderBottom: '1px solid var(--neu-dark)',
                            backgroundColor: notif.unread ? 'rgba(75, 112, 226, 0.03)' : 'transparent'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2`} style={{
                              backgroundColor: notif.unread ? 'var(--neu-primary)' : '#d1d9e6'
                            }}></div>
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold mb-0.5 ${notif.unread ? 'neu-heading' : 'neu-text'}`}>{notif.title}</h4>
                              <p className="text-xs neu-text-light mb-1">{notif.message}</p>
                              <span className="text-xs neu-text-light">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-12 text-center">
                        <div className="w-16 h-16 neu-icon-inset rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-8 h-8 neu-text-light" />
                        </div>
                        <p className="text-sm neu-text-light">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 neu-card-inset" style={{ borderTop: '1px solid var(--neu-dark)' }}>
                    <button 
                      onClick={() => {
                        window.location.href = "/notifications";
                      }}
                      className="w-full text-sm font-medium neu-button-primary px-4 py-2.5 rounded-lg"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
  );
};

export default Topbar;
