import {  useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "./AddTeacher";
import {
  deleteTeacher,
  updateTeacher,
} from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";
import {
  AlertTriangle,
  BadgeCheck,
  Plus,
  Search,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";

const ManageTeachers = () => {
  const { users } = useSelector(state => state.admin);
  const { isCreateTeacherModalOpen } = useSelector(state => state.popup);
  const [showModel, setShowModel] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    maxStudents: 1,
  });
  const dispatch = useDispatch();
  const teachers = useMemo(() => {
    return (users || [])
      .filter(user => user.role?.toLowerCase() === "teacher")
      .map(user => ({
        ...user,
        department:
          typeof user.department === "object"
            ? user.department?.department || ""
            : user.department || "",
        expertise: Array.isArray(user.expertise)
          ? user.expertise
              .map(item => (typeof item === "object" ? item?.name || "" : item))
              .filter(Boolean)
          : typeof user.expertise === "string"
          ? [user.expertise]
          : [],
      }));
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map(t => t.department).filter(Boolean)
    );
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || teacher.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModel = () => {
    setShowModel(false);
    setEditingTeacher(null);
    setTeacherData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      maxStudents: 1,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: teacherData }));
    }
    handleCloseModel();
  };

  const handleEdit = teacher => {
    setEditingTeacher(teacher);
    setTeacherData({
      name: teacher.name,
      email: teacher.email,
      department:
        typeof teacher.department === "object"
          ? teacher.department?.department || ""
          : teacher.department || "",
      expertise: Array.isArray(teacher.expertise)
        ? teacher.expertise[0] || ""
        : typeof teacher.expertise === "string"
        ? teacher.expertise
        : "",
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 1,
    });
    setShowModel(true);
  };

  const handleDelete = teacher => {
    setTeacherToDelete(teacher);
    setShowDeleteModel(true);
  };
  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModel(false);
      setTeacherToDelete(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModel(false);
    setTeacherToDelete(null);
  };
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center border border-slate-200 transition-all duration-300 hover:shadow-lg">
          <div>
            <h1 className="page-header">
              Manage Teachers
            </h1>
            <p className="text-gray-500 mt-1">
              Add, edit, and manage teacher accounts
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleTeacherModel())}
            className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md 
      transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add New Teacher</span>
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total teachers */}
          <div
            className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200
    transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center">
              <div
                className="p-4 bg-blue-100 rounded-xl 
        transition-all duration-300 group-hover:bg-blue-500"
              >
                <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-all duration-300" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Total Teachers
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {teachers.length}
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
                <BadgeCheck className="w-6 h-6 text-purple-600 group-hover:text-white transition-all duration-300" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Assigned Students
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {teachers.reduce(
                    (sum, total) => sum + (total.assignedStudents?.length || 0),
                    0
                  )}
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
                <p className="text-sm font-medium text-slate-500">
                  Departments
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {departments.length}
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
                Search Teachers
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

        {/* Teachers Tables  */}

        {/* Students Table Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Teachers List
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Teachers Info</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Expertise</th>
                    <th className="px-6 py-3">Join Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher._id} className="hover:bg-slate-50">
                      {/* taeacher Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <span className="text-xs text-slate-500">
                            {teacher.email}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <div>{teacher.department || "-"}</div>
                      </td>

                      {/* Expertise */}
                      <td className="px-6 py-4">
                        {Array.isArray(teacher.expertise)
                          ? teacher.expertise.join(", ") || "-"
                          : teacher.expertise || "-"}
                      </td>

                      {/* Teachers join date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {teacher.createdAt
                            ? new Date(teacher.createdAt).toLocaleString()
                            : "-"}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(teacher)}
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
                No Teachers Found Matching Your Criteria.
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
                  Edit Teacher
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
                    value={teacherData.name}
                    onChange={e =>
                      setTeacherData({ ...teacherData, name: e.target.value })
                    }
                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={teacherData.email}
                    onChange={e =>
                      setTeacherData({ ...teacherData, email: e.target.value })
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
                    value={teacherData.department}
                    onChange={e =>
                      setTeacherData({
                        ...teacherData,
                        department: e.target.value,
                      })
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

                {/* Expertise */}

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Expertise
                  </label>

                  <select
                    required
                    value={teacherData.expertise}
                    onChange={e =>
                      setTeacherData({
                        ...teacherData,
                        expertise: e.target.value,
                      })
                    }
                    className="border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                  >
                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Computer Networks">Computer Networks</option>
                  </select>
                </div>

                {/* max students */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    required
                    max={10} //update the value max or min
                    min={1}
                    value={teacherData.maxStudents}
                    onChange={e =>
                      setTeacherData({
                        ...teacherData,
                        maxStudents: e.target.value,
                      })
                    }
                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                  />
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
                    Update Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModel && teacherToDelete && (
          <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg p-6 mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Delete Teacher
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Are you sure you want to delete?{" "}
                  <span>
                    {teacherToDelete.name}? This action can't be undone.
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

        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default ManageTeachers;
