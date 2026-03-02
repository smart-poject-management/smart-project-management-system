import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { Loader } from "lucide-react";
import {
  FaLock,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaQuoteLeft,
} from "react-icons/fa";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { authUser, isLoggingIn } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is Invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    dispatch(login(data));
  };

  useEffect(() => {
    if (authUser) {
      switch (formData.role) {
        case "Student":
          navigate("/student");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Admin":
          navigate("/admin");
          break;
        default:
          navigate("/login");
      }
    }
  }, [authUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md sm:max-w-3xl xl:max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT SIDE - Form */}
        <div className="w-full lg:w-1/2 bg-[#f6f4ed] px-6 sm:px-10 lg:px-14 py-10 flex flex-col justify-center">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight">
              Sign In
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Welcome back! Please enter your details
            </p>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              {[
                { value: "Student", icon: <FaUserGraduate /> },
                { value: "Teacher", icon: <FaChalkboardTeacher /> },
                { value: "Admin", icon: <FaUserShield /> },
              ].map(role => (
                <label
                  key={role.value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />
                  <span className="text-indigo-600 group-hover:scale-110 transition">
                    {role.icon}
                  </span>
                  <span className="text-gray-700">{role.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className={`w-full bg-white border rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-2 pl-2">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"} // ✅ now works
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full bg-white border rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.password ? "border-red-400" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // ✅ now works
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-xs text-red-500 mt-2 pl-2">
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-8">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoggingIn}
            className="w-full bg-indigo-700 text-white py-3 rounded-full hover:bg-indigo-800 transition-all duration-300 text-sm font-medium disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="flex justify-center items-center gap-2">
                <Loader className="animate-spin h-4 w-4 text-white" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Register */}
          <p className="text-sm text-center mt-8 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE - Quote */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative px-12 py-16 flex-col justify-center">
          <div className="max-w-md">
            <div className="flex gap-4 items-start">
              <FaQuoteLeft className="text-3xl opacity-80 mt-1" />{" "}
              {/* ✅ now imported */}
              <p className="text-lg leading-relaxed">
                This educational project management system makes tracking
                assignments and collaborating with teachers incredibly easy.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 right-6 opacity-10 text-[150px] font-bold select-none">
            EDU
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
