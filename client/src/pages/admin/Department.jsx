import { Plus, Search, X } from 'lucide-react'
import { useState } from 'react'

function Department() {
    const [showModal, setShowModal] = useState(false)
    const [activeType, setActiveType] = useState('department') // 'department' | 'expertise'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        departmentId: '', 
    })

    const handleClose = () => {
        setShowModal(false)
        setActiveType('department')
        setFormData({ name: '', description: '', departmentId: '' })
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
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

            {/* Filters Card */}
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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm"
                                placeholder="Search by Department & Expertise..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-1">
                            Filter by Type
                        </label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition-all duration-200 text-sm">
                            <option value="all">All Department & Expertise</option>
                            <option value="department">Department</option>
                            <option value="expertise">Expertise</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Department & Expertise</h2>
                </div>
                <div className="overflow-y-auto">
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
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md mx-4">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-slate-800">Add Department & Expertise</h2>
                            <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Toggle: Department | Expertise */}
                        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
                            <button
                                onClick={() => setActiveType('department')}
                                className={`flex-1 py-2 text-sm font-medium transition-all ${activeType === 'department'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Department
                            </button>
                            <button
                                onClick={() => setActiveType('expertise')}
                                className={`flex-1 py-2 text-sm font-medium transition-all ${activeType === 'expertise'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Expertise
                            </button>
                        </div>

                        {/* Department Fields */}
                        {activeType === 'department' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Department Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                        placeholder="Enter Department Name"
                                    />
                                </div>

                            </div>
                        )}

                        {/* Expertise Fields — Department select bhi hai */}
                        {activeType === 'expertise' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Select Department
                                    </label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                    >
                                        <option value="">-- Select Department  --</option>
                                        <option value="1">Computer Science</option>
                                        <option value="2">Electrical Engineering</option>
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">Select Department</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Expertise Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                        placeholder="Enter Expertise Name"
                                    />
                                </div>

                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-[2] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all"
                            >
                                Save {activeType === 'department' ? 'Department' : 'Expertise'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Department