import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";
import { BellOff, ExternalLink } from "lucide-react";

const AdminNotificationsPage = () => {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector(
    state => state.notification,
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Notifications
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Requests and updates from students and teachers
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => dispatch(markAllAsRead())}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {loading && list.length === 0 && (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        )}

        <ul className="space-y-3">
          {list.map(n => (
            <li
              key={n._id}
              className={`border rounded-lg p-4 flex gap-3 transition-colors ${
                n.isRead
                  ? "border-slate-200 bg-slate-50/50"
                  : "border-blue-200 bg-blue-50/40"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm ${
                      n.isRead ? "text-slate-700" : "text-slate-900 font-medium"
                    }`}
                  >
                    {n.message}
                  </p>
                  {!n.isRead && (
                    <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(n.createdAt)}
                  </span>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => dispatch(markAsRead(n._id))}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dispatch(deleteNotification(n._id))}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {!loading && list.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-slate-100 rounded-full">
                <BellOff className="w-7 h-7 text-slate-400" />
              </div>
            </div>
            <p className="text-slate-500 text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
