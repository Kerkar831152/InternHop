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
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="nav-action-wrapper">
      <button
        className={`icon-btn ${open ? "icon-btn-active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="dropdown notification-dropdown">
          <div className="dropdown-header">
            <div>
              <h3>Notifications</h3>

              <span>
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread`}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <span>✓</span>
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read
                      ? "notification-unread"
                      : ""
                  }`}
                >
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                  </div>

                  {!notification.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}
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