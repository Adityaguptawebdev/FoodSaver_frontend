import { useCallback, useEffect, useRef, useState } from "react";
import client from "../api/client.js";
import { playNotificationSound, unlockNotificationSound } from "../utils/notificationSound.js";

const POLL_INTERVAL_MS = 30 * 1000;

// Polls only the unread count while the dropdown is closed, and the full list
// while it's open, so new alerts show up without refetching everything constantly.
export function useNotifications(listOpen) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listLoaded, setListLoaded] = useState(false);
  const [listError, setListError] = useState(false);
  const listOpenRef = useRef(listOpen);
  // Newest alert time (ms) seen so far; undefined until the first response so that
  // alerts which already existed when the page loaded don't chime.
  const latestSeenRef = useRef(undefined);

  const noteLatest = useCallback((latestAt) => {
    const latest = latestAt ? Date.parse(latestAt) : 0;
    if (latestSeenRef.current !== undefined && latest > latestSeenRef.current) playNotificationSound();
    latestSeenRef.current = Math.max(latestSeenRef.current ?? 0, latest);
  }, []);

  // Transient network/server errors in either fetch just wait for the next poll.
  const refreshCount = useCallback(async () => {
    try {
      const res = await client.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
      noteLatest(res.data.latestAt);
    } catch {}
  }, [noteLatest]);

  const refreshList = useCallback(async () => {
    try {
      const res = await client.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setListLoaded(true);
      setListError(false);
      noteLatest(res.data.notifications[0]?.createdAt);
    } catch {
      setListError(true);
    }
  }, [noteLatest]);

  // Fetch on open only. Refetching on close would race the mark-read request fired
  // by a notification click and briefly restore the stale unread count.
  useEffect(() => {
    listOpenRef.current = listOpen;
    if (listOpen) refreshList();
  }, [listOpen, refreshList]);

  // Keeps polling in background tabs too (browsers throttle it to about once a minute)
  // so the chime can reach an NGO who's on another tab; refreshes right away on return.
  useEffect(() => {
    function poll() {
      if (listOpenRef.current) refreshList();
      else refreshCount();
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") poll();
    }
    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCount, refreshList]);

  useEffect(() => {
    window.addEventListener("pointerdown", unlockNotificationSound);
    window.addEventListener("keydown", unlockNotificationSound);
    return () => {
      window.removeEventListener("pointerdown", unlockNotificationSound);
      window.removeEventListener("keydown", unlockNotificationSound);
    };
  }, []);

  function markRead(notification) {
    if (notification.readAt) return;
    const readAt = new Date().toISOString();
    setNotifications((list) => list.map((n) => (n._id === notification._id ? { ...n, readAt } : n)));
    setUnreadCount((count) => Math.max(0, count - 1));
    client.patch(`/notifications/${notification._id}/read`).catch(refreshList);
  }

  function markAllRead() {
    const readAt = new Date().toISOString();
    setNotifications((list) => list.map((n) => (n.readAt ? n : { ...n, readAt })));
    setUnreadCount(0);
    client.patch("/notifications/read-all").catch(refreshList);
  }

  return { notifications, unreadCount, listLoaded, listError, retryList: refreshList, markRead, markAllRead };
}
