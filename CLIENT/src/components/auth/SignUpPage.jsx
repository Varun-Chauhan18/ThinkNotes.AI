// src/components/auth/SignUpPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, ThemeToggleButton } from "./ThemeToggle";
import { Eye, EyeClosed } from "lucide-react";

// Firebase client
import { auth } from "../../firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUpPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Create user with Firebase client SDK (still creates the account)
    await createUserWithEmailAndPassword(auth, form.email, form.password);

    // Don't auto-get token or auto-navigate to dashboard.
    // Instead ask user to sign in to verify credentials and then login.
    alert("Registration successful! Please sign in to continue.");
    navigate("/signin");
  } catch (err) {
    // Handle Firebase errors (same as before)
    let msg = "Registration failed!";
    if (err?.code) {
      if (err.code === "auth/email-already-in-use") msg = "Email already in use.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      else if (err.code === "auth/weak-password") msg = "Password is too weak. Use at least 6 characters.";
      else msg = err.message || String(err);
    } else if (err?.message) {
      msg = err.message;
    }
    alert("Error: " + msg);
  } finally {
    setLoading(false);
  }
};
  return (
    <div
      className={`flex items-center justify-center h-full w-full px-8 py-12 transition-colors duration-500 min-h-screen py-8 ${
        isDarkMode ? "bg-[#111] text-white" : "bg-white text-black"
      } relative`}
    >
      <div
        className={`rounded-xl p-10 w-full max-w-md shadow-md transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1c1c]" : "bg-gray-100"
        }`}
      >
        <ThemeToggleButton />

        <h2 className="text-2xl font-bold mb-2 text-center">Create account</h2>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Get started with your document analysis platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            id="userName"
            name="userName"
            required
            value={form.userName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`w-full px-4 py-2 border rounded-md ${
              isDarkMode ? "bg-black text-white border-gray-700" : "bg-white border-gray-300 text-black"
            }`}
          />

          <input
            type="email"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-4 py-2 border rounded-md ${
              isDarkMode ? "bg-black text-white border-gray-700" : "bg-white border-gray-300 text-black"
            }`}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-2 border rounded-md pr-10 ${
                isDarkMode ? "bg-black text-white border-gray-700" : "bg-white border-gray-300 text-black"
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
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
