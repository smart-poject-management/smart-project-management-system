// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getAssignments,
//   createAssignment,
//   deleteAssignment,
// } from "../../store/slices/assignmentSlice";
// import {
//   Plus,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Trash2,
//   Eye,
//   X,
//   BookOpen,
//   FileText,
//   Clock,
//   AlertTriangle,
// } from "lucide-react";
// import { Tooltip } from "react-tooltip";
// import "react-tooltip/dist/react-tooltip.css";

// const AssignmentsTeacherTab = ({ student }) => {
//   const dispatch = useDispatch();
//   const { assignments = [], loading } = useSelector((state) => state.assignment);

//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//   });
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [viewAssignment, setViewAssignment] = useState(null);

//   const getTodayDate = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   useEffect(() => {
//     if (student?._id) {
//       dispatch(getAssignments(student._id));
//     }
//   }, [student?._id, dispatch]);

//   useEffect(() => {
//     if (showModal) {
//       setFormData({
//         title: "",
//         description: "",
//         dueDate: getTodayDate(),
//       });
//     }
//   }, [showModal]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.dueDate) return;

//     await dispatch(createAssignment({ ...formData, studentId: student._id }));
//     setFormData({ title: "", description: "", dueDate: "" });
//     setShowModal(false);
//   };

//   const handleDeleteClick = (assignment) => {
//     setDeleteTarget({ id: assignment._id, title: assignment.title });
//   };

//   const handleDeleteConfirm = async () => {
//     if (!deleteTarget) return;
//     await dispatch(deleteAssignment(deleteTarget.id));
//     setDeleteTarget(null);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Delete Modal */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
//             <div className="bg-red-50 px-6 pt-6 pb-4 flex flex-col items-center text-center">
//               <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
//                 <AlertTriangle className="w-7 h-7 text-red-500" />
//               </div>
//               <h3 className="text-lg font-bold text-slate-800">
//                 Delete Assignment?
//               </h3>
//               <p className="text-sm text-slate-600">
//                 Assignment{" "}
//                 <span className="font-semibold text-slate-700">
//                   "{deleteTarget.title}"
//                 </span>{" "}
//                 will be permanently deleted. This action cannot be undone.
//               </p>
//             </div>
//             <div className="px-6 py-4 bg-slate-50 flex gap-3">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
//               >
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Detail Modal */}
//       {viewAssignment && (
//         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
//             <div
//               className="px-6 py-5 flex items-start justify-between"
//               style={{ background: "linear-gradient(to right, #4f46e5, #9333ea)" }}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="bg-white/20 p-2 rounded-lg">
//                   <BookOpen className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">
//                     Assignment Detail
//                   </p>
//                   <h2 className="text-white text-xl font-bold mt-0.5">
//                     {viewAssignment.title}
//                   </h2>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setViewAssignment(null)}
//                 className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-5">
//               <div className="flex flex-wrap gap-2">
//                 <span
//                   className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${viewAssignment.submission?.submittedAt
//                       ? "bg-green-100 text-green-700"
//                       : "bg-amber-100 text-amber-700"
//                     }`}
//                 >
//                   <CheckCircle className="w-3 h-3" />
//                   {viewAssignment.submission?.submittedAt
//                     ? "Submitted"
//                     : "Not Submitted"}
//                 </span>

//                 <span
//                   className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${viewAssignment.isRead
//                       ? "bg-blue-100 text-blue-700"
//                       : "bg-slate-100 text-slate-500"
//                     }`}
//                 >
//                   <Eye className="w-3 h-3" />
//                   {viewAssignment.isRead ? "Read by Student" : "Unread by Student"}
//                 </span>
//               </div>

