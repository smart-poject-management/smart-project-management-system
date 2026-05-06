import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "./AddTeacher";
import { deleteTeacher, updateTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";
import {
  fetchExpertiseByDepartment,
  clearExpertise,
} from "../../store/slices/departmentSlice";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  Eye,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { toast } from "react-toastify";

const ManageTeachers = () => {
  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const expertiseList = useSelector((state) => state.department.expertise);

  const [showModel, setShowModel] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // View modal state
  const [viewModal, setViewModal] = useState({ show: false, teacher: null });

  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    departmentId: "",
    departmentLabel: "",
    expertise: [],
    maxStudents: 1,
  });

  const dispatch = useDispatch();

  const teachers = useMemo(() => {
    return (users || [])
      .filter((user) => user.role?.toLowerCase() === "teacher")
      .map((user) => ({
        ...user,
        department:
          typeof user.department === "object"
            ? user.department?.department || ""
            : user.department || "",
        departmentId:
          typeof user.department === "object"
            ? user.department?._id || ""
            : "",
        expertise: Array.isArray(user.expertise)
          ? user.expertise
            .map((item) => (typeof item === "object" ? item?.name || "" : item))
            .filter(Boolean)
          : typeof user.expertise === "string"
            ? [user.expertise]
            : [],
        expertiseIds: Array.isArray(user.expertise)
          ? user.expertise
            .map((item) => (typeof item === "object" ? item?._id || "" : ""))
            .filter(Boolean)
          : [],
      }));
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set((teachers || []).map((t) => t.department).filter(Boolean));
    return Array.from(set);
  }, [teachers]);

  const filterOptions = [
    { value: "all", label: "All Departments" },
    ...departments.map(dept => ({ value: dept, label: dept }))
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterDepartment === "all" || teacher.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (showModel && teacherData.departmentId) {
      dispatch(fetchExpertiseByDepartment(teacherData.departmentId));
    } else if (!showModel) {
      dispatch(clearExpertise());
    }
  }, [showModel, teacherData.departmentId, dispatch]);

  const handleExpertiseChange = (id) => {
    setTeacherData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(id)
        ? prev.expertise.filter((e) => e !== id)
        : [...prev.expertise, id],
    }));
  };

  const handleCloseModel = () => {
    setShowModel(false);
    setEditingTeacher(null);
    setTeacherData({
      name: "",
      email: "",
      departmentId: "",
      departmentLabel: "",
      expertise: [],
      maxStudents: 1,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (teacherData.expertise.length === 0) {
      toast.error("Please select at least one expertise");
      return;
    }

    if (editingTeacher) {
      const updatePayload = {
        id: editingTeacher._id,
        data: {
          expertise: teacherData.expertise,
          maxStudents: teacherData.maxStudents,
        },
      };
      dispatch(updateTeacher(updatePayload));
    }

    handleCloseModel();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherData({
      name: teacher.name,
      email: teacher.email,
      departmentId: teacher.departmentId || "",
      departmentLabel: teacher.department || "",
      expertise: teacher.expertiseIds || [],
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 1,
    });
    setShowModel(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModel(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModel(false);
      setTeacherToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModel(false);
    setTeacherToDelete(null);
  };

  const handleViewClick = (e, teacher) => {
    e.stopPropagation();
    setViewModal({ show: true, teacher });
  };

  const handleCloseView = () => {
    setViewModal({ show: false, teacher: null });
  };

  const viewTeacher = viewModal.teacher;
  const selectedExpertiseNames = useMemo(() => {
    if (!teacherData.expertise.length || !expertiseList.length) return [];
    return expertiseList
      .filter((exp) => teacherData.expertise.includes(exp._id))
      .map((exp) => ({ id: exp._id, name: exp.name }));
  }, [teacherData.expertise, expertiseList]);

  const statsCards = [
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: Users,
      bg: "bg-blue-100",
      border: "border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Assigned Students",
      value: teachers.reduce(
        (sum, total) => sum + (total.assignedStudents?.length || 0),
        0
      ),
      icon: BadgeCheck,
      bg: "bg-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Departments",
      value: departments.length,
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
            <h1 className="page-header">Manage Teachers</h1>
            <p className="text-gray-500 mt-1">Add, edit, and manage teacher accounts</p>
          </div>
          <button
            onClick={() => dispatch(toggleTeacherModel())}
            className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Teacher</span>
          </button>
        </div>

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
                    <Icon
                      className={`w-6 h-6 ${card.iconColor} transition-all duration-300`}
                    />
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {card.title}
                    </p>

                    <p className="text-2xl font-bold text-slate-800">
                      {card.value}
                    </p>
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
                Search Teachers
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
                    {filterOptions.find(f => f.value === filterDepartment)?.label || "Select Department"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Overlay */}
                {filterOpen && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setFilterOpen(false)}
                  />
                )}

                {/* Dropdown */}
                {filterOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-[120px] overflow-y-auto custom-scrollbar">
                    {filterOptions
                      .filter(item => item.value === "all" || item.value !== filterDepartment)
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
        {/* Teachers Table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Teachers List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Sr.no</th>
                  <th className="px-6 py-3">Teacher Information</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Expertise</th>
                  <th className="px-6 py-3">Max Students</th>
                  <th className="px-6 py-3">Assigned</th>
                  <th className="px-6 py-3">Join Date</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="capitalize font-medium text-slate-900 ">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher, index) => (
                    <tr
                      key={teacher._id}
                      className="border-t hover:bg-slate-50 transition-colors duration-150 "
                    >
                      <td className="px-4 py-4">{index + 1}</td>

                      <td className="px-6 py-4 ">
                        <div>
                          <div>{teacher.name}</div>
                          <div className="text-xs text-slate-500 lowercase">{teacher.email}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span>
                          {teacher.department || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {Array.isArray(teacher.expertise) && teacher.expertise.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {teacher.expertise.length} expertise
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">0 Expertise</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {teacher.maxStudents ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {teacher.assignedStudents?.length ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {teacher.createdAt
                          ? new Date(teacher.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* View Button */}
                          <button
                            data-tooltip-id="view-tooltip"
                            data-tooltip-content="View"
                            onClick={(e) => handleViewClick(e, teacher)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <Tooltip id="view-tooltip" place="top" offset={10} />
                          </button>

                          {/* Edit Button */}
                          <button
                            data-tooltip-id="edit-tooltip"
                            data-tooltip-content="Edit"
                            onClick={() => handleEdit(teacher)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <Tooltip id="edit-tooltip" place="top" offset={10} />
                          </button>

                          {/* Delete Button */}
                          <button

                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDelete(teacher)}
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
                        ? "No teachers found matching your criteria."
                        : "No teachers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── VIEW TEACHER MODAL ── */}
        {viewModal.show && viewTeacher && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-5xl">

              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{viewTeacher.name}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Teacher Details</p>
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
                    {viewTeacher.assignedStudents?.length ?? 0}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">Assigned</p>
                </div>
                <div className="text-center bg-sky-50 rounded-xl py-3 border border-sky-100">
                  <p className="text-2xl font-bold text-sky-700">
                    {viewTeacher.maxStudents ?? 0}
                  </p>
                  <p className="text-xs text-sky-600 mt-0.5">Max Students</p>
                </div>
                <div className="text-center bg-amber-50 rounded-xl py-3 border border-amber-100">
                  <p className="text-2xl font-bold text-amber-700">
                    {viewTeacher.expertise?.length ?? 0}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">Expertise</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1  px-6 py-4 space-y-5">

                {/* Basic Info */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Basic Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-800">{viewTeacher.email || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Department</span>
                      <span className="text-sm font-medium text-slate-800 capitalize">
                        {viewTeacher.department || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Joined</span>
                      <span className="text-sm font-medium text-slate-800">
                        {viewTeacher.createdAt
                          ? new Date(viewTeacher.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expertise List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Expertise
                    </h3>
                    <span className="text-xs text-slate-400">
                      {viewTeacher.expertise?.length ?? 0} total
                    </span>
                  </div>
                  {viewTeacher.expertise?.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      <ul className="space-y-2">
                        {viewTeacher.expertise.map((exp, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700">{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No expertise assigned
                    </p>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <button
                  // add the vew profile page link
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

        {/* ── EDIT TEACHER MODAL ── */}
        {showModel && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">

              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Edit Teacher
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update teacher expertise and capacity
                  </p>
                </div>
                <button
                  onClick={handleCloseModel}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Name + Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          disabled
                          value={teacherData.name}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Email
                        </label>
                        <input
                          type="email"
                          disabled
                          value={teacherData.email}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Department
                      </label>
                      <input
                        type="text"
                        disabled
                        value={teacherData.departmentLabel}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed outline-none capitalize"
                      />
                    </div>

                    {/* Max Students */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Max Students
                      </label>

                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden w-full">
                        <button
                          type="button"
                          onClick={() => {
                            const next = teacherData.maxStudents - 1;
                            if (next >= 1)
                              setTeacherData({ ...teacherData, maxStudents: next });
                          }}
                          disabled={teacherData.maxStudents <= 1}
                          className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>

                        <span className="flex-1 text-center text-sm font-medium text-slate-800 select-none">
                          {teacherData.maxStudents}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const next = teacherData.maxStudents + 1;
                            if (next <= 10)
                              setTeacherData({ ...teacherData, maxStudents: next });
                          }}
                          disabled={teacherData.maxStudents >= 10}
                          className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  {selectedExpertiseNames.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Selected Expertise
                        </label>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-600 text-white">
                          {selectedExpertiseNames.length} selected
                        </span>
                      </div>

                      <ul className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {selectedExpertiseNames.map((exp, i) => (
                          <li
                            key={exp.id}
                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-sm font-medium text-slate-700">
                                {exp.name}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Add More Expertise
                  </label>

                  <div className="border border-slate-200 rounded-xl bg-slate-50 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {expertiseList.length > 0 ? (
                      expertiseList.map((exp, idx) => (
                        <label
                          key={exp._id}
                          className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-white transition ${idx !== expertiseList.length - 1
                            ? "border-b border-slate-100"
                            : ""
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={teacherData.expertise.includes(exp._id)}
                            onChange={() => handleExpertiseChange(exp._id)}
                            className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                          />
                          <span className="text-sm text-slate-700">{exp.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 py-4 text-center">
                        {teacherData.departmentId
                          ? "No expertise available for this department"
                          : "Department not linked — cannot load expertise"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModel}
                  className="px-5 py-2.5 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={teacherData.expertise.length === 0}
                  className="px-5 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update Teacher
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ── DELETE MODAL ── */}
        {showDeleteModel && teacherToDelete && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 mx-4 shadow-2xl border border-slate-200">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Teacher</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-700">{teacherToDelete.name}</span>?
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

        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default ManageTeachers;