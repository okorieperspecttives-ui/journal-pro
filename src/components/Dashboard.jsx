import { Loader2, LogIn, LogOut } from "lucide-react";
import React, { useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import Calendar from "./Calender";
import { supabase } from "../config/supabaseClient";
import EntryForm from "./EntryForm";
const Dashboard = () => {
  const { user, loadingUser, selectedDate, setEntries, formModal } =
    useAuthContext();

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

  if (!loadingUser && !user)
    return (
      <>
        <div className="container h-full w-full mx-auto flex items-center justify-center">
          <Link to="/auth">
            <button className="text-2xl text-gray-600 bg-gray-300 hover:bg-gray-700 hover:text-gray-400 transition-all duration-500 ease-in-out w-fit p-2 font-bold cursor-pointer mt-5">
              Login to see entries
            </button>
          </Link>
        </div>
      </>
    );

  console.log(user.photoURL);

  // 🔥 Function that fires on mount and whenever selectedDate changes
  useEffect(() => {
    const checkTrades = async () => {
      if (!selectedDate) return;

      // selectedDate should be in YYYY-MM-DD format
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("created_at", selectedDate);

      if (error) {
        console.error("Error checking trades:", error.message);
      } else {
        if (data.length === 0) {
          console.log(`No trades found for ${selectedDate}`);
        } else {
          console.log(`Found ${data.length} trades for ${selectedDate}`, data);
          setEntries(data);
        }
      }
    };

    checkTrades();
  }, [selectedDate]);

  return (
    <>
      <div className="w-screen h-screen bg-transparent">
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
              <div className="w-10 h-10 rounded-full">
                <img
                  className="w-full h-full rounded-full"
                  src={user.photoURL}
                  alt="User"
                />
              </div>
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

        <div className="w-full h-full">
          <div className="flex items-start h-full w-full gap-2 px-2">
            <div className="overflow-y-scroll w-full h-full scrollbar-hide flex-2">
              <Calendar />
            </div>
            <div className="overflow-y-scroll w-full h-full scrollbar-hide pt-4 text-gray-200  flex-5">
              {formModal && <EntryForm />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
