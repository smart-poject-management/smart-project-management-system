import { useState } from "react";
import { useDispatch } from "react-redux";
import { FileText, MessageCircle, Upload, Send, Paperclip } from "lucide-react";
import { submitDeadlineExtensionRequest } from "../../store/slices/studentSlice";

const DeadlineExtensionRequest = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return window.alert("Please enter a request title.");
    }

    if (!message.trim()) {
      return window.alert("Please enter your request message.");
    }

    if (!proofFile) {
      return window.alert("Please upload a proof file.");
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("message", message.trim());
    formData.append("proof", proofFile);

    setLoading(true);
    try {
      await dispatch(submitDeadlineExtensionRequest(formData)).unwrap();
      setTitle("");
      setMessage("");
      setProofFile(null);
      document.getElementById("proof-file-input").value = "";
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 border border-slate-200 rounded-xl shadow-xl">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-6">
            <div>
              <h2 className="page-header">Request Deadline Extension</h2>
              <p className="text-gray-500 mt-1">
                Send an extension request to admin with title, message, and proof.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Supported file types: PDF, DOCX, PPTX, ZIP, JPG, PNG.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Request Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter a short title for your extension request"
                className="w-full border border-gray-300 rounded-md px-4 h-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                Request Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={1000}
                placeholder="Explain why you need the deadline extended and attach proof."
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                Maximum 1000 characters. Be clear and concise.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 text-gray-500" />
                Proof File
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="proof-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {proofFile && (
                  <span className="text-sm text-slate-600 truncate max-w-xs">
                    <Paperclip className="inline-block mr-2" />
                    {proofFile.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Send className="w-4 h-4" />
                {loading ? "Submitting..." : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeadlineExtensionRequest;
