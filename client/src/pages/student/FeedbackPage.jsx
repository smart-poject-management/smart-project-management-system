import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import {
  AlertTriangle, Loader2, MessageSquare,
  ThumbsUp,
  AlertCircle,
  FileText,
  Info,
  CheckCircle,
  MessageCircleOff,
} from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback, loading, error } = useSelector(state => state.student);
  const [activeFilter, setActiveFilter] = useState("all");
  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);
  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project?._id]);
  const handleFilterClick = (type) => {
    setActiveFilter(prev => (prev === type && type !== "all" ? "all" : type));
  };
  const getFeedbackIcon = (type) => {
    switch (type) {
      case "total":
        return <MessageSquare className="w-6 h-6 text-blue-500" />;
      case "positive":
        return <ThumbsUp className="w-6 h-6 text-green-500" />;
      case "revision":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "file":
        return <FileText className="w-6 h-6 text-purple-500" />;
      case "general":
        return <Info className="w-6 h-6 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      default:
        return <MessageSquare className="w-6 h-6 text-gray-400" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "positive": return "bg-green-100 text-green-700";
      case "revision": return "bg-red-100 text-red-700";
      case "file": return "bg-purple-100 text-purple-700";
      case "general": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getBorderStyle = (type) => {
    switch (type) {
      case "positive": return "border-l-green-400";
      case "revision": return "border-l-red-400";
      case "file": return "border-l-purple-400";
      case "general": return "border-l-red-400";
      default: return "border-l-blue-400";
    }
  };

  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  const filteredFeedback =
    activeFilter === "all"
      ? safeFeedback
      : safeFeedback.filter(f => f.type === activeFilter);

  const feedbackStats = [
    {
      type: "all",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-700",
      valueColor: "text-blue-900",
      activeBorder: "ring-2 ring-blue-400 ring-offset-1",
      getCount: () => safeFeedback.length,
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-700",
      valueColor: "text-green-900",
      activeBorder: "ring-2 ring-green-400 ring-offset-1",
      getCount: () => safeFeedback.filter(f => f.type === "positive").length,
    },
    {
      type: "general",
      title: "General",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-700",
      valueColor: "text-red-900",
      activeBorder: "ring-2 ring-red-400 ring-offset-1",
      getCount: () => safeFeedback.filter(f => f.type === "general").length,
    },
    {
      type: "file",
      title: "File Reviews",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      textColor: "text-purple-700",
      valueColor: "text-purple-900",
      activeBorder: "ring-2 ring-purple-400 ring-offset-1",
      getCount: () => safeFeedback.filter(f => f.type === "file").length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm font-medium">{typeof error === "string" ? error : "Failed to load feedback."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 overflow-x-hidden">
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">

        {/* Feedback Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Supervisor Feedback</h2>
            <p className="text-sm text-slate-500">
              View feedback and comments from your supervisor
            </p>
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {feedbackStats.map((item, i) => (
            <div
              key={i}
              onClick={() => handleFilterClick(item.type)}
              className={`
                ${item.bg} rounded-2xl p-4 shadow-md cursor-pointer select-none
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                ${activeFilter === item.type ? `${item.activeBorder} scale-[1.03]` : ""}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
                  {getFeedbackIcon(item.type === "all" ? "total" : item.type)}
                </div>
                <div>
                  <p className={`text-xs font-medium ${item.textColor}`}>
                    {item.title}
                  </p>
                  <p className={`text-lg font-bold ${item.valueColor}`}>
                    {item.getCount()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div
                key={item._id}
                className={`bg-slate-50 border border-slate-200 border-l-4 ${getBorderStyle(item.type)} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex-shrink-0">
                    {getFeedbackIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeStyle(item.type)}`}>
                          {item.type
                            ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                            : "General"}
                        </span>
                        {item.title && (
                          <span className="text-sm font-semibold text-slate-700">
                            {item.title}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : ""}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.message || (
                        <span className="text-slate-400 italic">No message provided.</span>
                      )}
                    </p>
                    {(item.supervisorName || item.supervisorEmail) && (
                      <p className="text-xs text-slate-400 mt-2">
                        — {item.supervisorName || item.supervisorEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <MessageCircleOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {activeFilter === "all"
                  ? "No feedback yet from your supervisor."
                  : `No ${activeFilter} feedback found.`}
              </p>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-600 underline underline-offset-2"
                >
                  Show all feedback
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FeedbackPage;