import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getFeesStatus } from "../../store/slices/adminSlice";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

const FeesStatus = () => {
  const dispatch = useDispatch();
  const { feeStatus } = useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getFeesStatus());
  }, [dispatch]);

  const rows = useMemo(
    () =>
      (feeStatus || []).flatMap((student) =>
        (student.fees || []).map((fee) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          rollNo: student.rollNo || "-",
          department: student.department || "-",
          semester: fee.semester,
          totalAmount: fee.totalAmount,
          paidAmount: fee.paidAmount,
          pendingAmount: fee.pendingAmount,
          status: fee.status,
          payments: fee.payments || [],
          lastPaymentDate: fee.payments?.length
            ? fee.payments[fee.payments.length - 1]?.date
            : null,
        })),
      ),
    [feeStatus],
  );

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
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          row.studentName?.toLowerCase().includes(normalizedSearch) ||
          row.rollNo?.toLowerCase().includes(normalizedSearch);
        return matchesStatus && matchesSemester && matchesSearch;
      }),
    [rows, searchTerm, statusFilter, semesterFilter],
  );

  const tableColumns = [
    {
      key: "studentName",
      label: "Student Name",
      render: (row) => (
        <Link
          to={`/admin/student-fees/${row.studentId}`}
          className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          {row.studentName}
        </Link>
      ),
    },
    { key: "department", label: "Department" },
    { key: "semester", label: "Semester" },
    {
      key: "totalAmount",
      label: "Total Fees",
      render: (row) => `Rs. ${row.totalAmount}`,
    },
    {
      key: "paidAmount",
      label: "Paid Amount",
      render: (row) => `Rs. ${row.paidAmount}`,
    },
    {
      key: "pendingAmount",
      label: "Pending Amount",
      render: (row) => `Rs. ${row.pendingAmount}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastPaymentDate",
      label: "Last Payment Date",
      render: (row) => formatDate(row.lastPaymentDate),
    },
  ];

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
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or roll number"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[260px]"
          />
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

      <DataTable
        columns={tableColumns}
        rows={filteredRows.map((row, index) => ({
          ...row,
          key: `${row.studentId}-${row.semester}-${index}`,
        }))}
        emptyMessage="No fee records available for selected filters."
      />
    </div>
  );
};

export default FeesStatus;
