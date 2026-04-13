import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FileText, MessageCircle, Upload, Send, Paperclip } from "lucide-react";
import { getDeadlineExtensionRequest, submitDeadlineExtensionRequest } from "../../store/slices/studentSlice";

const DeadlineExtensionRequest = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(false);

  const [errors, setErrors] = useState({
    title: false,
    message: false,
    proof: false,
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);

    if (file) {
      setErrors((prev) => ({ ...prev, proof: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      title: !title.trim(),
      message: !message.trim(),
      proof: !proofFile,
    };

    setErrors(newErrors);

    if (newErrors.title || newErrors.message || newErrors.proof) {
      return;
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
      setExistingRequest(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await dispatch(getDeadlineExtensionRequest()).unwrap();
        setExistingRequest(Boolean(res?.data?.request));
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequest();
  }, [dispatch]);

  const canRequest = !existingRequest;

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Request Title
                {errors.title && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={title}
                disabled={!canRequest}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, title: false }));
                  }
                }}
                className={`w-full border rounded-md px-4 h-12 focus:outline-none focus:ring-2 ${errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                Request Message
                {errors.message && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={message}
                disabled={!canRequest}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, message: false }));
                  }
                }}
                rows={6}
                className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 ${errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 text-gray-500" />
                Proof File
                {errors.proof && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="proof-file-input"
                  type="file"
                  disabled={!canRequest}
                  onChange={handleFileChange}
                  className={`block w-full text-sm ${errors.proof ? "text-red-500" : "text-slate-500"
                    }`}
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
                disabled={loading || !canRequest}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-white ${loading || !canRequest
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                <Send className="w-4 h-4" />
                {existingRequest
                  ? "Already sent request"
                  : loading
                    ? "Submitting..."
                    : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeadlineExtensionRequest;
