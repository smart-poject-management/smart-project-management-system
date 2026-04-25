import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLearning } from "../store/slices/studentSlice";
import { getAssignments } from "../store/slices/assignmentSlice";
import socket from "../socket";
import AssignmentsTab from "./AssignmentsTab";
import ChatTab from "./ChatTab";

const StudentWorkspace = () => {
  const dispatch = useDispatch();

  const { assignments } = useSelector((state) => state.assignment);
  const { authUser } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(getLearning());
  }, [dispatch]);

  useEffect(() => {
    if (!authUser?._id) return;

    console.log("FETCHING ASSIGNMENTS FOR:", authUser._id);
    dispatch(getAssignments(authUser._id));
  }, [authUser, dispatch]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "assignments", label: "Assignments" },
    { key: "chat", label: "Chat" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* TABS */}
      <div className="flex gap-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-xl font-bold">{assignments?.length || 0}</p>
            <p className="text-sm text-gray-500">Assignments</p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-xl font-bold">0</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-xl font-bold">0</p>
            <p className="text-sm text-gray-500">Progress</p>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="bg-white p-4 rounded shadow">
          <AssignmentsTab />
        </div>
      )}

      {/* CHAT */}
      {activeTab === "chat" && (
        <div className="bg-white p-4 rounded shadow">
          <ChatTab student={authUser} />
        </div>
      )}

    </div>
  );
};

export default StudentWorkspace;