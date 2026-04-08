import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { X } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
  const { projects } = useSelector(state => state.admin);

  const [viewProjects, setViewProjects] = useState(projects || []);
  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return (viewProjects || []).map(project => ({
      _id: project._id,
      title: project.title,
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

  const filteredProjects = projectRows.filter(row => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const hanedleSubmit = async e => {
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

      // Directly update local state — no refresh needed
      setViewProjects(prev =>
        prev.map(p =>
          p._id === selectedProject._id
            ? { ...p, deadline: formData.deadlineDate }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card*/}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="page-header">Manage Deadlines</h1>
            <p className="text-gray-500 mt-1">
              Create and monitor project deadlines
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium mt-4 md:mt-0"
          >
            Create/Update Deadline
          </button>
        </div>
      </div>

      {/* Filters Card*/}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Deadlines
            </label>
            <input
              type="text"
              placeholder="Search by project or student..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Project Deadlines Card*/}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Project Deadlines
          </h2>
        </div>

        {/* Project Deadlines Tables */}
        <div className="overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Project Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Deadline Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProjects.map(row => {
                return (
                  <tr key={row._id} className="hover:bg-slate-100">
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
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{row.deadline}</td>
                    <td className="px-6 py-4">{row.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* filters project */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No projects found matching your search criteria. Try adjusting your
            search or check back later for new projects.
          </div>
        )}
      </div>

      {/* Create/Update Deadline Modal */}
      {showModal && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
            {/* Headers */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Create or Update Deadline
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={hanedleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start typing to search projects..."
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setSelectedProject(null);
                    setFormData({ ...formData, projectTitle: e.target.value });
                  }}
                />
                {query && !selectedProject && (
                  <div className="mt-2 border border-slate-200 rounded-md max-h-56 overflow-y-auto">
                    {(projects || [])
                      .filter(p =>
                        p.title.toLowerCase().includes(query.toLowerCase())
                      )
                      .slice(0, 8)
                      .map(project => (
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
                            {project.student?.name || "No student assigned"}{" "}
                            {project.supervisor?.name ||
                              "No supervisor assigned"}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.deadlineDate}
                  onChange={e =>
                    setFormData({ ...formData, deadlineDate: e.target.value })
                  }
                />
              </div>

              {selectedProject && (
                <div className="mt-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-slate-900">
                      Project Details
                    </div>
                    <div
                      className="text-sm text-slate-700"
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
                        : selectedProject.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Status */}
                    <div>
                      <div className="text-sm text-slate-500">Status</div>
                      <div className="text-sm font-medium text-slate-800">
                        {selectedProject.status || "Unknown"}
                      </div>
                    </div>

                    {/* Supervisor */}
                    <div>
                      <div className="text-sm text-slate-500">Supervisor</div>
                      <div className="text-sm font-medium text-slate-800">
                        {selectedProject.supervisor?.name ||
                          "No supervisor assigned"}
                      </div>
                    </div>

                    {/* Student */}
                    <div>
                      <div className="text-sm text-slate-500">Student</div>
                      <div className="text-sm font-medium text-slate-800 space-y-1">
                        <div>
                          {selectedProject.student?.name ||
                            "No student assigned"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedProject.student?.email || "No email"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedProject.student?.rollNo || "No roll number"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedProject.student?.department ||
                            "No department"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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
