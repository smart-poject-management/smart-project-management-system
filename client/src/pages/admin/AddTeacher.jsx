import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";
import {
  fetchDepartments,
  fetchExpertiseByDepartment,
  clearExpertise,
} from "../../store/slices/departmentSlice";
import { X, ChevronDown, Eye, EyeOff, Plus, Minus } from "lucide-react";

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    expertise: [],
    maxStudents: 1,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const departments = useSelector((state) => state.department.departments);
  const expertise = useSelector((state) => state.department.expertise);
  const loading = useSelector((state) => state.department.loadingDepartments);

  const selectedDept = departments.find((d) => d._id === teacherData.department);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (!teacherData.department) {
      dispatch(clearExpertise());
      return;
    }
    dispatch(fetchExpertiseByDepartment(teacherData.department));
  }, [dispatch, teacherData.department]);

  const handleExpertiseChange = (id) => {
    setTeacherData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(id)
        ? prev.expertise.filter((e) => e !== id)
        : [...prev.expertise, id],
    }));
  };

  const handleSelectDept = (deptId) => {
    setTeacherData({ ...teacherData, department: deptId, expertise: [] });
    setDeptDropdownOpen(false);
  };

  const handleMaxStudents = (delta) => {
    const next = teacherData.maxStudents + delta;
    if (next >= 1 && next <= 10) {
      setTeacherData({ ...teacherData, maxStudents: next });
    }
  };

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    if (teacherData.expertise.length === 0) {
      alert("Please select at least one expertise");
      return;
    }
    dispatch(createTeacher(teacherData));
    setTeacherData({
      name: "",
      email: "",
      department: "",
      password: "",
      expertise: [],
      maxStudents: 1,
    });
    dispatch(toggleTeacherModel());
  };

  return (
    <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">


      {deptDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDeptDropdownOpen(false)}
        />
      )}

      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-100 flex flex-col z-20">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 rounded-t-xl">
          <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight">
            Add Teacher
          </h3>
          <button
            onClick={() => dispatch(toggleTeacherModel())}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreateTeacher} className="p-5 space-y-4">

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={teacherData.name}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, name: e.target.value })
                }
                placeholder="Dr. John Doe"
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
                value={teacherData.email}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, email: e.target.value })
                }
                placeholder="teacher@uni.edu"
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
                value={teacherData.password}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, password: e.target.value })
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

          {/* Max Students */}
          <div className="grid grid-cols-2 gap-3">

            {/* Custom Department Dropdown */}
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
                    className="mini-custom-scroll absolute bottom-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-y-auto"
                   
                  >
                    {departments.map((dept) => (
                      <button
                        key={dept._id}
                        type="button"
                        onClick={() => handleSelectDept(dept._id)}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition
                          hover:bg-gray-50
                          ${teacherData.department === dept._id
                            ? "text-gray-900 font-medium bg-gray-50"
                            : "text-gray-700"
                          }`}
                      >
                        <span>{dept.department}</span>
                        {teacherData.department === dept._id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-800 block" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Max Students Stepper */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Max Students
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleMaxStudents(-1)}
                  disabled={teacherData.maxStudents <= 1}
                  className="px-3 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-sm font-medium text-gray-800 select-none">
                  {teacherData.maxStudents}
                </span>
                <button
                  type="button"
                  onClick={() => handleMaxStudents(1)}
                  disabled={teacherData.maxStudents >= 10}
                  className="px-3 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Expertise Checkboxes */}
          {teacherData.department && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Expertise
                </label>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition
                    ${teacherData.expertise.length > 0
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-600"
                    }`}
                >
                  {teacherData.expertise.length} selected
                </span>
              </div>

              <div
                className="border mini-custom-scroll border-gray-200 rounded-lg bg-gray-50 overflow-y-auto"
               
              >
                {expertise.length > 0 ? (
                  expertise.map((exp, idx) => (
                    <label
                      key={exp._id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-white transition
                        ${idx !== expertise.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={teacherData.expertise.includes(exp._id)}
                        onChange={() => handleExpertiseChange(exp._id)}
                        className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700 ">{exp.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    No expertise available for this department
                  </p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={() => dispatch(toggleTeacherModel())}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleCreateTeacher}
            disabled={!teacherData.department || teacherData.expertise.length === 0}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Teacher
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddTeacher;
