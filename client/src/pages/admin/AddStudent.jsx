import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStudent } from "../../store/slices/adminSlice";
import { toggleStudentModel } from "../../store/slices/popupSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";

const AddStudent = () => {
  const dispatch = useDispatch();

  const defaultSession = "2022-26";

  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    roll_no: "",
    semester: 1,
    session: defaultSession,
    fees: [{ semester: 1, totalAmount: 0 }],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const departments = useSelector((state) => state.department.departments);
  const loading = useSelector((state) => state.department.loadingDepartments);

  const selectedDept = departments.find(
    (dept) => dept._id === studentData.department,
  );

  const sessionOptions = ["2022-26", "2023-27", "2024-28"];

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleSelectDept = (deptId) => {
    setStudentData({
      ...studentData,
      department: deptId,
    });
    setDeptDropdownOpen(false);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    const result = await dispatch(createStudent(studentData));

    if (createStudent.fulfilled.match(result)) {
      setStudentData({
        name: "",
        email: "",
        department: "",
        password: "",
        roll_no: "",
        semester: 1,
        session: defaultSession,
        fees: [{ semester: 1, totalAmount: 0 }],
      });

      dispatch(toggleStudentModel());
    }
  };

  const updateFeeRow = (index, key, value) => {
    const nextFees = [...studentData.fees];
    nextFees[index] = {
      ...nextFees[index],
      [key]: Number(value || 0),
    };
    setStudentData({ ...studentData, fees: nextFees });
  };

  const addFeeRow = () => {
    setStudentData({
      ...studentData,
      fees: [...studentData.fees, { semester: 1, totalAmount: 0 }],
    });
  };

  const removeFeeRow = (index) => {
    const nextFees = studentData.fees.filter((_, i) => i !== index);
    setStudentData({
      ...studentData,
      fees: nextFees.length ? nextFees : [{ semester: 1, totalAmount: 0 }],
    });
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
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 rounded-t-xl">
          <h3 className="text-[15px] font-semibold text-slate-800">
            Add Student
          </h3>

          <button
            onClick={() => dispatch(toggleStudentModel())}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <form
          id="add-student-form"
          onSubmit={handleCreateStudent}
          className="p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">
                Full Name
              </label>

              <input
                type="text"
                required
                value={studentData.name}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    name: e.target.value,
                  })
                }
                placeholder="Jane Smith"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">
                Email
              </label>

              <input
                type="email"
                required
                value={studentData.email}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    email: e.target.value,
                  })
                }
                placeholder="student@uni.edu"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={studentData.password}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    password: e.target.value,
                  })
                }
                placeholder="Set password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">
                Roll No
              </label>

              <input
                type="text"
                value={studentData.roll_no}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    roll_no: e.target.value,
                  })
                }
                placeholder="2022-CS-001"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">
                Semester
              </label>

              <input
                type="number"
                min="1"
                max="8"
                value={studentData.semester}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    semester: Number(e.target.value || 1),
                  })
                }
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">
              Session
            </label>

            <select
              value={studentData.session}
              onChange={(e) =>
                setStudentData({
                  ...studentData,
                  session: e.target.value,
                })
              }
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {sessionOptions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">
              Department
            </label>

            <div className="relative mt-1 z-20">
              <button
                type="button"
                onClick={() => !loading && setDeptDropdownOpen((o) => !o)}
                disabled={loading}
                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <span>
                  {loading
                    ? "Loading..."
                    : selectedDept
                    ? selectedDept.department
                    : "Select Department"}
                </span>

                <ChevronDown size={14} />
              </button>

              {deptDropdownOpen && (
                <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <button
                      key={dept._id}
                      type="button"
                      onClick={() => handleSelectDept(dept._id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        studentData.department === dept._id
                          ? "bg-gray-50 font-medium"
                          : ""
                      }`}
                    >
                      {dept.department}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase">
                Semester Fees
              </label>
              <button
                type="button"
                onClick={addFeeRow}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                + Add Semester
              </button>
            </div>

            <div className="space-y-2">
              {studentData.fees.map((fee, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={fee.semester}
                    onChange={(e) => updateFeeRow(index, "semester", e.target.value)}
                    placeholder="Sem"
                    className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    value={fee.totalAmount}
                    onChange={(e) => updateFeeRow(index, "totalAmount", e.target.value)}
                    placeholder="Total"
                    className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeeRow(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => dispatch(toggleStudentModel())}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-student-form"
            disabled={!studentData.department}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
          >
            Add Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;