import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  BellOff,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  ExternalLink,
  Info,
  MessageSquare,
  Send,
  Settings,
  User,
  XCircle,
  BadgeCheck,
  Calendar,
} from "lucide-react";

const TeacherNotificationsPage = () => {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector(
    state => state.notification
  );

  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = id => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = id => dispatch(deleteNotification(id));

  const getNotificationIcon = notifType => {
    switch (notifType) {
      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;
      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;
      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;
      case "general":
        return <Info className="w-6 h-6 text-blue-400" />;
      case "rejection":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "request":
        return <Send className="w-6 h-6 text-orange-500" />;
      case "feedback":
        return <MessageSquare className="w-6 h-6 text-green-500" />;
      default:
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-yellow-500";
      case "low":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-slate-300";
    }
  };

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const stats = [
    {
      key: "all",
      title: "Total",
      value: list.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      activeBorder: "ring-2 ring-blue-400",
      Icon: User,
    },
    {
      key: "unread",
      title: "Unread",
      value: list.filter(n => !n.isRead).length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      activeBorder: "ring-2 ring-yellow-400",
      Icon: AlertCircle,
    },
    {
      key: "high",
      title: "High Priority",
      value: list.filter(n => n.priority === "high").length,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      activeBorder: "ring-2 ring-red-400",
      Icon: Clock,
    },
    {
      key: "week",
      title: "This Week",
      value: list.filter(n => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.createdAt) >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      activeBorder: "ring-2 ring-green-400",
      Icon: CheckCircle2,
    },
  ];

  const filteredNotifications = useMemo(() => {
    let next = [...list];

    if (activeFilter === "unread") {
      next = next.filter(n => !n.isRead);
    } else if (activeFilter === "high") {
      next = next.filter(n => n.priority === "high");
    } else if (activeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      next = next.filter(n => new Date(n.createdAt) >= weekAgo);
    }

    next.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return next;
  }, [list, activeFilter]);

  const handleStatClick = key => {
    setActiveFilter(prev => (prev === key || key === "all" ? null : key));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="page-header">Notifications</h2>
            <p className="text-gray-500 mt-1">
              Requests and updates from students and teachers
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsReadHandler}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && list.length === 0 && (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {stats.map((item, i) => {
            const isActive =
              activeFilter === item.key ||
              (item.key === "all" && activeFilter === null);
            return (
              <div
                key={i}
                onClick={() => handleStatClick(item.key)}
                className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none
                  ${isActive ? item.activeBorder : "ring-0"}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
                    <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${item.titleColor}`}>{item.title}</p>
                    <p className="text-lg font-bold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`relative border rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md
                ${getPriorityColor(notification.priority)}
                ${!notification.isRead ? "border-blue-200" : "bg-white hover:bg-slate-50"}`}
            >
              <div className="flex space-x-4">
                <div className="flex-shrink-0 mt-1 p-2">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3
                      className={`text-sm font-semibold ${
                        notification.isRead ? "text-slate-800" : "text-blue-900"
                      }`}
                    >
                      {notification.title || "Notification"}
                      {!notification.isRead && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse" />
                      )}
                    </h3>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.priority && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium capitalize
                            ${
                              notification.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : notification.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                        >
                          {notification.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 leading-relaxed break-words">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="px-2 py-1 text-xs rounded-full font-medium capitalize bg-gray-100 text-gray-700">
                      {notification.type || "general"}
                    </span>

                    <div className="flex items-center space-x-3">
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsReadHandler(notification._id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          deleteNotificationHandler(notification._id)
                        }
                        className="text-xs font-medium text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <BellOff className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              {activeFilter
                ? "No notifications match the selected filter"
                : "No notifications yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotificationsPage;
