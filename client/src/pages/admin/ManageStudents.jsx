import { useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleStudentModel } from "../../store/slices/popupSlice";
import { deleteStudent } from "../../store/slices/adminSlice";
import {
  Plus,
  TriangleAlert,
  User,
  Search,
  AlertTriangle,
  Trash2,
  Eye,
  ChevronDown,
  X,
  BadgeCheck,
} from "lucide-react";
import AddStudent from "./AddStudent";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [viewModal, setViewModal] = useState({ show: false, student: null });
  const dispatch = useDispatch();
  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      (user) => user.role?.toLowerCase() === "student"
    );
    return studentUsers.map((student) => {
      const studentProject = (projects || []).find(
        (project) =>
          project.student === student._id ||
          project.student?._id === student._id
      );

      return {
        ...student,
        department:
          typeof student.department === "object"
            ? student.department?.department || ""
            : student.department || "",
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((s) => s.department).filter(Boolean)
    );
    return Array.from(set);
  }, [students]);

  const filterOptions = [
    { value: "all", label: "All Departments" },
    ...departments.map((dept) => ({ value: dept, label: dept })),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModel(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModel(false);
      setStudentToDelete(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModel(false);
    setStudentToDelete(null);
  };
  const handleViewClick = (e, student) => {
    e.stopPropagation();
    setViewModal({ show: true, student });
  };
  const handleCloseView = () => {
    setViewModal({ show: false, student: null });
  };
  const viewStudent = viewModal.student;
  const statsCards = [
    {
      title: "Total Students",
      value: students.length,
      icon: User,
      bg: "bg-blue-100",
      border: "border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Assigned Students",
      value: students.filter((s) => s.supervisor).length,
      icon: BadgeCheck,
      bg: "bg-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Unassigned",
      value: students.filter((s) => !s.supervisor).length,
      icon: TriangleAlert,
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
          <div>
            <h1 className="page-header">Manage Students</h1>
            <p className="text-gray-500 mt-1">Add, view, and manage student accounts</p>
          </div>
          <button
            onClick={() => dispatch(toggleStudentModel())}
            className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`group ${card.bg} ${card.border} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center">
                  <div className={`p-4 ${card.iconBg} rounded-xl shadow`}>
                    <Icon className={`w-6 h-6 ${card.iconColor} transition-all duration-300`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="w-full md:w-56">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Filter Department
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="capitalize w-full h-[44px] px-3 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
                >
                  <span>
                    {filterOptions.find((f) => f.value === filterDepartment)?.label || "Select Department"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {filterOpen && (
                  <div className="fixed inset-0 z-0" onClick={() => setFilterOpen(false)} />
                )}

                {filterOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-[120px] overflow-y-auto custom-scrollbar">
                    {filterOptions
                      .filter((item) => item.value === "all" || item.value !== filterDepartment)
                      .map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setFilterDepartment(item.value);
                            setFilterOpen(false);
                          }}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {item.label}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Students List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Sr.No</th>
                  <th className="px-6 py-3">Student Information</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Supervisor</th>
                  <th className="px-6 py-3">Project Title</th>
                  <th className="px-6 py-3">Project Status</th>
                  <th className="px-6 py-3">Join Date</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="capitalize font-medium text-slate-900">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className="border-t hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4">{index + 1}</td>

                      <td className="px-6 py-4">
                        <div>
                          <div>{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span>{student.department || "-"}</span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {student.supervisor ? (
                          <span>{student.supervisor?.name || "-"}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {student.projectStatus === "rejected" ? "Rejected" : "Not Assigned"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {student.projectTitle || (
                          <span className="text-slate-400 text-xs">No project</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {student.projectStatus ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                              ${student.projectStatus === "completed"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : student.projectStatus === "rejected"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : student.projectStatus === "approved"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-yellow-50 text-yellow-700 border-yellow-100"
                              }`}
                          >
                            {student.projectStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                            No Status
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* View Button */}
                          <button
                            data-tooltip-id="view-tooltip"
                            data-tooltip-content="View"
                            onClick={(e) => handleViewClick(e, student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <Tooltip id="view-tooltip" place="top" offset={10} />
                          </button>

                          {/* Delete Button */}
                          <button
                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDelete(student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <Tooltip id="delete-tooltip" place="top" offset={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                      {searchTerm || filterDepartment !== "all"
                        ? "No students found matching your criteria."
                        : "No students found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── VIEW STUDENT MODAL ── */}
        {viewModal.show && viewStudent && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-5xl">

              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{viewStudent.name}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Student Details</p>
                </div>
                <button
                  onClick={handleCloseView}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="text-center bg-emerald-50 rounded-xl py-3 border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">
                    {viewStudent.supervisor ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">Supervised</p>
                </div>
                <div className="text-center bg-sky-50 rounded-xl py-3 border border-sky-100">
                  <p className="text-2xl font-bold text-sky-700">
                    {viewStudent.projectTitle ? "1" : "0"}
                  </p>
                  <p className="text-xs text-sky-600 mt-0.5">Projects</p>
                </div>
                <div className="text-center bg-amber-50 rounded-xl py-3 border border-amber-100">
                  <p className="text-xl font-bold text-amber-700 capitalize">
                    {viewStudent.projectStatus || "N/A"}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">Status</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 px-6 py-4 space-y-5">

                {/* Basic Info */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Basic Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-800">{viewStudent.email || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Department</span>
                      <span className="text-sm font-medium text-slate-800 capitalize">
                        {viewStudent.department || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Joined</span>
                      <span className="text-sm font-medium text-slate-800">
                        {viewStudent.createdAt
                          ? new Date(viewStudent.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Project Info
                    </h3>
                  </div>

                  {viewStudent.projectTitle ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Project Title</span>
                        <span className="text-sm font-medium text-slate-800 capitalize text-right max-w-[60%]">
                          {viewStudent.projectTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Supervisor</span>
                        <span className="text-sm font-medium text-slate-800 capitalize">
                          {viewStudent.supervisor?.name || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Status</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize
                            ${viewStudent.projectStatus === "completed"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : viewStudent.projectStatus === "rejected"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : viewStudent.projectStatus === "approved"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-yellow-50 text-yellow-700 border-yellow-100"
                            }`}
                        >
                          {viewStudent.projectStatus}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No project assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <button
                  className="capitalize flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={handleCloseView}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE MODAL ── */}
        {showDeleteModel && studentToDelete && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 mx-4 shadow-2xl border border-slate-200">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Student</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-700">{studentToDelete.name}</span>?
                  This action can't be undone.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-5 py-2.5 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  type="button"
                  className="px-5 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isCreateStudentModalOpen && <AddStudent />}
      </div>
    </>
  );
};

export default ManageStudents;