import { useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Select date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return "Select time";
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    const selectedDate = date ? new Date(date) : null;

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected =
        selectedDate &&
        currentDate.toDateString() === selectedDate.toDateString();
      const isPast = currentDate < today && !isToday;

      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
      });
    }

    return days;
  };

  const handleDateSelect = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split("T")[0];
    onDateChange(dateString);
    setShowCalendar(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1),
    );
    setCurrentMonth(newMonth);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayTime = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Date Picker */}
      <div>
        <h3 className="text-xl font-medium text-black font-cabin mb-3">Date</h3>
        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin text-left flex items-center justify-between"
        >
          <span className={date ? "text-black" : "text-gray-400"}>
            {formatDisplayDate(date)}
          </span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Time Picker */}
      <div>
        <h3 className="text-xl font-medium text-black font-cabin mb-3">Time</h3>
        <button
          type="button"
          onClick={() => setShowTimePicker(true)}
          className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin text-left flex items-center justify-between"
        >
          <span className={time ? "text-black" : "text-gray-400"}>
            {formatDisplayTime(time)}
          </span>
          <Clock className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 col-span-2">
          <div className="bg-white rounded-lg w-full max-w-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-black font-cabin">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Body */}
            <div className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayObj, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      !dayObj.isPast && handleDateSelect(dayObj.date)
                    }
                    disabled={dayObj.isPast}
                    className={`
                      aspect-square text-sm font-cabin rounded transition-colors
                      ${
                        !dayObj.isCurrentMonth
                          ? "text-gray-300"
                          : dayObj.isPast
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-black hover:bg-gray-100"
                      }
                      ${
                        dayObj.isToday
                          ? "bg-blue-100 text-blue-700 font-semibold"
                          : ""
                      }
                      ${
                        dayObj.isSelected
                          ? "bg-explore-green text-white font-semibold"
                          : ""
                      }
                    `}
                  >
                    {dayObj.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Footer */}
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => setShowCalendar(false)}
                className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="flex-1 py-2 bg-explore-green text-white rounded-lg font-cabin font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 col-span-2">
          <div className="bg-white rounded-lg w-full max-w-sm max-h-96">
            {/* Time Picker Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-black font-cabin">
                Select Time
              </h3>
              <button
                onClick={() => setShowTimePicker(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Options */}
            <div className="max-h-64 overflow-y-auto p-4">
              <div className="space-y-2">
                {generateTimeOptions().map((timeOption) => (
                  <button
                    key={timeOption.value}
                    onClick={() => {
                      onTimeChange(timeOption.value);
                      setShowTimePicker(false);
                    }}
                    className={`
                      w-full text-left py-3 px-4 rounded-lg font-cabin transition-colors
                      ${
                        time === timeOption.value
                          ? "bg-explore-green text-white"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    {timeOption.display}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
