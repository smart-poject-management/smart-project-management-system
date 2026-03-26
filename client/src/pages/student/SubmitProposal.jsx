import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";
import { FileText, AlignLeft, Send } from "lucide-react";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(submitProjectProposal(formData));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="bg-white/70 border border-slate-200 rounded-2xl shadow-xl">
          <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Submit Proposal
                  </h2>
                  <p className="text-sm text-slate-500">
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
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Provide a detailed description of your project..."
                  ></textarea>
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition ${isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? "Submitting..." : "Submit Proposal"}
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