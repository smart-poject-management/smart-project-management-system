import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptRequest,
  getTeacherRequests,
  rejectRequest,
} from "../../store/slices/teacherSlice";
import { FileText } from "lucide-react";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});

  const dispatch = useDispatch();
  const { list } = useSelector(state => state.teacher);
  const { authUser } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser._id));
  }, [dispatch, authUser._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const handleAccept = async request => {
    const id = request._id;
    setLoading(id, "accepting", true);

    try {
      await dispatch(acceptRequest(id)).unwrap();
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async request => {
    const id = request._id;
    setLoading(id, "rejecting", true);

    try {
      await dispatch(rejectRequest(id)).unwrap();
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const filteredRequests =
    list.filter(request => {
      const matchesSearch =
        (request?.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (request?.latestProject?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h1 className="text-lg font-semibold text-slate-800">
              Pending Supervision Requests
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review and respond to student supervision requests
            </p>
          </div>

          {/* Search & filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by student name or project title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 
          bg-slate-50 focus:bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
          shadow-sm transition-all duration-200 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            {/* Filter */}

            <select
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 
        bg-slate-50 focus:bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
        shadow-sm transition-all duration-200 text-sm sm:w-48"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests */}
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const id = req._id;
            const project = req.latestProject;
            const projectStatus = project?.status?.toLowerCase() || "pending";
            const supervisorAssigned = !!project?.supervisor;
            const canAccept =
              projectStatus === "approved" && !supervisorAssigned;
            const lm = loadingMap[id] || {};
            let bgClass = "bg-white";
            let StatusMessage = "";
            if (projectStatus === "approved" && supervisorAssigned) {
              bgClass = "bg-blue-50 border-blue-300";
              StatusMessage = "Supervisor already assigned";
            } else if (projectStatus === "rejected") {
              bgClass = "bg-red-50 border-red-300";
              StatusMessage = "Project proposal rejected";
            } else if (projectStatus === "pending") {
              bgClass = "bg-yellow-50 border-yellow-300";
              StatusMessage = "Project proposal pending";
            }

            return (
              <div
                key={id}
                className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${bgClass} transition-all`}
              >
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {req?.student?.name || "Unknown Student"}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === "pending" ? "bg-yellow-100 text-yellow-800" : req.status === "accepted" ? "bg-green-100 text-green-800 " : " bg-red-100 text-red-800"}`}
                      >
                        {req.status?.charAt(0).toLowerCase() +
                          req.status?.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">
                      {req?.student?.email || "No email"}
                    </p>
                    <h4 className="font-medium text-slate-700 mb-2">
                      {project?.title || "No project title"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Submitted:{" "}
                      {req?.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "-"}
                    </p>

                    {StatusMessage && (
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {StatusMessage}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${canAccept ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        disabled={lm.accepting || !canAccept}
                        onClick={() => handleAccept(req)}
                      >
                        {lm.accepting ? "Accepting" : "Accept"}
                      </button>

                      <button
                        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 disabled:opacity-60 bg-red-600 hover:bg-red-700 text-white disabled:cursor-not-allowed`}
                        disabled={lm.rejecting}
                        onClick={() => handleReject(req)}
                      >
                        {lm.rejecting ? "Rejecting" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Request */}
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              No requests found
            </h3>
            <p className="text-slate-600">
              No supervision requests match your filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PendingRequests;
