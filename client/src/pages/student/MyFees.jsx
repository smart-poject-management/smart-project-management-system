import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyFees, payFees } from "../../store/slices/studentSlice";

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

  const semesterOptions = [...new Set((fees || []).map((fee) => Number(fee.semester)))].sort(
    (a, b) => a - b,
  );

  const filteredFees = (fees || []).filter((fee) => {
    const matchesStatus = statusFilter === "All" || fee.status === statusFilter;
    const matchesSemester =
      semesterFilter === "All" || Number(fee.semester) === Number(semesterFilter);
    return matchesStatus && matchesSemester;
  });

  return (
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Semester</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Paid</th>
              <th className="px-6 py-3">Pending</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment Dates</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredFees.map((fee) => (
              <tr key={fee.semester}>
                <td className="px-6 py-4">{fee.semester}</td>
                <td className="px-6 py-4">Rs. {fee.totalAmount}</td>
                <td className="px-6 py-4">Rs. {fee.paidAmount}</td>
                <td className="px-6 py-4">Rs. {fee.pendingAmount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(fee.status)}`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {fee.payments?.length ? (
                    <div className="space-y-1">
                      {fee.payments.map((payment, index) => (
                        <div key={`${payment.date}-${index}`} className="text-xs text-slate-600">
                          {formatDate(payment.date)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No payments</span>
                  )}
                </td>
                <td className="px-6 py-4">
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
                      className="border border-slate-300 rounded-lg px-3 py-2 w-32"
                    />
                    <button
                      onClick={() => handlePay(fee.semester)}
                      disabled={fee.pendingAmount <= 0}
                      className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Pay
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredFees.length && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No fee records found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyFees;
