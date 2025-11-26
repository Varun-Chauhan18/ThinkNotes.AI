import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // Fetch username/email from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userName') || localStorage.getItem('email');
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    navigate('/'); // Redirect to landing page
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 shadow-lg rounded-b-lg">
      {/* Application Logo/Title */}
      <div className="flex items-center space-x-2">
        <FileText size={24} className="text-purple-400" />
        <span className="text-xl font-bold text-gray-500">ThinkNotes.AI</span>
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-400">
          <User size={20} />
          <span className="text-sm">{userName || "Guest"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
