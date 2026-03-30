import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import {
  Folder,
  User,
  CalendarDays,
  MessageSquare,
  MessageCircle,
  Bell,
  AlertTriangle,
  MessageCircleOff,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotification || [];
  const feedbackList = dashboardStats?.feedbackNotification || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // reusable stat card
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase">{title}</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-1">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow">
        <h1 className="text-2xl font-bold">
          Welcome, {authUser?.name || "Student"} 👋
        </h1>
        <p className="text-sm opacity-90">
          Track your project, feedback & deadlines here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Folder}
          title="Project"
          value={project?.title || "No Project"}
          color="bg-blue-500"
        />
        <StatCard
          icon={User}
          title="Supervisor"
          value={supervisorName}
          color="bg-emerald-500"
        />
        <StatCard
          icon={CalendarDays}
          title="Next Deadline"
          value={upcomingDeadlines[0]?.title || "N/A"}
          color="bg-orange-500"
        />
        <StatCard
          icon={MessageSquare}
          title="Latest Feedback"
          value={
            feedbackList?.length
              ? formatDate(feedbackList[0]?.createdAt)
              : "No feedback"
          }
          color="bg-purple-500"
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Project Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="font-semibold text-slate-800">Project Overview</h2>
            <Link
              to="/student/supervisor"
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full"
            >
              View
            </Link>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">Title</p>
            <p className="font-semibold text-slate-800 mt-1">
              {project?.title || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">Description</p>
            <p className="text-sm text-slate-600 line-clamp-4 mt-1">
              {project?.description || "No description"}
            </p>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${project?.status === "approved"
                  ? "bg-green-100 text-green-600"
                  : project?.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
            >
              {project?.status || "Unknown"}
            </span>

            <span className="text-sm text-slate-600">
              {formatDate(project?.deadline)}
            </span>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Feedback</h2>
            <Link
              to="/student/feedback"
              className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full"
            >
              View All
            </Link>
          </div>

          {feedbackList.length ? (
            <div className="space-y-3">
              {feedbackList.map((fb, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-xl hover:shadow-sm hover:bg-slate-100"
                >
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{fb.title || "Feedback"}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(fb.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3">
                    {fb.message}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    - {supervisorName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <MessageCircleOff className="mx-auto mb-2" />
              No feedback yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-semibold mb-4">Upcoming Deadlines</h2>

          {upcomingDeadlines.length ? (
            upcomingDeadlines.map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg mb-2"
              >
                <div>
                  <p className="font-medium text-slate-800">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(d.deadline)}
                  </p>
                </div>

                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded capitalize font-bold">
                  upcoming
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400">
              <AlertTriangle className="mx-auto mb-2" />
              No deadlines
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Notifications</h2>
            <Link
              to="/student/notifications"
              className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full"
            >
              View All
            </Link>
          </div>

          {topNotifications.length ? (
            <div className="space-y-3">
              {topNotifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all duration-200"
                >
                  <div className="mt-1">
                    <Send className="w-4 h-4 text-orange-500" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Bell className="mx-auto mb-2" />
              No notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;