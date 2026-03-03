import { Link } from "react-router-dom";

function DemoHomePage() {
  const token = localStorage.getItem("token");

  console.log(token);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
      <h1 className="text-3xl font-bold">Welcome to Demo Home Page</h1>

      <div className="flex gap-4">
        <Link
          to="/register"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Login
        </Link>

        <Link
          to={`/password/reset/${token}`}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Reset-password
        </Link>

        <Link
          to="/password/forgot"
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
}

export default DemoHomePage;
