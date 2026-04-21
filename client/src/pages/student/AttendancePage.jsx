import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyAttendance } from "../../store/slices/attendanceSlice";

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { history, summary, loadingMyAttendance } = useSelector(
    (state) => state.attendance,
  );

  useEffect(() => {
    dispatch(getMyAttendance());
  }, [dispatch]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-700";
      case "Half Day":
        return "bg-amber-100 text-amber-700";
      case "Leave":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="page-header">My Attendance</h1>
        <p className="text-slate-500 mt-1">Track your attendance percentage and history</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
          <p className="text-xs text-emerald-700 uppercase">Present</p>
          <p className="text-2xl font-bold text-emerald-800">{summary.present || 0}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <p className="text-xs text-slate-600 uppercase">Total Classes</p>
          <p className="text-2xl font-bold text-slate-800">{summary.total || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <p className="text-xs text-blue-700 uppercase">Attendance %</p>
          <p className="text-2xl font-bold text-blue-800">{summary.percentage || 0}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(history || []).map((record) => (
                <tr key={record._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {new Date(record.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                        record.status,
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{record.markedBy?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingMyAttendance && !history.length && (
            <div className="text-center py-8 text-slate-500">No attendance records yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
