import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStudent } from "../../store/slices/adminSlice";
import { toggleStudentModel } from "../../store/slices/popupSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";

const AddStudent = () => {
  const dispatch = useDispatch();
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const departments = useSelector((state) => state.department.departments);
  const loading = useSelector((state) => state.department.loadingDepartments);

  const selectedDept = departments.find((d) => d._id === studentData.department);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleSelectDept = (deptId) => {
    setStudentData({ ...studentData, department: deptId });
    setDeptDropdownOpen(false);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    dispatch(createStudent(studentData));
    setStudentData({ name: "", email: "", department: "", password: "" });
    dispatch(toggleStudentModel());
  };

  return (
    <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">

      {deptDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDeptDropdownOpen(false)}
        />
      )}

      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100 flex flex-col z-20">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 rounded-t-xl">
          <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight">
            Add Student
          </h3>
          <button
            onClick={() => dispatch(toggleStudentModel())}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreateStudent} className="p-5 space-y-4">

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentData.name}
                onChange={(e) =>
                  setStudentData({ ...studentData, name: e.target.value })
                }
                placeholder="Jane Smith"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition placeholder:text-gray-300"
              />
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={studentData.email}
                onChange={(e) =>
                  setStudentData({ ...studentData, email: e.target.value })
                }
                placeholder="student@uni.edu"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={studentData.password}
                onChange={(e) =>
                  setStudentData({ ...studentData, password: e.target.value })
                }
                placeholder="Set a secure password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Department Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Department
            </label>
            <div className="relative z-20">
              <button
                type="button"
                onClick={() => !loading && setDeptDropdownOpen((o) => !o)}
                disabled={loading}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition
                  ${deptDropdownOpen
                    ? "border-gray-400 ring-2 ring-gray-200"
                    : "border-gray-200 hover:border-gray-300"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  bg-white`}
              >
                <span className={selectedDept ? "text-gray-800" : "text-gray-300"}>
                  {loading
                    ? "Loading..."
                    : selectedDept
                    ? selectedDept.department
                    : "Select department"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    deptDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {deptDropdownOpen && (
                <div
                  className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-y-auto"
                  style={{
                    maxHeight: "180px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "gray transparent",
                  }}
                >
                  {departments.map((dept) => (
                    <button
                      key={dept._id}
                      type="button"
                      onClick={() => handleSelectDept(dept._id)}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition
                        hover:bg-gray-50
                        ${studentData.department === dept._id
                          ? "text-gray-900 font-medium bg-gray-50"
                          : "text-gray-700"
                        }`}
                    >
                      <span>{dept.department}</span>
                      {studentData.department === dept._id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-800 block" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={() => dispatch(toggleStudentModel())}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleCreateStudent}
            disabled={!studentData.department}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-weight disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Student
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddStudent;