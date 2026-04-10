import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { AlertTriangle, CalendarClock, Search, X } from "lucide-react";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-700",
  complete: "bg-red-500 text-red-50",
  completed: "bg-blue-500 text-blue-50",
  pending: "bg-yellow-100 text-yellow-700",
  default: "bg-gray-100 text-gray-700",
};

const getStatusStyle = (status) => {
  return STATUS_STYLES[status?.toLowerCase()] ?? STATUS_STYLES.default;
};

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const [viewProjects, setViewProjects] = useState(projects || []);
  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setQuery("");
    setFormData({
      projectTitle: "",
      studentName: "",
      supervisor: "",
      status: "",
      deadlineDate: "",
      description: "",
    });
  };

  const isStatusDisabled =
    selectedProject &&
    selectedProject.status?.toLowerCase() !== "approved";

  const today = new Date().toISOString().slice(0, 10);
  const existingDeadline = selectedProject?.deadline
    ? new Date(selectedProject.deadline).toISOString().slice(0, 10)
    : null;
  const minDate =
    existingDeadline && existingDeadline > today ? existingDeadline : today;

  const projectRows = useMemo(() => {
    return (viewProjects || []).map((project) => ({
      _id: project._id,
      title: project.title,
      status: project.status,
      studentName: project.student?.name || "N/A",
      studentEmail: project.student?.email || "N/A",
      studentDepartment: project.student?.department || "N/A",
      supervisor: project.supervisor?.name || "N/A",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().slice(0, 10)
        : "N/A",
      updatedAt: project.updatedAt
        ? new Date(project.updatedAt).toLocaleString()
        : "N/A",
      raw: project,
    }));
  }, [viewProjects]);

  const supervisors = useMemo(() => {
    return [...new Set((viewProjects || [])
      .map((p) => p.supervisor?.name)
      .filter(Boolean))];
  }, [viewProjects]);

  const filteredProjects = projectRows.filter((row) => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || row.status?.toLowerCase() === filterStatus;
    const matchesSupervisor =
      filterSupervisor === "all" || row.supervisor === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  // Nearest deadline
  const nearestDeadlineId = useMemo(() => {
    const todayDate = new Date();
    let nearest = null;
    let minDiff = Infinity;

    filteredProjects.forEach((row) => {
      if (!row.deadline || row.deadline === "N/A") return;
      const diff = new Date(row.deadline) - todayDate;
      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        nearest = row._id;
      }
    });

    return nearest;
  }, [filteredProjects]);

  const hanedleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    const deadlinePayload = {
      name: selectedProject?.student?.name,
      dueDate: formData.deadlineDate,
      project: selectedProject?._id,
    };

    try {
      await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlinePayload })
      ).unwrap();

      setViewProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id
            ? { ...p, deadline: formData.deadlineDate }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="page-header">Manage Deadlines</h1>
            <p className="text-gray-500 mt-1">
              Create and monitor project deadlines
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:scale-105"
          >
            <CalendarClock className="w-5 h-5" />
            Create & Update Deadline
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
              Search Projects
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300
                  bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                  focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                  transition-all duration-200 text-sm"
                placeholder="Search by project title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
              Filter by Status
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300
                bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                transition-all duration-200 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Projects</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Filter by Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
              Filter by Supervisor
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300
                bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                transition-all duration-200 text-sm"
              value={filterSupervisor}
              onChange={(e) => setFilterSupervisor(e.target.value)}
            >
              <option value="all">All Supervisors</option>
              {supervisors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Deadlines Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-800">
            Project Deadlines
          </h2>
        </div>

        <div className="overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 ">
                  Sr.no
                </th>
                <th className="px-6 py-3 ">
                  Student
                </th>
                <th className="px-6 py-3 ">
                  Project Title
                </th>
                <th className="px-6 py-3 ">
                  Supervisor
                </th>
                <th className="px-6 py-3 ">
                  Status
                </th>
                <th className="px-6 py-3 ">
                  Deadline Date
                </th>
                <th className="px-6 py-3 ">
                  Updated Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProjects.map((row, index) => (
                <tr
                  key={row._id}
                  className="hover:bg-slate-100 transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-medium text-sm text-slate-900 text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {row.studentName}
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        {row.studentEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{row.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.supervisor !== "N/A" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {row.supervisor}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                        row.status
                      )}`}
                    >
                      {row.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {nearestDeadlineId === row._id ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {row.deadline}
                      </span>
                    ) : (
                      row.deadline
                    )}
                  </td>
                  <td className="px-6 py-4">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No projects found matching your search criteria.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Create or Update Deadline
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={hanedleSubmit} className="space-y-4">
              {/* Project Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start typing to search projects..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedProject(null);
                    setFormData({ ...formData, projectTitle: e.target.value });
                  }}
                />
                {query && !selectedProject && (
                  <div className="mt-2 border border-slate-200 rounded-md max-h-56 overflow-y-auto">
                    {(projects || [])
                      .filter((p) =>
                        p.title.toLowerCase().includes(query.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((project) => (
                        <button
                          type="button"
                          key={project._id}
                          className="w-full text-left px-8 py-2 hover:bg-slate-50"
                          onClick={() => {
                            setSelectedProject(project);
                            setQuery(project.title);
                            setFormData({
                              ...formData,
                              projectTitle: project.title,
                              deadlineDate: project.deadline
                                ? new Date(project.deadline)
                                    .toISOString()
                                    .slice(0, 10)
                                : "",
                            });
                          }}
                          title={project.title}
                        >
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {project.title}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {project.student?.name || "No student"} •{" "}
                            {project.supervisor?.name || "No supervisor"}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Deadline Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.deadlineDate}
                  min={minDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deadlineDate: e.target.value })
                  }
                />
              </div>

              {/* Selected Project Details */}
              {selectedProject && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm p-5 transition-all hover:shadow-md">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs text-slate-500 mb-1">
                      Project Title <br />
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {selectedProject.title}
                      </span>
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        selectedProject.status
                      )}`}
                    >
                      {selectedProject.status || "Unknown"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-4 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Description</p>
                      <p
                        className="text-sm text-slate-700 leading-relaxed"
                        title={
                          selectedProject.description ||
                          "No description available"
                        }
                      >
                        {(
                          selectedProject.description ||
                          "No description available"
                        ).length > 160
                          ? `${selectedProject.description.slice(0, 160)}...`
                          : selectedProject.description ||
                          "No description available"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <p className="text-xs text-slate-500">Deadline:</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${formData.deadlineDate
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {formData.deadlineDate
                          ? new Date(formData.deadlineDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                          : "Not set"}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supervisor */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs text-slate-500">Supervisor</p>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {selectedProject.supervisor?.name || "Not assigned"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedProject.supervisor?.email || "No email"}
                      </p>
                    </div>

                    {/* Student */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs text-slate-500">Student</p>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm font-medium text-slate-800">
                          {selectedProject.student?.name || "Not assigned"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedProject.student?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  {isStatusDisabled && (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-red-700 leading-relaxed">
                        <span className="font-semibold">Action Restricted:</span>{" "}
                        Deadline can only be assigned to projects marked as{" "}
                        <span className="font-semibold text-red-600">Approved</span>.
                        <br />
                        Current Status:{" "}
                        <span className="font-semibold capitalize">
                          {selectedProject.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStatusDisabled}
                  className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${isStatusDisabled
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlinesPage;
