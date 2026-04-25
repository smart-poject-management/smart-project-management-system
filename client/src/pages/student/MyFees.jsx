import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyFees, payFees } from "../../store/slices/studentSlice";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

const MyFees = () => {
  const dispatch = useDispatch();
  const { fees } = useSelector((state) => state.student);
  const [amountBySemester, setAmountBySemester] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");

  useEffect(() => {
    dispatch(getMyFees());
  }, [dispatch]);

  const handlePay = async (semester) => {
    const amount = Number(amountBySemester[semester] || 0);
    if (!amount || amount <= 0) return;

    const result = await dispatch(payFees({ semester, amount }));
    if (payFees.fulfilled.match(result)) {
      setAmountBySemester((prev) => ({ ...prev, [semester]: "" }));
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const semesterOptions = [...new Set((fees || []).map((fee) => Number(fee.semester)))].sort(
    (a, b) => a - b,
  );

  const filteredFees = (fees || []).filter((fee) => {
    const matchesStatus = statusFilter === "All" || fee.status === statusFilter;
    const matchesSemester =
      semesterFilter === "All" || Number(fee.semester) === Number(semesterFilter);
    return matchesStatus && matchesSemester;
  });

  const totalFees = filteredFees.reduce((sum, fee) => sum + Number(fee.totalAmount || 0), 0);
  const totalPaid = filteredFees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);
  const totalPending = filteredFees.reduce((sum, fee) => sum + Number(fee.pendingAmount || 0), 0);

  const tableColumns = [
    { key: "semester", label: "Semester" },
    {
      key: "totalAmount",
      label: "Total Fees",
      render: (fee) => `Rs. ${fee.totalAmount}`,
    },
    {
      key: "paidAmount",
      label: "Paid Amount",
      render: (fee) => `Rs. ${fee.paidAmount}`,
    },
    {
      key: "pendingAmount",
      label: "Pending Amount",
      render: (fee) => `Rs. ${fee.pendingAmount}`,
    },
    {
      key: "status",
      label: "Status",
      render: (fee) => <StatusBadge status={fee.status} />,
    },
    {
      key: "history",
      label: "Payment History",
      render: (fee) =>
        fee.payments?.length ? (
          <details className="group">
            <summary className="cursor-pointer text-indigo-700 hover:text-indigo-900 text-xs font-medium">
              View {fee.payments.length} payment(s)
            </summary>
            <div className="mt-2 space-y-1">
              {fee.payments.map((payment, index) => (
                <div key={`${payment.date}-${index}`} className="text-xs text-slate-600">
                  Rs. {payment.amount} on {formatDate(payment.date)}
                </div>
              ))}
            </div>
          </details>
        ) : (
          <span className="text-xs text-slate-400">No payments</span>
        ),
    },
    {
      key: "action",
      label: "Action",
      render: (fee) => (
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={fee.pendingAmount}
            disabled={fee.pendingAmount <= 0}
            value={amountBySemester[fee.semester] || ""}
            onChange={(e) =>
              setAmountBySemester((prev) => ({
                ...prev,
                [fee.semester]: e.target.value,
              }))
            }
            placeholder="Amount"
            className="border border-slate-300 rounded-lg px-3 py-2 w-24"
          />
          <button
            onClick={() => handlePay(fee.semester)}
            disabled={fee.pendingAmount <= 0}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Pay Fees
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Fees</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">Rs. {totalFees}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Paid Amount</p>
          <p className="text-2xl font-semibold text-green-700 mt-1">Rs. {totalPaid}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Pending Amount</p>
          <p className="text-2xl font-semibold text-red-700 mt-1">Rs. {totalPending}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-lg font-semibold text-slate-800">My Fees</h1>
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

        <DataTable
          columns={tableColumns}
          rows={filteredFees.map((fee) => ({ ...fee, key: fee.semester }))}
          emptyMessage="No fee records found for selected filters."
        />
      </div>
    </div>
  );
};

export default MyFees;
