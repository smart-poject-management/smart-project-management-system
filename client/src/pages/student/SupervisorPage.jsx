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

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisor, supervisors } = useSelector(
    (state) => state.student
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
  const submitRequest = () => {
    if (!selectedSupervisor) return;
    const message =
      requestMessage?.trim() ||
      `${authUser.name || "Student"} has requested ${selectedSupervisor.name
      } to be their supervisor.`;

    dispatch(
      requestSupervisor({
        teacherId: selectedSupervisor._id,
        message,
      })
    );
  };

  return (
    <div className="space-y-6 p-4">

      <div className="bg-white/70 border border-slate-200 rounded-2xl shadow-xl">

        {/* Supervisor Section */}
        <div className="p-6">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                Current Supervisor
              </h2>

              {hasSupervisor && (
                <span className="inline-flex items-center gap-1 text-md font-semibold text-purple-600 mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Assigned
                </span>
              )}

              <p className="text-sm text-slate-500">
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
                                {item}
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
              <p className="text-slate-600">
                Supervisor not assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* Project Section */}
        {hasProject && (
          <div className="p-6">
            <div className="mb-6 border-b pb-4">
              <h2 className=" text-2xl font-bold text-slate-800 flex items-center gap-2">
                Project Details
              </h2>
              <p className="text-sm text-slate-500 mt-1 ">
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
                  {/* project status */}
                  <div className="flex gap-3 ">
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
                      <p className="text-xs text-slate-400 uppercase">
                        Status
                      </p>
                      <span
                        className={`text-sm font-medium capitalize ${project?.status === "approved"
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

        {/* Available supervisors */}
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
                          {sup.department || "No Department"}
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
                            ? sup.expertise.join(", ")
                            : sup?.expertise || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleOpenRequest(sup)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition duration-200"
                    >
                      Request Supervisor
                    </button>
                  </div>
                ))}
            </div>
          </div>

        )}

        {/* Modal */}
        {showRequestModal && selectedSupervisor && (
          
          <div className="modal-overlay">
            <div className="modal-content p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">Request Supervision</h3>
                <button onClick={() => setShowRequestModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                className="input w-full"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
              />

              <button
                onClick={submitRequest}
                className="btn-primary mt-4"
              >
                Send Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorPage;

