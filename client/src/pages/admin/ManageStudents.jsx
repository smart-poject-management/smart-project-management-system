import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleStudentModel } from "../../store/slices/popupSlice";
import {
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import {
  CheckCircle,
  Plus,
  TriangleAlert,
  User,
  X,
  Search,
  AlertTriangle,
} from "lucide-react";
import AddStudent from "../../components/modal/AddStudent";

const ManageStudents = () => {
  const { users, projects } = useSelector(state => state.admin);
  const { isCreateStudentModalOpen } = useSelector(state => state.popup);
  const [showModel, setShowModel] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });
  const dispatch = useDispatch();
  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      user => user.role?.toLowerCase() === "student"
    );
    return studentUsers.map(student => {
      const studentProject = (projects || []).find(
        project =>
          project.student === student._id ||
          project.student?._id === student._id
      );

      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map(s => s.department).filter(Boolean)
    );
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModel = () => {
    setShowModel(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }
    handleCloseModel();
  };

  const handleEdit = students => {
    setEditingStudent(students);
    setFormData({
      name: students.name,
      email: students.email,
      department: students.department,
    });
    setShowModel(true);
  };

  const handleDelete = students => {
    setStudentToDelete(students);
    setShowDeleteModel(true);
  };
  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModel(false);
      setStudentToDelete(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModel(false);
    setStudentToDelete(null);
  };
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manage Students
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add, edit, and manage student accounts
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleStudentModel())}
            className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md 
      transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Students */}
          <div
            className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200
    transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center">
              <div
                className="p-4 bg-blue-100 rounded-xl 
        transition-all duration-300 group-hover:bg-blue-500"
              >
                <User className="w-6 h-6 text-blue-600 group-hover:text-white transition-all duration-300" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div
            className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200
    transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center">
              <div
                className="p-4 bg-purple-100 rounded-xl 
        transition-all duration-300 group-hover:bg-purple-500"
              >
                <CheckCircle className="w-6 h-6 text-purple-600 group-hover:text-white transition-all duration-300" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Completed Projects
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {students.filter(s => s.projectStatus === "completed").length}
                </p>
              </div>
            </div>
          </div>

          {/* Unassigned */}
          <div
            className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200
    transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center">
              <div
                className="p-4 bg-yellow-100 rounded-xl 
        transition-all duration-300 group-hover:bg-yellow-500"
              >
                <TriangleAlert className="w-6 h-6 text-yellow-600 group-hover:text-white transition-all duration-300" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Unassigned</p>
                <p className="text-2xl font-bold text-slate-800">
                  {students.filter(s => !s.supervisor).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* filter */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Search Students
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 
          bg-slate-50 focus:bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
          shadow-sm transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="w-full md:w-56">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Filter Department
              </label>

              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 
        bg-slate-50 focus:bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
        shadow-sm transition-all duration-200 text-sm"
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>

                {departments.map(dept => (
                  <option value={dept} key={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* student Table  */}

        {/* Students Table Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Students List
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredStudents && filteredStudents.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Student Info</th>
                    <th className="px-6 py-3">Department & Year</th>
                    <th className="px-6 py-3">Supervisor</th>
                    <th className="px-6 py-3">Project Title</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStudents.map(student => (
                    <tr key={student._id} className="hover:bg-slate-50">
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-slate-500">
                            {student.email}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <div>{student.department || "-"}</div>
                        <div className="text-xs text-slate-500">
                          {student.createdAt
                            ? new Date(student.createdAt).getFullYear()
                            : "-"}
                        </div>
                      </td>

                      {/* Supervisor */}
                      <td className="px-6 py-4">
                        {student.supervisor ? (
                          <span>
                            {student.supervisor?.name || "-"}
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-xs">
                            {student.projectStatus === "rejected"
                              ? "Rejected"
                              : "Not Assigned"}
                          </span>
                        )}
                      </td>

                      {/* Project */}
                      <td className="px-6 py-4">
                        {student.projectTitle || "-"}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-slate-500">
                No Student Found Matching Your Criteria
              </div>
            )}
          </div>
        </div>

        {/* EDIT STUDENT MODAL */}
        {showModel && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg border">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit Student
                </h3>

                <button
                  onClick={handleCloseModel}
                  className="p-1 rounded hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                {/* Department */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Department
                  </label>

                  <select
                    required
                    value={formData.department}
                    onChange={e =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModel}
                    className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Update Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModel && studentToDelete && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg p-6 mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Delete Student
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Are you sure you want to delete?{" "}
                  <span>
                    {studentToDelete.name}? This action can't be undone.
                  </span>
                </p>

                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    type="submit"
                    className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCreateStudentModalOpen && <AddStudent />}
      </div>
    </>
  );
};

export default ManageStudents;
