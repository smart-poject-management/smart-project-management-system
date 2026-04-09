import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";
import { fetchDepartments, fetchExpertiseByDepartment, clearExpertise } from "../../store/slices/departmentSlice";
import { X } from "lucide-react";

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

  const departments = useSelector(state => state.department.departments);
  const expertise = useSelector(state => state.department.expertise);
  const loading = useSelector(state => state.department.loadingDepartments);

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
    setTeacherData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(id)
        ? prev.expertise.filter(e => e !== id)
        : [...prev.expertise, id]
    }));
  };

  const handleCreateTeacher = e => {
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
    <>
      <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg border max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-slate-800">Add Teacher</h3>

            <button
              onClick={() => dispatch(toggleTeacherModel())}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Full Name</label>
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

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={teacherData.password}
                onChange={e =>
                  setTeacherData({ ...teacherData, password: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Department</label>
              <select
                required
                value={teacherData.department}
                onChange={e =>
                  setTeacherData({
                    ...teacherData,
                    department: e.target.value,
                    expertise: [],
                  })
                }
                disabled={loading}
                className="border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {loading ? "Loading departments..." : "Select Department"}
                </option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Expertise - Checkboxes */}
            {teacherData.department && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Expertise (Select at least one)</label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {expertise.length > 0 ? (
                    expertise.map(exp => (
                      <label
                        key={exp._id}
                        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={teacherData.expertise.includes(exp._id)}
                          onChange={() => handleExpertiseChange(exp._id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{exp.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      No expertise available for this department
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* max students */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Students</label>
              <input
                type="number"
                required
                max={10}
                min={1}
                value={teacherData.maxStudents}
                onChange={e =>
                  setTeacherData({
                    ...teacherData,
                    maxStudents: parseInt(e.target.value),
                  })
                }
                className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => dispatch(toggleTeacherModel())}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                disabled={!teacherData.department || expertise.length === 0}
              >
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
