import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitProjectProposal, fetchProject } from "../../store/slices/studentSlice";
import { FileText, AlignLeft, Send } from "lucide-react";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const project = useSelector((state) => state.student.project);
  const hasProject = Boolean(project);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasProject) return;
    setIsLoading(true);
    try {
      await dispatch(submitProjectProposal(formData)).unwrap();
      setFormData({ title: "", description: "" });
      navigate("/student/supervisor");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white/70 border border-slate-200 rounded-xl shadow-xl">
          <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="page-header">
                    Submit Proposal
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Stay updated with your project progress and deadlines
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Project Title
                </label>

                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={hasProject}
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your project title"
                  />
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <AlignLeft className="w-4 h-4 text-gray-500" />
                  Project Description
                </label>

                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    disabled={hasProject}
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Provide a detailed description of your project..."
                  ></textarea>
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || hasProject}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition ${isLoading || hasProject
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? "Submitting..." : hasProject ? "Proposal already submitted" : "Submit Proposal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitProposal;