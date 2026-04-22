import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssignedStudents,
  setSelectedStudent,
} from "../../store/slices/teacherSlice";

const tabsList = [
  "Overview",
  "Assignments",
  "Learning",
  "Resources",
  "Chat",
  "Analytics",
  "Calendar",
];

const StudentsOverview = () => {
  const dispatch = useDispatch();

  const { assignedStudents, selectedStudent, loading } = useSelector(
    state => state.teacher
  );

  const [activeTab, setActiveTab] = useState("Overview");

  // 🔥 Fetch students
  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  // 🔄 Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Loading students...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* 🧑‍🎓 LEFT SIDEBAR */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <h2 className="text-lg font-semibold p-4 border-b">Students</h2>

        {assignedStudents.length === 0 ? (
          <p className="p-4 text-gray-400">No students found</p>
        ) : (
          assignedStudents.map(student => (
            <div
              key={student._id}
              onClick={() => dispatch(setSelectedStudent(student))}
              className={`p-4 cursor-pointer border-b transition ${
                selectedStudent?._id === student._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">
                {student.projectTitle || "No Project"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 📊 RIGHT CONTENT */}
      <div className="flex-1 p-6">
        {!selectedStudent ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            No student selected
          </div>
        ) : (
          <>
            {/* 🔝 HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{selectedStudent.name}</h1>
              <p className="text-gray-500">{selectedStudent.email}</p>
            </div>

            {/* 📌 TABS */}
            <div className="flex gap-6 border-b mb-6">
              {tabsList.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 📄 TAB CONTENT */}
            <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
              {/* 🔹 OVERVIEW TAB */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm">Department</p>
                    <p className="font-medium">
                      {selectedStudent.department || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Project</p>
                    <p className="font-medium">
                      {selectedStudent.projectTitle || "Not Assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <p className="font-medium capitalize">
                      {selectedStudent.status || "pending"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Student ID</p>
                    <p className="font-medium">{selectedStudent._id}</p>
                  </div>
                </div>
              )}

              {/* 🔹 ASSIGNMENTS TAB */}
              {activeTab === "Assignments" && (
                <div className="text-gray-500">
                  🚧 Assignment system coming next
                </div>
              )}

              {/* 🔹 LEARNING TAB */}
              {activeTab === "Learning" && (
                <div className="text-gray-500">
                  📘 Learning materials will be shown here
                </div>
              )}

              {/* 🔹 RESOURCES TAB */}
              {activeTab === "Resources" && (
                <div className="text-gray-500">
                  📂 Resources & files section
                </div>
              )}

              {/* 🔹 CHAT TAB */}
              {activeTab === "Chat" && (
                <div className="text-gray-500">
                  💬 Chat feature (can integrate socket.io)
                </div>
              )}

              {/* 🔹 ANALYTICS TAB */}
              {activeTab === "Analytics" && (
                <div className="text-gray-500">
                  📊 Analytics dashboard coming soon
                </div>
              )}

              {/* 🔹 CALENDAR TAB */}
              {activeTab === "Calendar" && (
                <div className="text-gray-500">
                  📅 Calendar integration pending
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentsOverview;
