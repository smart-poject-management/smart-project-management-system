import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import {
  getAllProjects,
  getDashboardStats,
} from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";
import {
  toggleStudentModel,
  toggleTeacherModel,
} from "../../store/slices/popupSlice";

import {
  AlertCircle,
  AlertTriangle,
  Box,
  FileTextIcon,
  Folder,
  PlusIcon,
  User,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    state => state.popup
  );

  const { stats, projects } = useSelector(state => state.admin);
  const notifications = useSelector(state => state.notification.list);

  const dispatch = useDispatch();

  const [isReportsModelOpen, setIsReportsModelOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
  }, [dispatch]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    return (projects || []).filter(project => {
      if (!project.deadline) return false;

      const deadline = new Date(project.deadline);

      return deadline >= now && deadline.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap(project =>
      (project.files || []).map(file => ({
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        projectTitle: project.title,
        studentName: project.student?.name,
      }))
    );
  }, [projects]);

  const filteredFiles = files.filter(
    file =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase())
  );

  const handleDownload = async (projectId, fileId, name) => {
    await dispatch(downloadProjectFile({ projectId, fileId, name }));
  };

  const supervisorsBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach(project => {
      if (!project.supervisor?.name) return;

      const name = project.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 6),
    [notifications]
  );

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject"))
      return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due"))
      return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    // type-based fallback
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v))
        return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v))
        return "bg-orange-100 text-orange-800";
      if (v === "request") return "bg-blue-100 text-blue-800";
      if (v === "feedback") return "bg-purple-100 text-purple-800";
      if (v === "meeting") return "bg-cyan-100 text-cyan-800";
      if (v === "system") return "bg-slate-100 text-slate-800";
      return "bg-gray-100 text-gray-800";
    }
    // priority
    if (v === "high") return "bg-red-100 text-red-800";
    if (v === "medium") return "bg-yellow-100 text-yellow-800";
    if (v === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: Box,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Folder,
    },
    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      bg: "bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModel()),
      btnClass: "btn-primary",
      Icon: PlusIcon,
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModel()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportsModelOpen(true),
      btnClass: "btn-outline",
      Icon: FileTextIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-sm border border-blue-100 text-white">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-90">
          Manage the entire project management system and oversee all
          activities.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {dashboardStats.map((item, i) => (
          <div
            key={i}
            className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
                <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <div className="ml-3">
                <p className={`text-xs font-medium text-slate-600`}>
                  {item.title}
                </p>
                <p className={`text-lg font-bold text-slate-800`}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vertical bar charts */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title">Project Distribution by Supervisor</h3>
          </div>
          <div className="p-4">
            {supervisorsBucket.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-sky-500">
                No Data
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width={"100%"} height={"100%"}>
                  <BarChart
                    data={supervisorsBucket}
                    margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    barCategoryGap={"20%"}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey={"name"}
                      tick={{ fontSize: 12, fill: "#334155" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={{ stroke: "#cbd5e1" }}
                      interval={0}
                      height={50}
                      dy={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#334155" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />

                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "#e2e8f0",
                      }}
                      formatter={(value, name) => [
                        value,
                        name === "count" ? "Projects Assigned" : name,
                      ]}
                      labelFormatter={label => `Supervisor: ${label}`}
                    />

                    <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    {supervisorsBucket.map((entry, index) => {
                      const colors = [
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            {latestNotifications.map(notification => {
              return (
                <div
                  key={notification._id}
                  className="flex items-center text-sm"
                >
                  <div
                    className={`mt-1 w-2 h-2 ${getBulletColor(notification.type, notification.priority)} rounded-full flex-shrink-0 mr-3`}
                  />

                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">
                      {notification.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${getBadgeClasses("type", notification.type)}`}
                      >
                        {notification.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${getBulletColor(notification.type, notification.priority)}`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {latestNotifications.length === 0 && (
              <div className="text-slate-500 text-sm ">
                No recent notifications.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionButtons.map((btn, index) => {
            return (
              <button
                key={index}
                className={`${btn.btnClass} flex items-center justify-center space-x-2 `}
                onClick={btn.onClick}
              >
                <btn.Icon className="h-5 w-5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* isReportsModelOpen */}
      {isReportsModelOpen && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                All Files
              </h3>
              <button
                onClick={() => setIsReportsModelOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="input w-full"
                placeholder="Search by file name, project title, or student name"
                value={reportSearch}
                onChange={e => setReportSearch(e.target.value)}
              />
            </div>

            {filteredFiles.length === 0 ? (
              <div className="text-slate-500">No Files Found.</div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {file.originalName}
                        </div>

                        <div className="font-sm text-slate-500">
                          {file.projectTitle} - {file.studentName}
                        </div>
                      </div>

                      <button
                        className="btn-outline btn-small"
                        onClick={() =>
                          handleDownload(
                            file.projectId,
                            file.fileId,
                            file.originalName
                          )
                        }
                      >
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
  );
};

export default AdminDashboard;
