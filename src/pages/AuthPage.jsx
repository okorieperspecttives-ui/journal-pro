import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../config/firebaseConfig";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { supabase } from "../config/supabaseClient";

const AuthPage = () => {
  const { user, loadingUser } = useAuthContext();
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    photoUrl: "",
  });

  const navigate = useNavigate();

  function makeUsername(str1, str2) {
    // Take the first 4 characters from each string
    const part1 = str1.slice(0, 4);
    const part2 = str2.slice(0, 4);

    // Join them together
    return part1 + part2;
  }

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

      const { data, error } = await supabase.from("users").insert({
        user_id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        phone: result.user.phoneNumber,
        username: makeUsername(result.user.displayName, result.user.uid),
        avatar_url: result.user.photoURL,
      });

      if (!error) {
        console.log(data);
      } else {
        console.log(error);
      }
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
