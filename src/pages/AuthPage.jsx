import React, { useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../config/firebaseConfig";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

const AuthPage = () => {
  const { user, loadingUser } = useAuthContext();

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to home
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loadingUser)
    return (
      <>
        <div className="w-screen h-screen bg-transparent flex items-center justify-center">
          <Loader2 className="text-gray-500 animate-spin w-10 h-10" />
        </div>
      </>
    );

  const handleLoginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center gap-4 flex-col">
        <header className="">
          <h1 className="text-2xl text-gray-600 bg-gray-50 w-fit p-2 font-bold">
            You're welcome
          </h1>
        </header>
        <button
          onClick={handleLoginWithGoogle}
          className="text-2xl text-gray-600 bg-gray-300 hover:bg-gray-700 hover:text-gray-400 transition-all duration-500 ease-in-out w-fit p-2 font-bold cursor-pointer mt-5"
        >
          Login With Google
        </button>
      </div>
    </>
  );
};

export default AuthPage;
