import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  BadgeCheck,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.list);
  const unreadCount = useSelector(state => state.notification.unreadCount);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = id => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = id => dispatch(deleteNotification(id));

  const getNotificationIcon = type => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;
      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;
      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;
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
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      Icon: User,
    },
    {
      title: "Unread",
      value: notifications.filter(n => !n.isRead).length,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter(n => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter(n => {
        const notifDate = new Date(n.createdAt);
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
            <p className="text-sm text-slate-500">
              Stay updated with your project progress and deadlines
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsReadHandler}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((item, i) => (
            <div
              key={i}
              className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
                  <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                </div>
                <div>
                  <p className={`text-xs ${item.titleColor}`}>{item.title}</p>
                  <p className="text-lg font-bold text-slate-800">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`relative border rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md
                ${getPriorityColor(notification.priority)}
                ${!notification.isRead
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white hover:bg-slate-50"
                }`}
            >
              <div className="flex space-x-4">
                <div className="flex-shrink-0 mt-1 p-2 bg-slate-100 rounded-lg">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`text-sm font-semibold ${notification.isRead ? "text-slate-800" : "text-blue-900"
                        }`}
                    >
                      {notification.title}
                      {!notification.isRead && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse" />
                      )}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium
                          ${notification.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : notification.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium capitalize
                        ${notification.type === "feedback"
                          ? "bg-blue-100 text-blue-700"
                          : notification.type === "deadline"
                            ? "bg-red-100 text-red-700"
                            : notification.type === "approval"
                              ? "bg-green-100 text-green-700"
                              : notification.type === "meeting"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {notification.type}
                    </span>

                    <div className="flex space-x-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsReadHandler(notification._id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotificationHandler(notification._id)}
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
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <BellOff className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <p className="text-slate-500 text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;