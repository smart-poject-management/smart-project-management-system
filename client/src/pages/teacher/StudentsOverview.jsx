import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssignedStudents,
  setSelectedStudent,
} from "../../store/slices/teacherSlice";
import { ArrowLeft, User, Search, Eye, Import } from "lucide-react";
import AssignmentsTeacherTab from "./AssignmentTeacherTab";
import ChatTeacherTab from "./ChatTeacherTab";
const tabsList = ["Overview", "Assignments", "Learning", "Chat"];

const AVATAR_COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#DB2777",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0284C7",
  "#65A30D",
];
const avatarColor = name => {
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
const getInitials = name =>
  name
    ? name
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

const getDept = student =>
  typeof student?.department === "object"
    ? student.department?.department || "N/A"
    : student?.department || "N/A";

const Avatar = ({ name, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      background: avatarColor(name),
      fontSize: size * 0.35,
    }}
    className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 tracking-wide"
  >
    {getInitials(name)}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    approved: "bg-blue-50   text-blue-700   border-blue-100",
    rejected: "bg-red-50    text-red-700    border-red-100",
    completed: "bg-green-50  text-green-700  border-green-100",
    submitted: "bg-purple-50 text-purple-700 border-purple-100",
    pending: "bg-amber-50  text-amber-700  border-amber-100",
  };
  const cls =
    map[status?.toLowerCase()] || "bg-amber-50 text-amber-700 border-amber-100";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cls}`}
    >
      {status || "Pending"}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-800 text-right capitalize ml-4 truncate max-w-[60%]">
      {value || "—"}
    </span>
  </div>
);

const StudentCard = ({ student, onView }) => {
  const shortProject = student.projectTitle
    ? student.projectTitle.split(" ").slice(0, 2).join(" ") +
      (student.projectTitle.split(" ").length > 2 ? "..." : "")
    : null;

  return (
    <div
      onClick={() => onView(student)}
      className="group relative bg-white border border-slate-200 rounded-xl shadow-md p-5
                 flex flex-col items-center gap-2.5 cursor-pointer
                 transition-shadow duration-300 hover:shadow-lg overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 flex items-center justify-center z-10"
      >
        <div className="bg-white/90 rounded-full p-2 shadow-md">
          <Eye className="text-indigo-600" style={{ width: 25, height: 25 }} />
        </div>
      </div>

      <Avatar name={student.name} size={58} />

      <div className="text-center w-full space-y-0.5">
        <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
          {student.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{student.email}</p>
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Roll: </span>
          {student.rollNo || student._id?.slice(-6)?.toUpperCase() || "N/A"}
        </p>
        {shortProject && (
          <p className="text-xs text-slate-500 truncate">
            <span className="font-medium text-slate-600">Project: </span>
            {shortProject}
          </p>
        )}
      </div>

      <StatusBadge status={student.status} />
    </div>
  );
};

const StudentDetailPage = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-0 -m-1">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600
                     hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Students
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-sm text-slate-400 truncate">{student.name}</span>
      </div>

      {/* Profile Banner */}
      <div
        className="px-8 py-8 flex items-center gap-6"
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        }}
      >
        <div className="p-1 rounded-full bg-white/25">
          <Avatar name={student.name} size={68} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {student.name}
          </h1>
          <p className="text-indigo-200 text-sm mt-0.5">{student.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium capitalize border border-white/20">
              {student.status || "Pending"}
            </span>
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
              {getDept(student)}
            </span>
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
              Roll:{" "}
              {student.rollNo || student._id?.slice(-6)?.toUpperCase() || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-1 sticky top-[53px] z-10">
        {tabsList.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3.5 px-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-indigo-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-slate-50 min-h-[400px]">
        {activeTab === "Overview" && (
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Basic Info
                </h3>
              </div>
              <div className="px-5">
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Department" value={getDept(student)} />
                <InfoRow
                  label="Roll No"
                  value={
                    student.rollNo || student._id?.slice(-6)?.toUpperCase()
                  }
                />
                <InfoRow
                  label="Joined"
                  value={
                    student.createdAt
                      ? new Date(student.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : null
                  }
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Project Info
                </h3>
              </div>
              {student.projectTitle ? (
                <div className="px-5">
                  <InfoRow label="Project Title" value={student.projectTitle} />
                  <InfoRow
                    label="Project Status"
                    value={student.project?.status || student.status}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No project assigned
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Assignments" && (
          <AssignmentsTeacherTab student={student} />
        )}

        {activeTab === "Learning" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-400">Learning progress coming soon</p>
          </div>
        )}

        {activeTab === "Chat" && <ChatTeacherTab student={student} />}
      </div>
    </div>
  );
};

const StudentsOverview = () => {
  const dispatch = useDispatch();
  const { assignedStudents, selectedStudent, loading } = useSelector(
    state => state.teacher
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const handleView = student => dispatch(setSelectedStudent(student));
  const handleBack = () => dispatch(setSelectedStudent(null));

  const filtered = assignedStudents.filter(
    s =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (selectedStudent) {
    return <StudentDetailPage student={selectedStudent} onBack={handleBack} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-slate-500">
        Loading students...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div
        className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center
                      justify-between border border-slate-200 transition-all duration-300 hover:shadow-lg"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {assignedStudents.length} student
            {assignedStudents.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-xl mt-4 md:mt-0">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Search Students
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50
                       focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                       focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-white rounded-xl shadow-md border border-slate-200
                        flex flex-col items-center justify-center py-20 text-slate-400 gap-3"
        >
          <span className="text-5xl">👥</span>
          <p className="text-sm">
            {search
              ? "No students match your search"
              : "No students assigned yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(student => (
            <StudentCard
              key={student._id}
              student={student}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsOverview;
