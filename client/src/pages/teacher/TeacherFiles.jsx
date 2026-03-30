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

  const handleDownloadFile = async (projectId, fileId, fileName) => {
    await dispatch(downloadTeacherFile({ projectId, fileId, fileName }));
    toast.success(`"${fileName}" downloaded successfully.`);
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
    <></>
  );
};

export default TeacherFiles;
