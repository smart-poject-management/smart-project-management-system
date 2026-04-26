import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getLearning } from "../../store/slices/studentSlice";
import { getAssignments } from "../../store/slices/assignmentSlice";
import AssignmentsTab from "../../components/AssignmentsTab";
import StudentChatTab from "./StudentChatTab"; // Correct import name

const StudentWorkspace = () => {
  const dispatch = useDispatch();

  const { assignments } = useSelector(state => state.assignment);
  const { authUser } = useSelector(state => state.auth);
  const { project, loading } = useSelector(state => state.student); // Added loading state

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(getLearning());
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getAssignments(authUser._id));
    }
  }, [authUser, dispatch]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "assignments", label: "Assignments" },
    { key: "chat", label: "Chat" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Tabs Header */}
      <div className="flex gap-6 border-b bg-white px-4 rounded-t-lg">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <p className="text-2xl font-bold text-blue-600">
                {assignments?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Assignments</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <p className="text-2xl font-bold text-orange-600">0%</p>
              <p className="text-sm text-gray-500">Progress</p>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <AssignmentsTab />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            {loading ? (
              <p className="text-center text-gray-400 py-10">
                Fetching project details...
              </p>
            ) : !project ? (
              <p className="text-center text-gray-400 py-10">
                No project data found.
              </p>
            ) : !project.supervisor ? (
              <div className="text-center py-10">
                <p className="text-gray-500 font-medium">
                  No supervisor assigned yet.
                </p>
                <p className="text-xs text-gray-400">
                  Chat will be enabled once a teacher is assigned to your
                  project.
                </p>
              </div>
            ) : (
              <StudentChatTab supervisor={project.supervisor} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWorkspace;
