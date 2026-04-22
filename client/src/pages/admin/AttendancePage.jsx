import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import {
  assignOc,
  getAttendanceOverview,
  getOcAssignments,
} from "../../store/slices/attendanceSlice";

const AttendancePage = () => {
  const dispatch = useDispatch();

  const { departments } = useSelector((state) => state.department);
  const { users } = useSelector((state) => state.admin);
  const { overviewRows, overviewTotals, ocAssignments } = useSelector(
    (state) => state.attendance,
  );

  const sessionOptions = ["2022-26", "2023-27", "2024-28"];

  const [filters, setFilters] = useState({
    department: "",
    session: "2022-26",
    semester: 1,
  });

  const [ocDepartment, setOcDepartment] = useState("");
  const [selectedTeacherBySemester, setSelectedTeacherBySemester] = useState(
    {},
  );

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAttendanceOverview(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (ocDepartment) {
      dispatch(getOcAssignments(ocDepartment));
    }
  }, [dispatch, ocDepartment]);

  const departmentTeachers = users.filter(
    (user) =>
      user.role === "Teacher" &&
      user.department?._id === ocDepartment,
  );

  const assignedTeacherBySemester = ocAssignments.reduce(
    (acc, assignment) => {
      acc[assignment.semester] = assignment.teacher;
      return acc;
    },
    {},
  );

  const handleAssignOc = (semester) => {
    const teacherId = selectedTeacherBySemester[semester];

    if (!teacherId || !ocDepartment) return;

    dispatch(
      assignOc({
        teacherId,
        departmentId: ocDepartment,
        semester,
      }),
    ).then(() => {
      dispatch(getOcAssignments(ocDepartment));
    });
  };

  const handleCancelOcSection = () => {
    setOcDepartment("");
    setSelectedTeacherBySemester({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="page-header">Attendance Overview</h1>
        <p className="text-slate-500 mt-1">
          Monitor attendance trends across students and departments
        </p>
      </div>

      {/* OC Assignment Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-800">
            Assign Officer In-Charge
          </h2>

          {ocDepartment && (
            <button
              type="button"
              onClick={handleCancelOcSection}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>

        <select
          value={ocDepartment}
          onChange={(e) => setOcDepartment(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full md:w-80"
        >
          <option value="">Select Department</option>

          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.department}
            </option>
          ))}
        </select>

        {ocDepartment && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => i + 1).map(
              (semester) => (
                <div
                  key={semester}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <p className="font-medium text-slate-800">
                    Semester {semester}
                  </p>

                  <p
                    className={`text-xs font-medium ${
                      assignedTeacherBySemester[semester]
                        ? "text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md inline-block"
                        : "text-slate-400"
                    }`}
                  >
                    Current OC:{" "}
                    {assignedTeacherBySemester[semester]?.name ||
                      "Not Assigned"}
                  </p>

                  <select
                    value={
                      selectedTeacherBySemester[semester] || ""
                    }
                    onChange={(e) =>
                      setSelectedTeacherBySemester(
                        (prev) => ({
                          ...prev,
                          [semester]: e.target.value,
                        }),
                      )
                    }
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    <option value="">Select Teacher</option>

                    {departmentTeachers.map((teacher) => {
                      const isCurrent =
                        assignedTeacherBySemester[
                          semester
                        ]?._id === teacher._id;

                      return (
                        <option
                          key={teacher._id}
                          value={teacher._id}
                        >
                          {teacher.name}{" "}
                          {isCurrent ? "(Current OC)" : ""}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    onClick={() =>
                      handleAssignOc(semester)
                    }
                    className="w-full bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-indigo-700"
                  >
                    {assignedTeacherBySemester[semester]
                      ? "Change OC"
                      : "Assign OC"}
                  </button>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid md:grid-cols-3 gap-4">
        <select
          value={filters.department}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              department: e.target.value,
            }))
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

        <select
          value={filters.session}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              session: e.target.value,
            }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {sessionOptions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max="8"
          value={filters.semester}
          onChange={(e) => {
            let value = Number(e.target.value || 1);

            if (value < 1) value = 1;
            if (value > 8) value = 8;

            setFilters((prev) => ({
              ...prev,
              semester: value,
            }));
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs uppercase text-blue-700">
            Students
          </p>
          <p className="text-2xl font-bold text-blue-800">
            {overviewTotals.students}
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs uppercase text-emerald-700">
            Present Entries
          </p>
          <p className="text-2xl font-bold text-emerald-800">
            {overviewTotals.present}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-600">
            Total Entries
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {overviewTotals.classes}
          </p>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p className="text-xs uppercase text-violet-700">
            Attendance %
          </p>
          <p className="text-2xl font-bold text-violet-800">
            {overviewTotals.percentage}%
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Present</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">%</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {overviewRows.map((row) => (
                <tr
                  key={row.student._id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {row.student.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.student.email}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {row.student.roll_no || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {row.student.department?.department ||
                      "-"}
                  </td>

                  <td className="px-6 py-4">
                    {row.student.session}
                  </td>

                  <td className="px-6 py-4">
                    {row.student.semester}
                  </td>

                  <td className="px-6 py-4">
                    {row.present}
                  </td>

                  <td className="px-6 py-4">
                    {row.total}
                  </td>

                  <td className="px-6 py-4">
                    {row.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!overviewRows.length && (
            <div className="text-center py-8 text-slate-500">
              No attendance data found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;