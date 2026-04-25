import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFeesStatus } from "../../store/slices/adminSlice";

const FeesStatus = () => {
  const dispatch = useDispatch();
  const { feeStatus } = useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");

  useEffect(() => {
    dispatch(getFeesStatus());
  }, [dispatch]);

  const rows = useMemo(
    () =>
      (feeStatus || []).flatMap((student) =>
        (student.fees || []).map((fee) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          semester: fee.semester,
          totalAmount: fee.totalAmount,
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          status: fee.status,
          payments: fee.payments || [],
        })),
      ),
    [feeStatus],
  );

  const getStatusStyles = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Unpaid") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const semesterOptions = useMemo(
    () =>
      [...new Set(rows.map((row) => Number(row.semester)))].sort((a, b) => a - b),
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = statusFilter === "All" || row.status === statusFilter;
        const matchesSemester =
          semesterFilter === "All" || Number(row.semester) === Number(semesterFilter);
        return matchesStatus && matchesSemester;
      }),
    [rows, statusFilter, semesterFilter],
  );

  const exportCsv = () => {
    if (!filteredRows.length) return;

    const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const headers = [
      "Student Name",
      "Semester",
      "Total",
      "Paid",
      "Pending",
      "Status",
      "Payment History",
    ];

    const lines = filteredRows.map((row) => {
      const history = row.payments.length
        ? row.payments
            .map((payment) => `Rs. ${payment.amount} on ${formatDate(payment.date)}`)
            .join(" | ")
        : "No payments";

      return [
        row.studentName,
        row.semester,
        row.totalAmount,
        row.paidAmount,
        row.pendingAmount,
        row.status,
        history,
      ]
        .map(escapeCell)
        .join(",");
    });

    const csv = [headers.map(escapeCell).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fees-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">Fees Status</h1>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={!filteredRows.length}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => dispatch(getFeesStatus())}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Semesters</option>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3">Semester</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Paid</th>
              <th className="px-6 py-3">Pending</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment History</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((row, index) => (
              <tr key={`${row.studentId}-${row.semester}-${index}`}>
                <td className="px-6 py-4">{row.studentName}</td>
                <td className="px-6 py-4">{row.semester}</td>
                <td className="px-6 py-4">Rs. {row.totalAmount}</td>
                <td className="px-6 py-4">Rs. {row.paidAmount}</td>
                <td className="px-6 py-4">Rs. {row.pendingAmount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {row.payments.length ? (
                    <div className="space-y-1">
                      {row.payments.map((payment, paymentIndex) => (
                        <div key={`${row.semester}-${paymentIndex}`} className="text-xs text-slate-600">
                          Rs. {payment.amount} on {formatDate(payment.date)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No payments</span>
                  )}
                </td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No fee records available for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeesStatus;
