import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import { getAllUsers, updateStudent } from "../../store/slices/adminSlice";

const ManageStudents = () => {
  const { users, projects } = useSelector(state => state.admin);

  const { isCreateStudentModalOpen } = useSelector(state.popup);

  const [showModel, setShowModel] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  const students = useMemo(() => {
    const studentUsers =
      users || [].filter(user => user.role?.toLowerCase() === "student");

    return studentUsers.map(student => {
      const studentProject = (projects || []).find(
        project => project.student?._id === student._id
      );

      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.projectStatus || null,
      };
    });
  }, [users, projects]);

  useEffect(() => {
    dispatch(getAllUsers());
  });

  const departments = useMemo(() => {
    const set = new Set(students || [])
      .map(student => student.department)
      .filter(Boolean);
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent());
    }
  };

  return <></>;
};

export default ManageStudents;
