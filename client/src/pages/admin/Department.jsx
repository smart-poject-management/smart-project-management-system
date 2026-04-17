import { Plus, Search, X, Trash2, AlertTriangle, Eye, ChevronDown, BadgeCheck, FolderKanban, Users, Briefcase, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
    createDepartment,
    createExpertise,
    fetchDepartments,
    fetchExpertiseByDepartment,
    deleteDepartment,
    deleteExpertise,
} from '../../store/slices/departmentSlice'
import {
    getAllProjects,
    getDashboardStats,
} from "../../store/slices/adminSlice";

function Department() {
    const dispatch = useDispatch()
    const { stats, } = useSelector(state => state.admin);
    const [searchText, setSearchText] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterOpen, setFilterOpen] = useState(false);
    const { departments, loadingDepartments } = useSelector(state => state.department)
    const [expertiseMap, setExpertiseMap] = useState({})
    const [loadingExpertise, setLoadingExpertise] = useState({})
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [activeType, setActiveType] = useState('department')
    const [viewModal, setViewModal] = useState({ show: false, dept: null })

    const [deleteModal, setDeleteModal] = useState({
        show: false, type: null, id: null, name: '', deptId: null, confirmText: '',
    })
    const isConfirmMatch = deleteModal.confirmText === deleteModal.name
    const [formData, setFormData] = useState({
        departmentName: '', expertiseName: '', departmentId: '',
    })
    const totalExpertise = Object.values(expertiseMap)
        .reduce((acc, curr) => acc + curr.length, 0);
    const viewDept = viewModal.dept
    const viewExpertise = viewDept ? (expertiseMap[viewDept._id] || []) : []
    const viewLoading = viewDept ? (loadingExpertise[viewDept._id] || false) : false
    const handleCloseView = () => setViewModal({ show: false, dept: null })

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.department.toLowerCase().includes(searchText.toLowerCase())
        let matchesType = true
        if (filterType === 'expertise') {
            const expCount = Object.prototype.hasOwnProperty.call(expertiseMap, dept._id)
                ? expertiseMap[dept._id].length
                : (dept.expertiseCount ?? 0)
            matchesType = expCount > 0
        }
        return matchesSearch && matchesType
    })

    const filterOptions = [
        { value: "all", label: "All Department & Expertise" },
        { value: "department", label: "Department" },
        { value: "expertise", label: "Expertise" }
    ];

    useEffect(() => {
        dispatch(getDashboardStats());
        dispatch(getAllProjects());
        if (departments.length > 0) {
            departments.forEach(dept => {
                loadExpertise(dept._id);
            });
        }
    }, [dispatch, departments]);

    const projectStats = [
        {
            title: "Total Departments",
            value: (departments || []).length,
            bg: "bg-blue-100",
            iconColor: "text-blue-600",
            Icon: FolderKanban
        },
        {
            title: "Total Expertise",
            value: totalExpertise,
            bg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            Icon: BadgeCheck
        },
        {
            title: "Total Students",
            value: stats?.totalStudents ?? 0,
            bg: "bg-blue-100",
            iconColor: "text-blue-600",
            Icon: User,
        },
        {
            title: "Total Teachers",
            value: stats?.totalTeachers ?? 0,
            bg: "bg-green-100",
            iconColor: "text-green-600",
            Icon: Users,
        },
        {
            title: "Total Projects",
            value: stats?.totalProjects ?? 0,
            bg: "bg-red-100",
            iconColor: "text-red-600",
            Icon: Briefcase
        }
    ];

    useEffect(() => {
        dispatch(fetchDepartments())
    }, [dispatch])

    const loadExpertise = async (deptId) => {
        if (Object.prototype.hasOwnProperty.call(expertiseMap, deptId)) return
        setLoadingExpertise(prev => ({ ...prev, [deptId]: true }))
        try {
            const result = await dispatch(fetchExpertiseByDepartment(deptId)).unwrap()
            setExpertiseMap(prev => ({ ...prev, [deptId]: result }))
        } catch (err) {
            console.log(err)
            setExpertiseMap(prev => ({ ...prev, [deptId]: [] }))
        } finally {
            setLoadingExpertise(prev => ({ ...prev, [deptId]: false }))
        }
    }

    const handleViewClick = (e, dept) => {
        e.stopPropagation()
        setViewModal({ show: true, dept })
        loadExpertise(dept._id)
    }

    const handleClose = () => {
        setShowModal(false)
        setActiveType('department')
        setFormData({ departmentName: '', expertiseName: '', departmentId: '' })
    }

    const isDuplicateExpertise = (departmentId, expertiseName) => {
        const existing = expertiseMap[departmentId] || []
        return existing.some(
            exp => exp.name.trim().toLowerCase() === expertiseName.trim().toLowerCase()
        )
    }
    const isDuplicateDepartment = (departmentName) => {
        return departments.some(
            dept => dept.department.trim().toLowerCase() === departmentName.trim().toLowerCase()
        )
    }

    const handleSubmit = async () => {
        try {
            if (activeType === 'department') {
                if (!formData.departmentName.trim()) return toast.error('Department name is required')
                if (isDuplicateDepartment(formData.departmentName)) {
                    return toast.warning(
                        `"${formData.departmentName}" department already exists!`,
                        { icon: <AlertTriangle size={18} color="#c70000ff" /> }
                    )
                }

                await dispatch(createDepartment({ department: formData.departmentName })).unwrap()
                toast.success('Department created successfully')
            }

            if (activeType === 'expertise') {
                if (!formData.departmentId) return toast.error('Please select department')
                if (!formData.expertiseName.trim()) return toast.error('Expertise name is required')
                if (isDuplicateExpertise(formData.departmentId, formData.expertiseName)) {
                    const deptName = departments.find(d => d._id === formData.departmentId)?.department || 'this department'
                    return toast.warning(
                        `"${formData.expertiseName}" expertise already exists in ${deptName}!`,
                        { icon: <AlertTriangle size={18} color="#c70000ff" /> }
                    )
                }

                const result = await dispatch(
                    createExpertise({ departmentId: formData.departmentId, name: formData.expertiseName })
                ).unwrap()
                setExpertiseMap(prev => ({
                    ...prev,
                    [formData.departmentId]: [result, ...(prev[formData.departmentId] || [])],
                }))
                toast.success('Expertise created successfully')
            }
            handleClose()
        } catch (err) {
            console.log(err)
        }
    }

    const openDeleteDept = (e, dept) => {
        e.stopPropagation()
        setDeleteModal({ show: true, type: 'department', id: dept._id, name: dept.department, deptId: null, confirmText: '' })
    }

    const openDeleteExpertise = (e, exp, deptId) => {
        e.stopPropagation()
        setDeleteModal({ show: true, type: 'expertise', id: exp._id, name: exp.name, deptId, confirmText: '' })
    }

    const handleDeleteConfirm = async () => {
        if (deleteModal.confirmText !== deleteModal.name) {
            toast.error(`Please type "${deleteModal.name}" to confirm`)
            return
        }
        try {
            if (deleteModal.type === 'department') {
                await dispatch(deleteDepartment(deleteModal.id)).unwrap()
                setExpertiseMap(prev => {
                    const copy = { ...prev }
                    delete copy[deleteModal.id]
                    return copy
                })
                if (viewModal.dept?._id === deleteModal.id) handleCloseView()
                toast.success('Department deleted successfully')
            }
            if (deleteModal.type === 'expertise') {
                await dispatch(deleteExpertise({
                    expertiseId: deleteModal.id,
                    departmentId: deleteModal.deptId
                })).unwrap()
                setExpertiseMap(prev => ({
                    ...prev,
                    [deleteModal.deptId]: (prev[deleteModal.deptId] || []).filter(
                        e => e._id !== deleteModal.id
                    ),
                }))
                toast.success('Expertise deleted successfully')
            }
        } catch (err) {
            toast.error('Delete failed')
        } finally {
            setDeleteModal({ show: false, type: null, id: null, name: '', deptId: null, confirmText: '' })
        }
    }



    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="page-header">Manage Department & Expertise</h1>
                        <p className="text-gray-500 mt-1">Create and monitor Department & Expertise</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Department & Expertise
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {projectStats.map((item, i) => (
                    <div
                        key={i}
                        className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-xl shadow`}>
                                <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
                            </div>
                            <div className="ml-3">
                                <p className={`text-xs font-medium text-slate-600`}>{item.title}</p>
                                <p className={`text-lg font-bold text-slate-800`}>{item.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
                            Search Department & Expertise
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                placeholder="Search by Department.."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
                            Filter by Type
                        </label>
                        <div className="relative mb-5">
                            <button
                                type="button"
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="capitalize w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center gap-2"
                            >
                                <span>{filterOptions.find(f => f.value === filterType)?.label || "Select Filter"}</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`} />
                            </button>
                            {filterOpen && (
                                <div className="fixed inset-0 z-0" onClick={() => setFilterOpen(false)}></div>
                            )}
                            {filterOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-[120px] overflow-y-auto custom-scrollbar">
                                    {filterOptions
                                        .filter(item => item.value === "all" || item.value !== filterType)
                                        .map((item) => (
                                            <div
                                                key={item.value}
                                                onClick={() => { setFilterType(item.value); setFilterOpen(false); }}
                                                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                            >
                                                {item.label}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Department & Expertise</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Sr.no</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Expertise</th>
                                <th className="px-6 py-3">Total Teacher</th>
                                <th className="px-6 py-3">Total Student</th>
                                <th className="px-6 py-3">Total Project</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.map((dept, index) => {
                                const expertiseCount = Object.prototype.hasOwnProperty.call(expertiseMap, dept._id)
                                    ? expertiseMap[dept._id].length
                                    : (dept.expertiseCount ?? null)
                                return (
                                    <tr key={dept._id} className="border-t hover:bg-slate-50">
                                        <td className="px-4 py-4 text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-800 capitalize">{dept.department}</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {expertiseCount !== null ? expertiseCount : '—'} expertise
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{dept.totalTeacher ?? 0}</td>
                                        <td className="px-6 py-4">{dept.totalStudent ?? 0}</td>
                                        <td className="px-6 py-4">{dept.totalProject ?? 0}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    data-tooltip-id="view-tooltip"
                                                    data-tooltip-content="View"
                                                    onClick={(e) => handleViewClick(e, dept)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <Tooltip id="view-tooltip" place="top" offset={10} />
                                                </button>
                                                <button
                                                    data-tooltip-id="delete-tooltip"
                                                    data-tooltip-content="Delete"
                                                    onClick={e => openDeleteDept(e, dept)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <Tooltip id="delete-tooltip" place="top" offset={10} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredDepartments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        {searchText || filterType !== 'all' ? 'No matching departments found' : 'No departments found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VIEW DETAIL MODAL */}
            {viewModal.show && viewDept && (
                <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-start p-6 border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">{viewDept.department}</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Department Details</p>
                            </div>
                            <button onClick={handleCloseView} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="text-center bg-emerald-50 rounded-xl py-3 border border-emerald-100">
                                <p className="text-2xl font-bold text-emerald-700">{viewDept.totalTeacher ?? 0}</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Teachers</p>
                            </div>
                            <div className="text-center bg-sky-50 rounded-xl py-3 border border-sky-100">
                                <p className="text-2xl font-bold text-sky-700">{viewDept.totalStudent ?? 0}</p>
                                <p className="text-xs text-sky-600 mt-0.5">Students</p>
                            </div>
                            <div className="text-center bg-amber-50 rounded-xl py-3 border border-amber-100">
                                <p className="text-2xl font-bold text-amber-700">{viewDept.totalProject ?? 0}</p>
                                <p className="text-xs text-amber-600 mt-0.5">Projects</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Expertise</h3>
                                {!viewLoading && <span className="text-xs text-slate-400">{viewExpertise.length} total</span>}
                            </div>
                            {viewLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : viewExpertise.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm">No expertise added yet</p>
                                </div>
                            ) : (
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar px-6 py-4">
                                    <ul className="space-y-2">
                                        {viewExpertise.map((exp, i) => (
                                            <li key={exp._id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                                                    <span className="text-sm font-medium text-slate-700">{exp.name}</span>
                                                </div>
                                                <button
                                                    data-tooltip-id="delete-tooltip"
                                                    data-tooltip-content="Delete"
                                                    onClick={e => openDeleteExpertise(e, exp, viewDept._id)}
                                                    className="flex items-center gap-1 text-red-600 transition-all text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <Tooltip id="delete-tooltip" place="top" offset={10} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    handleCloseView()
                                    setShowModal(true)
                                    setActiveType('expertise')
                                    setFormData(prev => ({ ...prev, departmentId: viewDept._id }))
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Expertise
                            </button>
                            <button onClick={handleCloseView} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-slate-800">Add Department & Expertise</h2>
                            <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
                            <button
                                onClick={() => setActiveType('department')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeType === 'department' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Department
                            </button>
                            <button
                                onClick={() => setActiveType('expertise')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeType === 'expertise' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Expertise
                            </button>
                        </div>
                        {activeType === 'department' ? (
                            <>
                                <input
                                    type="text"
                                    value={formData.departmentName}
                                    onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
                                    placeholder="Enter Department Name"
                                />
                                {/* duplicate warning for department */}
                                {formData.departmentName.trim() && isDuplicateDepartment(formData.departmentName) && (
                                    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                            <strong>"{formData.departmentName}"</strong> department already exists.
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="relative mb-5">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(!open)}
                                        className="capitalize w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
                                    >
                                        <span>{formData.departmentId ? departments.find(d => d._id === formData.departmentId)?.department : "Select Department"}</span>
                                        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                                    </button>
                                    {open && <div className="fixed inset-0 z-0" onClick={() => setOpen(false)}></div>}
                                    {open && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-[120px] overflow-y-auto custom-scrollbar">
                                            {departments.map(d => (
                                                <div key={d._id} onClick={() => { setFormData({ ...formData, departmentId: d._id }); setOpen(false); }} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                                                    {d.department}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={formData.expertiseName}
                                    onChange={e => setFormData({ ...formData, expertiseName: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
                                    placeholder="Enter Expertise Name"
                                />
                                {/*  duplicate warning for expertise */}
                                {formData.departmentId && formData.expertiseName.trim() &&
                                    isDuplicateExpertise(formData.departmentId, formData.expertiseName) && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                <strong>"{formData.expertiseName}"</strong> expertise already exists in this department.
                                            </span>
                                        </div>
                                    )}
                            </>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    loadingDepartments ||
                                    (activeType === 'department' && formData.departmentName.trim() && isDuplicateDepartment(formData.departmentName)) ||
                                    (activeType === 'expertise' && formData.departmentId && formData.expertiseName.trim() && isDuplicateExpertise(formData.departmentId, formData.expertiseName))
                                }
                                className="flex-[2] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save {activeType === 'department' ? 'Department' : 'Expertise'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  delete confirmation */}
            {deleteModal.show && (
                <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Delete {deleteModal.type === 'department' ? 'Department' : 'Expertise'}?
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Type{' '}
                                <span className="font-semibold text-slate-700">"{deleteModal.name}"</span>
                                {' '}to confirm deletion.
                                {deleteModal.type === 'department' && (
                                    <span className="block mt-1 text-red-500 text-xs">
                                        This will also remove all its expertise.
                                    </span>
                                )}
                            </p>
                        </div>

                        {/*  Confirmation Input */}
                        <input
                            type="text"
                            value={deleteModal.confirmText}
                            onChange={e =>
                                setDeleteModal(prev => ({ ...prev, confirmText: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 mb-4 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-red-400 focus:outline-none text-sm"
                            placeholder={`Type "${deleteModal.name}" to confirm`}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, type: null, id: null, name: '', deptId: null, confirmText: '' })}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={!isConfirmMatch}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${isConfirmMatch
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-red-300 cursor-not-allowed'
                                    }`}
                            >
                                Yes, confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Department