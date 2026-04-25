import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStudentFeesDetails } from "../../store/slices/adminSlice";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

const StudentFeesDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { studentFeeDetails, studentFeeDetailsLoading, studentFeeDetailsError } =
    useSelector((state) => state.admin);

  useEffect(() => {
    if (id) {
      dispatch(getStudentFeesDetails(id));
    }
  }, [dispatch, id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const feeRows = useMemo(
    () => studentFeeDetails?.fees || [],
    [studentFeeDetails],
  );

  const paymentRows = useMemo(() => {
    return feeRows
      .flatMap((fee) =>
        (fee.payments || []).map((payment, index) => ({
          key: `${fee.semester}-${index}`,
          date: payment.date,
          amount: Number(payment.amount || 0),
        })),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [feeRows]);

  const feeColumns = [
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
  ];

  const paymentColumns = [
    {
      key: "date",
      label: "Payment Date",
      render: (row) => formatDate(row.date),
    },
    {
      key: "amount",
      label: "Amount Paid",
      render: (row) => `Rs. ${row.amount}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Student Fee Details</h1>
        <Link
          to="/admin/fees"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          Back to Fees Dashboard
        </Link>
      </div>

      {studentFeeDetailsLoading && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-sm text-slate-600">
          Loading student fee details...
        </div>
      )}

      {!studentFeeDetailsLoading && studentFeeDetailsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
          {studentFeeDetailsError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Student Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {studentFeeDetails?.student?.name || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Roll No</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {studentFeeDetails?.student?.rollNo || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Department</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {studentFeeDetails?.student?.department || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Fees Overview</h2>
        </div>
        <DataTable columns={feeColumns} rows={feeRows} emptyMessage="No fees found for this student." />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Payment History</h2>
        </div>
        <DataTable
          columns={paymentColumns}
          rows={paymentRows}
          emptyMessage="No payments have been made yet."
        />
      </div>
    </div>
  );
};

export default StudentFeesDetail;
