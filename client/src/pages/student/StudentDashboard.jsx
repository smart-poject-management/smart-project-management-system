import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import {
  Folder,
  User,
  CalendarDays,
  MessageSquare,
  MessageCircle,
  MessageCircleWarning,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector(state => state.auth);
  const { dashboardStats } = useSelector(state => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackList = dashboardStats?.feedbackList?.slice(-2).reverse() || [];

  const formatDate = dateStr => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // const getStatusColor = status => {
  //   switch (status) {
  //     case "upcoming":
  //       return "badge-pending";
  //     case "completed":
  //       return "badge-approved";
  //     case "overdue":
  //       return "badge-rejected";
  //     default:
  //       return "badge-pending";
  //   }
  // };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm border border-blue-100 text-white">
          <h1 className="text-3xl font-bold ">
            Welcome back, {authUser?.name || "Student"}!
          </h1>
          <p className="text-white">
            Here's your project overview and recent updates.
          </p>
        </div>
        {/*   Quick stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Project title */}
          <div className="w-full p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"
              >
                <Folder className="text-white w-5 h-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Project Title
                </h2>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {project?.title || "No Project"}
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor */}
          <div className="w-full p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-emerald-500 to-green-600 shadow-md"
              >
                <User className="text-white w-5 h-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Supervisor
                </h2>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {supervisorName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="w-full p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-orange-500 to-red-500 shadow-md"
              >
                <CalendarDays className="text-white w-5 h-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Next Deadline
                </h2>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {upcomingDeadlines[0]?.title || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="w-full p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-purple-500 to-pink-500 shadow-md"
              >
                <MessageSquare className="text-white w-5 h-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Recent Feedback
                </h2>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {feedbackList?.length
                    ? formatDate(feedbackList[0]?.createdAt)
                    : "No feedback yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Overview</h2>
            </div>
            {/* project disc */}
            <div className="">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-gray-500 tracking-wider uppercase"
              >
                Title
              </label>
              <p id="title" className="text-xl font-bold text-gray-900 mt-1">
                {project?.title || "No Project"}
              </p>

              <label
                htmlFor="description"
                className="text-sm font-semibold text-gray-500 tracking-wider uppercase"
              >
                Description
              </label>
              <p
                id="description"
                className="text-xl font-bold text-gray-900 mt-1"
              >
                {project?.description || "No Project"}
              </p>
            </div>

            {/* projects status */}
            <div className=" flex items-center gap-2 mt-4">
              <label htmlFor="text-sm font-medium text-slate-600">Status</label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                 ${
                   project?.status === "approved"
                     ? "badge-approved"
                     : project?.status === "pending"
                       ? "badge-pending"
                       : project?.status === "rejected"
                         ? "badge-rejected"
                         : "badge-pending"
                 }`}
              >
                {project?.status || "Unknown"}
              </span>
            </div>

            <div className=" flex items-center gap-2 mt-4">
              <label htmlFor="text-sm font-medium text-slate-600">
                Submission Deadline
              </label>

              <p className="text-slate-800 font-medium">
                {formatDate(project?.deadline) || "N/A"}
              </p>
            </div>
          </div>

          {/* Latest feedback */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Latest Feedback</h2>
              <Link
                to={"/student/feedback"}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-600 transition-all duration-300"
              >
                View All
              </Link>
            </div>

            {feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4 p-4">
                {feedbackList.map((feedback, index) => {
                  return (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                          <h3>{feedback.title || "Supervisor Feedback"}</h3>
                        </div>

                        <p className="text-xs text-slate-500">
                          {formatDate(feedback.createdAt)}
                        </p>
                      </div>

                      <div className="text-slate-50 rounded-lg p-3">
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {feedback.message}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-slate-500">
                          - {supervisorName || "Supervisor"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 ">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No feedback available yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines & Notification */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
            </div>

            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatDate(deadline.deadline)}
                        </p>
                      </div>
                      <div className={`badge badge-pending`}>upcoming</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 ">
                <MessageCircleWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 p-4">
                  No upcoming deadlines yet.
                </p>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Notifications</h2>
            </div>

            {topNotifications && topNotifications.length > 0 ? (
              topNotifications.map((notification, index) => {
                return (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <p className="font-medium text-slate-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 ">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No notification yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
