import { useState } from "react";
import { useDispatch } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";
import { X } from "lucide-react";

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    expertise: "",
    maxStudents: 1,
  });

  const handleCreateTeacher = e => {
    e.preventDefault();
    dispatch(createTeacher(teacherData));
    setTeacherData({
      name: "",
      email: "",
      department: "",
      password: "",
      expertise: "",
      maxStudents: 1,
    });
    dispatch(toggleTeacherModel());
  };

  return (
    <>
      <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg border">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Add Teacher</h3>

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
                  })
                }
                className="border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              >
                {/* explain this one Department  Select  all  */}

                <option value="" disabled>
                  Select Department
                </option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Data Science">Data Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            {/* Expertise */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Expertise</label>

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
                {/* explain this one   Select Expertise  all  */}
                <option value="" disabled>
                  Select Expertise
                </option>
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
              <label className="text-sm text-gray-600 mb-1">Max Students</label>
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
                onClick={() => dispatch(toggleTeacherModel())}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
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
