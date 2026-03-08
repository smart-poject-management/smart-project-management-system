import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import { X } from "lucide-react";
const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector(state => state.auth);
  const { project, supervisor, supervisors } = useSelector(
    state => state.student
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchAllSupervisor());
    dispatch(fetchProject());
    dispatch(getSupervisor());
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor]
  );

  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = dateStr => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return "-";

    const day = date.getDate();

    const j = day % 10,
      k = day % 100;

    const suffix =
      j === 1 && k !== 11
        ? "st"
        : j === 2 && k !== 12
          ? "nd"
          : j === 3 && k !== 13
            ? "rd"
            : "th";

    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
  };
  const handleOpenRequest = supervisor => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    if (!selectedSupervisor) return;
    const message =
      requestMessage?.trim() ||
      `${authUser.name || "Student"} has request ${
        selectedSupervisor.name
      } to be their supervisor.`;
    dispatch(
      requestSupervisor({
        teacherId: selectedSupervisor._id,
        message,
      })
    );
  };
  return (
    <>
      <div className="space-y-6">
        {/* current supervisor */}
        <div className="card">
          <div className="card-header">
            <h1>Current Supervisor</h1>
            {hasSupervisor && <span>Assigned</span>}
          </div>
          {/* supervisor info */}
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex item-start space-x-6">
                <img
                  src="/placeholder.jpg"
                  alt="Supervisor Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "-"}{" "}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {supervisor?.department || "-"}
                    </p>
                  </div>

                  <div className="grid grid-col-1 md:grid-col2 gap-4">
                    <div>
                      <label className="text-lg font-semibold text-slate-600 uppercase tracking-wider">
                        Email
                      </label>
                      <p className="text-lg text-slate-600">
                        {supervisor?.email || "-"}
                      </p>
                    </div>

                    <div>
                      <label className="text-lg font-semibold text-slate-600 uppercase tracking-wider">
                        Expertise
                      </label>
                      <p className="text-lg text-slate-600">
                        {Array.isArray(supervisor?.expertise)
                          ? supervisor?.expertise?.join(", ")
                          : supervisor?.expertise || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600">Supervisor not assigned yet.</p>
            </div>
          )}
        </div>

        {/* project details only show if project exists */}
        {hasProject && (
          <div className="card bg-white shadow-md rounded-xl p-6 border border-slate-200">
            <div className="card-header mb-4">
              <h2 className="card-title text-xl font-semibold text-slate-800">
                Project Details
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Project Title
                    </label>
                    <p className="text-base text-slate-700 mt-1">
                      {project?.title || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-2 
                  px-3 py-1 rounded-full font-medium capitalize text-sm
                  ${
                    project?.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : project?.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : project?.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                      >
                        {project?.status || "invalid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-base text-slate-700 mt-1">
                      {project?.deadline
                        ? formatDeadline(project?.deadline)
                        : "No deadline set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-base text-slate-700 mt-1">
                      {project?.createdAt
                        ? formatDeadline(project?.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {project.description && (
                <div>
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-base text-slate-700 mt-1 leading-relaxed">
                    {project?.description || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* if no project */}
        {!hasProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Required</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600">
                You need to submit a project proposal to get a supervisor.
              </p>
            </div>
          </div>
        )}

        {/* Available supervisors */}
        {hasProject && !hasSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Supervisors</h2>
              <p>
                Browse and request supervisor from available faculty members
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supervisor &&
                  supervisors.map(sup => (
                    <div key={sup._id} className="card">
                      <div className="card-header">
                        <h2 className="card-title">
                          {sup.name || "Anonymous"}{" "}
                        </h2>
                      </div>
                      <div className="p-6">
                        <h4 className="card-title">
                          {sup.name || "Anonymous"}{" "}
                        </h4>
                        <p className="text-slate-600">{sup.department}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <label className="text-sm font-medium text-slate-500">
                            Email
                          </label>
                          <p className="text-sm text-slate-700">
                            {sup.email || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-500">
                            Experties
                          </label>
                          <p className="text-sm text-slate-700">
                            {Array.isArray(sup?.expertise)
                              ? sup.expertise.join(", ")
                              : sup?.expertise || "-"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenRequest(sup)}
                        className="btn-primary w-full"
                      >
                        Request Supervisor
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* request modal */}

        {showRequestModal && selectedSupervisor && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <div className="flex item-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Request Supervision
                  </h3>
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedSupervisor(null);
                      setRequestMessage("");
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-md">
                    <p className="text-sm text-slate-600">
                      {selectedSupervisor?.name}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="label">Message to Supervisor </label>
                  <textarea
                    className="input main-h-[120px]"
                    required
                    value={requestMessage}
                    onChange={e => setRequestMessage(e.target.value)}
                    placeholder="Introduce your self and explain why
                  you'd life this professor to supervise
                   your project..."
                  />
                </div>
                <div
                  className="flex justify-end
                space-x-3 border-t border-slate-200
                "
                >
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedSupervisor(null);
                      setRequestMessage("");
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitRequest}
                    className="btn-primary"
                    disabled={!requestMessage.trim()}
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorPage;
