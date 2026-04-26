import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AssignmentsTab from "./AssignmentsTab";
import StudentChatTab from "./StudentChatTab";
import { getAssignments } from "../../store/slices/assignmentSlice";
import { fetchProject, getLearning } from "../../store/slices/studentSlice";

const StudentWorkspace = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector(state => state.auth);
  const { project, loading } = useSelector(state => state.student); 
  const [activeTab, setActiveTab] = useState("assignments");

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
