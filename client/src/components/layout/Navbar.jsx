import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";

import { logout } from "../../store/slices/authSlice";
import {
  getNotifications,
  markAsRead,
} from "../../store/slices/notificationSlice";

const Navbar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { authUser } = useSelector(state => state.auth);
  const { list: notifications, unreadCount } = useSelector(
    state => state.notification
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = userRole?.toLowerCase();

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getNotifications());
    }
  }, [dispatch, authUser]);

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

  const getFallbackRoute = () => {
    if (role === "admin") return "/admin";
    if (role === "teacher") return "/teacher";
    return "/student";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 fixed w-full top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* LEFT */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              ☰
            </button>

            <h1 className="ml-4 text-lg font-semibold">
              Smart Education System
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setNotificationsOpen(v => !v);
                  setProfileDropdownOpen(false);
                  dispatch(getNotifications());
                }}
                className="relative p-2 rounded-lg hover:bg-slate-100"
              >
                <Bell className="w-5 h-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-2 border-b flex justify-between">
                    <span className="font-semibold">Notifications</span>

                    {/* ✅ FIXED VIEW ALL */}
                    <Link
                      to={
                        role === "admin"
                          ? "/admin/notifications"
                          : role === "teacher"
                            ? "/teacher/notifications"
                            : "/student/notifications"
                      }
                      className="text-blue-500 text-sm"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all
                    </Link>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        No notifications
                      </p>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <button
                          key={n._id}
                          className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                            !n.isRead ? "bg-blue-50 font-medium" : ""
                          }`}
                          onClick={() => {
                            if (!n.isRead) {
                              dispatch(markAsRead(n._id));
                            }

                            if (n.link) {
                              navigate(
                                n.link.startsWith("/") ? n.link : `/${n.link}`
                              );
                            } else {
                              navigate(getFallbackRoute());
                            }

                            setNotificationsOpen(false);
                          }}
                        >
                          <p className="text-sm">{n.message}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(authUser?.name)}
                  </span>
                </div>
                <span>{authUser?.name}</span>
              </button>

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

      {(notificationsOpen || profileDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotificationsOpen(false);
            setProfileDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
