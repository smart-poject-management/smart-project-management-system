import { BookOpen, Loader, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../store/slices/authSlice";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isUpdatingPassword } = useSelector(state => state.auth);

  const token = searchParams.get("token");

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      navigate("/login");
    } catch (err) {
      setErrors({
        general: err || "Failed to reset password",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative">
        {/* EDU watermark */}
        <div className="absolute bottom-4 right-6 text-7xl font-bold text-indigo-100 opacity-20 pointer-events-none">
          EDU
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-600 mt-2">Create a new secure password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                {errors.general}
              </p>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={`w-full px-4 py-3 pr-12 rounded-full border ${
                  errors.password ? "border-red-400" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 pr-12 rounded-full border ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-indigo-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-medium transition disabled:opacity-60"
          >
            {isUpdatingPassword ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
