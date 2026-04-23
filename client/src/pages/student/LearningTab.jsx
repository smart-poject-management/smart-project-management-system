import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLearning, completeTopic } from "../../store/slices/studentSlice";

const LearningTab = () => {
  const dispatch = useDispatch();
  const { learning, progress } = useSelector(state => state.student);

  useEffect(() => {
    dispatch(getLearning());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Progress</h2>
        <div className="w-full bg-gray-200 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm mt-2">{progress}% Completed</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Learning Topics</h2>

        {learning.map(topic => (
          <div
            key={topic._id}
            className="flex justify-between items-center border-b py-3"
          >
            <div>
              <p className="font-medium">{topic.title}</p>
              <p className="text-sm text-gray-500">{topic.status}</p>
            </div>

            {topic.status !== "completed" && (
              <button
                onClick={() => dispatch(completeTopic(topic._id))}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningTab;
