import React, { useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { Pen } from "lucide-react";

const Calendar = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const { selectedDate, setSelectedDate, entries, setFormModal } =
    useAuthContext();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const toggleFormModal = () => {
    setFormModal((prev) => !prev);
  };

  // Set default selected date to today when component mounts
  useEffect(() => {
    // Normalize today's date into YYYY-MM-DD
    const defaultDate = today.toISOString().split("T")[0];
    setSelectedDate(defaultDate);
  }, [setSelectedDate]);

  const handleClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const isoDate = clickedDate.toISOString().split("T")[0]; // "2025-12-14"
    setSelectedDate(isoDate);
  };

  return (
    <div className="p-4 font-sans">
      <h2 className="text-lg font-bold mb-2 text-gray-300">
        {today.toLocaleString("default", { month: "long" })} {currentYear}
      </h2>
      <div className="flex flex-wrap gap-1">
        {daysArray.map((day) => {
          const thisDate = new Date(
            currentYear,
            currentMonth,
            day
          ).toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

          const isSelected = selectedDate === thisDate;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(thisDate)}
              className={`w-[25px] h-[25px] flex items-center justify-center 
                  border rounded-sm cursor-pointer text-[15px]
                  ${
                    isSelected
                      ? "bg-blue-500 text-white border-blue-700"
                      : "bg-gray-500 border-gray-400 hover:bg-blue-200"
                  }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <>
          <p className="mt-3 text-gray-100 text-sm">
            Selected Date: <span className="font-semibold">{selectedDate}</span>
          </p>
          <p className="my-3 text-gray-100 text-sm">
            {entries.length} entries for date
          </p>
          <button
            onClick={toggleFormModal}
            className="mx-auto w-fit  bg-gray-400 rounded-lg text-gray-700 cursor-pointer hover:scale-125 p-2 font-bold text-sm transition-all ease-in-out duration-700 text-center"
          >
            <Pen className="text-center" />
          </button>
        </>
      )}
    </div>
  );
};

export default Calendar;
