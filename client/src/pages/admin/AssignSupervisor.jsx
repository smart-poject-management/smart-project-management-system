import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { Search, Users, UserCheck, UserX, ChevronDown } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStatusOpen, setFilterStatusOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [pendingFor, setPendingFor] = useState(null);

  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (user) => user.role?.toLowerCase() === "teacher"
    );
    return teacherUsers.map((teacher) => ({
      ...teacher,
      assignedCount: Array.isArray(teacher.assignedStudents)
        ? teacher.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof teacher.maxStudents === "number" ? teacher.maxStudents : 0) -
        (Array.isArray(teacher.assignedStudents)
          ? teacher.assignedStudents.length
          : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((project) => !!project.student?._id)
      .map((project) => ({
        projectId: project._id,
        title: project.title,
        status: project.status,
        supervisor: project.supervisor?.name || null,
        supervisorId: project.supervisor?._id || null,
        studentId: project.student?._id,
        studentName: project.student?.name || "-",
        studentEmail: project.student?.email || "-",
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().slice(0, 10)
          : "-",
        updatedAt: project.updatedAt
          ? new Date(project.updatedAt).toLocaleDateString()
          : "-",
        isApproved: project.status === "approved",
      }));
  }, [projects]);

  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const status = row.supervisorId ? "assigned" : "not-assigned";
    const matchFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchFilter;
  });

  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({ ...prev, [projectId]: supervisorId }));
    setOpenDropdownId(null);
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus === "rejected") {
      toast.error("Cannot assign supervisor to a rejected project");
      return;
    }
    setPendingFor(projectId);
    const res = await dispatch(assignSupervisorThunk({ studentId, supervisorId }));
    setPendingFor(null);
    if (assignSupervisorThunk.fulfilled.match(res)) {
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    }
  };

  const filterStatusOptions = [
    { value: "all", label: "All Students" },
    { value: "assigned", label: "Assigned Students" },
    { value: "not-assigned", label: "Unassigned Students" },
  ];

  const availableTeachers = teachers.filter((t) => t.capacityLeft > 0);

  const getButtonLabel = (row) => {
    if (pendingFor === row.projectId) return "Assigning...";
    if (row.supervisor) return "Assigned";
    if (row.status === "rejected") return "Rejected";
    if (!row.isApproved) return "Not Approved";
    return "Assign";
  };

  const isButtonDisabled = (row) =>
    pendingFor === row.projectId ||
    !!row.supervisor ||
    row.status === "rejected" ||
    !row.isApproved ||
    !selectedSupervisor[row.projectId];

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((p) => !!p.supervisorId).length,
      Icon: UserCheck,
      bg: "bg-emerald-100",
      border: "border-emerald-200",
      iconColor: "text-emerald-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((p) => !p.supervisorId).length,
      Icon: UserX,
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      iconColor: "text-yellow-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter((t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0)).length,
      Icon: Users,
      bg: "bg-blue-100",
      border: "border-blue-200",
      iconColor: "text-blue-600",
    },
  ];

  const headers = [
    "Sr.No",
    "Student",
    "Project Title",
    "Supervisor",
    "Updated",
    "Deadline",
    "Assign Supervisor",
    "Actions",
  ];

  const Badge = ({ color, children }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {children}
    </span>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
        <div>
          <h1 className="page-header">Assign Supervisor</h1>
          <p className="text-gray-500 mt-1">
            Manage supervisor assignments for students and projects
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.title}
              className={`group ${card.bg} ${card.border} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center">
                <div className={`p-4 ${card.bg} rounded-xl shadow`}>
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
                placeholder="Search by name or project title..."
                className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Status — custom dropdown */}
          <div className="w-full md:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Filter Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterStatusOpen(!filterStatusOpen)}
                className="capitalize w-full h-[44px] px-3 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
              >
                <span>{filterStatusOptions.find((f) => f.value === filterStatus)?.label || "All Students"}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${filterStatusOpen ? "rotate-180" : ""}`}
                />
              </button>

              {filterStatusOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setFilterStatusOpen(false)} />
              )}

              {filterStatusOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[132px] overflow-y-auto custom-scrollbar">
                  {filterStatusOptions
                    .filter((item) => item.value === "all" || item.value !== filterStatus)
                    .map((item) => (
                      <div
                        key={item.value}
                        onClick={() => { setFilterStatus(item.value); setFilterStatusOpen(false); }}
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Student Assignments
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({filtered.length} records)
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="capitalize font-medium text-slate-900">
              {filtered.length > 0 ? (
                filtered.map((row, index) => (
                  <tr key={row.projectId} className="border-t hover:bg-slate-50 transition-colors duration-150">

                    {/* Sr.No */}
                    <td className="px-4 py-4 text-sm">{index + 1}</td>

                    {/* Student */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900">{row.studentName}</div>
                      <div className="text-xs text-slate-500 normal-case">{row.studentEmail}</div>
                    </td>

                    {/* Project Title */}
                    <td className="px-4 py-4 max-w-[180px]">
                      <span className="text-sm text-slate-700 font-medium line-clamp-2" title={row.title}>
                        {row.title}
                      </span>
                    </td>

                    {/* Supervisor Badge */}
                    <td className="px-4 py-4">
                      {row.supervisor ? (
                        <Badge color="bg-green-50 text-green-700 border-green-100">
                          {row.supervisor}
                        </Badge>
                      ) : (
                        <Badge color="bg-red-50 text-red-700 border-red-100">
                          {row.status === "rejected" ? "Rejected" : "Not Assigned"}
                        </Badge>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-4 text-sm text-slate-600 normal-case">{row.updatedAt}</td>

                    {/* Deadline */}
                    <td className="px-4 py-4 text-sm text-slate-600 normal-case">{row.deadline}</td>

                    {/* Assign Supervisor — custom dropdown */}
                    <td className="px-4 py-4">
                      {!!row.supervisor || row.status === "rejected" || !row.isApproved ? (
                        <div className="w-48 h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400 flex items-center cursor-not-allowed">
                          {row.supervisor
                            ? "Already Assigned"
                            : row.status === "rejected"
                            ? "Project Rejected"
                            : "Not Yet Approved"}
                        </div>
                      ) : (
                        <div className="relative w-48">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdownId(openDropdownId === row.projectId ? null : row.projectId)
                            }
                            className="w-full h-[38px] px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-sm flex justify-between items-center gap-1 transition-colors"
                          >
                            <span className="truncate text-left normal-case">
                              {selectedSupervisor[row.projectId]
                                ? teachers.find((t) => t._id === selectedSupervisor[row.projectId])?.name || "Select"
                                : "Select Supervisor"}
                            </span>
                            <ChevronDown
                              size={14}
                              className={`shrink-0 transition-transform duration-200 ${openDropdownId === row.projectId ? "rotate-180" : ""}`}
                            />
                          </button>

                          {openDropdownId === row.projectId && (
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            />
                          )}

                          {openDropdownId === row.projectId && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[132px] overflow-y-auto custom-scrollbar">
                              {availableTeachers.length > 0 ? (
                                availableTeachers.map((t) => (
                                  <div
                                    key={t._id}
                                    onClick={() => handleSupervisorSelect(row.projectId, t._id)}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors normal-case
                                      ${selectedSupervisor[row.projectId] === t._id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"}`}
                                  >
                                    <div className="font-medium capitalize">{t.name}</div>
                                    <div className="text-xs text-slate-400">{t.capacityLeft} slot{t.capacityLeft !== 1 ? "s" : ""} left</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-sm text-slate-400 text-center">
                                  No teachers available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Assign Button */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleAssign(row.studentId, row.status, row.projectId)}
                        disabled={isButtonDisabled(row)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                          ${isButtonDisabled(row)
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md active:scale-95"
                          }`}
                      >
                        {getButtonLabel(row)}
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {searchTerm || filterStatus !== "all"
                      ? "No students found matching your criteria."
                      : "No student assignments found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisor;