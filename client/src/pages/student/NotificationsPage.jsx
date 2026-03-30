import { useEffect, useMemo, useState } from "react";
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
  Info,
  Send,
  Settings,
  User,
  XCircle,
} from "lucide-react";

const type = [
  { key: "all", label: "All" },
  { key: "approval", label: "Approval" },
  { key: "general", label: "General" },
  { key: "rejection", label: "Rejection" },
  { key: "request", label: "Request" },
  { key: "deadline", label: "Deadline" },
  { key: "meeting", label: "Meeting" },
  { key: "feedback", label: "Feedback" },
  { key: "system", label: "System" },
];

const typeColorMap = {
  all: { base: "bg-sky-100 text-sky-800 border-sky-300", active: "bg-sky-700 text-white border-sky-700" },
  approval: { base: "bg-green-100 text-green-800 border-green-300", active: "bg-green-700 text-white border-green-700" },
  general: { base: "bg-blue-100 text-blue-800 border-blue-300", active: "bg-blue-700 text-white border-blue-700" },
  rejection: { base: "bg-red-100 text-red-800 border-red-300", active: "bg-red-700 text-white border-red-700" },
  request: { base: "bg-orange-100 text-orange-800 border-orange-300", active: "bg-orange-700 text-white border-orange-700" },
  deadline: { base: "bg-rose-100 text-rose-800 border-rose-300", active: "bg-rose-700 text-white border-rose-700" },
  meeting: { base: "bg-purple-100 text-purple-800 border-purple-300", active: "bg-purple-700 text-white border-purple-700" },
  feedback: { base: "bg-green-100 text-green-800 border-green-300", active: "bg-green-700 text-white border-green-700" },
  system: { base: "bg-gray-100 text-gray-800 border-gray-300", active: "bg-gray-700 text-white border-gray-700" },

};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.list);
  const unreadCount = useSelector(state => state.notification.unreadCount);

  const [activeFilter, setActiveFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = id => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = id => dispatch(deleteNotification(id));


  const toggleTypeFilter = (type) => {
    if (type === "all") {
      setTypeFilter(null);
    } else {
      setTypeFilter(prev => prev === type ? null : type);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "deadline": return <Clock5 className="w-6 h-6 text-red-500" />;
      case "approval": return <BadgeCheck className="w-6 h-6 text-green-500" />;
      case "meeting": return <Calendar className="w-6 h-6 text-purple-500" />;
      case "system": return <Settings className="w-6 h-6 text-gray-500" />;
      case "general": return <Info className="w-6 h-6 text-blue-400" />;
      case "rejection": return <XCircle className="w-6 h-6 text-red-500" />;
      case "request": return <Send className="w-6 h-6 text-orange-500" />;
      case "feedback": return <MessageSquare className="w-6 h-6 text-green-500" />;
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
      case "high": return "border-l-4 border-l-red-500";
      case "medium": return "border-l-4 border-l-yellow-500";
      case "low": return "border-l-4 border-l-green-500";
      default: return "border-l-4 border-l-slate-300";
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
      value: notifications.length,
      bg: "bg-blue-50", iconBg: "bg-blue-100",
      textColor: "text-blue-600", titleColor: "text-blue-800",
      activeBorder: "ring-2 ring-blue-400", Icon: User,
    },
    {
      key: "unread",
      title: "Unread",
      value: notifications.filter(n => !n.isRead).length,
      bg: "bg-yellow-50", iconBg: "bg-yellow-100",
      textColor: "text-yellow-600", titleColor: "text-yellow-800",
      activeBorder: "ring-2 ring-yellow-400", Icon: AlertCircle,
    },
    {
      key: "high",
      title: "High Priority",
      value: notifications.filter(n => n.priority === "high").length,
      bg: "bg-red-50", iconBg: "bg-red-100",
      textColor: "text-red-600", titleColor: "text-red-800",
      activeBorder: "ring-2 ring-red-400", Icon: Clock,
    },
    {
      key: "week",
      title: "This Week",
      value: notifications.filter(n => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.createdAt) >= weekAgo;
      }).length,
      bg: "bg-green-50", iconBg: "bg-green-100",
      textColor: "text-green-600", titleColor: "text-green-800",
      activeBorder: "ring-2 ring-green-400", Icon: CheckCircle2,
    },
  ];


  const filteredNotifications = useMemo(() => {
    let list = [...notifications];

    // stat card filter
    if (activeFilter === "unread") {
      list = list.filter(n => !n.isRead);
    } else if (activeFilter === "high") {
      list = list.filter(n => n.priority === "high");
    } else if (activeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      list = list.filter(n => new Date(n.createdAt) >= weekAgo);
    }


    if (typeFilter && typeFilter !== "all") {
      list = list.filter(n => n.type === typeFilter);
    }

    list.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [notifications, activeFilter, typeFilter]);

  const handleStatClick = (key) => {
    setActiveFilter(prev => (prev === key || key === "all") ? null : key);
  };

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
                    <p className="text-lg font-bold text-slate-800">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TYPE FILTER */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-slate-500 font-medium mr-1">Filter by type:</span>
          {type.map(({ key, label }) => {
            const isActive = key === "all" ? typeFilter === null : typeFilter === key;
            const cls = typeColorMap[key];
            return (
              <button
                key={key}
                onClick={() => toggleTypeFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
                  ${isActive ? cls.active : cls.base}`}
              >
                {label}
              </button>
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

                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium capitalize
                        ${typeColorMap[notification.type]?.base ?? "bg-gray-100 text-gray-700"}`}
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
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <BellOff className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              {(activeFilter || typeFilter)
                ? "No notifications match the selected filters"
                : "No notifications yet"}
            </p>
          </div>
        )}

      </div>
    </div>

  );
};

export default NotificationsPage;