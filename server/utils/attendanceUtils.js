export const calculateAttendancePercentage = (presentCount, totalCount) => {
  if (!totalCount) return 0;
  return Number(((presentCount / totalCount) * 100).toFixed(2));
};
