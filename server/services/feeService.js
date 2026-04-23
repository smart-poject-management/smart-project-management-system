const calculatePaidAmount = (payments = []) =>
  payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

const getFeeStatus = (paidAmount, totalAmount) => {
  if (paidAmount === 0) return "Unpaid";
  if (paidAmount >= Number(totalAmount)) return "Paid";
  return "Partial";
};

export const normalizeFees = (fees = []) => {
  if (!Array.isArray(fees)) return [];

  return fees.map((item) => {
    const payments = Array.isArray(item.payments)
      ? item.payments
          .map((payment) => ({
            amount: Number(payment.amount),
            date: payment.date ? new Date(payment.date) : new Date(),
          }))
          .filter(
            (payment) =>
              Number.isFinite(payment.amount) &&
              payment.amount > 0 &&
              !Number.isNaN(payment.date.getTime()),
          )
      : [];

    // Backward compatibility: old paidAmount is converted into a single payment.
    if (!payments.length && Number(item.paidAmount) > 0) {
      payments.push({
        amount: Number(item.paidAmount),
        date: new Date(),
      });
    }

    return {
      semester: Number(item.semester),
      totalAmount: Number(item.totalAmount),
      payments,
    };
  });
};

export const validateFees = (fees = []) => {
  if (!Array.isArray(fees)) {
    return "Fees must be an array";
  }

  const seenSemesters = new Set();

  for (const fee of fees) {
    const semester = Number(fee.semester);
    const totalAmount = Number(fee.totalAmount);
    const payments = Array.isArray(fee.payments) ? fee.payments : [];
    const paidAmount = calculatePaidAmount(payments);

    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      return "Semester must be a number between 1 and 8";
    }

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return "Total amount must be a valid positive number";
    }

    if (!Array.isArray(fee.payments)) {
      return "Payments must be an array";
    }

    for (const payment of payments) {
      const paymentAmount = Number(payment.amount);
      const paymentDate = payment.date ? new Date(payment.date) : null;

      if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        return "Each payment amount must be greater than 0";
      }

      if (!paymentDate || Number.isNaN(paymentDate.getTime())) {
        return "Each payment must have a valid payment date";
      }
    }

    if (paidAmount > totalAmount) {
      return "Paid amount cannot exceed total amount";
    }

    if (seenSemesters.has(semester)) {
      return "Duplicate fee entry for same semester is not allowed";
    }

    seenSemesters.add(semester);
  }

  return null;
};

export const mapFeeWithPending = (fee) => {
  const payments = fee.payments || [];
  const paidAmount = calculatePaidAmount(payments);
  const totalAmount = Number(fee.totalAmount || 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

  return {
    semester: fee.semester,
    totalAmount,
    payments: payments.map((payment) => ({
      amount: Number(payment.amount || 0),
      date: payment.date,
    })),
    paidAmount,
    pendingAmount,
    status: getFeeStatus(paidAmount, totalAmount),
  };
};

export const mapStudentFees = (student) => ({
  studentId: student._id,
  studentName: student.name,
  fees: (student.fees || []).map(mapFeeWithPending),
});
