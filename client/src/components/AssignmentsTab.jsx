import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments, createAssignment } from "../store/slices/teacherSlice";

const AssignmentsTab = ({ student }) => {
  const dispatch = useDispatch();
  const { assignments = [] } = useSelector(state => state.teacher);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (student?._id) {
      dispatch(getAssignments(student._id));
    }
  }, [student, dispatch]);

  const handleCreate = () => {
    dispatch(
      createAssignment({
        title,
        description,
        studentId: student._id,
      })
    );

    setTitle("");
    setDescription("");
  };

  return (
    <div>
      {/* CREATE FORM */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Assignment title"
          className="border p-2 mr-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          className="border p-2 mr-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div>
        {assignments.map(a => (
          <div key={a._id} className="border p-3 mb-2 rounded">
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-gray-500">{a.description}</p>
            <p className="text-xs mt-1">Status: {a.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsTab;
