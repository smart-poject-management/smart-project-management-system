import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  Eye,
  Upload,
  X,
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Check,
  XCircle,
} from "lucide-react";
import {
  getAssignments,
  markAsRead,
  submitAssignment,
} from "../../store/slices/assignmentSlice";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const AssignmentsTab = () => {
  const dispatch = useDispatch();

  const { assignments = [] } = useSelector((state) => state.assignment);
  const { user: authUser } = useSelector((state) => state.auth);

  const [loadingMap, setLoadingMap] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => !!a.submission?.submittedAt).length;
  const pendingCount = totalCount - completedCount;

  useEffect(() => {
    if (authUser?._id) dispatch(getAssignments(authUser._id));
  }, [authUser?._id, dispatch]);

  const handleAction = async (assignment, action) => {
    const id = assignment._id;
    setLoadingMap((prev) => ({ ...prev, [id]: action }));
    try {
      if (action === "view") {
        if (!assignment.isRead) await dispatch(markAsRead(id));
        setSelectedAssignment(assignment);
      } else if (action === "read") {
        await dispatch(markAsRead(id));
      } else if (action === "submit") {
        await dispatch(
          submitAssignment({ id, fileUrl: "https://dummyfile.com/file.pdf" })
        );
      } else if (action === "close") {
        setSelectedAssignment(null);
      }
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: null }));
    }
  };

  const renderModal = () => {
    if (!selectedAssignment) return null;
    const a =
      assignments.find((x) => x._id === selectedAssignment._id) ||
      selectedAssignment;
    const isSubmitted = !!a.submission?.submittedAt;
    const isRead = a.isRead === true;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
          <div
            className="px-6 py-5 flex items-start justify-between"
            style={{ background: "linear-gradient(to right, #4f46e5, #9333ea)" }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">
                  Assignment Detail
                </p>
                <h2 className="text-white text-xl font-bold mt-0.5">{a.title}</h2>
              </div>
            </div>
            <button
              onClick={() => handleAction(a, "close")}
              className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${isSubmitted
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
                  }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {isSubmitted ? "Completed" : "Pending Submission"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${isRead
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {isRead ? "Read" : "Unread"}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-700 text-sm">
                {a.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {a.dueDate && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Due Date</span>
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {new Date(a.dueDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
              {isSubmitted && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Submitted</span>
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {new Date(a.submission.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
              {a.submission?.fileUrl && (
                <div className="col-span-2 bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">File</span>
                  </div>
                  <a
                    href={a.submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-purple-700 break-all hover:underline"
                  >
                    {a.submission.fileUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-slate-50 flex justify-end">
            <button
              onClick={() => handleAction(a, "close")}
              className="px-4 py-2 text-sm rounded-lg border text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}

      {assignments.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No assignments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Sr.No</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y text-slate-900">
                {assignments.map((a, index) => {
                  const isSubmitted = !!a.submission?.submittedAt;
                  const isRead = a.isRead === true;
                  const currentLoading = loadingMap[a._id];

                  return (
                    <tr key={a._id} className="border-t hover:bg-slate-50 transition-colors">

                      {/* Sr.No */}
                      <td className="px-4 py-4 text-sm text-slate-500">{index + 1}</td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="font-medium text-slate-800 capitalize">{a.title}</span>
                          {!isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                          )}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isSubmitted
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {isSubmitted
                            ? <CheckCircle className="w-3.5 h-3.5" />
                            : <XCircle className="w-3.5 h-3.5" />}
                          {isSubmitted ? "Completed" : "Pending"}
                        </span>
                      </td>
                      {/* Submitted */}
                      <td className="px-6 py-4">
                        {isSubmitted ? (
                          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {new Date(a.submission.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <XCircle className="w-3 h-3" />
                            Not Submitted
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            data-tooltip-id="view-tooltip"
                            data-tooltip-content="View"
                            onClick={() => handleAction(a, "view")}
                            disabled={!!currentLoading}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors ${currentLoading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {currentLoading === "view" ? "Opening..." : ""}
                            <Tooltip id="view-tooltip" place="top" offset={10} />
                          </button>
                          {/* Mark Read */}
                          {!a.isRead && (
                            <button
                              data-tooltip-id="read-tooltip"
                              data-tooltip-content="Mark as Read"
                              onClick={() => handleAction(a, "read")}
                              disabled={!!currentLoading}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium transition-colors ${currentLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {currentLoading === "read" ? "Marking..." : ""}
                              <Tooltip id="read-tooltip" place="top" offset={10} />
                            </button>
                          )}
                          {/* Submit */}
                          {!isSubmitted && (
                            <button
                              data-tooltip-id="submit-tooltip"
                              data-tooltip-content="Submit Assignment"
                              onClick={() => handleAction(a, "submit")}
                              disabled={!!currentLoading}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium transition-colors ${currentLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Upload className="w-3.5 h-3.5" />

                              {currentLoading === "submit"
                                ? "Submitting..."
                                : ""}

                              <Tooltip id="submit-tooltip" place="top" offset={10} />
                            </button>

                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;