import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaQuoteLeft,
} from "react-icons/fa";
import { Loader } from "lucide-react";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const { authUser, isSigningUp } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );
  };

  useEffect(() => {
    if (authUser) {
      switch (authUser.role) {
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
              Create Account
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Join us! Fill in your details to get started
            </p>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
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

          {/* Name */}
          <div className="mb-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full bg-white border rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-2 pl-2">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full bg-white border rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-2 pl-2">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`w-full bg-white border rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.password ? "border-red-400" : "border-gray-300"
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

          {/* Confirm Password */}
          <div className="mb-8 relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full bg-white border rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.confirmPassword ? "border-red-400" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-2 pl-2">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSigningUp}
            className="w-full bg-indigo-700 text-white py-3 rounded-full hover:bg-indigo-800 transition-all duration-300 text-sm font-medium disabled:opacity-50"
          >
            {isSigningUp ? (
              <div className="flex justify-center items-center gap-2">
                <Loader className="animate-spin h-4 w-4 text-white" />
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login link */}
          <p className="text-sm text-center mt-8 text-gray-600">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE - Quote */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative px-12 py-16 flex-col justify-center">
          <div className="max-w-md">
            <div className="flex gap-4 items-start">
              <FaQuoteLeft className="text-3xl opacity-80 mt-1" />
              <p className="text-lg leading-relaxed">
                Education is the most powerful weapon which you can use to
                change the world. Start your journey with us today.
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

export default RegisterPage;
