"use client";

import { cn } from "@/utils/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        // v9 class names
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label:
          "text-sm font-bold text-[#D0AD6B] uppercase tracking-[0.15em]",
        nav: "flex items-center gap-1 absolute inset-x-4 top-2.5 justify-between",
        button_previous:
          "inline-flex items-center justify-center h-7 w-7 rounded-lg border border-gray-700 bg-transparent text-gray-400 hover:text-[#D0AD6B] hover:border-[#D0AD6B]/50 hover:bg-[#D0AD6B]/10 transition-all",
        button_next:
          "inline-flex items-center justify-center h-7 w-7 rounded-lg border border-gray-700 bg-transparent text-gray-400 hover:text-[#D0AD6B] hover:border-[#D0AD6B]/50 hover:bg-[#D0AD6B]/10 transition-all",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-gray-500 w-9 font-bold text-[10px] uppercase tracking-widest text-center",
        weeks: "w-full",
        week: "flex w-full mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button:
          "h-9 w-9 p-0 font-medium text-gray-300 hover:bg-[#D0AD6B]/20 hover:text-[#D0AD6B] rounded-lg transition-all inline-flex items-center justify-center text-sm w-full",
        selected:
          "!bg-[#D0AD6B] !text-black !font-bold shadow-lg shadow-[#D0AD6B]/30 rounded-lg [&>button]:text-black [&>button]:font-bold",
        today:
          "bg-gray-800 text-[#D0AD6B] border border-[#D0AD6B]/40 rounded-lg",
        outside: "text-gray-600 opacity-40",
        disabled: "text-gray-700 opacity-30 cursor-not-allowed",
        range_middle: "aria-selected:bg-gray-800 aria-selected:text-gray-300",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
