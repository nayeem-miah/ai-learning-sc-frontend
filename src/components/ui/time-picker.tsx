"use client"

import * as React from "react"
import { Clock, ChevronDown } from "lucide-react"

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

export function TimePicker({
    value,
    onChange,
    placeholder = "09:00 AM",
}: {
    value: string
    onChange: (val: string) => void
    placeholder?: string
}) {
    const parts = value ? value.split(":") : []
    const currentH = parts[0]?.padStart(2, "0") || "09"
    const rest = parts[1]?.split(" ") || []
    const currentM = rest[0] || "00"
    const currentP = rest[1] || "AM"

    const updateH = (h: string) => onChange(`${h}:${currentM} ${currentP}`)
    const updateM = (m: string) => onChange(`${currentH}:${m} ${currentP}`)
    const updateP = (p: string) => onChange(`${currentH}:${currentM} ${p}`)

    return (
        <div className="w-full flex items-center gap-2 h-12 rounded-xl border border-gray-800 bg-[#0a0a0a] px-4 hover:border-[#D0AD6B]/50 transition-all duration-300 group">
            {/* Clock icon */}
            <Clock className="h-4 w-4 text-[#D0AD6B] flex-shrink-0 group-hover:scale-110 transition-transform" />

            {/* Hour */}
            <div className="relative flex items-center">
                <select
                    value={currentH}
                    onChange={(e) => updateH(e.target.value)}
                    className="appearance-none bg-transparent text-gray-200 text-sm font-semibold focus:outline-none cursor-pointer pr-5 py-1 text-center"
                >
                    {HOURS.map((h) => (
                        <option key={h} value={h} className="bg-[#121212] text-gray-200">
                            {h}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-gray-500" />
            </div>

            <span className="text-gray-500 font-bold text-base flex-shrink-0">:</span>

            {/* Minute */}
            <div className="relative flex items-center">
                <select
                    value={currentM}
                    onChange={(e) => updateM(e.target.value)}
                    className="appearance-none bg-transparent text-gray-200 text-sm font-semibold focus:outline-none cursor-pointer pr-5 py-1 text-center"
                >
                    {MINUTES.map((m) => (
                        <option key={m} value={m} className="bg-[#121212] text-gray-200">
                            {m}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-gray-500" />
            </div>

            {/* AM/PM */}
            <div className="relative flex items-center ml-auto">
                <select
                    value={currentP}
                    onChange={(e) => updateP(e.target.value)}
                    className="appearance-none bg-[#D0AD6B]/10 text-[#D0AD6B] text-xs font-black rounded-lg pl-3 pr-7 py-1.5 focus:outline-none cursor-pointer border border-[#D0AD6B]/20 hover:bg-[#D0AD6B]/20 transition-all"
                >
                    <option value="AM" className="bg-[#121212] text-gray-200">AM</option>
                    <option value="PM" className="bg-[#121212] text-gray-200">PM</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-[#D0AD6B]" />
            </div>
        </div>
    )
}

