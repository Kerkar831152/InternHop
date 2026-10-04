export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}