// src/components/auth/SignInPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, ThemeToggleButton } from "./ThemeToggle";
import { Eye, EyeClosed } from "lucide-react";
import { loginUser } from "./../routes/api"; // <-- uses your api wrapper

const SignInPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",     // changed to email to match backend
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // loginUser uses axios and will save token to localStorage if backend returns access_token
      const data = await loginUser({ email: formData.email, password: formData.password });

      // Accept either access_token (our FastAPI) or token (older format)
      const token = data?.access_token || data?.token || null;
      if (!token) {
        throw new Error("Login failed: no token received from server.");
      }

      // persist token and email for later use
      localStorage.setItem("token", token);
      localStorage.setItem("userName", formData.email);

      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      // axios errors may have response data; present helpful message
      let msg = "Login failed!";
      if (error?.response?.data) {
        const d = error.response.data;
        msg = d.detail || d.message || JSON.stringify(d);
      } else if (error?.message) {
        msg = error.message;
      }
      alert("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-full w-full px-8 py-12 transition-colors duration-500 ${
        isDarkMode ? "bg-[#111] text-white" : "bg-white text-black"
      } relative`}
    >
      <div
        className={`rounded-xl p-10 w-full max-w-md shadow-md transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1c1c]" : "bg-gray-100"
        }`}
      >
        <ThemeToggleButton />

        <h2 className="text-2xl font-bold mb-2 text-center">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-4 py-2 border rounded-md ${
              isDarkMode
                ? "bg-black text-white border-gray-700"
                : "bg-white border-gray-300 text-black"
            }`}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-2 border rounded-md pr-10 ${
                isDarkMode
                  ? "bg-black text-white border-gray-700"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
