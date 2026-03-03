import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const { isRequestingForToken } = useSelector(state => state.auth);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      setError(err || "Something went wrong. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Check your email
          </h2>
          <p className="text-gray-600 mb-8">
            We've sent a password reset link to{" "}
            <span className="font-semibold">{email}</span>.
          </p>
          <Link
            to="/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-medium transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full relative overflow-hidden">
        {/* Decorative EDU Text */}
        <div className="absolute bottom-4 right-6 text-7xl font-bold text-indigo-100 opacity-20 pointer-events-none">
          EDU
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            Enter your email and we'll send reset instructions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="you@example.com"
              disabled={isRequestingForToken}
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isRequestingForToken}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-medium transition disabled:opacity-60"
          >
            {isRequestingForToken ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Sending Link...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
