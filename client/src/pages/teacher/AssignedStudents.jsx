import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader, Users, FolderOpen, TrendingUp, Award } from "lucide-react";
import { getAssignedStudents, addFeedback, markComplete } from "../../store/slices/teacherSlice";
const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModel, setShowFeedbackModel] = useState(false);
  const [showCompleteModel, setShowCompleteModel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const { assignedStudents, loading, error } = useSelector((state) => state.teacher);

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
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModel(true);
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModel(true);
  };

  const closeModal = () => {
    setShowFeedbackModel(false);
    setShowCompleteModel(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
  };

  const submitFeedback = () => {
    if (selectedStudent?.project?._id && feedbackData.title && feedbackData.message) {
      dispatch(addFeedback({ projectId: selectedStudent.project._id, payload: feedbackData }));
      closeModal();
    }
  };

  const confirmMarkComplete = () => {
    if (selectedStudent?.project?._id) {
      dispatch(markComplete(selectedStudent.project._id));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-header">Assigned Students</h1>
            <p className="text-gray-500 mt-1">Manage your assigned students and their projects</p>
          </div>
          {/* Sort control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="name">Sort by Name</option>
            <option value="lastActivity">Sort by Last Activity</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Stats.map((item) => {
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

      {/* Student Grid */}
      {sortedStudents.length === 0 ? (
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
              {/* Student header */}
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(student.project?.status)}`}>
                  {getStatusText(student.project?.status)}
                </span>
              </div>

              {student.project ? (
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 truncate">{student.project.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated: {new Date(student.project.updatedAt || new Date()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-400 italic">No project assigned yet</p>
                </div>
              )}

              {/* Actions */}
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
          ))}
        </div>
      )}

      {/* feedback modal */}
      {showFeedbackModel && (
        <div
          className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-800">Provide Feedback</h2>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Project info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Student</span>
                  <span className="text-slate-700 font-semibold">{selectedStudent?.name}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Project</span>
                  <span className="text-slate-700">{selectedStudent?.project?.title || "—"}</span>
                </div>
                {selectedStudent?.project?.deadline && (
                  <div className="flex gap-2 text-xs">
                    <span className="font-medium text-slate-500 w-20 flex-shrink-0">Deadline</span>
                    <span className="text-slate-700">{new Date(selectedStudent.project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex gap-2 text-xs">
                  <span className="font-medium text-slate-500 w-20 flex-shrink-0">Updated</span>
                  <span className="text-slate-700">{new Date(selectedStudent?.project?.updatedAt || new Date()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Form */}
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

              {/* Actions */}
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

      {/* Mark complete modal*/}
      {showCompleteModel && selectedStudent && (
        <div
          className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
                You're about to mark <span className="font-semibold text-slate-700">{selectedStudent.name}</span>'s project as completed.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                "{selectedStudent.project?.title}"
              </p>
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