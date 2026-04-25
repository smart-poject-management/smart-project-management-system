import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
} from "../../store/slices/assignmentSlice";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  X,
  BookOpen,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

const DeleteConfirmModal = ({ onConfirm, onCancel, title }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-red-50 px-6 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Delete Assignment?</h3>
        <p className="text-sm text-slate-600">
          Assignment <span className="font-semibold text-slate-700">"{title}"</span> will be permanently deleted.
          This action cannot be undone.
        </p>
      </div>

      <div className="px-6 py-4 bg-slate-50 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

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
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isSubmitted
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              {isSubmitted ? "Submitted" : "Not Submitted"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isRead
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Eye className="w-3 h-3" />
              {isRead ? "Read by Student" : "Unread by Student"}
            </span>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              {assignment.description || "No description provided."}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {assignment.dueDate && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Due Date
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-medium">
                  {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {isSubmitted && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Submitted On
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-medium">
                  {new Date(
                    assignment.submission.submittedAt
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {assignment.submission?.fileUrl && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 col-span-2">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Submitted File
                  </span>
                </div>
                <a
                  href={assignment.submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-700 text-sm font-medium hover:underline break-all"
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
            className="px-5 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignmentsTeacherTab = ({ student }) => {
  const dispatch = useDispatch();

  const { assignments = [], loading } = useSelector(
    (state) => state.assignment
  );

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);

  useEffect(() => {
    if (student?._id) {
      dispatch(getAssignments(student._id));
    }
  }, [student?._id, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;

    await dispatch(
      createAssignment({ ...formData, studentId: student._id })
    );

    setFormData({ title: "", description: "", dueDate: "" });
    setShowModal(false);
  };

  const handleDeleteClick = (assignment) => {
    setDeleteTarget({ id: assignment._id, title: assignment.title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteAssignment(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* View Detail Modal */}
      {viewAssignment && (
        <AssignmentDetailModal
          assignment={viewAssignment}
          onClose={() => setViewAssignment(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-slate-400 text-sm">Loading...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && assignments.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No assignments yet</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && assignments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[
                  "Sr",
                  "Title",
                  "Due Date",
                  "Status",
                  "Read",
                  "Submitted",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {assignments.map((a, index) => {
                const isSubmitted = !!a.submission?.submittedAt;
                const isRead = a.isRead === true;

                return (
                  <tr
                    key={a._id}
                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* SR NO */}
                    <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* TITLE */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800">
                          {a.title}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {a.dueDate
                        ? new Date(a.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isSubmitted
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isSubmitted ? "Completed" : "Pending"}
                      </span>
                    </td>

                    {/* READ */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          isRead ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        {isRead ? "✓ Read" : "Unread"}
                      </span>
                    </td>

                    {/* SUBMISSION */}
                    <td className="px-4 py-3">
                      {isSubmitted ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          {new Date(
                            a.submission.submittedAt
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <XCircle className="w-3 h-3" />
                          Not submitted
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewAssignment(a)}
                          title="View"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(a)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                Add Assignment
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Assignment title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Assignment description (optional)"
                  value={formData.description}
                  rows={3}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 p-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTeacherTab;