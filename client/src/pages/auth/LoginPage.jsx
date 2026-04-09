import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { Loader } from "lucide-react";
import {
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaQuoteLeft,
  FaQuoteRight,
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
          navigate("/");
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
              Login
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


          <form onSubmit={handleSubmit} noValidate>

            {/* Role Selection */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                {[
                  { value: "Student", icon: <FaUserGraduate /> },
                  { value: "Teacher", icon: <FaChalkboardTeacher /> },
                  { value: "Admin", icon: <FaUserShield /> },
                ].map(role => (
                  <label
                    key={role.value}
                    className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border-2 transition-all duration-200 ${formData.role === role.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span
                      className={`transition ${formData.role === role.value
                        ? "text-indigo-600"
                        : "text-gray-400"
                        }`}
                    >
                      {role.icon}
                    </span>
                    <span className="font-medium">{role.value}</span>
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
                className={`w-full bg-white border rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.email ? "border-red-400" : "border-gray-300"
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-2 pl-2">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`w-full bg-white border rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.password ? "border-red-400" : "border-gray-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                to="/password/forgot"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-700 text-white py-3 rounded-full hover:bg-indigo-800 transition-all duration-300 text-sm font-medium disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="flex justify-center items-center gap-2">
                  <Loader className="animate-spin h-4 w-4 text-white" />
                  Login...
                </div>
              ) : (
                "Login"
              )}
            </button>

          </form>
        </div>

        {/* RIGHT SIDE - Enhanced Quote */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1e293b] via-indigo-700 to-purple-800 text-white px-14 py-16 flex-col justify-between">

          {/* TOP CONTENT */}
          <div className="z-10 max-w-lg">

            {/* Quote Icon */}
            <div className="text-indigo-300 text-xl mb-4 text-right flex  justify-start">
              <FaQuoteLeft />
            </div>

            {/* Quote Text */}
            <p className="text-xl leading-relaxed font-light tracking-wide text-white">
              This educational project management system makes tracking assignments
              and collaborating with teachers incredibly easy.
            </p>

            {/* Bottom Quote Icon */}
            <div className="text-indigo-300 text-xl mt-4 text-right flex justify-end">
              <FaQuoteRight />
            </div>

          </div>

          {/* GLASS CARD DECORATION */}
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 backdrop-blur-xl rounded-2xl rotate-12 border border-white/20"></div>

          {/* BACKGROUND TEXT */}
          <div className="absolute bottom-0 right-6 opacity-[0.06] text-[180px] font-extrabold tracking-widest select-none">
            EDU
          </div>

          {/* GRADIENT OVERLAY (depth effect) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;