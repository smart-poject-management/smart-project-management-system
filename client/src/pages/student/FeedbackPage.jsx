// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
// import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";

// const FeedbackPage = () => {

//   const dispatch = useDispatch();
//   const { project, feedback } = useSelector(state => state.student);

//   useEffect(() => {
//     dispatch(fetchProject());
//   }, [dispatch]);


//   useEffect(() => {
//     if (project?._id) {
//       dispatch(getFeedback(project._id));
//     }
//   }, [dispatch, project]);

//   const getFeedbackIcon = (feedback) => {
//     if (type === "positive") {
//       return <BadgeCheck className="w-6 h-6 text-green-500" />;
//     }
//     if (type === "negative") {
//       return <AlertTriangle className="w-6 h-6 text-red-500" />;
//     }
//     return <MessageCircle className="w-6 h-6 text-blue-500" />
//   }


//   const feedbackStats = [
//     {
//       type: "general",
//       title: "Total Feedback",
//       bg: "bg-blue-50",
//       iconBg: "bg-blue-100",
//       textColor: "text-blue-800",
//       valueColor: "text-blue-900",
//       getCount: (feedback) => feedback?.length || 0,
//     },
//     {
//       type: "positive",
//       title: "Positive",
//       bg: "bg-green-50",
//       iconBg: "bg-green-100",
//       textColor: "text-green-800",
//       valueColor: "text-green-900",
//       getCount: (feedback) =>
//         feedback?.filter(f => f.type === "positive").length
//     },
//     {
//       type: "negative",
//       title: "Needs Revision",
//       bg: "bg-yellow-50",
//       iconBg: "bg-yellow-100",
//       textColor: "text-yellow-800",
//       valueColor: "text-yellow-900",
//       getCount: (feedback) =>
//         feedback?.filter(f => f.type === "negative").length
//     },
//     {
//       type: "neutral",
//       title: "Neutral Feedback",
//       bg: "bg-yellow-50",
//       iconBg: "bg-yellow-100",
//       textColor: "text-yellow-800",
//       valueColor: "text-yellow-900",
//       getCount: (feedback) => feedback?.filter(f => f.type === "neutral").length || 0,
//     },
//   ]
//   return <>
//     <div className="space-y-6 p-4">
//       <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">

//         {/*feedback header*/}
//         <div className="flex items-center justify-between border-b pb-4 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800">Supervisor Feedback</h2>
//             <p className="text-sm text-slate-500">
//               View feedback and comments from your supervisor
//             </p>
//           </div>
//         </div>

//         {/* feedback stats */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//           {feedbackStats.map((item, i) => (
//             <div
//               key={i}
//               className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
//             >
//               <div className="flex items-center space-x-3">
//                 <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
//                   {getFeedbackIcon(item.type)}
//                 </div>

//                 <div>
//                   <p className={`text-xs ${item.titleColor}`}>{item.title}</p>
//                   <p className="text-lg font-bold text-slate-800">
//                     {item.getCount(feedback)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>

//   </>;
// };

// export default FeedbackPage;


import  { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector(state => state.student);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

  const getFeedbackIcon = (type) => {
    if (type === "positive") {
      return <BadgeCheck className="w-6 h-6 text-green-500" />;
    }
    if (type === "negative") {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
    return <MessageCircle className="w-6 h-6 text-blue-500" />;
  };

  const feedbackStats = [
    {
      type: "general",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      getCount: (feedback) => feedback?.length || 0,
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      getCount: (feedback) =>
        feedback?.filter(f => f.type === "positive").length || 0,
    },
    {
      type: "negative",
      title: "Needs Revision",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-800",
      valueColor: "text-red-900",
      getCount: (feedback) =>
        feedback?.filter(f => f.type === "negative").length || 0,
    },
    {
      type: "neutral",
      title: "Neutral Feedback",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      getCount: (feedback) =>
        feedback?.filter(f => f.type === "neutral").length || 0,
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">

        {/* Feedback Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Supervisor Feedback</h2>
            <p className="text-sm text-slate-500">
              View feedback and comments from your supervisor
            </p>
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {feedbackStats.map((item, i) => (
            <div
              key={i}
              className={`${item.bg} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${item.iconBg} p-3 rounded-xl shadow`}>
                  {getFeedbackIcon(item.type)}
                </div>
                <div>
                  <p className={`text-xs ${item.textColor}`}>{item.title}</p>
                  <p className="text-lg font-bold text-slate-800">
                    {item.getCount(feedback)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            feedback.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getFeedbackIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.type === "positive"
                            ? "bg-green-100 text-green-700"
                            : item.type === "negative"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{item.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No feedback yet from your supervisor.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FeedbackPage;