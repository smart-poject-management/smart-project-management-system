import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  CheckCircle,
  X,
  Users,
  FolderOpen,
  TrendingUp,
  Award,
  ArrowLeft,
  Eye
} from "lucide-react";
import {
  getAssignedStudents,
  addFeedback,
  markComplete,
  setSelectedStudent
} from "../../store/slices/teacherSlice";
import AssignmentsTeacherTab from "./AssignmentTeacherTab";
import ChatTeacherTab from "./ChatTeacherTab ";

const tabsList = ["Overview", "Assignments", "Learning", "Chat"];

const AVATAR_COLORS = [
  "#4F46E5", "#7C3AED", "#DB2777", "#059669",
  "#D97706", "#DC2626", "#0284C7", "#65A30D",
];

const avatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const getDept = (student) =>
  typeof student?.department === "object"
    ? student.department?.department || "N/A"
    : student?.department || "N/A";

const Avatar = ({ name, size = 48 }) => (
  <div
    style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.35 }}
    className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 tracking-wide"
  >
    {getInitials(name)}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-800 text-right capitalize ml-4 truncate max-w-[60%]">
      {value || "—"}
    </span>
  </div>
);

//  Skeleton Components 

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
    <div className="animate-pulse bg-slate-200 rounded-lg p-2 w-8 h-8 flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <SkeletonPulse className="h-3 w-20" />
      <SkeletonPulse className="h-6 w-8" />
    </div>
  </div>
);

const StudentCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    {/* Top Section */}
    <div className="flex items-center gap-3 mb-4">
      <SkeletonPulse className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-3.5 w-32" />
        <SkeletonPulse className="h-3 w-44" />
      </div>
      <SkeletonPulse className="h-6 w-16 rounded-full flex-shrink-0" />
    </div>

    {/* Project Section */}
    <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-2">
      <SkeletonPulse className="h-3.5 w-48" />
      <SkeletonPulse className="h-3 w-36" />
    </div>

    {/* Bottom Actions */}
    <div className="flex items-center justify-between gap-2">
      <SkeletonPulse className="h-7 w-16 rounded-lg" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-7 w-20 rounded-lg" />
        <SkeletonPulse className="h-7 w-28 rounded-lg" />
      </div>
    </div>
  </div>
);
const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModel, setShowFeedbackModel] = useState(false);
  const [showCompleteModel, setShowCompleteModel] = useState(false);
  const [feedbackStudent, setFeedbackStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAssignedStudents());
    dispatch(setSelectedStudent(null));
  }, [dispatch]);

  const { assignedStudents, selectedStudent, loading, error } = useSelector(
    (state) => state.teacher
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "approved":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "in-progress":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const getStatusText = (status) => {
    if (status === "completed") return "Completed";
    if (status === "approved") return "Approved";
    if (status === "in-progress") return "In Progress";
    return "Pending";
  };

  const handleFeedback = (student) => {
    setFeedbackStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModel(true);
  };

  const handleMarkComplete = (student) => {
    setFeedbackStudent(student);
    setShowCompleteModel(true);
  };

  const handleViewDetails = (student) => {
    setActiveTab("Overview");
    dispatch(setSelectedStudent(student));
  };

  const handleBack = () => {
    dispatch(setSelectedStudent(null));
    setActiveTab("Overview");
  };

  const closeModal = () => {
    setShowFeedbackModel(false);
    setShowCompleteModel(false);
    setFeedbackStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
  };

  const submitFeedback = () => {
    if (feedbackStudent?.project?._id && feedbackData.title && feedbackData.message) {
      dispatch(addFeedback({ projectId: feedbackStudent.project._id, payload: feedbackData }));
      closeModal();
    }
  };

  const confirmMarkComplete = () => {
    if (feedbackStudent?.project?._id) {
      dispatch(markComplete(feedbackStudent.project._id));
      closeModal();
    }
  };

  const sortedStudents = [...(assignedStudents || [])].filter(Boolean).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastActivity":
        return new Date(b.project?.updatedAt) - new Date(a.project?.updatedAt);
      default:
        return 0;
    }
  });

  const Stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      label: "Completed",
      value: sortedStudents.filter((s) => s.project?.status === "completed").length,
      icon: Award,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter((s) => s.project?.status === "in-progress").length,
      icon: TrendingUp,
      bg: "bg-amber-50",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      label: "Total Projects",
      value: sortedStudents.filter((s) => s.project).length,
      icon: FolderOpen,
      bg: "bg-violet-50",
      text: "text-violet-700",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
          <p className="text-red-600 font-medium text-sm">{error || "Error loading students"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {selectedStudent ? (
        // Student Detail Page
        <>
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-3 shadow-sm sticky top-0 z-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600
                        hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Students
            </button>
          </div>

          <div
            className="px-8 py-8 flex items-center gap-6"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
          >
            <div className="p-1 rounded-full bg-white/25">
              <Avatar name={selectedStudent.name} size={68} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white leading-tight">{selectedStudent.name}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{selectedStudent.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium capitalize border border-white/20">
                  {selectedStudent.status || "Pending"}
                </span>
                <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                  {getDept(selectedStudent)}
                </span>
                <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                  Roll: {selectedStudent.rollNo || selectedStudent._id?.slice(-6)?.toUpperCase() || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border-b border-slate-200 px-6 flex gap-1 sticky top-[53px] z-10">
            {tabsList.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 px-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-indigo-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 bg-slate-50 min-h-[400px]">
            {activeTab === "Overview" && (
              <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Info</h3>
                  </div>
                  <div className="px-5">
                    <InfoRow label="Full Name" value={selectedStudent.name} />
                    <InfoRow label="Email" value={selectedStudent.email} />
                    <InfoRow label="Department" value={getDept(selectedStudent)} />
                    <InfoRow label="Roll No" value={selectedStudent.rollNo || selectedStudent._id?.slice(-6)?.toUpperCase()} />
                    <InfoRow label="Project Title" value={selectedStudent.projectTitle} />
                    <InfoRow label="Project Status" value={selectedStudent.project?.status || selectedStudent.status} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Assignments" && <AssignmentsTeacherTab student={selectedStudent} />}

            {activeTab === "Learning" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <p className="text-slate-400">Learning progress coming soon</p>
              </div>
            )}

            {activeTab === "Chat" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <ChatTeacherTab student={selectedStudent} />
              </div>
            )}
          </div>
        </>
      ) : (
    // Students Grid View 
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="page-header">Assigned Students</h1>
                <p className="text-gray-500 mt-1">Manage your assigned students and their projects</p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="name">Sort by Name</option>
                <option value="lastActivity">Sort by Last Activity</option>
              </select>
            </div>

            {/* Stats — skeleton while loading */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : Stats.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className={`${item.bg} rounded-xl p-4 flex items-center gap-3`}>
                        <div className={`${item.iconBg} rounded-lg p-2 flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 leading-none">{item.label}</p>
                          <p className={`text-xl font-bold mt-1 ${item.text}`}>{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Cards — skeleton while loading, empty state when done */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <StudentCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No assigned students yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {sortedStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  {/* Top Section */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-sm font-bold">
                        {student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "S"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-700 truncate">{student.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(
                        student.project?.status
                      )}`}
                    >
                      {getStatusText(student.project?.status)}
                    </span>
                  </div>

                  {/* Project Section */}
                  {student.project ? (
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 truncate">
                        {student.project.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Last updated:{" "}
                        {new Date(student.project.updatedAt || new Date()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-slate-400 italic">No project assigned yet</p>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeedback(student)}
                        disabled={!student.project}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Feedback
                      </button>

                      <button
                        onClick={() => handleMarkComplete(student)}
                        disabled={!student.project || student.project?.status === "completed"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal  */}
      {showFeedbackModel && (
        <div
          className="fixed inset-0 -top-10 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-800">Provide Feedback</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Student</span>
                  <span className="text-slate-700 font-semibold">{feedbackStudent?.name}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Project</span>
                  <span className="text-slate-700">{feedbackStudent?.project?.title || "—"}</span>
                </div>
                {feedbackStudent?.project?.deadline && (
                  <div className="flex gap-2 text-xs">
                    <span className="font-medium text-slate-500 w-20 flex-shrink-0">Deadline</span>
                    <span className="text-slate-700">
                      {new Date(feedbackStudent.project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Updated</span>
                  <span className="text-slate-700">
                    {new Date(feedbackStudent?.project?.updatedAt || new Date()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={feedbackData.title}
                    onChange={(e) => setFeedbackData({ ...feedbackData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Enter feedback title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
                  <select
                    value={feedbackData.type}
                    onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all"
                  >
                    <option value="general">General</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-all"
                    placeholder="Enter your feedback message..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackData.title || !feedbackData.message}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Complete Modal */}
      {showCompleteModel && feedbackStudent && (
        <div
          className="fixed inset-0 -top-10 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Mark as Complete?</h2>
              <p className="text-xs text-slate-500 mb-1">
                You're about to mark{" "}
                <span className="font-semibold text-slate-700">{feedbackStudent.name}</span>'s project as completed.
              </p>
              <p className="text-xs text-slate-400 mb-6">"{feedbackStudent.project?.title}"</p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkComplete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedStudents;