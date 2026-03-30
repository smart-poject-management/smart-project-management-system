import { ShieldX } from "lucide-react";
function Unauthorized() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">

                <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">

                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <ShieldX className="w-7 h-7" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Unauthorized Access
                    </h1>

                    {/* Description */}
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        You don’t have permission to view this page.
                        Please go back or contact your administrator.
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-4"></div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6 justify-center flex-wrap">

                        {/* Go Back */}
                        <button
                            onClick={() => window.history.back()}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Unauthorized