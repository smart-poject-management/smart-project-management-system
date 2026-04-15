import { Plus, Search, X, Trash2, AlertTriangle, Eye, ChevronDown, PlusIcon, Pen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import {
    createDepartment,
    createExpertise,
    fetchDepartments,
    fetchExpertiseByDepartment,
    deleteDepartment,
    deleteExpertise,
} from '../../store/slices/departmentSlice'

function Department() {
    const dispatch = useDispatch()
    const { departments, loadingDepartments } = useSelector(state => state.department)
    const [expertiseMap, setExpertiseMap] = useState({})
    const [loadingExpertise, setLoadingExpertise] = useState({})
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [activeType, setActiveType] = useState('department')
    const [viewModal, setViewModal] = useState({ show: false, dept: null })
    const [deleteModal, setDeleteModal] = useState({
        show: false, type: null, id: null, name: '', deptId: null,
    })
    const [formData, setFormData] = useState({
        departmentName: '', expertiseName: '', departmentId: '',
    })

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

    const handleCloseView = () => setViewModal({ show: false, dept: null })

    const handleClose = () => {
        setShowModal(false)
        setActiveType('department')
        setFormData({ departmentName: '', expertiseName: '', departmentId: '' })
    }

    const handleSubmit = async () => {
        try {
            if (activeType === 'department') {
                if (!formData.departmentName.trim()) return toast.error('Department name is required')
                await dispatch(createDepartment({ department: formData.departmentName })).unwrap()
                toast.success('Department created successfully')
            }
            if (activeType === 'expertise') {
                if (!formData.departmentId) return toast.error('Please select department')
                if (!formData.expertiseName.trim()) return toast.error('Expertise name is required')
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
        setDeleteModal({ show: true, type: 'department', id: dept._id, name: dept.department, deptId: null })
    }

    const openDeleteExpertise = (e, exp, deptId) => {
        e.stopPropagation()
        setDeleteModal({ show: true, type: 'expertise', id: exp._id, name: exp.name, deptId })
    }

    const handleDeleteConfirm = async () => {
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
            setDeleteModal({ show: false, type: null, id: null, name: '', deptId: null })
        }
    }

    const viewDept = viewModal.dept
    const viewExpertise = viewDept ? (expertiseMap[viewDept._id] || []) : []
    const viewLoading = viewDept ? (loadingExpertise[viewDept._id] || false) : false

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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                placeholder="Search by Department & Expertise..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
                            Filter by Type
                        </label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm">
                            <option value="all">All Department & Expertise</option>
                            <option value="department">Department</option>
                            <option value="expertise">Expertise</option>
                        </select>
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
                            {departments.map((dept, index) => {
                                const expertiseCount = Object.prototype.hasOwnProperty.call(expertiseMap, dept._id)
                                    ? expertiseMap[dept._id].length
                                    : (dept.expertiseCount ?? null)

                                return (
                                    <tr key={dept._id} className="border-t hover:bg-slate-50">

                                        <td className="px-4 py-4 text-sm text-slate-500">{index + 1}</td>

                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-800 capitalize">{dept.department}</span>
                                        </td>

                                        {/* Expertise count badge */}
                                        <td className="px-6 py-4 capitalize">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {expertiseCount !== null ? expertiseCount : '—'} expertise
                                            </span>
                                        </td>

                                        {/* Teacher badge */}
                                        <td className="px-6 py-4">

                                            {dept.totalTeacher ?? 0}

                                        </td>

                                        {/* Student badge */}
                                        <td className="px-6 py-4">

                                            {dept.totalStudent ?? 0}

                                        </td>

                                        {/* Project badge */}
                                        <td className="px-6 py-4">

                                            {dept.totalProject ?? 0}

                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">

                                                <button
                                                  
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                                                >
                                                    <Pen className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={e => handleViewClick(e, dept)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={e => openDeleteDept(e, dept)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                )
                            })}

                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No departments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/*  VIEW DETAIL MODAL */}
            {viewModal.show && viewDept && (
                <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">{viewDept.department}</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Department Details</p>
                            </div>
                            <button onClick={handleCloseView} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Stats */}
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

                        {/* Expertise list */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Expertise</h3>
                                {!viewLoading && (
                                    <span className="text-xs text-slate-400">{viewExpertise.length} total</span>
                                )}
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
                                <ul className="space-y-2">
                                    {viewExpertise.map((exp, i) => (
                                        <li
                                            key={exp._id}
                                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">{exp.name}</span>
                                            </div>
                                            <button
                                                onClick={e => openDeleteExpertise(e, exp, viewDept._id)}
                                                className="flex items-center gap-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all text-xs"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
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
                            <button
                                onClick={handleCloseView}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ADD MODAL*/}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
                            <input
                                type="text"
                                value={formData.departmentName}
                                onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
                                placeholder="Enter Department Name"
                            />
                        ) : (
                            <>

                                <div className="relative mb-5">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(!open)}
                                        className="capitalize w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm flex justify-between items-center"
                                    >
                                        <span>
                                            {formData.departmentId
                                                ? departments.find(d => d._id === formData.departmentId)?.department
                                                : "Select Department"}
                                        </span>

                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>


                                    {open && (
                                        <div
                                            className="fixed inset-0 z-0"
                                            onClick={() => setOpen(false)}
                                        ></div>
                                    )}

                                    {open && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg 
                        max-h-[120px] overflow-y-auto custom-scrollbar">

                                            {departments.map(d => (
                                                <div
                                                    key={d._id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, departmentId: d._id });
                                                        setOpen(false);
                                                    }}
                                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                                >
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
                            </>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loadingDepartments}
                                className="flex-[2] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                                Save {activeType === 'department' ? 'Department' : 'Expertise'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Delete {deleteModal.type === 'department' ? 'Department' : 'Expertise'}?
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Are you sure you want to delete{' '}
                                <span className="font-medium text-slate-700">"{deleteModal.name}"</span>?
                                {deleteModal.type === 'department' && (
                                    <span className="block mt-1 text-red-500 text-xs">
                                        This will also remove all its expertise.
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, type: null, id: null, name: '', deptId: null })}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Department