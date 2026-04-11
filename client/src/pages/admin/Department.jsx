import { Plus, Search } from 'lucide-react'



function Department() {
    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="page-header"> Manage Department & Expertise  </h1>
                        <p className="text-gray-500 mt-1">
                            Create and monitor Department & Expertise
                        </p>
                    </div>
                    <button
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
                            Search Projects
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300
                  bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
                  focus:ring-indigo-400 focus:border-indigo-400 shadow-sm
                  transition-all duration-200 text-sm"
                                placeholder="Search by project title or student name..."

                            />
                        </div>
                    </div>



                </div>
            </div>



        </div>
    )
}

export default Department