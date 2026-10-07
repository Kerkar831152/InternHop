import type { Dispatch, SetStateAction } from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "recommended" | "deadline" | "verification" | "system";
  read: boolean;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}