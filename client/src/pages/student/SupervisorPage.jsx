import {
  Mail,
  Briefcase,
  CheckCircle,
  FileText,
  Calendar,
  Clock,
  Info,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";

const MAX_MESSAGE_LENGTH = 250;

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisor, supervisors, pendingSupervisorRequestIds } =
    useSelector((state) => state.student);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const isProjectPending = useMemo(
    () => project?.status === "pending",
    [project?.status]
  );

  const pendingSupervisorIdSet = useMemo(() => {
    const ids = pendingSupervisorRequestIds || [];
    return new Set(ids.map((id) => String(id)));
  }, [pendingSupervisorRequestIds]);

  const hasPendingRequestTo = (supervisorId) =>
    pendingSupervisorIdSet.has(String(supervisorId));

  const formatDeadline = (dateStr) => {
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

  const handleOpenRequest = (sup) => {
    if (isProjectPending) return;
    setSelectedSupervisor(sup);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const buildDefaultMessage = (sup) =>
    `${authUser?.name || "Student"} has requested ${sup.name} to be their supervisor.`;

  const submitRequest = async () => {
    if (!selectedSupervisor) return;
    const raw = requestMessage?.trim();
    const message = raw
      ? raw.slice(0, MAX_MESSAGE_LENGTH)
      : buildDefaultMessage(selectedSupervisor).slice(0, MAX_MESSAGE_LENGTH);

    setLoading(true);
    try {
      await dispatch(
        requestSupervisor({
          teacherId: selectedSupervisor._id,
          message,
        })
      ).unwrap();
      setShowRequestModal(false);
      setRequestMessage("");
      setSelectedSupervisor(null);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 border border-slate-200 rounded-xl shadow-xl">

        {/* Supervisor Section */}
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h2 className="page-header flex items-center gap-2">
                Current Supervisor
              </h2>

              {hasSupervisor && (
                <span className="inline-flex items-center gap-1 text-md font-semibold text-purple-600 mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Assigned
                </span>
              )}

              <p className="text-gray-500 mt-1">
                Stay updated with your project progress and deadlines
              </p>
            </div>
          </div>

          {hasSupervisor ? (
            <div className="p-6">
              <div className="flex items-start space-x-6">
                <img
                  src="/placeholder.jpg"
                  alt="Supervisor Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-slate-100"
                />

                <div className="flex-1">
                  <div className="mb-4 ml-4">
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "-"}
                    </h3>
                    <p className="text-md text-slate-500">
                      {supervisor?.department || "No Department"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Email */}
                    <div className="p-4 flex items-start gap-3">
                      <Mail className="w-5 h-5 text-slate-500 mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                          Email
                        </p>
                        <p className="text-sm font-medium text-black">
                          {supervisor?.email || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="p-4 flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-slate-500 mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Expertise
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(supervisor?.expertise) ? (
                            supervisor.expertise.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full font-medium"
                              >
                                {item.name || item}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600">
                              {supervisor?.expertise || "-"}
                            </span>
                          )}
                        </div>
                      </div>
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

        {/* Project Section */}
        {hasProject && (
          <div className="p-6">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                Project Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Track your project information and timeline
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left */}
                <div className="bg-white shadow-sm rounded-2xl p-5 border space-y-5">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-purple-700 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase">
                        Project Title
                      </p>
                      <p className="text-base font-medium text-purple-700">
                        {project?.title || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Project Status */}
                  <div className="flex gap-3">
                    {project?.status === "approved" && (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    )}
                    {project?.status === "pending" && (
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
                    )}
                    {project?.status === "rejected" && (
                      <XCircle className="w-5 h-5 text-red-500 mt-1" />
                    )}
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Status</p>
                      <span
                        className={`text-sm font-medium capitalize ${
                          project?.status === "approved"
                            ? "text-green-500"
                            : project?.status === "pending"
                              ? "text-yellow-500"
                              : project?.status === "rejected"
                                ? "text-red-500"
                                : "text-gray-400"
                        }`}
                      >
                        {project?.status || "invalid"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="bg-white shadow-sm rounded-2xl p-5 border space-y-5">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-rose-800 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase">
                        Deadline
                      </p>
                      <p className="text-base font-medium text-rose-800">
                        {project?.deadline
                          ? formatDeadline(project.deadline)
                          : "No deadline"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase">
                        Created
                      </p>
                      <p className="text-base font-medium text-blue-500">
                        {project?.createdAt
                          ? formatDeadline(project.createdAt)
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {project?.description && (
                <div className="bg-white shadow-sm rounded-2xl p-5 border flex gap-3">
                  <Info className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase">
                      Description
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Supervisors */}
        {hasProject && !hasSupervisor && (
          <div className="p-6">

            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Available Supervisors
              </h2>
              <p className="text-gray-500 mt-2">
                Browse and request a supervisor from available faculty members
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supervisors &&
                supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-300"
                  >
                    {/* Top Section */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-lg">
                        {sup.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {sup.name || "Anonymous"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {sup.department.department || "No Department"}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-5 text-sm">
                      <div>
                        <p className="text-gray-400">Email</p>
                        <p className="text-gray-700 break-all">
                          {sup.email || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Expertise</p>
                        <p className="text-gray-700">
                          {Array.isArray(sup?.expertise)
                            ? sup.expertise.map(exp => exp.name || exp).join(", ")
                            : sup?.expertise || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenRequest(sup)}
                      disabled={isProjectPending || hasPendingRequestTo(sup._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:hover:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition duration-200"
                    >
                      {isProjectPending
                        ? "Project pending approval"
                        : hasPendingRequestTo(sup._id)
                          ? "Request pending"
                          : "Request Supervisor"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showRequestModal && selectedSupervisor && (
          <div className="fixed inset-0 -top-10 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Request Supervision
                </h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  disabled={loading}
                  className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Supervisor Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                  {selectedSupervisor.name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {selectedSupervisor.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedSupervisor.department || "No Department"}
                  </p>
                </div>
              </div>

              {/* Message Input */}
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Message (optional, max {MAX_MESSAGE_LENGTH} characters)
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder={buildDefaultMessage(selectedSupervisor).slice(
                  0,
                  MAX_MESSAGE_LENGTH
                )}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">
                {requestMessage.length}/{MAX_MESSAGE_LENGTH}
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  disabled={loading}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRequest}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupervisorPage;