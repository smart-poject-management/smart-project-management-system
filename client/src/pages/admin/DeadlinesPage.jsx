import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.admin);

  const [viewProjects, setViewProjects] = useState(projects || []);
  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return (viewProjects || []).map(project => ({
      _id: project._id,
      title: project.title,
      studentName: project.student?.name || "N/A",
      studentEmail: project.student?.email || "N/A",
      studentDepartment: project.student?.department || "N/A",
      supervisor: project.supervisor?.name || "N/A",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().slice(0, 10)
        : "N/A",
      updatedAt: project.updatedAt
        ? new Date(project.updatedAt).toLocaleString()
        : "N/A",
      raw: project,
    }));
  }, [viewProjects]);

  const filteredProjects = projectRows.filter(row => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const hanedleSubmit = async e => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    let deadlineDate = {
      name: selectedProject?.student?.name,
      dueDate: selectedProject?.deadlineDate,
      project: selectedProject?._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineDate })
      ).unwrap();

      const updatedProject = updated?.project || updated;
      if (updatedProject?._id) {
        setViewProjects(prev =>
          prev.map(p =>
            p._id === updatedProject._id ? { ...p, ...updatedProject } : p
          )
        );
      }
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  return <></>;
};

export default DeadlinesPage;
