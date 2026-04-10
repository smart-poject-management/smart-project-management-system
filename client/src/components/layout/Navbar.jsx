import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";

import { logout } from "../../store/slices/authSlice";
import { getNotifications, markAsRead } from "../../store/slices/notificationSlice";

const Navbar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { authUser } = useSelector(state => state.auth);
  const { list: notifications, unreadCount } = useSelector(
    state => state.notification,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userRole === "Admin") {
      dispatch(getNotifications());
    }
  }, [dispatch, userRole]);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate("/");
    });
  };

  const getInitials = name => {
    return (
      name
        ?.split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 fixed w-full top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo and title */}
            <div className="flex items-center ml-4">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-lg font-semibold text-slate-800">
                    Final Year Project Management System
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {userRole === "Admin" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setNotificationsOpen(v => !v);
                    setProfileDropdownOpen(false);
                    dispatch(getNotifications());
                  }}
                  className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-[min(70vh,24rem)] flex flex-col"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
                      <span className="text-sm font-semibold text-slate-800">
                        Notifications
                      </span>
                      <Link
                        to="/admin/notifications"
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-6 text-sm text-slate-500 text-center">
                          No notifications yet
                        </p>
                      ) : (
                        <ul className="py-1">
                          {notifications.slice(0, 8).map(n => (
                            <li key={n._id}>
                              <button
                                type="button"
                                className={`w-full text-left px-3 py-2.5 text-sm border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                                  n.isRead ? "text-slate-600" : "text-slate-900 font-medium bg-blue-50/50"
                                }`}
                                onClick={() => {
                                  if (!n.isRead) {
                                    dispatch(markAsRead(n._id));
                                  }
                                  if (n.link) {
                                    navigate(n.link);
                                  }
                                  setNotificationsOpen(false);
                                }}
                              >
                                <span className="line-clamp-2">{n.message}</span>
                                <span className="block text-xs text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(authUser?.name)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">
                    {authUser?.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {authUser?.role}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-800">
                        {authUser?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {authUser?.email}
                      </p>
                      <p className="text-xs text-blue-600 capitalize font-medium mt-1">
                        {authUser?.role}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mt-2"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
