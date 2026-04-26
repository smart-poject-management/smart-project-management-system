import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLearning } from "../../store/slices/studentSlice";
import AssignmentsTab from "./AssignmentsTab";
import ChatTab from "./ChatTab";
import { getAssignments } from "../../store/slices/assignmentSlice";

const StudentWorkspace = () => {
  const dispatch = useDispatch();

  const { authUser } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("assignments");

  useEffect(() => {
    dispatch(getLearning());
  }, [dispatch]);

  useEffect(() => {
    if (!authUser?._id) return;
    dispatch(getAssignments(authUser._id));
  }, [authUser, dispatch]);

  const tabs = [
    { key: "assignments", label: "Assignments" },
    { key: "chat", label: "Chat" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 pb-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments */}
      {activeTab === "assignments" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <AssignmentsTab />
        </div>
      )}

      {/* Chat */}
      {activeTab === "chat" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <ChatTab student={authUser} />
        </div>
      )}
    </div>
  );
};

export default StudentWorkspace;