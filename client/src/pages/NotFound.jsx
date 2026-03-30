import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-8 w-full max-w-md text-center relative">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Compass className="w-7 h-7" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
          404
        </h1>

        {/* Title */}
        <p className="text-lg font-medium text-slate-700 mt-2">
          Page not found
        </p>

        {/* Description */}
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved.
          Try navigating back or return to homepage.
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
  );
};

export default NotFound;