//               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
//                   Description
//                 </p>
//                 <p className="text-slate-700 text-sm leading-relaxed">
//                   {viewAssignment.description || "No description provided."}
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 {viewAssignment.dueDate && (
//                   <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
//                     <div className="flex items-center gap-2 text-orange-600 mb-1">
//                       <Calendar className="w-4 h-4" />
//                       <span className="text-xs font-semibold uppercase tracking-wider">
//                         Due Date
//                       </span>
//                     </div>
//                     <p className="text-slate-800 text-sm font-medium">
//                       {new Date(viewAssignment.dueDate).toLocaleDateString(
//                         "en-IN",
//                         {
//                           day: "numeric",
//                           month: "long",
//                           year: "numeric",
//                         }
//                       )}
//                     </p>
//                   </div>
//                 )}

//                 {viewAssignment.submission?.submittedAt && (
//                   <div className="bg-green-50 rounded-xl p-4 border border-green-100">
//                     <div className="flex items-center gap-2 text-green-600 mb-1">
//                       <Clock className="w-4 h-4" />
//                       <span className="text-xs font-semibold uppercase tracking-wider">
//                         Submitted On
//                       </span>
//                     </div>
//                     <p className="text-slate-800 text-sm font-medium">
//                       {new Date(
//                         viewAssignment.submission.submittedAt
//                       ).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       })}
//                     </p>
//                   </div>
//                 )}

//                 {viewAssignment.submission?.fileUrl && (
//                   <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 col-span-2">
//                     <div className="flex items-center gap-2 text-purple-600 mb-1">
//                       <FileText className="w-4 h-4" />
//                       <span className="text-xs font-semibold uppercase tracking-wider">
//                         Submitted File
//                       </span>
//                     </div>
//                     <a
//                       href={viewAssignment.submission.fileUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-purple-700 text-sm font-medium hover:underline break-all"
//                     >
//                       {viewAssignment.submission.fileUrl}
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="border-t px-6 py-4 bg-slate-50 flex justify-end">
//               <button
//                 onClick={() => setViewAssignment(null)}
//                 className="px-5 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex justify-end items-center">
//         <button
//           onClick={() => setShowModal(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Add Assignment
//         </button>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="flex items-center justify-center py-10">
//           <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//           <span className="ml-2 text-slate-400 text-sm">Loading...</span>
//         </div>
//       )}

//       {/* Empty */}
//       {!loading && assignments.length === 0 && (
//         <div className="text-center py-10">
//           <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
//           <p className="text-slate-400 text-sm">No assignments yet</p>
//         </div>
//       )}

//       {/* Table */}
//       {!loading && assignments.length > 0 && (
//         <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">

//           <div className="px-4 py-4 border-b border-slate-200">
//             <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-50">
//                 <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                   <th className="px-4 py-3">Sr.no</th>
//                   <th className="px-6 py-3">Title</th>
//                   <th className="px-6 py-3">Due Date</th>
//                   <th className="px-6 py-3">Status</th>
//                   <th className="px-6 py-3">Read</th>
//                   <th className="px-6 py-3">Submitted</th>
//                   <th className="px-6 py-3">Action</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y capitalize font-medium text-slate-900">
//                 {assignments.map((a, index) => {
//                   const isSubmitted = !!a.submission?.submittedAt;
//                   const isRead = a.isRead === true;

//                   return (
//                     <tr key={a._id} className="border-t hover:bg-slate-50">
//                       <td className="px-4 py-4">{index + 1}</td>

//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
//                           <span className="font-medium text-slate-800">
//                             {a.title}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 text-slate-600 text-xs">
//                         {a.dueDate
//                           ? new Date(a.dueDate).toLocaleDateString("en-IN", {
//                             day: "numeric",
//                             month: "short",
//                             year: "numeric",
//                           })
//                           : "—"}
//                       </td>

//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-2 py-1 text-xs rounded-full font-medium ${isSubmitted
//                               ? "bg-green-100 text-green-700"
//                               : "bg-amber-100 text-amber-700"
//                             }`}
//                         >
//                           {isSubmitted ? "Completed" : "Pending"}
//                         </span>
//                       </td>

//                       <td className="px-6 py-4">
//                         <span
//                           className={`text-xs font-medium ${isRead ? "text-blue-600" : "text-slate-400"
//                             }`}
//                         >
//                           {isRead ? "✓ Read" : "Unread"}
//                         </span>
//                       </td>

//                       <td className="px-6 py-4">
//                         {isSubmitted ? (
//                           <div className="flex items-center gap-1 text-green-600 text-xs">
//                             <CheckCircle className="w-3 h-3" />
//                             {new Date(a.submission.submittedAt).toLocaleDateString(
//                               "en-IN",
//                               {
//                                 day: "numeric",
//                                 month: "short",
//                               }
//                             )}
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-1 text-slate-400 text-xs">
//                             <XCircle className="w-3 h-3" />
//                             Not submitted
//                           </div>
//                         )}
//                       </td>

//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-4">
//                           <button
//                             data-tooltip-id="view-tooltip"
//                             data-tooltip-content="View"
//                             onClick={() => setViewAssignment(a)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
//                           >
//                             <Eye className="w-3.5 h-3.5" />
//                             <Tooltip id="view-tooltip" place="top" offset={10} />
//                           </button>
//                           <button
//                             data-tooltip-id="delete-tooltip"
//                             data-tooltip-content="Delete"
//                             onClick={() => handleDeleteClick(a)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                             <Tooltip id="delete-tooltip" place="top" offset={10} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Add Assignment Modal */}
//       {showModal && (
//         <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
//             <div className="flex items-center justify-between mb-5">
//               <h3 className="text-lg font-bold text-slate-800">
//                 Add Assignment
//               </h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
//                   Title *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Assignment title"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   placeholder="Assignment description (optional)"
//                   value={formData.description}
//                   rows={3}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
//                   Due Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.dueDate}
//                   min={getTodayDate()}
//                   onChange={(e) =>
//                     setFormData({ ...formData, dueDate: e.target.value })
//                   }
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
//                 />
//               </div>

//               <div className="flex gap-3 pt-1">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 border border-slate-200 p-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl text-sm font-semibold transition-colors"
//                 >
//                   Add Assignment
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssignmentsTeacherTab;

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
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

//  Skeleton Components 

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const TableRowSkeleton = () => (
  <tr className="border-t">
    <td className="px-4 py-4"><SkeletonPulse className="h-3.5 w-6" /></td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <SkeletonPulse className="w-4 h-4 rounded flex-shrink-0" />
        <SkeletonPulse className="h-3.5 w-36" />
      </div>
    </td>
    <td className="px-6 py-4"><SkeletonPulse className="h-3.5 w-24" /></td>
    <td className="px-6 py-4"><SkeletonPulse className="h-5 w-16 rounded-full" /></td>
    <td className="px-6 py-4"><SkeletonPulse className="h-3.5 w-12" /></td>
    <td className="px-6 py-4"><SkeletonPulse className="h-3.5 w-20" /></td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-7 w-9 rounded-lg" />
        <SkeletonPulse className="h-7 w-9 rounded-lg" />
      </div>
    </td>
  </tr>
);

//  Main Component─

const AssignmentsTeacherTab = ({ student }) => {
  const dispatch = useDispatch();
  const { assignments = [], loading } = useSelector((state) => state.assignment);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (student?._id) {
      dispatch(getAssignments(student._id));
    }
  }, [student?._id, dispatch]);

  useEffect(() => {
    if (showModal) {
      setFormData({
        title: "",
        description: "",
        dueDate: getTodayDate(),
      });
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;
    await dispatch(createAssignment({ ...formData, studentId: student._id }));
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

  return (
    <div className="space-y-4">

      {/*  Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-red-50 px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Assignment?</h3>
              <p className="text-sm text-slate-600">
                Assignment{" "}
                <span className="font-semibold text-slate-700">"{deleteTarget.title}"</span>{" "}
                will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewAssignment && (
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
                  <h2 className="text-white text-xl font-bold mt-0.5">
                    {viewAssignment.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setViewAssignment(null)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    viewAssignment.submission?.submittedAt
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {viewAssignment.submission?.submittedAt ? "Submitted" : "Not Submitted"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    viewAssignment.isRead
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {viewAssignment.isRead ? "Read by Student" : "Unread by Student"}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {viewAssignment.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {viewAssignment.dueDate && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Due Date</span>
                    </div>
                    <p className="text-slate-800 text-sm font-medium">
                      {new Date(viewAssignment.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {viewAssignment.submission?.submittedAt && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Submitted On</span>
                    </div>
                    <p className="text-slate-800 text-sm font-medium">
                      {new Date(viewAssignment.submission.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {viewAssignment.submission?.fileUrl && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 col-span-2">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Submitted File</span>
                    </div>
                    <a
                      href={viewAssignment.submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-700 text-sm font-medium hover:underline break-all"
                    >
                      {viewAssignment.submission.fileUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewAssignment(null)}
                className="px-5 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header  */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Loading Skeleton Table */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <SkeletonPulse className="h-5 w-32" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Sr.no</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Read</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/*  Empty State  */}
      {!loading && assignments.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No assignments yet</p>
        </div>
      )}

      {/*  Assignments Table */}
      {!loading && assignments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Sr.no</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Read</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y capitalize font-medium text-slate-900">
                {assignments.map((a, index) => {
                  const isSubmitted = !!a.submission?.submittedAt;
                  const isRead = a.isRead === true;

                  return (
                    <tr key={a._id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-4">{index + 1}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="font-medium text-slate-800">{a.title}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
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

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium ${
                            isRead ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {isRead ? "✓ Read" : "Unread"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isSubmitted ? (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            {new Date(a.submission.submittedAt).toLocaleDateString("en-IN", {
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

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            data-tooltip-id="view-tooltip"
                            data-tooltip-content="View"
                            onClick={() => setViewAssignment(a)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <Tooltip id="view-tooltip" place="top" offset={10} />
                          </button>
                          <button
                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDeleteClick(a)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <Tooltip id="delete-tooltip" place="top" offset={10} />
                          </button>
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

      {/* Add Assignment Modal*/}
      {showModal && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Add Assignment</h3>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  min={getTodayDate()}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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