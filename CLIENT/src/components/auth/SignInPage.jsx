// src/components/auth/SignInPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";

// firebase client 
import { auth } from "../../firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignInPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
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
      // 1) Sign in with Firebase client SDK
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2) Get a fresh ID token (force refresh = true ensures token is fresh)
      const idToken = await user.getIdToken(/* forceRefresh */ true);

      // 3) Persist idToken on client (used to call your backend)
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("userEmail", formData.email);


      try {
        const res = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend /auth/login returned non-OK:", err);
        } else {
          const data = await res.json();
          if (data?.uid) localStorage.setItem("uid", data.uid);
          if (data?.email) localStorage.setItem("userEmail", data.email);
        }
      } catch (backendErr) {
        console.warn("Could not verify token with backend:", backendErr);
      }

      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      // Firebase auth errors give useful codes/messages
      let msg = "Login failed!";
      if (err?.code) {
        if (err.code === "auth/user-not-found") msg = "No user found with this email.";
        else if (err.code === "auth/wrong-password") msg = "Incorrect password.";
        else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
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
