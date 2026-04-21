export const buildStudentFilters = ({ department, session, semester }) => {
  const filters = { role: "Student" };

  if (department) {
    filters.department = department;
  }

  if (session) {
    filters.session = session.trim();
  }

  if (semester) {
    filters.semester = Number(semester);
  }

  return filters;
};
