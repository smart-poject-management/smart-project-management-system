import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAttendanceStudents,
  markBulkAttendance,
} from "../../store/slices/attendanceSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";

const ATTENDANCE_STATUS_OPTIONS = [
  { label: "P", value: "Present" },
  { label: "A", value: "Absent" },
  { label: "HD", value: "Half Day" },
  { label: "L", value: "Leave" },
];

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { students, loadingStudents } = useSelector((state) => state.attendance);
  const { departments } = useSelector((state) => state.department);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filters, setFilters] = useState({ department: "", session: "", semester: "" });
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    // Temporary debug log for frontend request payload.
    console.log("[Attendance][TeacherPage] filters", filters);
    dispatch(getAttendanceStudents(filters));
  }, [dispatch, filters]);

  const records = useMemo(
    () =>
      Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      })),
    [attendanceMap],
  );

  const updateStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    if (!records.length) return;
    dispatch(markBulkAttendance({ records, date }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="page-header">Attendance Management</h1>
        <p className="text-slate-500 mt-1">Mark and manage student attendance</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid md:grid-cols-4 gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filters.department}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, department: e.target.value }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.department}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Session"
          value={filters.session}
          onChange={(e) => setFilters((prev) => ({ ...prev, session: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="1"
          placeholder="Semester"
          value={filters.semester}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              semester: e.target.value === "" ? "" : Number(e.target.value),
            }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700"
        >
          Submit Attendance
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(students || []).map((student) => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4">{student.roll_no || "-"}</td>
                  <td className="px-6 py-4">
                    {student.department?.department || student.department || "-"}
                  </td>
                  <td className="px-6 py-4">{student.semester || 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {ATTENDANCE_STATUS_OPTIONS.map((statusOption) => (
                        <button
                          key={statusOption.value}
                          type="button"
                          onClick={() => updateStatus(student._id, statusOption.value)}
                          className={`px-2 py-1 rounded text-xs border ${
                            attendanceMap[student._id] === statusOption.value
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-700 border-slate-300"
                          }`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingStudents && !students.length && (
            <div className="text-center py-8 text-slate-500">No students found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
