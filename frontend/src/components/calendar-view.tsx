import { useCardModal } from "@/hooks/use-card-modal";
import { cn, formatDate } from "@/lib/utils";
import { Task } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";

interface CalendarViewProps {
  tasks: Task[];
  mutate: () => void;
}

const CalendarView = ({ tasks, mutate }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const cardModal = useCardModal();

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Total days in month
    const daysInMonth = lastDay.getDate();

    // Calculate previous month days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = startDayOfWeek;

    // Calculate next month days to show (to fill grid)
    const totalCells = Math.ceil((daysInMonth + prevMonthDays) / 7) * 7;
    const nextMonthDays = totalCells - (daysInMonth + prevMonthDays);

    return {
      year,
      month,
      daysInMonth,
      prevMonthDays,
      prevMonthLastDay,
      nextMonthDays,
      startDayOfWeek,
    };
  }, [currentDate]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (task.exp_end_date) {
        const dateKey = task.exp_end_date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days = [];

    // Previous month days
    for (let i = calendarData.prevMonthDays - 1; i >= 0; i--) {
      const day = calendarData.prevMonthLastDay - i;
      const date = new Date(
        calendarData.year,
        calendarData.month - 1,
        day
      );
      days.push({
        day,
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split("T")[0],
      });
    }

    // Current month days
    for (let day = 1; day <= calendarData.daysInMonth; day++) {
      const date = new Date(calendarData.year, calendarData.month, day);
      days.push({
        day,
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split("T")[0],
      });
    }

    // Next month days
    for (let day = 1; day <= calendarData.nextMonthDays; day++) {
      const date = new Date(
        calendarData.year,
        calendarData.month + 1,
        day
      );
      days.push({
        day,
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split("T")[0],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {monthNames[calendarData.month]} {calendarData.year}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
          {calendarDays.map((calendarDay, index) => {
            const dayTasks = tasksByDate[calendarDay.dateString] || [];

            return (
              <div
                key={`${calendarDay.dateString}-${index}`}
                className={cn(
                  "border-r border-b last:border-r-0 p-2 min-h-[100px] overflow-hidden",
                  !calendarDay.isCurrentMonth && "bg-gray-50",
                  isToday(calendarDay.date) && "bg-blue-50"
                )}
              >
                {/* Day number */}
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    !calendarDay.isCurrentMonth && "text-gray-400",
                    isToday(calendarDay.date) &&
                      "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  )}
                >
                  {calendarDay.day}
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.name}
                      onClick={() => cardModal.onOpen(task, mutate)}
                      className={cn(
                        "w-full text-left text-xs px-2 py-1 rounded truncate hover:opacity-75 transition-opacity",
                        task.status === "Completed"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : task.status === "Overdue"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : task.status === "Working"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : task.status === "Pending Review"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      )}
                      title={task.subject}
                    >
                      {task.subject}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

