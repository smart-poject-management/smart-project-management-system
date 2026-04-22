import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import {
  getAttendanceDayRecords,
  getAttendanceStudents,
  getTeacherAttendanceAccess,
  getMyOcAssignments,
  markBulkAttendance,
} from "../../store/slices/attendanceSlice";

import { axiosInstance } from "../../lib/axios";

const ATTENDANCE_STATUS_OPTIONS = [
  { label: "P", value: "Present" },
  { label: "A", value: "Absent" },
  { label: "HD", value: "Half Day" },
  { label: "L", value: "Leave" },
];

const formatAttendanceDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getLocalDateString = (value = new Date()) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AttendancePage = () => {
  const dispatch = useDispatch();

  const {
    students,
    dayRecords,
    loadingStudents,
    loadingTeacherAccess,
    teacherAttendanceAccess,
    teacherOcAssignments,
  } = useSelector((state) => state.attendance);

  const currentDate = getLocalDateString();

  const [attendanceMap, setAttendanceMap] = useState({});
  const [scope, setScope] = useState({ department: "", semester: "" });

  const [historyDate, setHistoryDate] = useState(currentDate);
  const [historyDailyRecords, setHistoryDailyRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [historyMonth, setHistoryMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  useEffect(() => {
    dispatch(getTeacherAttendanceAccess());
    dispatch(getMyOcAssignments());
  }, [dispatch]);

  useEffect(() => {
    if (teacherAttendanceAccess.hasAccess) {
      setScope({
        department:
          teacherAttendanceAccess.scopedDepartment ||
          teacherAttendanceAccess.assignments?.[0]?.department?._id ||
          "",
        semester:
          teacherAttendanceAccess.scopedSemester ||
          teacherAttendanceAccess.assignments?.[0]?.semester ||
          "",
      });
      return;
    }

    if (teacherOcAssignments.length) {
      const first = teacherOcAssignments[0];
      setScope({
        department: first.department?._id || "",
        semester: first.semester || "",
      });
    }
  }, [teacherAttendanceAccess, teacherOcAssignments]);

  useEffect(() => {
    if (!scope.department || !scope.semester) return;

    dispatch(
      getAttendanceStudents({
        department: scope.department,
        semester: scope.semester,
      }),
    );

    dispatch(
      getAttendanceDayRecords({
        department: scope.department,
        semester: scope.semester,
        date: currentDate,
      }),
    );
  }, [dispatch, scope.department, scope.semester, currentDate]);

  useEffect(() => {
    const map = {};

    dayRecords.forEach((record) => {
      const studentId = record.student?._id || record.student;
      map[studentId] = record.status;
    });

    setAttendanceMap(map);
  }, [dayRecords]);

  const records = useMemo(() => {
    return Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId,
      status,
    }));
  }, [attendanceMap]);

  const studentById = useMemo(() => {
    const map = new Map();
    (students || []).forEach((student) => map.set(student._id, student));
    return map;
  }, [students]);

  const dailyAttendanceRows = useMemo(() => {
    return (students || []).map((student) => {
      const record = historyDailyRecords.find((r) => {
        const recordStudentId = r.student?._id || r.student;
        return recordStudentId?.toString?.() === student._id.toString();
      });

      return {
        student,
        status: record?.status || "-",
      };
    });
  }, [students, historyDailyRecords]);

  const updateStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = () => {
    if (!records.length) return;

    dispatch(markBulkAttendance({ records, date: currentDate })).then(() => {
      dispatch(
        getAttendanceDayRecords({
          department: scope.department,
          semester: scope.semester,
          date: currentDate,
        }),
      );
    });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!scope.department || !scope.semester || !historyDate) return;

      setLoadingHistory(true);

      try {
        const res = await axiosInstance.get("/attendance/day-records", {
          params: {
            department: scope.department,
            semester: scope.semester,
            date: historyDate,
          },
        });

        setHistoryDailyRecords(res.data?.data?.records || []);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [scope.department, scope.semester, historyDate]);

  useEffect(() => {
    const fetchMonthly = async () => {
      if (!scope.department || !scope.semester || !students.length) return;

      setLoadingMonthly(true);

      try {
        const [yearStr, monthStr] = historyMonth.split("-");
        const year = Number(yearStr);
        const monthIndex = Number(monthStr) - 1;

        const totalDays = new Date(year, monthIndex + 1, 0).getDate();

        const requests = Array.from({ length: totalDays }, (_, i) => {
          const day = String(i + 1).padStart(2, "0");
          const date = `${historyMonth}-${day}`;

          return axiosInstance.get("/attendance/day-records", {
            params: {
              department: scope.department,
              semester: scope.semester,
              date,
            },
          });
        });

        const responses = await Promise.all(requests);

        const statsMap = {};

        responses.forEach((response) => {
          const list = response.data?.data?.records || [];

          list.forEach((item) => {
            const studentId = item.student?._id || item.student;

            if (!statsMap[studentId]) {
              statsMap[studentId] = {
                total: 0,
                present: 0,
              };
            }

            statsMap[studentId].total += 1;

            if (item.status === "Present") statsMap[studentId].present += 1;
            if (item.status === "Half Day") statsMap[studentId].present += 0.5;
          });
        });

        const rows = students.map((student) => {
          const stat = statsMap[student._id] || {
            total: 0,
            present: 0,
          };

          const percentage = stat.total
            ? Math.round((stat.present / stat.total) * 100)
            : 0;

          return {
            student,
            ...stat,
            percentage,
          };
        });

        setMonthlyRows(rows);
      } finally {
        setLoadingMonthly(false);
      }
    };

    fetchMonthly();
  }, [scope.department, scope.semester, historyMonth, students]);

  const openStudentHistory = async (student) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
    setLoadingStudentHistory(true);

    try {
      const res = await axiosInstance.get(
        `/attendance/student-history/${student._id}`,
      );

      setStudentHistory(res.data?.data?.history || []);
    } catch (error) {
      setStudentHistory([]);
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Attendance Daily Report", 14, 12);

    autoTable(doc, {
      startY: 20,
      head: [["Name", "Roll No", "Status"]],
      body: dailyAttendanceRows.map((row) => [
        row.student?.name || "-",
        row.student?.roll_no || "-",
        row.status,
      ]),
    });

    doc.save(`attendance-${historyDate}.pdf`);
  };

  const downloadExcel = () => {
    const rows = dailyAttendanceRows.map((row) => ({
      Name: row.student?.name || "-",
      Roll_No: row.student?.roll_no || "-",
      Status: row.status,
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet, "Attendance");

    XLSX.writeFile(book, `attendance-${historyDate}.xlsx`);
  };

  if (loadingTeacherAccess) {
    return <div>Checking permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h1 className="text-xl font-bold">Attendance Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage attendance for {scope.semester || "-"} semester
        </p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Roll</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-t">
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.roll_no}</td>

                <td className="p-3">
                  <div className="flex gap-1">
                    {ATTENDANCE_STATUS_OPTIONS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() =>
                          updateStatus(student._id, item.value)
                        }
                        className={`px-2 py-1 rounded text-xs border ${
                          attendanceMap[student._id] === item.value
                            ? "bg-indigo-600 text-white"
                            : "bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Submit Today Attendance
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Previous Daily Attendance</h2>

        <div className="flex gap-3 flex-wrap">
          <input
            type="date"
            value={historyDate}
            max={currentDate}
            onChange={(e) => setHistoryDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <button
            onClick={downloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>

          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download Excel
          </button>
        </div>

        {loadingHistory ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Roll</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">History</th>
              </tr>
            </thead>

            <tbody>
              {dailyAttendanceRows.map((row) => (
                <tr key={row.student._id} className="border-t">
                  <td className="p-3">{row.student.name}</td>
                  <td className="p-3">{row.student.roll_no || "-"}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        openStudentHistory(studentById.get(row.student._id) || row.student)
                      }
                      className="text-indigo-600 font-medium"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Monthly Attendance Summary</h2>

        <input
          type="month"
          value={historyMonth}
          onChange={(e) => setHistoryMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        {loadingMonthly ? (
          <p>Loading monthly summary...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Present</th>
                <th className="p-3 text-left">Marked</th>
                <th className="p-3 text-left">%</th>
              </tr>
            </thead>

            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.student._id} className="border-t">
                  <td className="p-3">{row.student.name}</td>
                  <td className="p-3">{row.present}</td>
                  <td className="p-3">{row.total}</td>
                  <td className="p-3">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {selectedStudent?.name} Attendance History
              </h3>

              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>

            {loadingStudentHistory ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {studentHistory.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    {formatAttendanceDate(item.date)} - {item.status}
                  </div>
                ))}

                {!studentHistory.length && (
                  <p className="text-sm text-slate-500">
                    No history found
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;