"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between h-12 rounded-xl border border-gray-800 bg-[#0a0a0a] px-4 text-sm font-semibold",
            "hover:border-[#D0AD6B]/50 hover:bg-[#0f0f0f] transition-all duration-300 group",
            !date && "text-gray-500",
          )}
        >
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-[#D0AD6B] group-hover:scale-110 transition-transform" />
            {date && !isNaN(date.getTime()) ? (
              <span className="text-gray-200">
                {format(date, "MMMM d, yyyy")}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800 group-hover:border-[#D0AD6B]/40 group-hover:text-[#D0AD6B] transition-all">
            <CalendarIcon className="h-3.5 w-3.5" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[#121212] border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        align="start"
      >
        {/* Gold glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D0AD6B]/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none" />
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        <div className="border-t border-gray-800 px-4 py-3 flex justify-between">
          <button
            onClick={() => setDate(undefined)}
            className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            Clear
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="text-[10px] font-bold text-[#D0AD6B] hover:underline uppercase tracking-wider transition-all"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
