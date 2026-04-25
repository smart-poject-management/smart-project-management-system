import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitProposal from "./pages/student/SubmitProposal";
import UploadFiles from "./pages/student/UploadFiles";
import SupervisorPage from "./pages/student/SupervisorPage";
import DeadlineExtensionRequest from "./pages/student/DeadlineExtensionRequest";
import FeedbackPage from "./pages/student/FeedbackPage";
import NotificationsPage from "./pages/student/NotificationsPage";
import StudentAttendancePage from "./pages/student/AttendancePage";
import MyFees from "./pages/student/MyFees";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PendingRequests from "./pages/teacher/PendingRequests";
import AssignedStudents from "./pages/teacher/AssignedStudents";
import TeacherFiles from "./pages/teacher/TeacherFiles";
import TeacherNotificationsPage from "./pages/teacher/TeacherNotificationsPage";
import TeacherAttendancePage from "./pages/teacher/AttendancePage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import NotFound from "./pages/NotFound";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { getAllProjects, getAllUsers } from "./store/slices/adminSlice";
import { fetchDashboardStats } from "./store/slices/studentSlice";
import Unauthorized from "./pages/Unauthorized";
import Department from "./pages/admin/Department";
import AdminAttendancePage from "./pages/admin/AttendancePage";
import FeesStatus from "./pages/admin/FeesStatus";
import StudentsOverview from "./pages/teacher/StudentsOverview";
import LearningTab from "./pages/student/LearningTab";
import StudentWorkspace from "./components/StudentWorkspace";
import StudentFeesDetail from "./pages/admin/StudentFeesDetail";

const ProtectedRoute = ({ children, allowedRoles, authUser }) => {
  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles?.length &&
    authUser?.role &&
    !allowedRoles.includes(authUser.role)
  ) {
    const redirectPath =
      authUser.role === "Admin"
        ? "/admin"
        : authUser.role === "Teacher"
          ? "/teacher"
          : "/student";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const App = () => {
  const { authUser, isCheckingAuth } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?.role === "Admin") {
      dispatch(getAllUsers());
      dispatch(getAllProjects());
    }
    if (authUser?.role === "Student") {
      dispatch(fetchDashboardStats());
    }
  }, [authUser, dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/password/forgot" element={<ForgotPasswordPage />} />
        <Route path="/password/reset/:token" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]} authUser={authUser}>
              <DashboardLayout userRole="Admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="assign-supervisor" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="departments" element={<Department />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="fees" element={<FeesStatus />} />
          <Route path="student-fees/:id" element={<StudentFeesDetail />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student"]} authUser={authUser}>
              <DashboardLayout userRole="Student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="submit-proposal" element={<SubmitProposal />} />
          <Route path="upload-files" element={<UploadFiles />} />
          <Route
            path="deadline-extension"
            element={<DeadlineExtensionRequest />}
          />
          <Route path="supervisor" element={<SupervisorPage />} />
          <Route path="/student/learning" element={<StudentWorkspace />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="fees" element={<MyFees />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]} authUser={authUser}>
              <DashboardLayout userRole="Teacher" />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="pending-requests" element={<PendingRequests />} />
          <Route path="assigned-students" element={<AssignedStudents />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="files" element={<TeacherFiles />} />
          <Route path="notifications" element={<TeacherNotificationsPage />} />
          <Route path="/teacher/students" element={<StudentsOverview />} />
        </Route>

        <Route path="unauthorized" element={<Unauthorized />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer theme="dark" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
