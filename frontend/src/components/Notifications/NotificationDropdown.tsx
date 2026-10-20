import { useState } from "react";

import type { NotificationDropdownProps } from "../../types/notification";

function NotificationDropdown({
  notifications,
  setNotifications,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="nav-action-wrapper">
      <button
        className={`nav-icon-button ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        type="button"
      >
        <span className="bell-icon">♢</span>

        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="dropdown notification-dropdown">
          <div className="dropdown-header">
            <div>
              <span className="dropdown-eyebrow">INTERNHOP</span>
              <h3>Notifications</h3>
            </div>

            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-action">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-dropdown">
              <div>✓</div>
              <p>You're all caught up.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read ? "unread" : ""
                  }`}
                >
                  <div className="notification-dot"></div>

                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="notification-read"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;