import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-all duration-300">
      {/* Left Panel */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white flex flex-col items-center justify-center md:w-1/2 w-full px-8 py-12">

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          Summarize Your Documents
        </h1>
        <p className="text-lg md:text-xl text-center max-w-md text-white/90">
          Upload, analyze, and get intelligent insights from your PDFs and documents with AI-powered processing.
        </p>

        {/* Animated Dots */}
        <div className="flex gap-2 mt-6">
          <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          <span className="w-3 h-3 bg-white/60 rounded-full animate-bounce [animation-delay:0.6s]"></span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
