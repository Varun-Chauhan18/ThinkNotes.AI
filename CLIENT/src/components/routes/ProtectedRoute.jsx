import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Listen to firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ensure token available
        const token = await user.getIdToken();
        localStorage.setItem("idToken", token);
        setIsAuthed(true);
      } else {
        setIsAuthed(false);
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);


  if (isChecking) return null;


  if (!isAuthed) return <Navigate to="/signin" replace />;

  return children;
};

export default ProtectedRoute;
