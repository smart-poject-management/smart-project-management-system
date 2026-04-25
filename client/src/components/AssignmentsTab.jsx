import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssignments,
  markAsRead,
  submitAssignment,
} from "../store/slices/assignmentSlice";
import {
  CheckCircle,
  Eye,
  Upload,
  X,
  FileText,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";

const AssignmentDetailModal = ({ assignment, onClose }) => {
  if (!assignment) return null;

  const isSubmitted = !!assignment.submission?.submittedAt;
  const isRead = assignment.isRead === true;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
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
              <h2 className="text-white text-xl font-bold mt-0.5">
                {assignment.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isSubmitted
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <CheckCircle className="w-3 h-3 inline mr-1" />
              {isSubmitted ? "Completed" : "Pending Submission"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isRead
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              {isRead ? "Read" : "Unread"}
            </span>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-700 text-sm">
              {assignment.description || "No description provided."}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {assignment.dueDate && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">
                    Due Date
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {new Date(assignment.dueDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}

            {isSubmitted && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 text-green-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">
                    Submitted
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {new Date(
                    assignment.submission.submittedAt
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}

            {assignment.submission?.fileUrl && (
              <div className="col-span-2 bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-600">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">
                    File
                  </span>
                </div>
                <a
                  href={assignment.submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-purple-700 break-all hover:underline"
                >
                  {assignment.submission.fileUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignmentsTab = () => {
  const dispatch = useDispatch();

  const { assignments = [], loading } = useSelector(
    (state) => state.assignment
  );
  const { user: authUser } = useSelector((state) => state.auth);

  const [submittingId, setSubmittingId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getAssignments(authUser._id));
    }
  }, [authUser?._id, dispatch]);

  const handleOpenDetail = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCloseDetail = () => {
    setSelectedAssignment(null);
  };

  const handleMarkRead = async (assignment) => {
    await dispatch(markAsRead(assignment._id));
  };

  const handleAction = async (assignment) => {
    if (!assignment.isRead) {
      await handleMarkRead(assignment);
    }
    handleOpenDetail(assignment);
  };

  const handleSubmit = async (id) => {
    setSubmittingId(id);
    await dispatch(
      submitAssignment({ id, fileUrl: "https://dummyfile.com/file.pdf" })
    );
    setSubmittingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={
            assignments.find((a) => a._id === selectedAssignment._id) ||
            selectedAssignment
          }
          onClose={handleCloseDetail}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">My Assignments</h2>
        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
          {assignments.length} Total
        </span>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {assignments.map((a) => {
          const isSubmitted = !!a.submission?.submittedAt;

          return (
            <div
              key={a._id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {a.title}
                    {!a.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {a.description || "No description"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAction(a)}
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      a.isRead
                        ? "bg-slate-100 text-slate-600"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    {a.isRead ? "View" : "Mark Read"}
                  </button>

                  {!isSubmitted && (
                    <button
                      onClick={() => handleSubmit(a._id)}
                      disabled={submittingId === a._id}
                      className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg"
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      {submittingId === a._id ? "Submitting" : "Submit"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsTab;