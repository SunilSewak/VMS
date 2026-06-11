export interface AppNotification {
  id: string;
  message: string;
  created_at: string;
}

const STORAGE_KEY = 'avems_notifications';

function parseNotifications(value: string | null): AppNotification[] {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  return parseNotifications(window.localStorage.getItem(STORAGE_KEY));
}

export function addNotification(notification: AppNotification): void {
  if (typeof window === 'undefined') return;
  const notifications = getNotifications();
  const next = [notification, ...notifications].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeNotification(id: string): void {
  if (typeof window === 'undefined') return;
  const notifications = getNotifications().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function clearNotifications(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
