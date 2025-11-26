import { FileText, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Landing = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#130f40] to-black text-white overflow-x-hidden">
      
      {/* Hero Section - Fullscreen */}
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl md:text-8xl font-extrabold text-purple-500 mb-4">
          Transform Your Documents
        </h1>
        <p className="text-gray-300 max-w-3xl text-xl mb-10 md:text-2xl">
          Upload, analyze, and get intelligent insights from your PDFs and documents with AI-powered processing.
        </p>
        <div className="mt flex gap-6 flex-wrap justify-center">
          <button onClick={()=> navigate("/signup")} className="bg-purple-600 hover:bg-purple-700 text-white text-lg md:text-xl font-semibold py-3 px-8 rounded-lg shadow transition">
            Get Started →
          </button>
          <button onClick={() => navigate("/signin")}className="bg-black border border-white text-white text-lg md:text-xl font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition">
            Sign In
          </button>
        </div>
      </div>

      <section className="min-h-screen bg-[#111] py-28 px-8 flex items-center justify-center">
  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-20 text-center max-w-8xl mx-auto w-full">
    
    {/* Feature 1 */}
    <div className="flex flex-col items-center max-w-md mx-auto">
      <FileText size={60} className="text-purple-500 mb-6" />
      <h3 className="text-2xl font-bold mb-4">Smart Document Analysis</h3>
      <p className="text-gray-400 text-lg">
        Advanced AI algorithms analyze your documents and extract key insights automatically.
      </p>
    </div>

    {/* Feature 2 */}
    <div className="flex flex-col items-center max-w-md mx-auto">
      <Zap size={60} className="text-purple-500 mb-6" />
      <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
      <p className="text-gray-400 text-lg">
        Get results in seconds, not minutes. Our optimized processing handles large documents effortlessly.
      </p>
    </div>

    {/* Feature 3 */}
    <div className="flex flex-col items-center max-w-md mx-auto">
      <ShieldCheck size={60} className="text-purple-500 mb-6" />
      <h3 className="text-2xl font-bold mb-4">Secure & Private</h3>
      <p className="text-gray-400 text-lg">
        Your documents are processed securely with enterprise-grade encryption and privacy protection.
      </p>
     </div>
    </div>
    </section>
    </div>
  );
};

export default Landing;
