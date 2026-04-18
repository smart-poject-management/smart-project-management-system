import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Folder,
  Search,
  X,
  Calendar,
  User,
  FileText,
  BadgeCheck,
  ChevronDown,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  approveProject,
  getProject,
  rejectProject,
} from "../../store/slices/adminSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";

const ConfirmModal = ({ isOpen, onClose, onConfirm, type, projectTitle, isLoading }) => {
  if (!isOpen) return null;
  const isApprove = type === "approved";

  return (
    <div className="fixed inset-0 -top-10 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${isApprove ? "bg-green-100" : "bg-red-100"}`}>
            {isApprove ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          {isApprove ? "Approve Project?" : "Reject Project?"}
        </h2>
        <p className="text-md text-slate-500 mb-1">
          You're about to{" "}
          <span className={`font-medium ${isApprove ? "text-emerald-600" : "text-red-600"}`}>
            {isApprove ? "Approve" : "Reject"}
          </span>{" "}
          this project.
        </p>
        <p className="text-sm text-black font-semibold mb-6 uppercase">
          " {projectTitle || "Untitled Project"} "
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg text-white font-medium transition items-center gap-2
              ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
              disabled:opacity-70 flex-1 px-4 py-2 text-sm active:scale-95 transition-all`}
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4 inline mr-1" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                <path fill="white" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isLoading
              ? isApprove ? "Approving..." : "Rejecting..."
              : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [supervisorDropOpen, setSupervisorDropOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentProjects, setCurrentProjects] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    projectId: null,
    projectTitle: "",
  });
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const supervisors = useMemo(() => {
    const set = new Set(
      (projects || []).map((p) => p?.supervisor?.name).filter(Boolean)
    );
    return Array.from(set);
  }, [projects]);

  const statusOptions = [
    { value: "all", label: "All Projects" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ];

  const supervisorOptions = [
    { value: "all", label: "All Supervisors" },
    ...supervisors.map((s) => ({ value: s, label: s })),
  ];

  const filteredProjects = (projects || []).filter((project) => {
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    const matchesSupervisor =
      filterSupervisor === "all" || project.supervisor?.name === filterSupervisor;
    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const files = useMemo(() => {
    return (projects || []).flatMap((project) =>
      (project.files || []).map((file) => ({
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        projectTitle: project.title,
        studentName: project.student?.name,
      }))
    );
  }, [projects]);

  const filteredFiles = files.filter(
    (file) =>
      (file.originalName || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
      (file.studentName || "").toLowerCase().includes(reportSearch.toLowerCase())
  );

  const handleDownload = async (projectId, fileId, name) => {
    await dispatch(downloadProjectFile({ projectId, fileId, name }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-50 text-green-700 border-green-100";
      case "approved": return "bg-blue-50 text-blue-700 border-blue-100";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "rejected": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const openConfirmModal = (projectId, projectTitle, newStatus) => {
    setConfirmModal({ isOpen: true, type: newStatus, projectId, projectTitle });
  };

  const handleConfirmStatusChange = async () => {
    const { projectId, type } = confirmModal;
    setIsStatusLoading(true);
    try {
      if (type === "approved") {
        await dispatch(approveProject(projectId));
      } else if (type === "rejected") {
        await dispatch(rejectProject(projectId));
      }
    } finally {
      setIsStatusLoading(false);
      setConfirmModal({ isOpen: false, type: null, projectId: null, projectTitle: "" });
    }
  };

  const handleCloseConfirm = () => {
    if (isStatusLoading) return;
    setConfirmModal({ isOpen: false, type: null, projectId: null, projectTitle: "" });
  };

  const handleViewProject = async (projectId) => {
    setIsViewLoading(true);
    setShowViewModal(true);
    const res = await dispatch(getProject(projectId));
    setIsViewLoading(false);
    if (!getProject.fulfilled.match(res)) {
      setShowViewModal(false);
      return;
    }
    const detail = res.payload?.project || res.payload;
    setCurrentProjects(detail);
  };

  const projectStats = [
    { title: "Total Projects", value: (projects || []).length, bg: "bg-blue-100", border: "border-blue-200", iconColor: "text-blue-600", Icon: Folder },
    { title: "Approved", value: (projects || []).filter((p) => p.status === "approved").length, bg: "bg-emerald-100", border: "border-emerald-200", iconColor: "text-emerald-600", Icon: BadgeCheck },
    { title: "Pending Review", value: (projects || []).filter((p) => p.status === "pending").length, bg: "bg-orange-100", border: "border-orange-200", iconColor: "text-orange-600", Icon: AlertTriangle },
    { title: "Completed", value: (projects || []).filter((p) => p.status === "completed").length, bg: "bg-green-100", border: "border-green-200", iconColor: "text-green-600", Icon: CheckCircle2 },
    { title: "Rejected", value: (projects || []).filter((p) => p.status === "rejected").length, bg: "bg-red-100", border: "border-red-200", iconColor: "text-red-600", Icon: X },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
        <div>
          <h1 className="page-header">All Projects</h1>
          <p className="text-gray-500 mt-1">
            View and manage all student projects, their statuses, and associated files.
          </p>
        </div>
        <button
          onClick={() => setIsReportsOpen(true)}
          className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <FileDown className="w-5 h-5" />
          <span>Download Reports</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {projectStats.map((item, i) => (
          <div
            key={i}
            className={`${item.bg} ${item.border} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl shadow">
                <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-slate-600">{item.title}</p>
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">

          {/* Search */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Search Projects
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm"
                placeholder="Search by project title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Status — custom dropdown */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Filter by Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setStatusDropOpen(!statusDropOpen); setSupervisorDropOpen(false); }}
                className="capitalize w-full h-[44px] px-3 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
              >
                <span>{statusOptions.find((f) => f.value === filterStatus)?.label || "All Projects"}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${statusDropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {statusDropOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setStatusDropOpen(false)} />
              )}

              {statusDropOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[132px] overflow-y-auto custom-scrollbar">
                  {statusOptions
                    .filter((item) => item.value === "all" || item.value !== filterStatus)
                    .map((item) => (
                      <div
                        key={item.value}
                        onClick={() => { setFilterStatus(item.value); setStatusDropOpen(false); }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 capitalize"
                      >
                        {item.label}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter by Supervisor — custom dropdown */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Filter by Supervisor
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSupervisorDropOpen(!supervisorDropOpen); setStatusDropOpen(false); }}
                className="capitalize w-full h-[44px] px-3 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
              >
                <span className="truncate">
                  {supervisorOptions.find((f) => f.value === filterSupervisor)?.label || "All Supervisors"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 shrink-0 ${supervisorDropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {supervisorDropOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setSupervisorDropOpen(false)} />
              )}

              {supervisorDropOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[132px] overflow-y-auto custom-scrollbar">
                  {supervisorOptions
                    .filter((item) => item.value === "all" || item.value !== filterSupervisor)
                    .map((item) => (
                      <div
                        key={item.value}
                        onClick={() => { setFilterSupervisor(item.value); setSupervisorDropOpen(false); }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 capitalize"
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

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Projects Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Sr.No</th>
                <th className="px-6 py-3">Project Details</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Supervisor</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="capitalize font-medium text-slate-900">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <tr key={project._id} className="border-t hover:bg-slate-50 transition-colors duration-150">

                    <td className="px-4 py-4 text-sm">{index + 1}</td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{project.title}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate normal-case">{project.description}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{project.student?.name || "N/A"}</div>
                      <div className="text-xs text-slate-500 normal-case">
                        Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {project.supervisor?.name || "Unassigned"}
                      </div>
                      <div className="text-xs text-slate-500 normal-case">{project.supervisor?.email}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        {/* View */}
                        <button
                          data-tooltip-id="view-tooltip"
                          data-tooltip-content="View"
                          onClick={() => handleViewProject(project._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <Tooltip id="view-tooltip" place="top" offset={10} />
                        </button>

                        {/* Approve — only if pending */}
                        {project.status === "pending" && (
                          <>
                            <button
                              data-tooltip-id="approved-tooltip"
                              data-tooltip-content="Approve"
                              onClick={() => openConfirmModal(project._id, project.title, "approved")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium transition-colors"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <Tooltip id="approved-tooltip" place="top" offset={10} />
                            </button>

                            <button
                              data-tooltip-id="reject-tooltip"
                              data-tooltip-content="Reject"
                              onClick={() => openConfirmModal(project._id, project.title, "rejected")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <Tooltip id="reject-tooltip" place="top" offset={10} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {searchTerm || filterStatus !== "all" || filterSupervisor !== "all"
                      ? "No projects found matching your criteria."
                      : "No projects found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmStatusChange}
        type={confirmModal.type}
        projectTitle={confirmModal.projectTitle}
        isLoading={isStatusLoading}
      />

      {/* View Project Modal — same style as before */}
      {showViewModal && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Overview
              </h2>
              <button
                onClick={() => { setShowViewModal(false); setCurrentProjects(null); }}
                className="p-2 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isViewLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm">Fetching project details...</p>
              </div>
            ) : currentProjects ? (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {currentProjects.title || "Untitled Project"}
                  </h3>
                  <span className={`px-4 py-1 text-xs rounded-full font-semibold tracking-wide border capitalize ${getStatusColor(currentProjects.status)}`}>
                    {currentProjects.status || "N/A"}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" /> Student
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {currentProjects.student?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" /> Supervisor
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {currentProjects.supervisor?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Deadline
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {currentProjects.deadline?.split("T")[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Project Description
                  </p>
                  <div className="max-h-44 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                      {currentProjects.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Attachments</p>
                  {(currentProjects.files || []).length === 0 ? (
                    <div className="text-sm text-gray-400 italic">No files uploaded</div>
                  ) : (
                    <div className="max-h-44 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-200">
                      <div className="grid md:grid-cols-2 gap-3">
                        {currentProjects.files.map((file) => (
                          <div
                            key={file._id || file.url}
                            className="flex items-center justify-between bg-white border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate">{file.originalName}</span>
                            </div>
                            <button
                              className="btn-outline btn-small shrink-0"
                              onClick={() => handleDownload(currentProjects._id, file._id, file.originalName)}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center py-12 text-gray-500">Failed to load project details.</p>
            )}
          </div>
        </div>
      )}

      {/* Download Reports Modal */}
      {isReportsOpen && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-slate-800">All Files</h2>
              <button onClick={() => setIsReportsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-400"
                placeholder="Search files..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
              />
            </div>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">No files found</div>
            ) : (
              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {filteredFiles.map((file) => (
                  <div key={`${file.projectId}-${file.fileId}`} className="flex items-center justify-between py-3">
                    <div className="text-sm">
                      <p className="text-slate-800 font-medium">{file.originalName}</p>
                      <p className="text-xs text-slate-500">{file.projectTitle} • {file.studentName}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(file.projectId, file.fileId, file.originalName)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;