import { AlertTriangle, CheckCircle2, FileDown, Folder, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { approveProject, getProject, rejectProject } from "../../store/slices/adminSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProjects, setCurrentProjects] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.admin);

  const supervisors = useMemo(() => {
    const set = new Set(
      projects?.map(project => project?.supervisor?.name).filter(Boolean)
    );

    return Array.from(set);
  }, [projects]);

  const filteredProjects = projects?.filter(project => {
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const matchesSupervisor =
      filterSupervisor === "all" ||
      project.supervisor?.name === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const files = useMemo(() => {
    return (projects || []).flatMap(project =>
      (project.files || []).map(file => ({
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        projectTitle: project.title,
        studentName: project.student?.name,
      }))
    );
  }, [projects]);

  const filteredFiles = files?.filter(
    file =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase())
  );

  const handleDownload = async (projectId, fileId, name) => {
    await dispatch(downloadProjectFile({ projectId, fileId, name }));
    toast.success(`"${name}" downloaded successfully.`);
  };

  const getStatusColor = status => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";

      case "pending":
        return "bg-orange-100 text-orange-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter(p => p.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: projects.filter(p => p.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter(p => p.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage all student projects, their statuses, and associated
            files.
          </p>
        </div>

        <button
          onClick={() => setIsReportsOpen(true)}
          className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md 
      transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <FileDown className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          <span>Download Reports</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {projectStats.map((item, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${item.bg}`}>
                  <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    {item.title}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Projects
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by project title or student name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Status
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by project title or student name..."
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Projects</option>
              <option value="pending">Pending Projects</option>
              <option value="approved">Approved Projects</option>
              <option value="completed">Completed Projects</option>
              <option value="rejected">Rejected Projects</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter supervisor
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by project title or student name..."
              value={filterSupervisor}
              onChange={e => setFilterSupervisor(e.target.value)}
            >
              <option value="all">All Supervisors</option>
              {supervisors.map(supervisor => {
                return (
                  <option key={supervisor} value={supervisor}>
                    {supervisor}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Projects Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Project Detailes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProjects?.map(project => (
                <tr key={project._id} className="hover:bg-slate-50">
                  {/* Project Details */}
                  <td className="px-6 py-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {project.title}
                      </div>
                      <div className="text-sm text-slate-500 max-w-xs truncate">
                        {project.description}
                      </div>
                      <div className="text-xs text-slate-400">
                        Due :{" "}
                        {project.deadline && project.deadline.split("T")[0]}
                      </div>
                    </div>
                  </td>

                  {/* Student */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {project.student?.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Last Update:{" "}
                      {project?.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>

                  {/* Supervisor */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {project.supervisor?.name ? (
                        project.supervisor?.name
                      ) : (
                        "Unassigned"
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.supervisor?.email}
                    </div>
                  </td>

                  {/* deadline */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString()
                        : "N/A"}
                    </div>

                  </td>

                  {/* project status */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>

                  {/* action  btn */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={async () => {

                        const res = await dispatch(getProject(project._id))
                        if (!getProject.fulfilled.match(res)) return
                        const detail = res.payload?.project || res.payload
                        setCurrentProjects(detail)
                        setShowViewModal(true)
                      }}

                        className="text-blue-600 hover:text-blue-800"> View

                      </button>
                      {
                        project.status === "pending" && (
                          <>

                            <button
                              onClick={() =>
                                handleStatusChange(project._id, "approved")
                              }
                              className="text-green-600 hover:text-green-800">
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(project._id, "rejected")
                              }
                              className="text-red-600 hover:text-red-800">
                              Reject
                            </button>

                          </>
                        )

                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {
          filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">No projects found matching your criteria</p>
            </div>
          )

        }
      </div>

      {/* View Project Modal */}
      {showViewModal && currentProjects && (
        <div className="fixed inset-0 -top-10 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Project Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Title
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects?.title || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Description
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects?.description || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Student
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects?.student?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Supervisor
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects?.supervisor?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Deadline
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects?.deadline &&
                    currentProjects?.deadline.split("T")[0]}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Status
                </label>
                <p className="text-sm text-slate-900">
                  {currentProjects.status}
                </p>
              </div>
              {/* file */}
              <div>
                <label className="text-sm font-medium text-slate-500">
                  File
                </label>
                <div className="text-sm text-slate-900">
                  {
                    (currentProjects?.files || []).length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No files uploaded
                      </div>
                    ) : (
                      <ul className="list-disc list-inside text-sm text-slate-700">
                        {currentProjects.files.map((file) => (
                          <li key={file._id || file.url}>
                            {file.originalName}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* report modal */}
      {isReportsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl p-5">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-slate-800">
                All Files
              </h2>

              <button
                onClick={() => setIsReportsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH */}
            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-400"
                placeholder="Search..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
              />
            </div>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">
                No files found
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredFiles.map((file) => (
                  <div
                    key={`${file.projectId}-${file.fileId}`}
                    className="flex items-center justify-between py-3"
                  >

                    {/* INFO */}
                    <div className="text-sm">
                      <p className="text-slate-800 font-medium">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {file.projectTitle} • {file.studentName}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDownload(
                          file.projectId,
                          file.fileId,
                          file.originalName
                        )
                      }
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
