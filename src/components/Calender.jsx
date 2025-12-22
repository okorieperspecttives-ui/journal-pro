import React, { useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Pen } from "lucide-react";
import { supabase } from "../config/supabaseClient";
import SelectedEntry from "./SelectedEntry";

const Calendar = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const {
    user,
    selectedDate,
    setSelectedDate,
    entries,
    setFormModal,
    setEntries,
    selectedEntryId,
    setSelectedEntryId,
    setLoadingEntry,
    setSelectedEntry,
  } = useAuthContext();

  const handleEntryClick = async (entry) => {
    setLoadingEntry(true);
    setSelectedEntryId(entry.id);
    try {
      // update the current user's preferences
      const { error: updateError } = await supabase
        .from("users")
        .update({
          preferences: {
            theme: "dark", // keep or merge existing theme
            lastSelectedPairId: entry.id,
          },
        })
        .eq("user_id", user.uid); // ✅ match Firebase user to Supabase row

      if (updateError) throw updateError;

      console.log("Updated preferences with lastSelectedPairId:", entry.id);
    } catch (err) {
      console.error("Error handling entry click:", err.message);
    } finally {
      setSelectedEntry(null);
      setLoadingEntry(false);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const toggleFormModal = () => {
    setFormModal((prev) => !prev);
  };
  // Set default selected date to today when component mounts
  useEffect(() => {
    const defaultDate = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
    setSelectedDate(defaultDate);
  }, [setSelectedDate]);

  const handleClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const isoDate = clickedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
    setSelectedDate(isoDate);
  };

  const todayISO = today.toLocaleDateString("en-CA");

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
          setEntries([]);
        } else {
          console.log(`Found ${data.length} trades for ${selectedDate}`, data);
          setEntries(data);
          console.log(entries);
        }
      }
    };

    checkTrades();
  }, [selectedDate, selectedEntryId]);

  return (
    <div className="p-4 font-sans">
      <h2 className="text-lg font-bold mb-2 text-gray-300">
        {today.toLocaleString("default", { month: "long" })} {currentYear}
      </h2>

      {/* Calendar days */}
      <div className="flex flex-wrap gap-1">
        {daysArray.map((day) => {
          const thisDate = new Date(
            currentYear,
            currentMonth,
            day
          ).toLocaleDateString("en-CA");

          const isSelected = selectedDate === thisDate;
          const isFuture = thisDate > todayISO;

          return (
            <button
              key={day}
              onClick={() => !isFuture && handleClick(day)}
              disabled={isFuture}
              title={isFuture ? "Future date not available" : ""}
              className={`w-[25px] h-[25px] flex items-center justify-center 
                border rounded-sm text-[15px]
                ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-700"
                    : "bg-transparent text-white border-gray-400 hover:bg-blue-200 hover:text-black"
                }
                ${
                  isFuture ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected date */}
      {selectedDate && (
        <>
          <p className="mt-3 text-gray-100 text-sm">
            Selected Date: <span className="font-semibold">{selectedDate}</span>
          </p>

          <button
            onClick={toggleFormModal}
            className="mx-auto w-fit bg-blue-500 rounded-lg text-white cursor-pointer hover:scale-125 p-1.5 mt-2 font-bold text-sm transition-all ease-in-out duration-700 text-center"
          >
            <Pen className="text-center" />
          </button>
        </>
      )}

      {/* Entries cards */}
      <div className="mt-4 space-y-2">
        {entries.length > 0 ? (
          entries.slice(0, 4).map((entry) => (
            <div
              onClick={() => handleEntryClick(entry)}
              key={entry.id}
              className="sm:p-2 p-1 bg-transparent border-1 border-gray-400 rounded max-w-[100px] cursor-pointer hover:scale-110 hover:bg-gray-800 duration-500 ease-in-out transition-all text-white sm:text-sm text-xs shadow"
            >
              <p className="font-semibold">{entry.symbol}</p>
              <p className="text-[10px]">{entry.id.substring(0, 15)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">0 entries for this date</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
