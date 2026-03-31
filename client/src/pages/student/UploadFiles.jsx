import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  deleteProjectFile,
  downloadFile,
  fetchProject,
  uploadFiles,
} from "../../store/slices/studentSlice";
import {
  Archive,
  AlertTriangle,
  File,
  FileCode,
  FilePlus,
  FileText,
  Loader,
  Upload,
  Download,
  Trash2,
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files, loading } = useSelector(state => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmFile, setConfirmFile] = useState(null); //popup state delete confirmation
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch , project]);

  const handleFilePick = e => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...list]);
    e.target.value = "";
  };

 const handleUpload = () => {
  if (!project?._id) {
    toast.error("Project not loaded yet");
    return;
  }

  if (selectedFiles.length === 0) {
    toast.warn("Select the file.");
    return;
  }

  dispatch(uploadFiles({ projectId: project._id, files: selectedFiles }));
  setSelectedFiles([]);
};


  const removeSelected = name => {
    setSelectedFiles(prev => prev.filter(f => f.name !== name));
    toast.warn(`"${name}" deleted from upload queue.`);
  };

  const getFileIcon = fileName => {
    const extension = fileName?.split(".").pop().toLowerCase();
    const color =
      extension === "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
          ? "text-blue-500"
          : ["ppt", "pptx"].includes(extension)
            ? "text-orange-500"
            : "text-slate-500";
    return <File className={`w-8 h-8 ${color}`} />;
  };

  const handleDownloadFile = async file => {
    if (downloadingId) return;
    setDownloadingId(file._id);
    await dispatch(
      downloadFile({
        projectId: project._id,
        fileId: file._id,
        fileName: file.originalName || "download",
      })
    );
    setDownloadingId(null);
  };

  const handleDeleteFile = file => {
    setConfirmFile(file);
  };
  // delete file confirmation
  const confirmDelete = async () => {
    const file = confirmFile;
    setConfirmFile(null);
    if (!project?._id || !file?._id) return;
    setDeletingId(file._id);
    await dispatch(
      deleteProjectFile({ projectId: project._id, fileId: file._id })
    );
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 p-4">
      {/* delete file confirmation */}
      {confirmFile && (
        <div
          className="fixed inset-0 -top-10 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmFile(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-base leading-tight">
                  Are you sure you want to delete this file?
                </h4>
                <h5 className="text-xs text-slate-500 mt-0.5">
                  Once deleted, this file cannot be recovered.
                </h5>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 font-medium truncate">
                {confirmFile.originalName}
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmFile(null)}
                className="px-5 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-sm rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Upload Section  */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Upload Project Files
            </h2>
            <p className="text-sm text-slate-500">
              Upload your project documents including reports, presentations,
              and code files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Report */}
          <div className="border-2 border-dashed border-blue-500 rounded-lg p-6 text-center ">
            <div className="mb-4">
              <FileText className="w-12 h-12 text-blue-700 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Report</h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your project report (PDF, DOC)
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2 border-2 border-blue-700 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition ">
              <Upload size={18} />
              Choose File
              <input
                type="file"
                ref={reportRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFilePick}
                multiple
              />
            </label>
          </div>

          {/* Presentation */}
          <div className="border-2 border-dashed border-orange-500 rounded-lg p-6 text-center ">
            <div className="mb-4">
              <Archive className="w-12 h-12 text-orange-500 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Presentation
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your presentation (PPT, PPTX, PDF)
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2 border-2 border-orange-500 text-orange-500 rounded-lg cursor-pointer hover:bg-orange-100 transition">
              <Upload size={18} />
              Choose File
              <input
                type="file"
                ref={presRef}
                className="hidden"
                accept=".ppt,.pptx,.pdf"
                onChange={handleFilePick}
                multiple
              />
            </label>
          </div>

          {/* Code Files */}
          <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center ">
            <div className="mb-4">
              <FileCode className="w-12 h-12 text-gray-500 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Code Files
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your source code (ZIP, RAR, TAR)
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2 border-2 border-gray-500 text-gray-500 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <Upload size={18} />
              Choose File
              <input
                type="file"
                ref={codeRef}
                className="hidden"
                accept=".zip,.rar,.tar,.gz"
                onChange={handleFilePick}
                multiple
              />
            </label>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Ready to Upload
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedFiles.length} file(s) selected
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {selectedFiles.map(file => (
                <div
                  key={file.name}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="truncate">
                      <p className="font-medium text-slate-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={loading || !project?._id}

                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 border border-blue-200 rounded-lg bg-white/50 hover:bg-blue-200 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
                    </button>
                    <button
                      onClick={() => removeSelected(file.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg bg-white/50 hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files List */}
        <div className="mt-6 border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Uploaded Files
            </h2>
            <p className="text-sm text-slate-500">
              Manage your uploaded project files
            </p>
          </div>

          {(files || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FilePlus className="w-14 h-14 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm">No files uploaded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {files.map(file => (
                <div
                  key={file._id || file.fileUrl}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {getFileIcon(file.originalName)}
                    <div className="truncate">
                      <p className="text-slate-800 font-medium truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {file.fileType || "File"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={
                        downloadingId === file._id || deletingId === file._id
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg bg-white/50 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {downloadingId === file._id ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file)}
                      disabled={
                        deletingId === file._id || downloadingId === file._id
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg bg-white/50 hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {deletingId === file._id ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
