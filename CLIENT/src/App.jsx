import { Routes, Route } from "react-router-dom";
import SignUpPage from "./components/auth/SignUpPage";
import Landing from './components/landing/landingPage';
import SignInPage from "./components/auth/SignInPage";
import AuthLayout from "./components/auth/AUthLayout";
import { ThemeProvider } from './components/auth/ThemeToggle';
import Dashboard from './components/pages/Dashboard';
import ProtectedRoute from "./components/routes/ProtectedRoute"; 
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth Routes using shared layout */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Route>

        {/*Protected Dashboard Route*/}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
