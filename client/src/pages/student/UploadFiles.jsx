
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { downloadFile, fetchProject, uploadFiles } from "../../store/slices/studentSlice";
import { Archive, File, FileCode, FilePlus, FileText, Loader } from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files, loading } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch]);

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.warn(" Select the  file.");
      return;
    }
    dispatch(uploadFiles({ projectId: project?._id, files: selectedFiles }))
      .then((res) => {
        if (uploadFiles.fulfilled.match(res)) {
          toast.success("Files upload successfully.");
        } else {
          toast.error("Upload failed.");
        }
      });
    setSelectedFiles([]);
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
    toast.info(`"${name}" remove ho gaya`);
  };

  const getFileIcon = (fileName) => {
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

  const handleDownloadFile = async (file) => {
    if (downloadingId) return;
    setDownloadingId(file._id);
    try {
      const res = await dispatch(
        downloadFile({
          projectId: project._id,
          fileId: file._id,
          fileName: file.originalName || "download",
        })
      );

      if (downloadFile.fulfilled.match(res)) {
        toast.success(`"${file.originalName}" download successfully!`);
      } else {
        toast.error("Download failed.");
      }
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Upload Section ── */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload Project Files</h1>
          <p className="card-subtitle">
            Upload your project documents including reports, presentations, and
            code files.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Report */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div className="mb-4">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Report</h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your project report (PDF, DOC)
            </p>
            <label className="btn-outline cursor-pointer">
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
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div className="mb-4">
              <Archive className="w-12 h-12 text-slate-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Presentation
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your presentation (PPT, PPTX, PDF)
            </p>
            <label className="btn-outline cursor-pointer">
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
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div className="mb-4">
              <FileCode className="w-12 h-12 text-slate-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Code Files
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Upload your source code (ZIP, RAR, TAR)
            </p>
            <label className="btn-outline cursor-pointer">
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

        {/* Upload Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Uploading..." : "Upload Selected Files"}
          </button>
        </div>
      </div>

      {/* ── Selected Files Preview ── */}
      {selectedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ready to upload</h2>
          </div>
          <div className="space-y-3">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-600">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  className="btn-danger btn-small"
                  onClick={() => removeSelected(file.name)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Uploaded Files List ── */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Uploaded Files</h2>
          <p className="card-subtitle">Manage your Uploaded Project Files</p>
        </div>

        {(files || []).length === 0 ? (
          <div className="text-center py-4">
            <FilePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No Files Uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id || file.fileUrl}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.originalName)}
                  <div>
                    <p className="text-slate-800">{file.originalName}</p>
                    <p className="text-sm text-slate-600">
                      {file.fileType || "File"}
                    </p>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  className="btn-outline btn-small inline-flex items-center gap-1.5"
                  onClick={() => handleDownloadFile(file)}
                  disabled={downloadingId === file._id}
                >
                  {downloadingId === file._id ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    "Download"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UploadFiles;