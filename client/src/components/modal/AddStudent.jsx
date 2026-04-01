import { useState } from "react";
import { useDispatch } from "react-redux";
import { createStudent } from "../../store/slices/adminSlice";
import { toggleStudentModel } from "../../store/slices/popupSlice";
import { X } from "lucide-react";

const AddStudent = () => {
  const dispatch = useDispatch();
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });

  const handleCreateStudent = e => {
    e.preventDefault();
    dispatch(createStudent(studentData));
    setStudentData({ name: "", email: "", department: "", password: "" });
    dispatch(toggleStudentModel());
  };

  return (
    <>
      <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg border">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-slate-800">Add Student</h3>

            <button
              onClick={() => dispatch(toggleStudentModel())}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={studentData.name}
                onChange={e =>
                  setStudentData({ ...studentData, name: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={studentData.email}
                onChange={e =>
                  setStudentData({ ...studentData, email: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={studentData.password}
                onChange={e =>
                  setStudentData({ ...studentData, password: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Department</label>

              <select
                required
                value={studentData.department}
                onChange={e =>
                  setStudentData({
                    ...studentData,
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

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => dispatch(toggleStudentModel())}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
