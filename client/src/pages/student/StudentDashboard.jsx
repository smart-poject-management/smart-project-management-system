import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import { Folder, User, CalendarDays, MessageSquare } from "lucide-react";

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
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackList = dashboardStats?.feedbackList?.slice(-2).reverse() || [];


  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "badge-pending";
      case "completed":
        return "badge-approved";
      case "overdue":
        return "badge-rejected";
      default:
        return "badge-pending";
    }
  };
  return (
    <>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-500 p-6 rounded-xl shadow-sm border border-blue-100 text-white">
          <h1 className="text-3xl font-bold ">Welcome back, {authUser?.name || "Student"}!</h1>
          <p className="text-white">Here's your project overview and recent updates.</p>
        </div>
        {/*   Quick stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Project title */}
          <div className="w-full p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">

              <div className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
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

              <div className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
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

              <div className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
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

              <div className="w-10 h-10 flex items-center justify-center rounded-xl 
                      bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                <MessageSquare className="text-white w-5 h-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Recent Feedback
                </h2>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {
                    feedbackList?.length ?
                      formatDate(feedbackList[0]?.createdAt)
                      : "No feedback yet"

                  }

                </p>

              </div>

            </div>
          </div>

        </div>


        {/*  */}
      </div>


    </>
  )
};

export default StudentDashboard;


