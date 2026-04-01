import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  FileArchive,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  downloadTeacherFile,
  getTeacherFiles,
} from "../../store/slices/teacherSlice";
import { toast } from "react-toastify";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const filesFromStore = useSelector(state => state.teacher.files || []);

  useEffect(() => {
    dispatch(getTeacherFiles());
  }, [dispatch]);

  const driveTypeFormatName = name => {
    if (!name) return "other";

    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
  };

  const normalize = file => {
    const type = driveTypeFormatName(file.originalName) || file.type || "other";

    let category = "other";
    if (["pdf", "doc", "docx", "txt"].includes(type)) {
      category = "report";
    } else if (["ppt", "pptx"].includes(type)) {
      category = "presentation";
    } else if (
      ["zip", "rar", "7z", "js", "ts", "html", "css", "json"].includes(type)
    ) {
      category = "code";
    } else if (["jpeg", "jpg", "png", "avif", "gif"].includes(type)) {
      category = "image";
    }

    return {
      id: file._id,
      name: file.originalName,
      type: type.toUpperCase(),
      size: file.size || "-",
      student: file.studentName || "-",
      uploadDate: file.uploadedAt || file.createdAt || new Date().toISOString(),
      category,
      projectId: file.projectId || file.project?._id,
      fileId: file._id,
    };
  };

  const files = useMemo(
    () => (filesFromStore || []).map(normalize),
    [filesFromStore]
  );

  const getFileIcon = type => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;

      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;

      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;

      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;

      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesType =
      filterType === "all" ? true : file.category === filterType;

    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch && matchesType;
  });

  const handleDownloadFile = async file => {
    if (!file?.fileId || !file?.projectId) {
      toast.error("Invalid file or project");
      return;
    }
    await dispatch(
      downloadTeacherFile({
        projectId: file.projectId,
        fileId: file.fileId,
        fileName: file.name,
      })
    );
  };

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter(f => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter(f => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter(f => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
    {
      label: "Images",
      count: files.filter(f => f.category === "image").length,
      bg: "bg-pink-50",
      text: "text-pink-600",
      value: "text-pink-700",
    },
  ];

  const tableHeadData = [
    "File Name",
    "Student",
    "Type",
    "Upload Date",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-header">
              Student Files
            </h1>
            <p className="text-gray-500 mt-1">
              Manage files shared with and received from students
            </p>
          </div>
        </div>

        {/* Controllers */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              className="w-56 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">All Files</option>
              <option value="report">Reports</option>
              <option value="presentation">Presentation</option>
              <option value="code">Code</option>
              <option value="image">Images</option>
            </select>

            <input
              type="text"
              className="w-96 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <button
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Files stats */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          {fileStats.map((item, index) => {
            return (
              <div key={index} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.text}`}>{item.label}</p>
                <p className={`text-2xl font-bold ${item.value}`}>
                  {item.count}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Files Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">{getFileIcon(file.type)}</div>
                <h3
                  className="font-medium text-slate-800 mb-1 truncate w-full"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <p className="text-sm text-slate-600 mb-1">{file.student}</p>
                <p className="text-xs text-slate-500 mb-1">{file.size}</p>
                <p className="text-xs text-slate-600 mb-4">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </p>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="w-full rounded-lg text-white bg-blue-500 text-lg font-medium flex items-center justify-center py-2 gap-3 hover:bg-blue-700 duration-300 transition-all"
                  >
                    <ArrowDownToLine size={20} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <table className="min-w-full border border-slate-200 font-semibold">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {tableHeadData.map(table => {
                  return (
                    <th
                      key={table}
                      className="py-3 px-4 text-left font-semibold"
                    >
                      {table}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {filteredFiles.map(file => {
                return (
                  <tr
                    key={file.id}
                    className="border-t hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 items-center gap-3">
                      {getFileIcon(file.type)}{" "}
                      <span className="font-medium">{file.name}</span>
                    </td>
                    <td className="py-3 px-4">{file.student}</td>
                    <td className="py-3 px-4">{file.type}</td>
                    <td className="py-3 px-4">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-sm"
                        onClick={() => handleDownloadFile(file)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherFiles;
