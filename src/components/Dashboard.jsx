import { Loader2, LogIn, LogOut } from "lucide-react";
import React, { useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const Dashboard = () => {
  const { user, loadingUser } = useAuthContext();

  const handleLougout = () => {
    signOut(auth);
  };

  if (loadingUser)
    return (
      <>
        <div className="w-screen h-screen bg-transparent flex items-center justify-center">
          <Loader2 className="text-gray-500 animate-spin w-10 h-10" />
        </div>
      </>
    );
  return (
    <>
      <div className="w-full h-full bg-transparent">
        <header className="p-2 flex items-center gap-4">
          <h1 className="text-gray-600 bg-gray-300 backdrop-blur-2xl italic rounded-sm  w-fit p-1  text-2xl">
            jonero
          </h1>
          <div>
            {!user ? (
              <Link to="auth">
                <LogIn className="text-gray-500 hover:scale-110 transition-all ease-in-out duration-700 cursor-pointer" />
              </Link>
            ) : (
              <p className="text-gray-300   transition-all ease-in-out duration-700">
                {user.displayName}
              </p>
            )}
          </div>
          {user && (
            <button className="cursor-pointer">
              <LogOut
                onClick={handleLougout}
                className="text-gray-500 hover:scale-110 transition-all ease-in-out duration-700 cursor-pointer"
              />
            </button>
          )}
        </header>
      </div>
    </>
  );
};

export default Dashboard;
