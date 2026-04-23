import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLearning, completeTopic } from "../store/slices/studentSlice";
import socket from "../socket";

const StudentWorkspace = () => {
  const dispatch = useDispatch();

  const { learning, progress, project } = useSelector(state => state.student);

  const [activeTab, setActiveTab] = useState("overview");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    dispatch(getLearning());
  }, [dispatch]);

  useEffect(() => {
    socket.on("receiveMessage", msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", { message });
    setMessages(prev => [...prev, { message }]);
    setMessage("");
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "assignments", label: "Assignments" },
    { key: "learning", label: "Learning" },
    { key: "chat", label: "Chat" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-6 border-b">
        {tabs.map(tab => (
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

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {project?.title || "Project Title"}
              </h2>
              <p className="text-sm text-gray-500">{project?.description}</p>
            </div>

            <div className="text-blue-600 font-bold text-xl">
              {progress || 0}%
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-xl font-bold">{learning?.length || 0}</p>
              <p className="text-sm text-gray-500">Topics</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-xl font-bold">
                {learning?.filter(t => t.status === "completed").length || 0}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-xl font-bold">0</p>
              <p className="text-sm text-gray-500">Assignments</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-xl font-bold">{progress || 0}%</p>
              <p className="text-sm text-gray-500">Progress</p>
            </div>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <p className="font-medium">Next Steps</p>
            <ul className="text-sm mt-2 list-disc ml-4">
              <li>Complete pending topics</li>
              <li>Submit assignments</li>
              <li>Check feedback</li>
            </ul>
          </div>
        </div>
      )}

   
      {activeTab === "assignments" && (
        <div className="bg-white p-4 rounded shadow">
          <p>No assignments yet</p>
        </div>
      )}

      {/* ================= LEARNING ================= */}
      {activeTab === "learning" && (
        <div className="space-y-6">
          {/* PROGRESS BAR */}
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold mb-2">Progress</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            <p className="text-sm mt-2">{progress || 0}% Completed</p>
          </div>

          {/* TOPICS */}
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold mb-4">Learning Topics</p>

            {learning?.map(topic => (
              <div
                key={topic._id}
                className="flex justify-between items-center border-b py-3"
              >
                <div>
                  <p className="font-medium">{topic.title}</p>
                  <p className="text-sm text-gray-500">{topic.status}</p>
                </div>

                {topic.status !== "completed" && (
                  <button
                    onClick={() => dispatch(completeTopic(topic._id))}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CHAT ================= */}
      {activeTab === "chat" && (
        <div className="bg-white p-4 rounded shadow">
          <div className="h-64 overflow-y-auto border mb-3 p-2">
            {messages.map((m, i) => (
              <p key={i} className="mb-1">
                {m.message}
              </p>
            ))}
          </div>

          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="border p-2 w-full"
            placeholder="Type message..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-3 py-1 mt-2"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentWorkspace;
