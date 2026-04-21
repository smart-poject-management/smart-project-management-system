import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { getAttendanceOverview } from "../../store/slices/attendanceSlice";

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);
  const { overviewRows, overviewTotals } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    department: "",
    session: "",
    semester: 1,
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAttendanceOverview(filters));
  }, [dispatch, filters]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="page-header">Attendance Overview</h1>
        <p className="text-slate-500 mt-1">
          Monitor attendance trends across students and departments
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid md:grid-cols-3 gap-4">
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
          value={filters.semester}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, semester: Number(e.target.value || 1) }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 uppercase">Students</p>
          <p className="text-2xl font-bold text-blue-800">{overviewTotals.students}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-700 uppercase">Present Entries</p>
          <p className="text-2xl font-bold text-emerald-800">{overviewTotals.present}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-600 uppercase">Total Entries</p>
          <p className="text-2xl font-bold text-slate-800">{overviewTotals.classes}</p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p className="text-xs text-violet-700 uppercase">Overall Attendance %</p>
          <p className="text-2xl font-bold text-violet-800">
            {overviewTotals.percentage}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Present</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {overviewRows.map((row) => (
                <tr key={row.student._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{row.student.name}</div>
                    <div className="text-xs text-slate-500">{row.student.email}</div>
                  </td>
                  <td className="px-6 py-4">{row.student.roll_no || "-"}</td>
                  <td className="px-6 py-4">
                    {row.student.department?.department || row.student.department || "-"}
                  </td>
                  <td className="px-6 py-4">{row.student.session || "-"}</td>
                  <td className="px-6 py-4">{row.student.semester || 1}</td>
                  <td className="px-6 py-4">{row.present}</td>
                  <td className="px-6 py-4">{row.total}</td>
                  <td className="px-6 py-4">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!overviewRows.length && (
            <div className="text-center py-8 text-slate-500">No attendance data found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
