import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { Search, Users, UserCheck, UserX, } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
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
    const res = await dispatch(
      assignSupervisorThunk({ studentId, supervisorId })
    );
    setPendingFor(null);
    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    } else {
      toast.error("Failed to assign supervisor");
    }
  };


  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((p) => !!p.supervisorId).length,
      icon: <UserCheck />,
      iconBg: "bg-emerald-100",
      hoverBg: "bg-emerald-500",
      iconColor: "text-emerald-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((p) => !p.supervisorId).length,
      icon: <UserX />,
      iconBg: "bg-yellow-100",
      hoverBg: "bg-yellow-500",
      iconColor: "text-yellow-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0)
      ).length,
      icon: <Users />,
      iconBg: "bg-blue-100",
      hoverBg: "bg-blue-500",
      iconColor: "text-blue-600",
    },
  ];
  const headers = [
    "Student",
    "Project Title",
    "Supervisor",
    "Updated",
    "Deadline",
    "Assign Supervisor",
    "Actions",
  ];

  const Badge = ({ color, children }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {children}
    </span>
  );

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

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Assign Supervisor</h1>
        <p className="text-gray-500 mt-1">
          Manage supervisor assignments for students and projects
        </p>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <div
            key={card.title}
            className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200
      transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center">

              {/* Icon Box */}
              <div
                className={`p-4 rounded-xl transition-all duration-300 ${card.iconBg} group-hover:${card.hoverBg}`}
              >
                <div
                  className={`w-6 h-6 transition-all duration-300 ${card.iconColor} group-hover:text-black`}
                >
                  {card.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {card.value}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Search Students
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or project title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300
                  bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                  focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                  transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter */}
          <div className="w-full md:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Filter Status
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300
                bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                transition-all duration-200 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="assigned">Assigned Students</option>
              <option value="not-assigned">Unassigned Students</option>
            </select>
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
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.projectId} className="hover:bg-slate-50 transition-colors">
                  {/* Student */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {row.studentName}
                    </div>
                    <div className="text-xs text-slate-500">{row.studentEmail}</div>
                  </td>

                  {/* Project Title */}
                  <td className="px-4 py-4 max-w-[180px]">
                    <span
                      className="text-slate-700 font-medium line-clamp-2"
                      title={row.title}
                    >
                      {row.title}
                    </span>
                  </td>


                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      {row.supervisor ? (
                        <Badge color="bg-green-100 text-green-700">
                          {row.supervisor}
                        </Badge>
                      ) : (
                        <Badge color="bg-red-100 text-red-700">
                          {row.status === "rejected" ? "Rejected" : "Not Assigned"}
                        </Badge>
                      )}
                    </div>
                  </td>


                  <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                    {row.updatedAt}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                    {row.deadline}
                  </td>

                  {/* Supervisor Select */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm
                        bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                        focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedSupervisor[row.projectId] || ""}
                      disabled={
                        !!row.supervisor ||
                        row.status === "rejected" ||
                        row.isApproved === false
                      }
                      onChange={(e) =>
                        handleSupervisorSelect(row.projectId, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select Supervisor
                      </option>


                      {
                        teachers
                          .filter((t) => t.capacityLeft > 0)
                          .map((t) => (
                            <option value={t._id} key={t._id}
                            > {t.name} ({t.capacityLeft} solote left) </option>
                          ))
                      }

                    </select>
                  </td>

                  {/* Action Button */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleAssign(row.studentId, row.status, row.projectId)
                      }
                      disabled={isButtonDisabled(row)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                        ${isButtonDisabled(row)
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
                        }`}
                    >
                      {getButtonLabel(row)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No students match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisor;